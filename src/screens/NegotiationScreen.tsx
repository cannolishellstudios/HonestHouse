import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Lock, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useAppStore } from '../store/store';
import { colors } from '../theme/colors';
import { ChunkyCard } from '../components';

interface Script {
  situation: string;
  what: string;
  script: string;
  why: string;
}

const SCRIPTS: Script[] = [
  {
    situation: 'asking for a lower price',
    what: 'use this after your inspection reveals issues — or when a home has been sitting on the market 30+ days.',
    script: `"Based on the inspection report and comparable sales in the area, we'd like to revise our offer to $[X]. Specifically, [item 1] and [item 2] will need to be addressed, which we've estimated at $[cost]. We're still very interested in the property and hope we can find a number that works for both of us."`,
    why: 'you\'re giving them a logical reason, not just lowballing. specifics = credibility. leaving the door open = less defensive seller.',
  },
  {
    situation: 'requesting closing cost credits',
    what: 'instead of lowering price (which requires reappraisal), ask them to cover your closing costs — same money, less friction.',
    script: `"Rather than adjusting the price, would you consider a seller concession of $[X] toward closing costs? It keeps the sale price intact for appraisal purposes and helps us close quickly without delays."`,
    why: 'sellers often prefer this because their net proceeds look the same on paper. it also doesn\'t trigger renegotiation of the loan.',
  },
  {
    situation: 'countering after a rejection',
    what: 'they said no to your first offer. don\'t just cave — meet in the middle with a reason.',
    script: `"We understand your position. We've reviewed our finances carefully and the highest we can responsibly go is $[X]. We want to make this work — is there anything else we can address that would help close the gap? We're flexible on timeline and can accommodate [fast close / as-is / your moving date]."`,
    why: 'giving flexibility on non-price terms (timing, contingencies) is free to you but valuable to them. always give them a soft landing.',
  },
  {
    situation: 'asking for repairs after inspection',
    what: 'use this after inspection. pick your battles — focus on safety issues and big-ticket items.',
    script: `"The inspection flagged a few items we'd like to address before closing. We're not asking for cosmetic fixes — specifically [roof issue / HVAC / electrical item] which are either safety concerns or significant cost items. We'd like to request either the repairs be completed before closing or a credit of $[X] to handle them ourselves."`,
    why: 'framing it as "safety or significant cost" puts it in a category they can\'t easily dismiss. offering a credit option gives them a cheaper out.',
  },
  {
    situation: 'negotiating in a bidding war',
    what: 'competing offers are stressful. use this to stand out without just throwing money at it.',
    script: `"We know you have multiple offers. We want to be transparent — our offer is $[X] with [X% down / all cash / no inspection contingency on cosmetic items only]. We're pre-approved with [lender], can close in [X days], and are genuinely excited about this home. We're not looking to nickel-and-dime. Let's get this done."`,
    why: 'sellers are often choosing between similar prices. speed, certainty of close, and not being a pain to deal with win deals.',
  },
  {
    situation: 'pushing back on a low appraisal',
    what: 'if the appraisal comes in below your contract price, you have leverage — even in a seller\'s market.',
    script: `"The appraisal came in at $[X], which is $[gap] below our agreed price. We have a few options: we can renegotiate to the appraised value, you can provide documentation of recent upgrades or sales we may use to challenge the appraisal, or we can discuss splitting the gap. We want to close — help us find a path."`,
    why: 'you\'re not threatening to walk. you\'re presenting options. sellers who have already mentally moved out will often split the difference rather than restart.',
  },
  {
    situation: "asking the seller to leave appliances/furniture",
    what: 'staging items, appliances, or furniture sometimes aren\'t in the listing. ask before closing.',
    script: `"We noticed the [washer/dryer/refrigerator/outdoor furniture] in the listing photos. Would you consider including those in the sale? It would save us the hassle of replacing them immediately and might help us move faster toward closing."`,
    why: 'framing it as convenience for them ("move faster toward closing") reframes an ask as a mutual benefit.',
  },
  {
    situation: 'dealing with an unreasonable seller',
    what: 'sometimes they\'re just not realistic. be direct without burning the deal.',
    script: `"We've looked at this carefully and we genuinely want the house. But at $[price], the math doesn't work for us based on current comps and the condition of the property. Our firm offer is $[X]. If that doesn't work, we completely understand — but we won't be able to go higher. We hope you'll consider it."`,
    why: 'leaving emotion out and stating your number firmly is more effective than back-and-forth. a clean "this is our number" is respected more than endless negotiation.',
  },
  {
    situation: 'asking about what\'s actually included',
    what: 'before you close, confirm exactly what stays with the house — in writing.',
    script: `"Before we finalize, can we get a written list of everything that conveys with the property? We want to avoid any confusion on closing day about light fixtures, window treatments, the garage door openers, or anything else that's currently in the home."`,
    why: 'verbal agreements mean nothing. anything not in the contract can walk out the door.',
  },
  {
    situation: 'negotiating after being under contract',
    what: 'new information (inspection, appraisal) gives you re-opener rights in most contracts.',
    script: `"Based on the inspection results, we\'d like to invoke our inspection contingency to renegotiate. We\'re not walking — we want to make this work. Our updated position is [credit of $X / repair of specific item / price reduction of $X]. We'd like to keep the same timeline to close."`,
    why: 'invoking a contingency legally isn\'t a threat — it\'s your right. sellers respect buyers who know their rights and use them cleanly.',
  },
];

