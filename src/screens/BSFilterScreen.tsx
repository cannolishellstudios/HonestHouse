import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Share } from 'react-native';
import { Flame, Lock, Share2 } from 'lucide-react-native';
import { useAppStore } from '../store/store';
import { colors } from '../theme/colors';
import { ChunkyCard, Pill, PaywallModal } from '../components';

interface Myth { q: string; a: string; v: string; cl: string; bg: string; sp: number; cat: string; }

// ─── 10 FREE ──────────────────────────────────────────────────────────────────
const FREE: Myth[] = [
  { q: 'renting is throwing money away', a: "the first 7+ years of a mortgage, most of your payment is pure interest going to the bank — not equity. renting buys flexibility, zero maintenance bills, and no risk of owing more than the house is worth.", v: 'mostly bs', cl: colors.red, bg: colors.redBg, sp: 4, cat: 'buying' },
  { q: 'buy the most house you qualify for', a: "banks approve you for way more than you should spend. they stress-test against their own risk models, not your actual happiness or lifestyle. one surprise expense at max = financial ruin.", v: 'total bs', cl: colors.red, bg: colors.redBg, sp: 5, cat: 'buying' },
  { q: 'you need exactly 20% down', a: "you can buy with 3–5% down (FHA/conventional). under 20% means PMI: $100–300/mo that builds zero equity. 20% isn't a law — it's the cheat code to skip that extra charge.", v: 'half true', cl: colors.yellow, bg: colors.yellowBg, sp: 3, cat: 'money' },
  { q: 'real estate always goes up', a: '2006–2012 entered the chat. housing generally appreciates over 20–30 year windows, but short-term it can drop 30–40% and take a full decade to recover. it is not a guarantee.', v: 'dangerous', cl: colors.red, bg: colors.redBg, sp: 5, cat: 'investing' },
  { q: '30-year fixed is always the move', a: "if you're moving in 5–7 years, an ARM could save $200–400/mo. a 15-year builds equity far faster. the 30-year fixed maximizes what the bank earns off you over time.", v: 'depends', cl: colors.yellow, bg: colors.yellowBg, sp: 3, cat: 'loans' },
  { q: 'your realtor has your back', a: "they earn a percentage of the sale price. higher price = bigger commission check for them. they are incentivized to get you to overspend and close fast. treat them like salespeople.", v: 'usually bs', cl: colors.red, bg: colors.redBg, sp: 4, cat: 'people' },
  { q: 'the mortgage interest deduction is huge', a: "standard deduction is $29,200 (married, 2024). your itemized deductions have to beat that for any benefit. you're still paying far more in interest than you ever save on taxes.", v: 'overblown', cl: colors.orange, bg: colors.orangeBg, sp: 3, cat: 'taxes' },
  { q: 'buying is always cheaper than renting', a: 'in many cities the full cost of owning (mortgage + tax + insurance + maintenance + opportunity cost on down payment) exceeds rent. always run real numbers for your specific market.', v: 'depends', cl: colors.yellow, bg: colors.yellowBg, sp: 3, cat: 'buying' },
  { q: 'buy ASAP — stop wasting time renting', a: "buying before you're ready financially means being house-poor. you technically own something but can't fix the water heater, take a vacation, or save for retirement.", v: 'bad advice', cl: colors.red, bg: colors.redBg, sp: 4, cat: 'timing' },
  { q: 'a house is your biggest investment', a: 'the S&P 500 has outperformed housing in nearly every 30-year window in history. your career growth and actual investment accounts are your real wealth builders — not your address.', v: 'misleading', cl: colors.orange, bg: colors.orangeBg, sp: 4, cat: 'investing' },
];

