import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Share } from 'react-native';
import { Flame, Lock, Share2, Check } from 'lucide-react-native';
import { useAppStore } from '../store/store';
import { colors } from '../theme/colors';
import { ChunkyCard, Pill, PaywallModal } from '../components';

interface Myth { q: string; a: string; v: string; cl: string; bg: string; sp: number; cat: string; }

const FREE: Myth[] = [
  { q: 'renting is throwing money away', a: "the first ~7 years of a mortgage, most of your payment is pure interest going to the bank. renting buys flexibility, no maintenance bills, and no risk of owing more than your house is worth.", v: 'mostly bs', cl: colors.red, bg: colors.redBg, sp: 4, cat: 'buying' },
  { q: 'buy the most house you qualify for', a: "banks will approve you for way more than you should spend. they stress-test against their risk models, not your happiness. one surprise expense at your max = financial ruin.", v: 'total bs', cl: colors.red, bg: colors.redBg, sp: 5, cat: 'buying' },
  { q: 'you need exactly 20% down', a: "you can buy with 3-5% down (FHA/conventional). but under 20% means PMI: $100-300/mo that builds zero equity. 20% isn't law — it's the cheat code.", v: 'half true', cl: colors.yellow, bg: colors.yellowBg, sp: 3, cat: 'money' },
  { q: 'real estate always goes up', a: '2006-2012 entered the chat. housing generally appreciates over 20-30 year windows, but short-term it can drop 30-40% and take a full decade to recover.', v: 'dangerous', cl: colors.red, bg: colors.redBg, sp: 5, cat: 'investing' },
  { q: '30-year fixed is always the move', a: "if you're moving in 5-7 years, an ARM could save $200-400/mo. a 15-year builds equity way faster. the 30-year maximizes what the bank earns off you.", v: 'depends', cl: colors.yellow, bg: colors.yellowBg, sp: 3, cat: 'loans' },
  { q: 'your realtor has your back', a: "they earn a percentage of the sale price. higher price = bigger commission check. they're incentivized to get you to overspend and close fast. treat them like salespeople.", v: 'usually bs', cl: colors.red, bg: colors.redBg, sp: 4, cat: 'people' },
  { q: 'the mortgage interest deduction is huge', a: "standard deduction is $29,200 (married, 2024). your itemized deductions have to beat that for any benefit. and you're still paying way more in interest than you save.", v: 'overblown', cl: colors.orange, bg: colors.orangeBg, sp: 3, cat: 'taxes' },
  { q: 'buying is always cheaper than renting', a: 'in many cities the full cost of owning (mortgage + tax + insurance + maintenance + opportunity cost on your down payment) is more than rent. run actual numbers.', v: 'depends', cl: colors.yellow, bg: colors.yellowBg, sp: 3, cat: 'buying' },
  { q: 'buy ASAP — stop wasting time renting', a: "buying before you're ready = house-poor. you own something but can't fix the water heater, can't go on vacation, can't save for retirement.", v: 'bad advice', cl: colors.red, bg: colors.redBg, sp: 4, cat: 'timing' },
  { q: 'a house is your biggest investment', a: 'the S&P 500 has outperformed housing in nearly every 30-year window in history. your career and actual investments are your real wealth builders.', v: 'misleading', cl: colors.orange, bg: colors.orangeBg, sp: 4, cat: 'investing' },
];

