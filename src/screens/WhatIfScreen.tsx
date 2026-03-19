import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Lock } from 'lucide-react-native';
import { useAppStore } from '../store/store';
import { colors } from '../theme/colors';
import { ChunkyCard, Pill, PaywallModal } from '../components';

const fm = (n: number) => Math.round(n).toLocaleString();
const fK = (n: number) => n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `$${Math.round(n / 1e3)}k` : `$${fm(n)}`;

export default function WhatIfScreen() {
  const store = useAppStore();
  const c = store.getCalcs();
  const [sel, sS] = useState<string | null>(null);
  const [showPay, sPay] = useState(false);

  const sc = useMemo(() => {
    const mr = store.rate / 100 / 12, np = store.term * 12;
    const calc = (p: number, d: number) => { const l = p - d; if (l <= 0 || mr <= 0) return 0; return l * (mr * Math.pow(1 + mr, np)) / (Math.pow(1 + mr, np) - 1) + p * (store.ptax / 100) / 12 + store.monthlyIns + store.hoa; };
    const prices = [0.6, 0.75, 0.9, 1.0, 1.15, 1.3].map(m => Math.round(c.price * m / 1e4) * 1e4);
    return { prices, downs: [0.05, 0.10, 0.15, 0.20, 0.30, 0.50], calc };
  }, [c, store]);

  const gD = (pi: number, dp: number) => {
    const p = sc.prices[pi], dn = p * dp, ln = p - dn, pay = sc.calc(p, dn), tot = pay * store.term * 12;
    return { p, dn, ln, pay, tot, ok: pay <= c.mx, int: Math.max(0, tot - ln) };
  };

  // Year-by-year breakdown for selected scenario or default
  const loanYears = useMemo(() => {
    if (!c.yd || c.yd.length === 0) return [];
    return c.yd.filter((_, i) => i === 1 || i === 5 || i === 10 || i === 15 || i === 20 || i === 30 || i === c.yd.length - 1)
      .filter((v, i, a) => a.findIndex(x => x.y === v.y) === i); // dedupe
  }, [c.yd]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={{ alignItems: 'center', paddingVertical: 14 }}>
        <Text style={{ color: colors.textLight, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 3 }}>the what-if machine</Text>
        <Text style={{ fontSize: 20, fontWeight: '900', color: colors.text, marginVertical: 4 }}>play with scenarios</Text>
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
          <Pill text="green = go" color={colors.green} bg={colors.greenBg} />
          <Pill text="yellow = tight" color={colors.yellow} bg={colors.yellowBg} />
          <Pill text="red = nope" color={colors.red} bg={colors.redBg} />
        </View>
      </View>

      {/* MATRIX */}
      <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
        <ChunkyCard style={{ padding: 0, overflow: 'hidden' }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              <View style={{ flexDirection: 'row', backgroundColor: colors.surface }}>
                <View style={{ width: 70, padding: 8 }}><Text style={{ color: colors.textMed, fontSize: 9, fontWeight: '800', textTransform: 'uppercase' }}>price</Text></View>
                {sc.downs.map(d => <View key={d} style={{ width: 68, padding: 8, alignItems: 'center' }}><Text style={{ color: colors.textMed, fontSize: 9, fontWeight: '800', textTransform: 'uppercase' }}>{Math.round(d * 100)}%</Text></View>)}
              </View>
              {sc.prices.map((p, pi) => (
                <View key={p} style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.surface }}>
                  <View style={{ width: 70, padding: 8, justifyContent: 'center' }}><Text style={{ color: colors.text, fontSize: 11, fontWeight: '800' }}>{fK(p)}</Text></View>
                  {sc.downs.map(dp => {
                    const { pay, ok } = gD(pi, dp); const tight = pay <= c.mx * 1.1 && !ok;
                    const k = `${pi}-${dp}`, sl2 = sel === k, cl = ok ? colors.green : tight ? colors.yellow : colors.red, bg = ok ? colors.greenBg : tight ? colors.yellowBg : colors.redBg;
                    return <TouchableOpacity key={dp} onPress={() => sS(sl2 ? null : k)} activeOpacity={0.7} style={{ width: 68, padding: 2, alignItems: 'center' }}>
                      <View style={{ borderRadius: 8, padding: 6, width: '100%', alignItems: 'center', backgroundColor: sl2 ? bg : 'transparent', borderWidth: sl2 ? 2 : 0, borderColor: cl }}>
                        <Text style={{ color: cl, fontSize: 11, fontWeight: '800' }}>${fm(pay)}</Text>
                        <Text style={{ fontSize: 8, fontWeight: '700', color: ok ? colors.greenDark : tight ? colors.yellowDark : colors.redDark }}>{ok ? 'go' : tight ? 'eh' : 'no'}</Text>
                      </View>
                    </TouchableOpacity>;
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
        </ChunkyCard>
      </View>

      {/* SELECTED DETAIL */}
      {sel && (() => {
        const [pi, dp] = sel.split('-'); const d = gD(parseInt(pi), parseFloat(dp));
        return <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
          <ChunkyCard color={d.ok ? colors.green : colors.red} shadowColor={d.ok ? colors.greenDark : colors.redDark}>
            <Text style={{ color: colors.text, fontSize: 15, fontWeight: '900', marginBottom: 10 }}>{fK(d.p)} · {Math.round(parseFloat(dp) * 100)}% down</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {[{ l: 'down', v: fK(d.dn), cl: colors.blue }, { l: 'borrow', v: fK(d.ln), cl: colors.text }, { l: 'monthly', v: `$${fm(d.pay)}`, cl: d.ok ? colors.green : colors.red }, { l: `${store.term}yr total`, v: fK(d.tot), cl: colors.yellowDark }, { l: 'just interest', v: fK(d.int), cl: colors.red }, { l: 'vs max', v: d.ok ? `$${fm(c.mx - d.pay)} ok` : `$${fm(d.pay - c.mx)} over`, cl: d.ok ? colors.green : colors.red }].map(({ l, v, cl }) =>
                <View key={l} style={{ width: '48%', backgroundColor: colors.surface, borderRadius: 8, padding: 8 }}>
                  <Text style={{ color: colors.textLight, fontSize: 10, fontWeight: '700' }}>{l}</Text>
                  <Text style={{ color: cl, fontSize: 15, fontWeight: '800' }}>{v}</Text>
                </View>
              )}
            </View>
            <View style={{ marginTop: 8, padding: 8, borderRadius: 8, backgroundColor: d.ok ? colors.greenBg : colors.redBg }}>
              <Text style={{ color: d.ok ? colors.greenDark : colors.redDark, fontSize: 12, fontWeight: '700' }}>
                {d.ok ? `this works. $${fm(c.mx - d.pay)} monthly cushion.` : `over budget by $${fm(d.pay - c.mx)}/mo.`}
              </Text>
            </View>
          </ChunkyCard>
        </View>;
      })()}

      {/* LOAN TRUTH — year by year table */}
      <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
        <ChunkyCard>
          <Text style={{ color: colors.text, fontSize: 15, fontWeight: '800' }}>the ugly truth about your loan</Text>
          <Text style={{ color: colors.textMed, fontSize: 12, marginBottom: 8 }}>here's exactly where your money goes each year</Text>

          {c.loan > 0 && c.pi > 0 && <>
            {/* HEADER */}
            <View style={{ flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 2, borderBottomColor: colors.border }}>
              <Text style={{ flex: 1, fontSize: 10, fontWeight: '800', color: colors.textMed, textTransform: 'uppercase' }}>year</Text>
              <Text style={{ flex: 1.5, fontSize: 10, fontWeight: '800', color: colors.textMed, textTransform: 'uppercase', textAlign: 'right' }}>still owe</Text>
              <Text style={{ flex: 1.5, fontSize: 10, fontWeight: '800', color: colors.textMed, textTransform: 'uppercase', textAlign: 'right' }}>you own</Text>
              <Text style={{ flex: 1.5, fontSize: 10, fontWeight: '800', color: colors.textMed, textTransform: 'uppercase', textAlign: 'right' }}>paid in int.</Text>
            </View>
            {loanYears.map(yr => (
              <View key={yr.y} style={{ flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.surface }}>
                <Text style={{ flex: 1, fontSize: 13, fontWeight: '800', color: colors.text }}>yr {yr.y}</Text>
                <Text style={{ flex: 1.5, fontSize: 12, fontWeight: '700', color: colors.red, textAlign: 'right' }}>{fK(yr.b)}</Text>
                <Text style={{ flex: 1.5, fontSize: 12, fontWeight: '700', color: colors.green, textAlign: 'right' }}>{fK(yr.e)}</Text>
                <Text style={{ flex: 1.5, fontSize: 12, fontWeight: '700', color: colors.textMed, textAlign: 'right' }}>{fK(yr.intPaid)}</Text>
              </View>
            ))}

            <View style={{ marginTop: 10, padding: 10, backgroundColor: colors.yellowBg, borderRadius: 8 }}>
              <Text style={{ color: colors.yellowDark, fontSize: 12, fontWeight: '700' }}>
                total interest over {store.term} years: <Text style={{ color: colors.text, fontWeight: '800' }}>{fK(c.tInt)}</Text>
              </Text>
              <Text style={{ color: colors.textMed, fontSize: 11, marginTop: 4 }}>
                that means for every dollar you borrow, you pay the bank an extra ${c.loan > 0 ? (c.tInt / c.loan * 100).toFixed(0) : 0} cents in interest
              </Text>
            </View>
          </>}

          {c.loan === 0 && <View style={{ padding: 16, alignItems: 'center' }}>
            <Text style={{ color: colors.textLight, fontSize: 13 }}>enter your income and expenses to see this</Text>
          </View>}
        </ChunkyCard>
      </View>

      {/* PRO: RENT VS BUY PREVIEW */}
      <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
        <ChunkyCard color={colors.purple} shadowColor={colors.purpleDark} onPress={() => sPay(true)}>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: colors.purpleBg, alignItems: 'center', justifyContent: 'center' }}><Lock size={20} color={colors.purple} /></View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontSize: 14, fontWeight: '800' }}>pro: rent vs. buy calculator</Text>
              <Text style={{ color: colors.textMed, fontSize: 12, marginTop: 2 }}>enter your current rent and we'll tell you if buying actually saves money — or costs more. includes opportunity cost on your down payment.</Text>
            </View>
          </View>
        </ChunkyCard>
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        <ChunkyCard color={colors.purple} shadowColor={colors.purpleDark} onPress={() => sPay(true)}>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: colors.purpleBg, alignItems: 'center', justifyContent: 'center' }}><Lock size={20} color={colors.purple} /></View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontSize: 14, fontWeight: '800' }}>pro: side-by-side house compare</Text>
              <Text style={{ color: colors.textMed, fontSize: 12, marginTop: 2 }}>save multiple scenarios and compare them head-to-head. see which house actually makes more financial sense over 5, 10, 30 years.</Text>
            </View>
          </View>
        </ChunkyCard>
      </View>

      <PaywallModal visible={showPay} onClose={() => sPay(false)} onPurchase={() => { store.setPro(true); sPay(false); }} />
    </ScrollView>
  );
}