// ─── 40 PRO ───────────────────────────────────────────────────────────────────
const PRO: Myth[] = [
  // money
  { q: 'closing costs are only 2–3%', a: "they're actually 3–6% of the purchase price. on a $350k house that's up to $21,000 in cash needed ON TOP of your down payment. nobody mentions this in the Zillow daydream phase.", v: 'undersold', cl: colors.red, bg: colors.redBg, sp: 4, cat: 'money' },
  { q: 'HOA fees are no big deal', a: "they average $250/mo nationally and can increase annually with no cap in most states. special assessments can hit you with $5,000–$20,000 surprise bills with little warning.", v: 'undersold', cl: colors.orange, bg: colors.orangeBg, sp: 4, cat: 'money' },
  { q: 'you should put down as much cash as possible', a: "if your mortgage rate is 6.5% but your investments earn 10%+, that extra cash works harder invested. the optimal point is usually exactly 20% down — invest everything above that.", v: 'oversimplified', cl: colors.yellow, bg: colors.yellowBg, sp: 3, cat: 'money' },
  { q: 'you can\'t buy with student loan debt', a: "you absolutely can. lenders care about your debt-to-income ratio, not the mere existence of debt. if your payments are manageable relative to your income, you can still qualify.", v: 'false', cl: colors.green, bg: colors.greenBg, sp: 2, cat: 'money' },
  { q: 'you should drain savings for the down payment', a: "never. you need 3–6 months of living expenses as an emergency fund after closing. houses break immediately — roof, HVAC, plumbing. something will go wrong in month one.", v: 'dangerous', cl: colors.red, bg: colors.redBg, sp: 5, cat: 'money' },
  { q: 'property taxes stay roughly the same', a: "they get reassessed regularly. in many states, buying triggers an immediate reassessment to full market value. your taxes can jump 50–100% from what the previous owner was paying.", v: 'wrong', cl: colors.red, bg: colors.redBg, sp: 5, cat: 'taxes' },
  { q: 'PMI is just a small extra fee', a: "PMI runs $100–$300/mo and builds zero equity for you. on a $350k house with 5% down, you could pay $10,000+ in PMI before hitting 20% equity. it is a tax on being underprepared.", v: 'underplayed', cl: colors.orange, bg: colors.orangeBg, sp: 3, cat: 'money' },
  { q: 'first-time buyer programs aren\'t worth it', a: "many states offer 0%–1% down programs, forgivable down payment grants, and below-market rates specifically for first-time buyers. most people never check and leave free money on the table.", v: 'wrong', cl: colors.red, bg: colors.redBg, sp: 3, cat: 'money' },
  // process
  { q: 'you can trust the home inspection', a: "home inspectors miss things constantly. they cannot see inside walls, under foundations, or behind finished basements. always pay for specialized inspections: roof, HVAC, plumbing, and pest separately.", v: 'risky', cl: colors.red, bg: colors.redBg, sp: 4, cat: 'process' },
  { q: 'pre-approval means you\'re approved', a: "pre-approval is a rough estimate based on what you told them. real underwriting happens after you're under contract — and they can still deny you at the last minute.", v: 'misleading', cl: colors.orange, bg: colors.orangeBg, sp: 3, cat: 'process' },
  { q: 'the listing price is what you\'ll pay', a: "in hot markets you pay over asking. everywhere you add closing costs, repairs negotiated post-inspection, moving, and immediate furniture needs. actual total cost is 5–15% more than the sticker.", v: 'rarely true', cl: colors.yellow, bg: colors.yellowBg, sp: 3, cat: 'process' },
  { q: 'skip the home warranty — it\'s not worth it', a: "for $400–600/year it covers major systems: HVAC, plumbing, appliances. one broken central AC unit alone is $3,000–$8,000. it is cheap insurance for the first few years of ownership.", v: 'bad advice', cl: colors.red, bg: colors.redBg, sp: 3, cat: 'process' },
  { q: 'you don\'t need a real estate lawyer', a: "in many states it's not required, but a real estate lawyer costs $500–$1,500 and catches contract issues that can save you tens of thousands. the title company works for the lender, not you.", v: 'risky skip', cl: colors.orange, bg: colors.orangeBg, sp: 3, cat: 'process' },
  { q: 'your first offer should lowball hard', a: "in competitive markets a lowball offer gets ignored or blacklisted. your agent should pull comps and make a fair, competitive offer. save your negotiating leverage for the inspection contingency.", v: 'depends', cl: colors.yellow, bg: colors.yellowBg, sp: 3, cat: 'process' },
  { q: 'new construction means no problems', a: "new builds have just as many issues — rushed contractors, lowest-bid materials, settling foundations. always get an independent inspection even on brand new construction.", v: 'myth', cl: colors.red, bg: colors.redBg, sp: 4, cat: 'process' },
  { q: 'waiving inspection contingency is fine in hot markets', a: "this is how buyers end up owning $40,000 of hidden foundation damage. in a bidding war, offer more money instead — never waive your right to know what you're buying.", v: 'dangerous', cl: colors.red, bg: colors.redBg, sp: 5, cat: 'process' },
  // loans
  { q: 'mortgage rates are the same everywhere', a: "rates vary significantly between lenders on the same day for the same borrower. getting 5 quotes vs 1 can save 0.25–0.75% — that's tens of thousands of dollars over 30 years.", v: 'wrong', cl: colors.red, bg: colors.redBg, sp: 4, cat: 'loans' },
  { q: 'ARMs are always dangerous after 2008', a: "5/1 and 7/1 ARMs can save you real money if you sell or refinance before the adjustment. they got a bad reputation from 2008 but modern ARM products are far better regulated.", v: 'outdated fear', cl: colors.yellow, bg: colors.yellowBg, sp: 3, cat: 'loans' },
  { q: 'points are never worth buying', a: "buying points (paying upfront to lower your rate) makes sense if you'll stay in the home long enough to break even — typically 4–7 years. do the math before saying no.", v: 'depends', cl: colors.yellow, bg: colors.yellowBg, sp: 3, cat: 'loans' },
  { q: 'you should pay off your mortgage ASAP', a: "if your mortgage rate is 6% and you can earn 10% in index funds, paying extra on the mortgage loses you money. the math depends on your rate vs. expected investment returns.", v: 'depends', cl: colors.yellow, bg: colors.yellowBg, sp: 3, cat: 'loans' },
  { q: 'refinancing is always worth it', a: "the break-even point on refinancing costs is typically 2–4 years. if you might move before then, you could lose money even on a lower rate. always calculate your specific break-even.", v: 'depends', cl: colors.yellow, bg: colors.yellowBg, sp: 3, cat: 'loans' },
  // investing
  { q: 'you can renovate your way to profit', a: "most renovations return 60–80 cents on the dollar. only kitchen and bathroom updates sometimes break even at resale. HGTV is entertainment, not a financial blueprint.", v: 'usually bs', cl: colors.red, bg: colors.redBg, sp: 4, cat: 'investing' },
  { q: 'buying a fixer-upper is a smart deal', a: "only if you have the cash AND skilled labor. most people underestimate renovation costs by 30–50%. the worst house on the block might be worst for structural reasons — flood zone, layout, foundation.", v: 'risky advice', cl: colors.orange, bg: colors.orangeBg, sp: 3, cat: 'investing' },
  { q: 'condos are cheaper than houses', a: "sticker price might be lower, but HOA fees ($200–$800/mo) plus periodic special assessments can make the true 10-year cost equal to or greater than a single-family home.", v: 'misleading', cl: colors.orange, bg: colors.orangeBg, sp: 3, cat: 'investing' },
  { q: 'house hacking always works out', a: "being a landlord is a job. tenant problems, vacancy months, repairs, legal compliance — most accidental landlords lose money or their sanity in the first two years.", v: 'harder than it sounds', cl: colors.orange, bg: colors.orangeBg, sp: 3, cat: 'investing' },
  // buying
  { q: 'the school district doesn\'t matter without kids', a: "school district is the single biggest driver of resale value in most markets. buying in a poor district to save money now means selling at a discount later — or being stuck.", v: 'wrong', cl: colors.red, bg: colors.redBg, sp: 4, cat: 'buying' },
  { q: 'you should buy the worst house on the best street', a: "this only works if you have substantial cash reserves AND construction skills to execute. most buyers dramatically underestimate renovation timelines and costs by 30–50%+.", v: 'risky', cl: colors.orange, bg: colors.orangeBg, sp: 3, cat: 'buying' },
  { q: 'zillow\'s zestimate is accurate', a: "Zillow's algorithm has a median error rate of 2–7% — which sounds small until it's a $14,000–$49,000 error on a $700k house. use it as a starting point, never as gospel.", v: 'overrelied on', cl: colors.orange, bg: colors.orangeBg, sp: 3, cat: 'buying' },
  { q: 'spring is the best time to buy', a: "spring has the most inventory but also the most competition and highest prices. winter has fewer listings but more motivated sellers and far fewer bidding wars — often better deals.", v: 'outdated', cl: colors.yellow, bg: colors.yellowBg, sp: 2, cat: 'timing' },
  { q: 'open houses are how you find the right home', a: "most serious buyers find homes via their agent's MLS access days before open houses. the best properties often go under contract before the open house even happens.", v: 'outdated tactic', cl: colors.yellow, bg: colors.yellowBg, sp: 2, cat: 'process' },
  // people
  { q: 'the seller\'s agent is neutral', a: "the seller's agent is legally obligated to work for the seller — not you. every piece of information you share with them can and will be used to get more money from you.", v: 'dangerous assumption', cl: colors.red, bg: colors.redBg, sp: 4, cat: 'people' },
  { q: 'you need the same lender your realtor recommends', a: "realtors often recommend lenders who pay them referral fees or with whom they have relationships. shop independently — you are not obligated to use anyone your agent suggests.", v: 'conflict of interest', cl: colors.orange, bg: colors.orangeBg, sp: 3, cat: 'people' },
  // taxes
  { q: 'you can deduct all your home office expenses', a: "the IRS home office deduction requires the space be used regularly and exclusively for business. a desk in the corner of your bedroom does not qualify, regardless of what you've heard.", v: 'often wrong', cl: colors.orange, bg: colors.orangeBg, sp: 3, cat: 'taxes' },
  { q: 'capital gains on home sales are always tax-free', a: "up to $250k ($500k married) of profit is excluded — but only if you've lived there 2 of the last 5 years. sell too soon and you owe full capital gains tax on the entire profit.", v: 'conditions apply', cl: colors.yellow, bg: colors.yellowBg, sp: 3, cat: 'taxes' },
  // timing
  { q: 'wait for rates to drop before buying', a: "when rates drop, buyer demand surges and prices spike. you often end up paying more for the house even with a lower rate. buy when your finances are ready, not when the market looks perfect.", v: 'flawed logic', cl: colors.orange, bg: colors.orangeBg, sp: 4, cat: 'timing' },
  { q: 'the market is about to crash — just wait', a: "people have been saying this since 2012. waiting costs you years of equity building and locks you into rising rent. buy when you are personally ready, not when pundits agree.", v: 'bad strategy', cl: colors.red, bg: colors.redBg, sp: 4, cat: 'timing' },
  { q: 'you should move fast — inventory is always low', a: "urgency is the oldest sales tactic in real estate. moving fast without due diligence leads to overpaying and missing critical issues. the right house is worth the right process.", v: 'pressure tactic', cl: colors.orange, bg: colors.orangeBg, sp: 3, cat: 'timing' },
  // misc
  { q: 'bigger house = better investment', a: "larger homes have higher carrying costs, maintenance, and utility bills. the best performing real estate investments are often modest homes in high-demand locations — not size.", v: 'false', cl: colors.orange, bg: colors.orangeBg, sp: 3, cat: 'investing' },
  { q: 'your family/friends bought houses, so you should too', a: "social pressure is the #1 driver of financially bad home purchases. someone else's financial situation, timeline, and goals are not yours. buy when the math works for you.", v: 'peer pressure', cl: colors.red, bg: colors.redBg, sp: 4, cat: 'buying' },
  { q: 'equity in your home is accessible savings', a: "home equity is illiquid until you sell or take a HELOC/cash-out refi — both of which cost money and add risk. treating equity like a savings account leads to being over-leveraged.", v: 'misleading', cl: colors.orange, bg: colors.orangeBg, sp: 3, cat: 'investing' },
];