const PRO_MYTHS: Myth[] = [
  { q: 'closing costs are only 2-3%', a: "they're actually 3-6% of the purchase price. on a $350k house that's $10,500-$21,000 in cash you need ON TOP of your down payment. nobody mentions this in the zillow daydream.", v: 'undersold', cl: colors.red, bg: colors.redBg, sp: 4, cat: 'money' },
  { q: 'you can trust the home inspection', a: "home inspectors miss stuff constantly. they can't see inside walls, under foundations, or behind finished basements. always get specialized inspections for roof, HVAC, plumbing, and pest.", v: 'risky', cl: colors.red, bg: colors.redBg, sp: 4, cat: 'process' },
  { q: 'HOA fees are no big deal', a: "they average $250/mo nationally and can increase every year with zero limit in most states. plus special assessments can hit you with $5-20k surprise bills.", v: 'undersold', cl: colors.orange, bg: colors.orangeBg, sp: 4, cat: 'money' },
  { q: "pre-approval means you're approved", a: "pre-approval is a rough estimate based on what you told them. the real underwriting happens after you're under contract and they can still deny you.", v: 'misleading', cl: colors.orange, bg: colors.orangeBg, sp: 3, cat: 'process' },
  { q: "the listing price is what you'll pay", a: "in hot markets you pay over asking. in slow markets you negotiate under. plus closing costs, repairs, moving, furniture — actual cost is 5-15% more than the sticker.", v: 'rarely true', cl: colors.yellow, bg: colors.yellowBg, sp: 3, cat: 'buying' },
  { q: 'you should skip the home warranty', a: "for $400-600/year it covers major systems (HVAC, plumbing, appliances). one broken AC unit is $3-8k. it's cheap insurance for the first 1-2 years.", v: 'bad advice', cl: colors.red, bg: colors.redBg, sp: 3, cat: 'process' },
  { q: 'you can renovate your way to profit', a: "most renovations return 60-80 cents on the dollar. only kitchen and bathroom remodels sometimes break even. HGTV is entertainment, not financial advice.", v: 'usually bs', cl: colors.red, bg: colors.redBg, sp: 4, cat: 'investing' },
  { q: 'property taxes stay the same', a: "they get reassessed regularly. in many states, buying a house triggers an immediate reassessment to market value. your taxes can jump 50-100% from what the previous owner paid.", v: 'wrong', cl: colors.red, bg: colors.redBg, sp: 5, cat: 'taxes' },
  { q: 'you should always put down as much as possible', a: "if your mortgage rate is 6.5% but your investments earn 10%, that extra money works harder invested. there's an optimal point — usually 20% down, invest the rest.", v: 'oversimplified', cl: colors.yellow, bg: colors.yellowBg, sp: 3, cat: 'money' },
  { q: 'spring is the best time to buy', a: "spring has the most inventory but also the most competition. winter has fewer listings but sellers are more motivated and you'll face fewer bidding wars.", v: 'outdated', cl: colors.yellow, bg: colors.yellowBg, sp: 2, cat: 'timing' },
  { q: 'the school district doesn\'t matter if you don\'t have kids', a: "school district is the #1 driver of resale value. buying in a bad district to save money now means selling at a discount later.", v: 'wrong', cl: colors.red, bg: colors.redBg, sp: 4, cat: 'buying' },
  { q: 'your first offer should be lowball', a: "in competitive markets a lowball offer gets ignored. your agent should pull comps and make a fair, competitive offer. save negotiating for the inspection contingency.", v: 'depends', cl: colors.yellow, bg: colors.yellowBg, sp: 3, cat: 'process' },
  { q: 'new construction = no problems', a: "new builds have just as many issues. rushed contractors, lowest-bid materials, settling foundation. ALWAYS get an independent inspection even on new builds.", v: 'myth', cl: colors.red, bg: colors.redBg, sp: 4, cat: 'buying' },
  { q: 'you don\'t need a lawyer for closing', a: "in many states it's not required, but a real estate lawyer costs $500-1500 and catches contract issues that save you thousands. the title company works for the lender, not you.", v: 'risky skip', cl: colors.orange, bg: colors.orangeBg, sp: 3, cat: 'process' },
  { q: 'mortgage rates are the same everywhere', a: "rates vary significantly between lenders on the same day. getting 5 quotes vs 1 can save you 0.25-0.75% — that's tens of thousands over 30 years.", v: 'wrong', cl: colors.red, bg: colors.redBg, sp: 4, cat: 'loans' },
  { q: 'you should buy the worst house on the best street', a: "only if you have the cash AND skills to renovate. most people underestimate renovation costs by 30-50%. the worst house might be worst for a reason (foundation, layout, flood zone).", v: 'risky advice', cl: colors.orange, bg: colors.orangeBg, sp: 3, cat: 'buying' },
  { q: 'ARMs are always dangerous', a: "5/1 and 7/1 ARMs can save you thousands if you sell or refinance before the adjustment period. they got a bad rep from 2008 but the products are much better regulated now.", v: 'outdated fear', cl: colors.yellow, bg: colors.yellowBg, sp: 3, cat: 'loans' },
  { q: 'you can\'t buy with student loan debt', a: "you absolutely can. lenders care about your DTI ratio, not the existence of debt. if your payments are manageable relative to income, you can qualify.", v: 'false', cl: colors.green, bg: colors.greenBg, sp: 2, cat: 'money' },
  { q: 'condos are cheaper than houses', a: "sticker price might be lower, but HOA fees ($200-800/mo) plus special assessments can make the total cost equal to or more than a house over 10 years.", v: 'misleading', cl: colors.orange, bg: colors.orangeBg, sp: 3, cat: 'buying' },
  { q: 'you should drain your savings for the down payment', a: "never. you need 3-6 months of expenses as an emergency fund AFTER closing. houses break immediately. roof, HVAC, plumbing — something will go wrong month one.", v: 'dangerous', cl: colors.red, bg: colors.redBg, sp: 5, cat: 'money' },
];

// NOTE: we have 10 free + 20 pro = 30 real myths written.
// the app says "200+" as the eventual content goal.
// more will be added over time as content.

