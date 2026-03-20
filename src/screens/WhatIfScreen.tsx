import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated, Easing,
} from 'react-native';
import { Lock, Zap } from 'lucide-react-native';
import { useAppStore } from '../store/store';
import { colors } from '../theme/colors';
import { ChunkyCard, Pill, PaywallModal } from '../components';

const fm = (n: number) => Math.round(n).toLocaleString();
const fK = (n: number) =>
  n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `$${Math.round(n / 1e3)}k` : `$${fm(n)}`;

export default function WhatIfScreen() {
  const store = useAppStore();
  const c = store.getCalcs();
  const [sel, sS] = useState<string | null>(null);
  const [showPay, sPay] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));

  React.useEffect(() => {
    if (!store.isPro) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.04, duration: 900, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 900, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        ])
      ).start();
    }
  }, [store.isPro]);

  const sc = useMemo(() => {
    const mr = store.rate / 100 / 12, np = store.term * 12;
    const calc = (p: number, d: number) => {
      const l = p - d;
      if (l <= 0 || mr <= 0) return 0;
      return (
        l * (mr * Math.pow(1 + mr, np)) / (Math.pow(1 + mr, np) - 1) +
        p * (store.ptax / 100) / 12 +
        store.monthlyIns +
        store.hoa
      );
    };
    const basePrice = c.price > 0 ? c.price : 400000;
    const prices = [0.6, 0.75, 0.9, 1.0, 1.15, 1.3].map(
      m => Math.round(basePrice * m / 1e4) * 1e4
    );
    return { prices, downs: [0.05, 0.10, 0.15, 0.20, 0.30, 0.50], calc };
  }, [c, store]);

  const gD = (pi: number, dp: number) => {
    const p = sc.prices[pi], dn = p * dp, ln = p - dn;
    const pay = sc.calc(p, dn), tot = pay * store.term * 12;
    return { p, dn, ln, pay, tot, ok: pay <= c.mx, int: Math.max(0, tot - ln) };
  };

  const loanYears = useMemo(() => {
    if (!c.yd || c.yd.length === 0) return [];
    const targetIndices = new Set([1, 5, 10, 15, 20, 30, c.yd.length - 1]);
    const seenYears = new Set<number>();
    return c.yd.filter((_, i) => targetIndices.has(i)).filter(v => {
      if (seenYears.has(v.y)) return false;
      seenYears.add(v.y);
      return true;
    });
  }, [c.yd]);

  const greenCount = useMemo(() => {
    let count = 0;
    sc.prices.forEach((_, pi) => {
      sc.downs.forEach((dp) => {
        if (gD(pi, dp).ok) count++;
      });
    });
    return count;
  }, [sc, c.mx]);

  const MatrixTable = ({ interactive }: { interactive: boolean }) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        <View style={{ flexDirection: 'row', backgroundColor: colors.surface }}>
          <View style={{ width: 70, padding: 8 }}>
            <Text style={{ color: colors.textMed, fontSize: 9, fontWeight: '800', textTransform: 'uppercase' }}>price</Text>
          </View>
          {sc.downs.map(d => (
            <View key={`hdr-${d}`} style={{ width: 68, padding: 8, alignItems: 'center' }}>
              <Text style={{ color: colors.textMed, fontSize: 9, fontWeight: '800', textTransform: 'uppercase' }}>
                {Math.round(d * 100)}%
              </Text>
            </View>
          ))}
        </View>

        {sc.prices.map((p, pi) => (
          <View key={`row-${pi}`} style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.surface }}>
            <View style={{ width: 70, padding: 8, justifyContent: 'center' }}>
              <Text style={{ color: colors.text, fontSize: 11, fontWeight: '800' }}>{fK(p)}</Text>
            </View>
            {sc.downs.map((dp, di) => {
              const { pay, ok } = gD(pi, dp);
              const tight = pay <= c.mx * 1.1 && !ok;
              const k = `${pi}-${di}`;
              const sl2 = sel === k;
              const cl = ok ? colors.green : tight ? colors.yellow : colors.red;
              const bg = ok ? colors.greenBg : tight ? colors.yellowBg : colors.redBg;
              // for tease: first row and first col are visible, rest are faded
              const teaseVisible = !interactive && (pi === 0 || di === 0);
              const cellOpacity = interactive ? 1 : teaseVisible ? 0.85 : 0.22;

              return (
                <TouchableOpacity
                  key={`cell-${pi}-${di}`}
                  onPress={() => {
                    if (!interactive) { sPay(true); return; }
                    sS(sl2 ? null : k);
                  }}
                  activeOpacity={interactive ? 0.7 : 0.85}
                  style={{ width: 68, padding: 2, alignItems: 'center' }}>
                  <View style={{
                    borderRadius: 8, padding: 6, width: '100%', alignItems: 'center',
                    backgroundColor: sl2 ? bg : (interactive ? 'transparent' : bg + '55'),
                    borderWidth: sl2 ? 2 : (interactive ? 0 : 1),
                    borderColor: cl + '50',
                    opacity: cellOpacity,
                  }}>
                    <Text style={{ color: cl, fontSize: 11, fontWeight: '800' }}>
                      ${fm(pay)}
                    </Text>
                    <Text style={{ fontSize: 8, fontWeight: '700', color: ok ? colors.greenDark : tight ? colors.yellowDark : colors.redDark }}>
                      {ok ? 'go' : tight ? 'eh' : 'no'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={{ alignItems: 'center', paddingVertical: 14 }}>
        <Text style={{ color: colors.textLight, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 3 }}>
          the what-if machine
        </Text>
        <Text style={{ fontSize: 20, fontWeight: '900', color: colors.text, marginVertical: 4 }}>
          play with scenarios
        </Text>
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
          <Pill text="green = go" color={colors.green} bg={colors.greenBg} />
          <Pill text="yellow = tight" color={colors.yellow} bg={colors.yellowBg} />
          <Pill text="red = nope" color={colors.red} bg={colors.redBg} />
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
        <ChunkyCard style={{ padding: 0, overflow: 'hidden' }}>
          {store.isPro ? (
            <MatrixTable interactive={true} />
          ) : (
            <View>
              {/* real numbers render behind — faded */}
              <MatrixTable interactive={false} />

              {/* white wash over most of the matrix */}
              <View style={styles.fadeOverlay} pointerEvents="none" />

              {/* pulsing lock card */}
              <View style={styles.lockOverlay} pointerEvents="box-none">
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <TouchableOpacity
                    onPress={() => sPay(true)}
                    activeOpacity={0.9}
                    style={styles.lockBadge}>

                    <View style={styles.lockIconWrap}>
                      <Lock size={22} color={colors.purple} />
                    </View>

                    <Text style={styles.lockTitle}>unlock the full matrix</Text>

                    {/* personalised hook */}
                    {c.mx > 0 ? (
                      greenCount > 0 ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginVertical: 7 }}>
                          <View style={{ backgroundColor: colors.greenBg, borderRadius: 7, paddingHorizontal: 10, paddingVertical: 4 }}>
                            <Text style={{ fontSize: 14, fontWeight: '900', color: colors.green }}>
                              {greenCount} combos work for you
                            </Text>
                          </View>
                        </View>
                      ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginVertical: 7 }}>
                          <Zap size={14} color={colors.orange} />
                          <Text style={{ fontSize: 12, color: colors.textMed, fontWeight: '700' }}>
                            see exactly what gets you there
                          </Text>
                        </View>
                      )
                    ) : (
                      <View style={{ marginVertical: 7 }}>
                        <Text style={{ fontSize: 12, color: colors.textMed, fontWeight: '700' }}>
                          enter income to see your scenarios
                        </Text>
                      </View>
                    )}

                    <Text style={styles.lockSub}>
                      tap any cell to explore every price{'\n'}+ down combo interactively
                    </Text>

                    <TouchableOpacity
                      onPress={() => sPay(true)}
                      activeOpacity={0.85}
                      style={styles.ctaButton}>
                      <Text style={{ fontSize: 13, fontWeight: '900', color: '#fff' }}>
                        get pro — from $2.99/mo
                      </Text>
                    </TouchableOpacity>

                  </TouchableOpacity>
                </Animated.View>
              </View>
            </View>
          )}
        </ChunkyCard>
      </View>

      {/* selected detail (pro only) */}
      {store.isPro && sel && (() => {
        const [pi, di] = sel.split('-');
        const d = gD(parseInt(pi), sc.downs[parseInt(di)]);
        return (
          <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
            <ChunkyCard color={d.ok ? colors.green : colors.red} shadowColor={d.ok ? colors.greenDark : colors.redDark}>
              <Text style={{ color: colors.text, fontSize: 15, fontWeight: '900', marginBottom: 10 }}>
                {fK(d.p)} · {Math.round(sc.downs[parseInt(di)] * 100)}% down
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {[
                  { l: 'down', v: fK(d.dn), cl: colors.blue },
                  { l: 'borrow', v: fK(d.ln), cl: colors.text },
                  { l: 'monthly', v: `$${fm(d.pay)}`, cl: d.ok ? colors.green : colors.red },
                  { l: `${store.term}yr total`, v: fK(d.tot), cl: colors.yellowDark },
                  { l: 'just interest', v: fK(d.int), cl: colors.red },
                  { l: 'vs max', v: d.ok ? `$${fm(c.mx - d.pay)} ok` : `$${fm(d.pay - c.mx)} over`, cl: d.ok ? colors.green : colors.red },
                ].map(({ l, v, cl }) => (
                  <View key={l} style={{ width: '48%', backgroundColor: colors.surface, borderRadius: 8, padding: 8 }}>
                    <Text style={{ color: colors.textLight, fontSize: 10, fontWeight: '700' }}>{l}</Text>
                    <Text style={{ color: cl, fontSize: 15, fontWeight: '800' }}>{v}</Text>
                  </View>
                ))}
              </View>
              <View style={{ marginTop: 8, padding: 8, borderRadius: 8, backgroundColor: d.ok ? colors.greenBg : colors.redBg }}>
                <Text style={{ color: d.ok ? colors.greenDark : colors.redDark, fontSize: 12, fontWeight: '700' }}>
                  {d.ok
                    ? `this works. $${fm(c.mx - d.pay)}/mo cushion.`
                    : `over budget by $${fm(d.pay - c.mx)}/mo.`}
                </Text>
              </View>
            </ChunkyCard>
          </View>
        );
      })()}

      {/* loan truth table */}
      <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
        <ChunkyCard>
          <Text style={{ color: colors.text, fontSize: 15, fontWeight: '800' }}>
            the ugly truth about your loan
          </Text>
          <Text style={{ color: colors.textMed, fontSize: 12, marginBottom: 8 }}>
            here's exactly where your money goes each year
          </Text>
          {c.loan > 0 && c.pi > 0 ? (
            <>
              <View style={{ flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 2, borderBottomColor: colors.border }}>
                <Text style={{ flex: 1, fontSize: 10, fontWeight: '800', color: colors.textMed, textTransform: 'uppercase' }}>year</Text>
                <Text style={{ flex: 1.5, fontSize: 10, fontWeight: '800', color: colors.textMed, textTransform: 'uppercase', textAlign: 'right' }}>still owe</Text>
                <Text style={{ flex: 1.5, fontSize: 10, fontWeight: '800', color: colors.textMed, textTransform: 'uppercase', textAlign: 'right' }}>you own</Text>
                <Text style={{ flex: 1.5, fontSize: 10, fontWeight: '800', color: colors.textMed, textTransform: 'uppercase', textAlign: 'right' }}>paid in int.</Text>
              </View>
              {loanYears.map((yr, i) => (
                <View key={`yr-${yr.y}-${i}`} style={{ flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.surface }}>
                  <Text style={{ flex: 1, fontSize: 13, fontWeight: '800', color: colors.text }}>yr {yr.y}</Text>
                  <Text style={{ flex: 1.5, fontSize: 12, fontWeight: '700', color: colors.red, textAlign: 'right' }}>{fK(yr.b)}</Text>
                  <Text style={{ flex: 1.5, fontSize: 12, fontWeight: '700', color: colors.green, textAlign: 'right' }}>{fK(yr.e)}</Text>
                  <Text style={{ flex: 1.5, fontSize: 12, fontWeight: '700', color: colors.textMed, textAlign: 'right' }}>{fK(yr.intPaid)}</Text>
                </View>
              ))}
              <View style={{ marginTop: 10, padding: 10, backgroundColor: colors.yellowBg, borderRadius: 8 }}>
                <Text style={{ color: colors.yellowDark, fontSize: 12, fontWeight: '700' }}>
                  total interest over {store.term} years:{' '}
                  <Text style={{ color: colors.text, fontWeight: '800' }}>{fK(c.tInt)}</Text>
                </Text>
                <Text style={{ color: colors.textMed, fontSize: 11, marginTop: 4 }}>
                  for every dollar you borrow, you pay the bank an extra{' '}
                  {c.loan > 0 ? (c.tInt / c.loan * 100).toFixed(0) : 0} cents in interest
                </Text>
              </View>
            </>
          ) : (
            <View style={{ padding: 16, alignItems: 'center' }}>
              <Text style={{ color: colors.textLight, fontSize: 13 }}>
                enter your income and expenses to see this
              </Text>
            </View>
          )}
        </ChunkyCard>
      </View>

      {/* pro rent vs buy teaser */}
      {!store.isPro && (
        <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
          <ChunkyCard color={colors.purple} shadowColor={colors.purpleDark} onPress={() => sPay(true)}>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: colors.purpleBg, alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={20} color={colors.purple} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 14, fontWeight: '800' }}>
                  pro: rent vs. buy calculator
                </Text>
                <Text style={{ color: colors.textMed, fontSize: 12, marginTop: 2 }}>
                  enter your current rent and find out if buying actually saves money — includes opportunity cost on your down payment.
                </Text>
              </View>
            </View>
          </ChunkyCard>
        </View>
      )}

      <PaywallModal visible={showPay} onClose={() => sPay(false)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fadeOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  lockOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  lockBadge: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.purple + '50',
    shadowColor: colors.purple,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
    maxWidth: 285,
    width: '100%',
  },
  lockIconWrap: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: colors.purpleBg,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 2, borderColor: colors.purple + '30',
  },
  lockTitle: {
    fontSize: 16, fontWeight: '900', color: colors.text, marginBottom: 2,
  },
  lockSub: {
    fontSize: 12, color: colors.textMed, textAlign: 'center', lineHeight: 18,
    marginTop: 4,
  },
  ctaButton: {
    marginTop: 14,
    backgroundColor: colors.purple,
    paddingHorizontal: 22, paddingVertical: 11,
    borderRadius: 11,
    borderBottomWidth: 3, borderBottomColor: colors.purpleDark,
    alignItems: 'center',
  },
});