import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Wallet, ShoppingCart, CreditCard, Target, TrendingUp, Rocket, Home, Trophy, Calendar, Check, Heart } from 'lucide-react-native';
import { useAppStore } from '../store/store';
import { colors } from '../theme/colors';
import { Pill } from '../components';

const fm = (n: number) => Math.round(n).toLocaleString();
const fK = (n: number) => n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `$${Math.round(n / 1e3)}k` : `$${fm(n)}`;
const ICS: Record<string, any> = { wallet: Wallet, cart: ShoppingCart, cc: CreditCard, tgt: Target, up: TrendingUp, rkt: Rocket, home: Home, trophy: Trophy, heart: Heart, cal: Calendar };

export default function GamePlanScreen() {
  const store = useAppStore();
  const c = store.getCalcs();
  const tD = store.totalDebt(), tE = store.totalExpenses();
  const subs = store.expenses.find(e => e.id === 'subs')?.val || 0;
  const fun = store.expenses.find(e => e.id === 'fun')?.val || 0;
  const rent = store.expenses.find(e => e.id === 'rent')?.val || 0;
  const hg = store.goal > 0;
  const [cel, sCel] = useState(false);

  // saveable = how much user could theoretically redirect per month
  const saveable = Math.round(subs * 0.4 + fun * 0.33);

  const steps = useMemo(() => {
    const s: any[] = [];
    if (store.take === 0) s.push({ id: 's1', p: 0, t: 'enter your take-home pay', d: 'head to the math tab and enter what actually hits your bank account.', ic: 'wallet', cl: colors.green, bg: colors.greenBg, sh: colors.greenDark, tp: 'action' });
    if (tE === 0 && store.take > 0) s.push({ id: 's2', p: 1, t: 'break down your expenses', d: "tap 'what it costs to be you' on the math tab and fill in every line.", ic: 'cart', cl: colors.yellow, bg: colors.yellowBg, sh: colors.yellowDark, tp: 'action' });

    if (tD > store.take * 0.15 && store.take > 0) {
      const excess = tD - store.take * 0.1;
      const months = saveable > 0 ? Math.ceil(tD * 6 / saveable) : 0; // rough payoff estimate
      s.push({ id: 's3', p: 2, t: 'your debt is holding you back', d: `$${fm(tD)}/mo in debt is ${Math.round(tD / store.take * 100)}% of your income. lenders see red above 15%.`, ic: 'cc', cl: colors.red, bg: colors.redBg, sh: colors.redDark, im: `cut $${fm(excess)}/mo`, timeline: months > 0 ? `~${months} months if you grind` : undefined, tp: 'goal' });
    } else if (tD > 0 && store.take > 0) {
      s.push({ id: 's4', p: 3, t: 'finish off the last bit of debt', d: `$${fm(tD)}/mo isn't killing you, but $0 is better for your mortgage rate.`, ic: 'cc', cl: colors.orange, bg: colors.orangeBg, sh: colors.orangeDark, im: `$${fm(tD)}/mo freed when done`, tp: 'goal' });
    }

    if (subs > 80) s.push({ id: 's5', p: 4, t: `$${fm(subs)}/mo on subscriptions — audit them`, d: `that's $${fm(subs * 12)}/yr. cancel everything for one month. see what you actually miss. put the savings toward your down payment.`, ic: 'cart', cl: colors.purple, bg: colors.purpleBg, sh: colors.purpleDark, im: `~$${fm(Math.round(subs * 0.4))}/mo saveable`, timeline: '1 week to audit', tp: 'tip' });

    if (fun > store.take * 0.08 && store.take > 0) {
      const saved = Math.round(fun * 0.33);
      s.push({ id: 's6', p: 5, t: `cut going-out budget by a third`, d: `$${fm(fun)}/mo on entertainment. cutting by 33% for 12 months adds $${fm(saved * 12)} to your down payment.`, ic: 'heart', cl: colors.orange, bg: colors.orangeBg, sh: colors.orangeDark, im: `$${fm(saved)}/mo redirected`, timeline: '12 months', tp: 'tip' });
    }

    if (hg && c.gGap > 0) {
      const monthsToClose = saveable > 0 ? Math.ceil(c.gGap / saveable * 30) : 0; // very rough
      s.push({ id: 's7', p: 6, t: `close the $${fm(c.gGap)}/mo gap to your ${fK(store.goal)} goal`, d: `you need $${fm(c.gPay)}/mo for that house but can do $${fm(c.mx)}/mo right now. earn more, cut expenses, or adjust the target.`, ic: 'tgt', cl: colors.blue, bg: colors.blueBg, sh: colors.blueDark, im: `$${fm(c.gGap)}/mo gap`, timeline: monthsToClose > 0 ? `~${monthsToClose} months at current pace` : undefined, tp: 'goal' });
    }

    if (c.price > 0 && store.dp < c.price * 0.2) {
      const need = Math.max(0, c.price * 0.2 - store.dp);
      const monthsDP = saveable > 0 ? Math.ceil(need / saveable) : 0;
      s.push({ id: 's8', p: 7, t: 'get to 20% down', d: `$${fm(store.dp)} saved. need $${fm(c.price * 0.2)} for 20% on a ${fK(c.price)} house. that's $${fm(need)} to go. no PMI = $100-300/mo saved forever.`, ic: 'tgt', cl: colors.green, bg: colors.greenBg, sh: colors.greenDark, im: 'saves $100-300/mo in PMI', timeline: monthsDP > 0 ? `~${monthsDP} months saving` : undefined, tp: 'goal' });
    }

    if (store.take > 0 && c.loan > 0) s.push({ id: 's9', p: 8, t: 'shop interest rates aggressively', d: `0.5% lower on ${fK(c.loan)} saves $${fm(c.loan * 0.005 / 12)}/mo — that's $${fm(Math.round(c.loan * 0.005 / 12 * 360))} over 30 years. get 5+ quotes.`, ic: 'up', cl: colors.blue, bg: colors.blueBg, sh: colors.blueDark, im: `$${fm(c.loan * 0.005 / 12)}/mo per 0.5%`, timeline: '2-3 weeks', tp: 'tip' });

    if (rent > 0 && c.mx > 0) s.push({ id: 's10', p: 9, t: `your rent is $${fm(rent)}/mo right now`, d: c.mx > rent ? `your max mortgage is $${fm(c.mx - rent)} more — budget for that jump.` : c.mx < rent ? 'your max mortgage is actually less than rent. nice.' : 'about the same. smooth transition.', ic: 'home', cl: colors.blue, bg: colors.blueBg, sh: colors.blueDark, tp: 'fyi' });

    if (s.length === 0 && store.take > 0) s.push({ id: 'done', p: 0, t: "you're ready to buy", d: 'numbers look solid. next step: get pre-approved by a lender and start actually looking.', ic: 'trophy', cl: colors.green, bg: colors.greenBg, sh: colors.greenDark, tp: 'win' });
    return s.sort((a, b) => a.p - b.p);
  }, [store.take, tD, tE, subs, fun, rent, hg, c, store.dp, store.goal, saveable]);

  const doneN = steps.filter(s => store.done[s.id]).length;
  const allDone = doneN === steps.length && steps.length > 0;
  useEffect(() => { if (allDone) sCel(true); }, [allDone]);

  const TPL: Record<string, string> = { action: 'do now', goal: 'target', tip: 'pro tip', fyi: 'fyi', win: 'congrats' };
  const TPC: Record<string, string> = { action: colors.green, goal: colors.orange, tip: colors.blue, fyi: colors.purple, win: colors.green };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={{ alignItems: 'center', paddingVertical: 12 }}>
        <Text style={{ fontSize: 20, fontWeight: '900', color: colors.text }}>{steps.length} steps to go</Text>
        {steps.length > 1 && <View style={{ flexDirection: 'row', gap: 3, marginTop: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
          {steps.map(s => <View key={s.id} style={{ width: Math.min(32, 260 / steps.length), height: 7, borderRadius: 4, backgroundColor: store.done[s.id] ? colors.green : colors.border }} />)}
        </View>}
        {doneN > 0 && <Text style={{ color: colors.green, fontSize: 12, fontWeight: '700', marginTop: 4 }}>{doneN}/{steps.length} done</Text>}
      </View>

      <View style={{ paddingHorizontal: 16, gap: 10 }}>
        {steps.map(s => {
          const IC = ICS[s.ic] || Target;
          const isDone = store.done[s.id];
          return (
            <View key={s.id} style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 2, borderColor: isDone ? colors.green : s.cl, borderBottomWidth: 4, borderBottomColor: isDone ? colors.greenDark : s.sh, opacity: isDone ? 0.55 : 1 }}>
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
                <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: isDone ? colors.greenBg : s.bg, alignItems: 'center', justifyContent: 'center' }}>
                  {isDone ? <Check size={20} color={colors.green} /> : <IC size={20} color={s.cl} />}
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ backgroundColor: (TPC[s.tp] || colors.blue) + '18', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, marginBottom: 3 }}>
                    <Text style={{ fontSize: 9, fontWeight: '800', color: TPC[s.tp] || colors.blue, textTransform: 'uppercase' }}>{isDone ? 'done' : TPL[s.tp]}</Text>
                  </View>
                  <Text style={{ color: colors.text, fontSize: 14, fontWeight: '800', textDecorationLine: isDone ? 'line-through' : 'none' }}>{s.t}</Text>
                  <Text style={{ color: colors.textMed, fontSize: 12, lineHeight: 18, marginTop: 4, marginBottom: 8 }}>{s.d}</Text>
                  <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                    {s.im && <Pill text={s.im} color={s.cl} bg={s.bg} />}
                    {s.timeline && <Pill text={s.timeline} color={colors.textMed} bg={colors.surface} />}
                    {/* DONE BUTTON — standalone, NOT inside ChunkyCard */}
                    <TouchableOpacity
                      onPress={() => store.toggleDone(s.id)}
                      activeOpacity={0.8}
                      style={{ backgroundColor: isDone ? colors.surface : s.cl, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, borderBottomWidth: isDone ? 0 : 2, borderBottomColor: s.sh }}>
                      <Text style={{ fontSize: 12, fontWeight: '800', color: isDone ? colors.textMed : '#fff' }}>{isDone ? 'undo' : 'mark done'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 2, borderColor: colors.blue, borderBottomWidth: 4, borderBottomColor: colors.blueDark }}>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: colors.blueBg, alignItems: 'center', justifyContent: 'center' }}><Calendar size={20} color={colors.blue} /></View>
            <View><Text style={{ color: colors.text, fontSize: 13, fontWeight: '800' }}>come back monthly</Text><Text style={{ color: colors.textMed, fontSize: 11 }}>update your numbers as life changes. your plan updates automatically.</Text></View>
          </View>
        </View>
      </View>

      {/* CELEBRATION */}
      <Modal visible={cel} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 24, padding: 36, alignItems: 'center', maxWidth: 340, width: '100%', borderWidth: 3, borderColor: colors.green }}>
            <View style={{ width: 72, height: 72, borderRadius: 18, backgroundColor: colors.greenBg, alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 3, borderColor: colors.green }}><Trophy size={36} color={colors.green} /></View>
            <Text style={{ fontSize: 26, fontWeight: '900', color: colors.text, marginBottom: 8 }}>you crushed it</Text>
            <Text style={{ fontSize: 14, color: colors.textMed, textAlign: 'center', lineHeight: 22, marginBottom: 20 }}>every step done. you're in a strong position. get pre-approved and start looking for real.</Text>
            <TouchableOpacity onPress={() => sCel(false)} activeOpacity={0.9} style={{ width: '100%', padding: 16, borderRadius: 14, backgroundColor: colors.green, alignItems: 'center', borderBottomWidth: 4, borderBottomColor: colors.greenDark }}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>let's keep going</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}