export default function BSFilterScreen() {
  const store = useAppStore();
  const [exp, sE] = useState<number | null>(null);
  const [filter, sF] = useState('all');
  const [showPay, sPay] = useState(false);

  const allMyths = store.isPro ? [...FREE, ...PRO] : FREE;
  const cats = [...new Set([...FREE, ...PRO].map(m => m.cat))];
  const filtered = filter === 'all' ? allMyths : allMyths.filter(m => m.cat === filter);

  const doShare = async (m: Myth) => {
    try {
      await Share.share({ message: `"${m.q}" — ${m.v}.\n\n${m.a}\n\n— via HonestHouse app` });
    } catch {}
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* header */}
      <View style={{ alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 }}>
        <Text style={{ color: colors.textLight, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 3 }}>
          bs detector
        </Text>
        <Text style={{ fontSize: 20, fontWeight: '900', color: colors.text, marginVertical: 4 }}>
          stuff people say that's wrong
        </Text>
        <Text style={{ color: colors.textMed, fontSize: 12 }}>
          {store.isPro
            ? `all 50 myths unlocked`
            : `10 free · 40 more in pro`}
        </Text>
      </View>

      {/* category filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 12 }}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 6 }}>
        {['all', ...cats].map(ct => (
          <TouchableOpacity
            key={ct}
            onPress={() => sF(ct)}
            activeOpacity={0.8}
            style={{
              paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100,
              borderWidth: 1.5,
              borderColor: filter === ct ? colors.text : colors.border,
              backgroundColor: filter === ct ? colors.text : 'transparent',
            }}>
            <Text style={{
              fontSize: 12, fontWeight: '800', textTransform: 'capitalize',
              color: filter === ct ? '#fff' : colors.textMed,
            }}>{ct}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* free myths */}
      <View style={{ paddingHorizontal: 16, gap: 6 }}>
        {filtered.map((m, _i) => {
          const ri = allMyths.indexOf(m);
          const isExp = exp === ri;
          return (
            <ChunkyCard
              key={ri}
              color={isExp ? m.cl : colors.border}
              shadowColor={isExp ? m.cl + '66' : colors.border}
              onPress={() => sE(isExp ? null : ri)}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontSize: 13, fontWeight: '800', lineHeight: 20 }}>
                    "{m.q}"
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 2, marginTop: 4 }}>
                    {[...Array(5)].map((_, j) => (
                      <Flame key={j} size={11} color={j < m.sp ? colors.red : colors.border} />
                    ))}
                  </View>
                </View>
                <Pill text={m.v} color={m.cl} bg={m.bg} />
              </View>

              {isExp && (
                <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 2, borderTopColor: colors.surface }}>
                  <Text style={{ color: colors.textMed, fontSize: 13, lineHeight: 21, marginBottom: 8 }}>
                    {m.a}
                  </Text>
                  <TouchableOpacity
                    onPress={() => doShare(m)}
                    activeOpacity={0.8}
                    style={{
                      flexDirection: 'row', alignItems: 'center', gap: 4,
                      backgroundColor: colors.surface,
                      borderWidth: 1, borderColor: colors.border,
                      borderRadius: 7, paddingHorizontal: 10, paddingVertical: 5,
                      alignSelf: 'flex-start',
                    }}>
                    <Share2 size={12} color={colors.textMed} />
                    <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textMed }}>share</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ChunkyCard>
          );
        })}
      </View>

      {/* locked preview — only shown if not pro */}
      {!store.isPro && (
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          {/* blurred locked myth previews */}
          <View style={{ marginBottom: 12, gap: 6 }}>
            {PRO.slice(0, 6).map((m, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => sPay(true)}
                activeOpacity={0.85}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 14, padding: 14,
                  borderWidth: 2, borderColor: colors.purple + '40',
                  borderBottomWidth: 3, borderBottomColor: colors.purpleDark + '30',
                  flexDirection: 'row', alignItems: 'center', gap: 10,
                  opacity: 0.65,
                }}>
                <View style={{
                  width: 28, height: 28, borderRadius: 8,
                  backgroundColor: colors.purpleBg,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Lock size={14} color={colors.purple} />
                </View>
                <Text style={{ flex: 1, color: colors.text, fontSize: 12, fontWeight: '700' }}>
                  "{m.q}"
                </Text>
                <Pill text="pro" color={colors.purple} bg={colors.purpleBg} />
              </TouchableOpacity>
            ))}

            {/* fade + counter */}
            <View style={{
              alignItems: 'center', paddingVertical: 10,
              borderTopWidth: 1, borderTopColor: colors.surface,
            }}>
              <Text style={{ color: colors.textMed, fontSize: 12, fontWeight: '700' }}>
                + {PRO.length - 6} more myths locked
              </Text>
            </View>
          </View>

          {/* upgrade card */}
          <ChunkyCard
            color={colors.purple}
            shadowColor={colors.purpleDark}
            onPress={() => sPay(true)}>
            <View style={{ alignItems: 'center', paddingVertical: 4 }}>
              <View style={{
                width: 44, height: 44, borderRadius: 12,
                backgroundColor: colors.purpleBg,
                alignItems: 'center', justifyContent: 'center',
                marginBottom: 10, borderWidth: 2, borderColor: colors.purple + '40',
              }}>
                <Lock size={20} color={colors.purple} />
              </View>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '900' }}>
                unlock all 50 myths
              </Text>
              <Text style={{ color: colors.textMed, fontSize: 12, marginTop: 4, textAlign: 'center' }}>
                + negotiation scripts, hidden costs checklist,{'\n'}what-if matrix & rent vs. buy calculator
              </Text>
              <View style={{ marginTop: 12 }}>
                <Pill text="get pro from $2.99/mo" color={colors.purple} bg={colors.purpleBg} />
              </View>
            </View>
          </ChunkyCard>
        </View>
      )}

      <PaywallModal visible={showPay} onClose={() => sPay(false)} />
    </ScrollView>
  );
}