export default function BSFilterScreen() {
  const store = useAppStore();
  const [exp, sE] = useState<number | null>(null);
  const [filter, sF] = useState('all');
  const [showPay, sPay] = useState(false);
  const [copied, sC] = useState<number | null>(null);

  const allMyths = store.isPro ? [...FREE, ...PRO_MYTHS] : FREE;
  const cats = [...new Set(allMyths.map(m => m.cat))];
  const filtered = filter === 'all' ? allMyths : allMyths.filter(m => m.cat === filter);

  const doShare = async (m: Myth) => {
    try { await Share.share({ message: `"${m.q}" — ${m.v}.\n\n${m.a}\n\n— via HonestHouse app` }); } catch {}
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={{ alignItems: 'center', paddingVertical: 14 }}>
        <Text style={{ color: colors.textLight, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 3 }}>bs detector</Text>
        <Text style={{ fontSize: 20, fontWeight: '900', color: colors.text, marginVertical: 4 }}>stuff people say that's wrong</Text>
        <Text style={{ color: colors.textMed, fontSize: 12 }}>
          {store.isPro ? `${allMyths.length} myths unlocked` : `${FREE.length} free · ${PRO_MYTHS.length} more in pro`}
        </Text>
      </View>

      {/* FILTERS */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 6 }}>
        {['all', ...cats].map(ct => (
          <TouchableOpacity key={ct} onPress={() => sF(ct)} activeOpacity={0.8}
            style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100, borderWidth: 1.5, borderColor: filter === ct ? colors.text : colors.border, backgroundColor: filter === ct ? colors.text : 'transparent' }}>
            <Text style={{ fontSize: 12, fontWeight: '800', color: filter === ct ? '#fff' : colors.textMed, textTransform: 'capitalize' }}>{ct}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* MYTHS */}
      <View style={{ paddingHorizontal: 16, gap: 6 }}>
        {filtered.map((m, i) => {
          const ri = allMyths.indexOf(m);
          const isExp = exp === ri;
          return (
            <ChunkyCard key={ri} color={isExp ? m.cl : colors.border} shadowColor={isExp ? m.cl + '66' : colors.border} onPress={() => sE(isExp ? null : ri)}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontSize: 13, fontWeight: '800', lineHeight: 20 }}>"{m.q}"</Text>
                  <View style={{ flexDirection: 'row', gap: 2, marginTop: 4 }}>
                    {[...Array(5)].map((_, j) => <Flame key={j} size={11} color={j < m.sp ? colors.red : colors.border} />)}
                  </View>
                </View>
                <Pill text={m.v} color={m.cl} bg={m.bg} />
              </View>
              {isExp && <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 2, borderTopColor: colors.surface }}>
                <Text style={{ color: colors.textMed, fontSize: 13, lineHeight: 21, marginBottom: 8 }}>{m.a}</Text>
                <TouchableOpacity onPress={() => doShare(m)} activeOpacity={0.8}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 7, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start' }}>
                  <Share2 size={12} color={colors.textMed} /><Text style={{ fontSize: 11, fontWeight: '700', color: colors.textMed }}>share</Text>
                </TouchableOpacity>
              </View>}
            </ChunkyCard>
          );
        })}
      </View>

      {/* LOCKED PREVIEWS (only if not pro) */}
      {!store.isPro && <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
        <View style={{ opacity: 0.5 }}>
          {PRO_MYTHS.slice(0, 5).map((m, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.surface }}>
              <Lock size={14} color={colors.purple} /><Text style={{ flex: 1, color: colors.text, fontSize: 12, fontWeight: '700' }}>"{m.q}"</Text><Pill text="pro" color={colors.purple} bg={colors.purpleBg} />
            </View>
          ))}
          <Text style={{ textAlign: 'center', paddingVertical: 8, color: colors.textMed, fontSize: 12 }}>and {PRO_MYTHS.length - 5} more...</Text>
        </View>

        <ChunkyCard color={colors.purple} shadowColor={colors.purpleDark} onPress={() => sPay(true)} style={{ marginTop: 4 }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: colors.text, fontSize: 15, fontWeight: '900' }}>unlock all {FREE.length + PRO_MYTHS.length} myths</Text>
            <Text style={{ color: colors.textMed, fontSize: 12, marginTop: 3 }}>plus scripts, checklists & tools</Text>
            <View style={{ marginTop: 10 }}><Pill text="7-day free trial → $2.99/mo" color={colors.purple} bg={colors.purpleBg} /></View>
          </View>
        </ChunkyCard>
      </View>}

      <PaywallModal visible={showPay} onClose={() => sPay(false)} onPurchase={() => { store.setPro(true); sPay(false); }} />
    </ScrollView>
  );
}