interface Props { onUpgrade: () => void; }

export default function NegotiationScreen({ onUpgrade }: Props) {
  const { isPro } = useAppStore();
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={{ alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 }}>
        <Text style={{ color: colors.textLight, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 3 }}>
          pro feature
        </Text>
        <Text style={{ fontSize: 20, fontWeight: '900', color: colors.text, marginVertical: 4, textAlign: 'center' }}>
          negotiation scripts
        </Text>
        <Text style={{ color: colors.textMed, fontSize: 13, textAlign: 'center' }}>
          word-for-word what to say in every situation
        </Text>
      </View>

      <View style={{ paddingHorizontal: 16, gap: 10 }}>
        {SCRIPTS.map((s, i) => {
          const isOpen  = expanded === i;
          const locked  = !isPro && i >= 2; // show first 2 free as teaser

          return (
            <View key={i} style={{ position: 'relative' }}>
              <ChunkyCard
                color={isOpen ? colors.green : colors.border}
                shadowColor={isOpen ? colors.greenDark : colors.border}
                onPress={() => {
                  if (locked) { onUpgrade(); return; }
                  setExpanded(isOpen ? null : i);
                }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{
                    width: 36, height: 36, borderRadius: 10,
                    backgroundColor: isOpen ? colors.greenBg : colors.surface,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    {locked
                      ? <Lock size={16} color={colors.purple} />
                      : <MessageSquare size={16} color={isOpen ? colors.green : colors.textMed} />}
                  </View>
                  <Text style={{ flex: 1, fontSize: 13, fontWeight: '800', color: locked ? colors.textMed : colors.text }}>
                    {s.situation}
                  </Text>
                  {locked
                    ? <View style={{ backgroundColor: colors.purpleBg, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 }}>
                        <Text style={{ fontSize: 9, fontWeight: '800', color: colors.purple }}>PRO</Text>
                      </View>
                    : (isOpen ? <ChevronUp size={16} color={colors.textLight} /> : <ChevronDown size={16} color={colors.textLight} />)
                  }
                </View>

                {isOpen && (
                  <View style={{ marginTop: 12, gap: 10 }}>
                    <View style={{ backgroundColor: colors.blueBg, borderRadius: 10, padding: 12 }}>
                      <Text style={{ fontSize: 10, fontWeight: '800', color: colors.blue, textTransform: 'uppercase', marginBottom: 4 }}>when to use</Text>
                      <Text style={{ fontSize: 13, color: colors.text, lineHeight: 19 }}>{s.what}</Text>
                    </View>
                    <View style={{ backgroundColor: colors.greenBg, borderRadius: 10, padding: 12 }}>
                      <Text style={{ fontSize: 10, fontWeight: '800', color: colors.green, textTransform: 'uppercase', marginBottom: 4 }}>what to say</Text>
                      <Text style={{ fontSize: 13, color: colors.text, lineHeight: 20, fontStyle: 'italic' }}>{s.script}</Text>
                    </View>
                    <View style={{ backgroundColor: colors.yellowBg, borderRadius: 10, padding: 12 }}>
                      <Text style={{ fontSize: 10, fontWeight: '800', color: colors.yellowDark, textTransform: 'uppercase', marginBottom: 4 }}>why it works</Text>
                      <Text style={{ fontSize: 13, color: colors.text, lineHeight: 19 }}>{s.why}</Text>
                    </View>
                  </View>
                )}
              </ChunkyCard>

              {/* blur overlay for locked cards */}
              {locked && (
                <TouchableOpacity
                  onPress={onUpgrade}
                  activeOpacity={0.85}
                  style={StyleSheet.absoluteFillObject}
                />
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}