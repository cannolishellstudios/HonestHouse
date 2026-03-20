import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import {
  Wallet, ShoppingCart, CreditCard, Target, TrendingUp,
  Home, Trophy, Calendar, Check, Heart, AlertTriangle,
  DollarSign,
} from 'lucide-react-native';
import { useAppStore } from '../store/store';
import { maybeRequestReview } from '../services/reviewPrompt';
import { colors } from '../theme/colors';
import { Pill } from '../components';

const fm = (n: number) => Math.round(n).toLocaleString();
const fK = (n: number) =>
  n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `$${Math.round(n / 1e3)}k` : `$${fm(n)}`;

// ─── icon map ────────────────────────────────────────────────────────────────
const ICS: Record<string, any> = {
  wallet: Wallet, cart: ShoppingCart, cc: CreditCard, tgt: Target,
  up: TrendingUp, home: Home, trophy: Trophy, heart: Heart,
  cal: Calendar, alert: AlertTriangle, dollar: DollarSign,
};

type StepType = 'action' | 'goal' | 'tip' | 'fyi' | 'win' | 'warning';

interface Step {
  id: string;
  priority: number;
  title: string;
  desc: string;
  icon: string;
  color: string;
  bg: string;
  shadow: string;
  type: StepType;
  impact?: string;
  timeline?: string;
}

// ─── label / color maps ──────────────────────────────────────────────────────
const TYPE_LABEL: Record<StepType, string> = {
  action: 'do now', goal: 'target', tip: 'pro tip',
  fyi: 'fyi', win: 'congrats', warning: 'watch out',
};
const TYPE_COLOR: Record<StepType, string> = {
  action: colors.green, goal: colors.orange, tip: colors.blue,
  fyi: colors.purple, win: colors.green, warning: colors.red,
};

export default function GamePlanScreen() {
  const store = useAppStore();
  const c = store.getCalcs();
  const [cel, sCel] = useState(false);

  const tD = store.totalDebt();
  const tE = store.totalExpenses();
  const subs  = store.expenses.find(e => e.id === 'subs')?.val  ?? 0;
  const fun   = store.expenses.find(e => e.id === 'fun')?.val   ?? 0;
  const rent  = store.expenses.find(e => e.id === 'rent')?.val  ?? 0;
  const food  = store.expenses.find(e => e.id === 'food')?.val  ?? 0;
  const cards = store.debts.find(d => d.id === 'cards')?.val    ?? 0;
  const student = store.debts.find(d => d.id === 'student')?.val ?? 0;

  const hasIncome  = store.take > 0;
  const hasGoal    = store.goal > 0;
  const hasExpenses = tE > 0;
  const saveable   = Math.round(subs * 0.4 + fun * 0.33);  // realistic monthly cut

  // ─── personalised step builder ──────────────────────────────────────────
  const steps = useMemo<Step[]>(() => {
    const s: Step[] = [];

    // ── 1. no income entered ─────────────────────────────────────────────
    if (!hasIncome) {
      s.push({
        id: 'no_income', priority: 0, type: 'action',
        title: 'start here: enter your take-home pay',
        desc: 'head to the math tab and enter what actually hits your bank account after taxes. every calculation depends on this number.',
        icon: 'wallet', color: colors.green, bg: colors.greenBg, shadow: colors.greenDark,
        impact: 'unlocks your whole plan', timeline: '2 minutes',
      });
      return s;
    }

    // ── 2. no expenses entered ────────────────────────────────────────────
    if (!hasExpenses) {
      s.push({
        id: 'no_expenses', priority: 1, type: 'action',
        title: 'fill in your monthly expenses',
        desc: 'tap "what it costs to be you" on the math tab. include everything — food, subscriptions, going out. the more honest you are, the more accurate your plan.',
        icon: 'cart', color: colors.yellow, bg: colors.yellowBg, shadow: colors.yellowDark,
        impact: 'reveals your real budget', timeline: '5 minutes',
      });
    }

    // ── 3. no goal set ────────────────────────────────────────────────────
    if (!hasGoal && hasIncome) {
      s.push({
        id: 'set_goal', priority: 2, type: 'action',
        title: 'set a target house price',
        desc: 'tap "set a goal house price" at the top of the math tab. without a target we can only tell you what you can afford — not how to get to where you want to go.',
        icon: 'tgt', color: colors.blue, bg: colors.blueBg, shadow: colors.blueDark,
        impact: 'makes the plan specific to your goal',
      });
    }

    // ── 4. credit card debt ───────────────────────────────────────────────
    if (cards > 0) {
      const dtiImpact = store.take > 0 ? Math.round(cards / store.take * 100) : 0;
      const monthsToPayoff = saveable > 0 ? Math.ceil(cards * 18 / saveable) : 0; // 18x monthly = rough balance
      s.push({
        id: 'cc_debt', priority: 3, type: 'warning',
        title: `credit card debt is costing you ~18–29% APR`,
        desc: `$${fm(cards)}/mo in credit card payments eating ${dtiImpact}% of your income. every dollar here = one less dollar toward your house. pay this down before anything else — the interest rate makes it the most expensive debt you own.`,
        icon: 'cc', color: colors.red, bg: colors.redBg, shadow: colors.redDark,
        impact: `frees $${fm(cards)}/mo when cleared`,
        timeline: monthsToPayoff > 0 ? `~${monthsToPayoff} months at current pace` : undefined,
      });
    }

    // ── 5. total debt too high ────────────────────────────────────────────
    if (tD > store.take * 0.15 && store.take > 0 && cards === 0) {
      const excess = Math.round(tD - store.take * 0.1);
      s.push({
        id: 'high_debt', priority: 4, type: 'warning',
        title: `your debt payments are ${Math.round(tD / store.take * 100)}% of income`,
        desc: `lenders get nervous above 15%. you're at $${fm(tD)}/mo. reduce this before applying — every dollar of monthly debt reduces your max mortgage by roughly $5–6 in loan amount.`,
        icon: 'cc', color: colors.red, bg: colors.redBg, shadow: colors.redDark,
        impact: `cut $${fm(excess)}/mo to hit 10% threshold`,
      });
    } else if (tD > 0 && tD <= store.take * 0.15 && store.take > 0) {
      s.push({
        id: 'manageable_debt', priority: 7, type: 'goal',
        title: 'knock out the remaining debt',
        desc: `$${fm(tD)}/mo isn't killing your chances, but $0 is always better for your mortgage rate and DTI score. put any windfalls (bonus, tax refund) directly toward this.`,
        icon: 'cc', color: colors.orange, bg: colors.orangeBg, shadow: colors.orangeDark,
        impact: `$${fm(tD)}/mo freed permanently`,
      });
    }

    // ── 6. student loans ──────────────────────────────────────────────────
    if (student > 0 && cards === 0) {
      s.push({
        id: 'student_loans', priority: 5, type: 'fyi',
        title: `student loans: $${fm(student)}/mo — here's the truth`,
        desc: `student loans alone won't stop you from buying. lenders care about your DTI, not the type of debt. as long as your total debt-to-income stays under 36%, you can still qualify. don't let this myth keep you renting forever.`,
        icon: 'dollar', color: colors.blue, bg: colors.blueBg, shadow: colors.blueDark,
        impact: 'myth busted — you can still qualify',
      });
    }

    // ── 7. subscription audit ─────────────────────────────────────────────
    if (subs > 60 && hasIncome) {
      const monthlySave = Math.round(subs * 0.4);
      const yearlySave = monthlySave * 12;
      s.push({
        id: 'subscription_audit', priority: 6, type: 'tip',
        title: `$${fm(subs)}/mo in subscriptions — audit them`,
        desc: `that's $${fm(subs * 12)}/yr. cancel everything for one month and only resubscribe to the ones you actually miss. the average person is paying for 3–4 forgotten services.`,
        icon: 'cart', color: colors.purple, bg: colors.purpleBg, shadow: colors.purpleDark,
        impact: `~$${fm(monthlySave)}/mo saveable ($${fm(yearlySave)}/yr)`,
        timeline: '1 weekend to audit',
      });
    }

    // ── 8. food / eating out ──────────────────────────────────────────────
    if (food > store.take * 0.12 && hasIncome) {
      const save = Math.round(food * 0.25);
      s.push({
        id: 'food_cut', priority: 8, type: 'tip',
        title: `food spending is high at $${fm(food)}/mo`,
        desc: `that's ${Math.round(food / store.take * 100)}% of your take-home. cutting by 25% through meal prepping 3 nights a week adds $${fm(save * 12)} to your down payment fund over a year — without feeling deprived.`,
        icon: 'cart', color: colors.orange, bg: colors.orangeBg, shadow: colors.orangeDark,
        impact: `$${fm(save)}/mo freed`,
        timeline: '12 months',
      });
    }

    // ── 9. entertainment too high ─────────────────────────────────────────
    if (fun > store.take * 0.08 && hasIncome) {
      const saved = Math.round(fun * 0.33);
      s.push({
        id: 'fun_cut', priority: 9, type: 'tip',
        title: `cut the going-out budget by a third`,
        desc: `$${fm(fun)}/mo on entertainment is ${Math.round(fun / store.take * 100)}% of your income. cutting by 33% for 12 months adds $${fm(saved * 12)} toward your down payment — and you'll barely notice after week 3.`,
        icon: 'heart', color: colors.orange, bg: colors.orangeBg, shadow: colors.orangeDark,
        impact: `$${fm(saved)}/mo redirected`,
        timeline: '12 months',
      });
    }

    // ── 10. goal gap ──────────────────────────────────────────────────────
    if (hasGoal && c.gGap > 0 && hasIncome) {
      const monthsAtCurrentPace = saveable > 0 ? Math.ceil(c.gGap / saveable * 30) : 0;
      s.push({
        id: 'goal_gap', priority: 10, type: 'goal',
        title: `close the $${fm(c.gGap)}/mo gap to your ${fK(store.goal)} goal`,
        desc: `you need $${fm(c.gPay)}/mo for that house. you can afford $${fm(c.mx)}/mo right now. that's a $${fm(c.gGap)}/mo gap. you can close it by earning more, cutting expenses, saving a bigger down payment (which lowers the mortgage), or adjusting the target price.`,
        icon: 'tgt', color: colors.blue, bg: colors.blueBg, shadow: colors.blueDark,
        impact: `$${fm(c.gGap)}/mo to close`,
        timeline: monthsAtCurrentPace > 0 ? `~${monthsAtCurrentPace} months at current savings pace` : undefined,
      });
    } else if (hasGoal && c.gGap === 0 && c.gPay > 0 && hasIncome) {
      s.push({
        id: 'goal_achievable', priority: 3, type: 'win',
        title: `you can afford your ${fK(store.goal)} goal right now`,
        desc: `your max is $${fm(c.mx)}/mo and the payment on your goal house is $${fm(c.gPay)}/mo — that's a $${fm(c.mx - c.gPay)}/mo cushion. get pre-approved and start looking seriously.`,
        icon: 'trophy', color: colors.green, bg: colors.greenBg, shadow: colors.greenDark,
        impact: `$${fm(c.mx - c.gPay)}/mo cushion`,
      });
    }

    // ── 11. down payment too low ──────────────────────────────────────────
    if (c.price > 0 && store.dp < c.price * 0.2 && hasIncome) {
      const need = Math.max(0, c.price * 0.2 - store.dp);
      const monthsDP = saveable > 0 ? Math.ceil(need / saveable) : 0;
      const pmiMonthly = Math.round(c.price * 0.006 / 12);
      s.push({
        id: 'down_payment', priority: 11, type: 'goal',
        title: 'get to 20% down and kill PMI',
        desc: `you have $${fm(store.dp)} saved. 20% on a ${fK(c.price)} house is $${fm(c.price * 0.2)} — you need $${fm(need)} more. once you hit 20%, you eliminate PMI ($${fm(pmiMonthly)}/mo that builds zero equity) and get a better rate.`,
        icon: 'tgt', color: colors.green, bg: colors.greenBg, shadow: colors.greenDark,
        impact: `saves $${fm(pmiMonthly)}/mo in PMI`,
        timeline: monthsDP > 0 ? `~${monthsDP} months saving $${fm(saveable)}/mo` : undefined,
      });
    }

    // ── 12. shop rates ────────────────────────────────────────────────────
    if (hasIncome && c.loan > 50000) {
      const savingsPerHalfPct = Math.round(c.loan * 0.005 / 12);
      s.push({
        id: 'shop_rates', priority: 12, type: 'tip',
        title: 'shop your mortgage rate — get 5+ quotes',
        desc: `0.5% lower on your $${fK(c.loan)} loan saves $${fm(savingsPerHalfPct)}/mo — that's $${fm(savingsPerHalfPct * 360)} over 30 years. lenders give the same person wildly different rates. never go with the first quote.`,
        icon: 'up', color: colors.blue, bg: colors.blueBg, shadow: colors.blueDark,
        impact: `$${fm(savingsPerHalfPct)}/mo per 0.5% saved`,
        timeline: '2–3 weeks to shop',
      });
    }

    // ── 13. rent context ──────────────────────────────────────────────────
    if (rent > 0 && c.mx > 0 && hasIncome) {
      const diff = c.mx - rent;
      const absDiff = Math.abs(diff);
      s.push({
        id: 'rent_vs_mortgage', priority: 13, type: 'fyi',
        title: `your rent is $${fm(rent)}/mo — here's what changes`,
        desc: diff > 100
          ? `your max mortgage payment is $${fm(absDiff)} more than your current rent. budget for that jump — plus property tax, insurance, HOA, and a repairs fund on top of the P&I.`
          : diff < -100
          ? `your max mortgage is actually $${fm(absDiff)} less than your current rent. owning could cost you less monthly — nice position to be in.`
          : `your max mortgage is about the same as your current rent. relatively smooth financial transition to ownership.`,
        icon: 'home', color: colors.blue, bg: colors.blueBg, shadow: colors.blueDark,
        impact: diff > 0 ? `plan for +$${fm(diff)}/mo jump` : `potentially saving $${fm(absDiff)}/mo`,
      });
    }

    // ── 14. rate check ────────────────────────────────────────────────────
    if (store.rate > 7.5 && hasIncome) {
      s.push({
        id: 'high_rate', priority: 5, type: 'warning',
        title: `your rate assumption of ${store.rate}% is high`,
        desc: `you've entered ${store.rate}% as your expected rate — that's above recent averages. even a 0.5% improvement from shopping lenders adds $${fm(Math.round(c.loan * 0.005 / 12))}/mo back to your budget. shop aggressively.`,
        icon: 'alert', color: colors.orange, bg: colors.orangeBg, shadow: colors.orangeDark,
        impact: 'shopping lenders could close this gap',
      });
    }

    // ── 15. everything looks good ─────────────────────────────────────────
    if (s.length === 0 && hasIncome && hasExpenses) {
      s.push({
        id: 'ready', priority: 0, type: 'win',
        title: "your finances are in solid shape",
        desc: 'income is solid, debt is manageable, DTI is healthy. next step: get pre-approved by at least 3 lenders and start looking for real. you are ready.',
        icon: 'trophy', color: colors.green, bg: colors.greenBg, shadow: colors.greenDark,
        impact: 'time to go shopping',
      });
    }

    return s.sort((a, b) => a.priority - b.priority);
  }, [
    store.take, tD, tE, subs, fun, rent, food, cards, student,
    hasIncome, hasGoal, hasExpenses, c, store.dp, store.goal, saveable,
  ]);

  const doneCount = steps.filter(s => store.done[s.id]).length;
  const allDone = doneCount === steps.length && steps.length > 0;
  useEffect(() => {
    if (allDone && steps.length > 2) {
      sCel(true);
      const st = store;
      maybeRequestReview({
        hasIncome: st.take > 0,
        hasExpenses: st.totalExpenses() > 0,
        readinessScore: store.getCalcs().rd,
      });
    }
  }, [allDone]);

  // ─── progress bar colour ─────────────────────────────────────────────────
  const progressPct = steps.length > 0 ? doneCount / steps.length : 0;
  const progressColor =
    progressPct < 0.4 ? colors.red :
    progressPct < 0.7 ? colors.orange : colors.green;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* header */}
      <View style={{ alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: '900', color: colors.text }}>
          {!hasIncome
            ? 'your game plan starts here'
            : allDone
            ? 'plan complete 🎉'
            : `${steps.length - doneCount} steps left`}
        </Text>

        {steps.length > 1 && (
          <>
            {/* progress bar */}
            <View style={{
              width: '100%', height: 8, borderRadius: 4,
              backgroundColor: colors.surface, marginTop: 10, overflow: 'hidden',
            }}>
              <View style={{
                width: `${progressPct * 100}%`, height: '100%',
                borderRadius: 4, backgroundColor: progressColor,
              }} />
            </View>
            {doneCount > 0 && (
              <Text style={{ color: progressColor, fontSize: 12, fontWeight: '700', marginTop: 4 }}>
                {doneCount}/{steps.length} done
              </Text>
            )}
          </>
        )}

        {/* personalisation context */}
        {hasIncome && (
          <View style={{
            flexDirection: 'row', flexWrap: 'wrap', gap: 6,
            marginTop: 10, justifyContent: 'center',
          }}>
            {hasGoal && (
              <Pill text={`goal: ${fK(store.goal)}`} color={colors.blue} bg={colors.blueBg} />
            )}
            {store.dp > 0 && (
              <Pill text={`saved: ${fK(store.dp)}`} color={colors.green} bg={colors.greenBg} />
            )}
            {tD > 0 && (
              <Pill text={`debt: $${fm(tD)}/mo`} color={colors.red} bg={colors.redBg} />
            )}
            <Pill text={`max: $${fm(c.mx)}/mo`} color={colors.orange} bg={colors.orangeBg} />
          </View>
        )}
      </View>

      {/* steps */}
      <View style={{ paddingHorizontal: 16, gap: 10 }}>
        {steps.map(step => {
          const IC = ICS[step.icon] || Target;
          const isDone = store.done[step.id];
          const tc = TYPE_COLOR[step.type];

          return (
            <View
              key={step.id}
              style={{
                backgroundColor: '#fff', borderRadius: 16, padding: 16,
                borderWidth: 2,
                borderColor: isDone ? colors.green : step.color,
                borderBottomWidth: 4,
                borderBottomColor: isDone ? colors.greenDark : step.shadow,
                opacity: isDone ? 0.5 : 1,
              }}>
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
                {/* icon */}
                <View style={{
                  width: 40, height: 40, borderRadius: 10,
                  backgroundColor: isDone ? colors.greenBg : step.bg,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  {isDone
                    ? <Check size={20} color={colors.green} />
                    : <IC size={20} color={step.color} />}
                </View>

                <View style={{ flex: 1 }}>
                  {/* type badge */}
                  <View style={{
                    backgroundColor: (isDone ? colors.green : tc) + '18',
                    alignSelf: 'flex-start',
                    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, marginBottom: 3,
                  }}>
                    <Text style={{
                      fontSize: 9, fontWeight: '800', textTransform: 'uppercase',
                      color: isDone ? colors.green : tc,
                    }}>
                      {isDone ? 'done ✓' : TYPE_LABEL[step.type]}
                    </Text>
                  </View>

                  {/* title */}
                  <Text style={{
                    color: colors.text, fontSize: 14, fontWeight: '800',
                    textDecorationLine: isDone ? 'line-through' : 'none',
                    marginBottom: 4,
                  }}>
                    {step.title}
                  </Text>

                  {/* description */}
                  <Text style={{
                    color: colors.textMed, fontSize: 12, lineHeight: 18, marginBottom: 10,
                  }}>
                    {step.desc}
                  </Text>

                  {/* pills + action */}
                  <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                    {step.impact && (
                      <Pill text={step.impact} color={step.color} bg={step.bg} />
                    )}
                    {step.timeline && (
                      <Pill text={step.timeline} color={colors.textMed} bg={colors.surface} />
                    )}
                    <TouchableOpacity
                      onPress={() => store.toggleDone(step.id)}
                      activeOpacity={0.8}
                      style={{
                        backgroundColor: isDone ? colors.surface : step.color,
                        paddingHorizontal: 14, paddingVertical: 6,
                        borderRadius: 8,
                        borderBottomWidth: isDone ? 0 : 2,
                        borderBottomColor: step.shadow,
                      }}>
                      <Text style={{
                        fontSize: 12, fontWeight: '800',
                        color: isDone ? colors.textMed : '#fff',
                      }}>
                        {isDone ? 'undo' : 'mark done'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {/* monthly reminder */}
      {hasIncome && (
        <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
          <View style={{
            backgroundColor: '#fff', borderRadius: 16, padding: 16,
            borderWidth: 2, borderColor: colors.blue,
            borderBottomWidth: 4, borderBottomColor: colors.blueDark,
          }}>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <View style={{
                width: 40, height: 40, borderRadius: 10,
                backgroundColor: colors.blueBg, alignItems: 'center', justifyContent: 'center',
              }}>
                <Calendar size={20} color={colors.blue} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 13, fontWeight: '800' }}>
                  come back monthly
                </Text>
                <Text style={{ color: colors.textMed, fontSize: 11 }}>
                  update your numbers as your situation changes. your plan updates automatically.
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* celebration modal */}
      <Modal visible={cel} transparent animationType="fade">
        <View style={{
          flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
          alignItems: 'center', justifyContent: 'center', padding: 24,
        }}>
          <View style={{
            backgroundColor: '#fff', borderRadius: 24, padding: 36,
            alignItems: 'center', maxWidth: 340, width: '100%',
            borderWidth: 3, borderColor: colors.green,
          }}>
            <View style={{
              width: 72, height: 72, borderRadius: 18,
              backgroundColor: colors.greenBg, alignItems: 'center', justifyContent: 'center',
              marginBottom: 16, borderWidth: 3, borderColor: colors.green,
            }}>
              <Trophy size={36} color={colors.green} />
            </View>
            <Text style={{ fontSize: 26, fontWeight: '900', color: colors.text, marginBottom: 8 }}>
              you crushed it
            </Text>
            <Text style={{ fontSize: 14, color: colors.textMed, textAlign: 'center', lineHeight: 22, marginBottom: 20 }}>
              every step done. your finances are in a strong position. get pre-approved by 3+ lenders and start looking for real.
            </Text>
            <TouchableOpacity
              onPress={() => sCel(false)}
              activeOpacity={0.9}
              style={{
                width: '100%', padding: 16, borderRadius: 14,
                backgroundColor: colors.green, alignItems: 'center',
                borderBottomWidth: 4, borderBottomColor: colors.greenDark,
              }}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>
                let's keep going
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}