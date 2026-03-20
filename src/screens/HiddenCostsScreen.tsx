import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Lock, Check, AlertTriangle } from 'lucide-react-native';
import { useAppStore } from '../store/store';
import { colors } from '../theme/colors';
import { ChunkyCard, Pill } from '../components';

interface CostItem {
  label: string;
  range: string;
  timing: 'at closing' | 'ongoing' | 'surprise';
  tip: string;
}

const COSTS: CostItem[] = [
  // AT CLOSING
  { label: 'lender origination fees',   range: '$1,000–$3,500',  timing: 'at closing', tip: 'these are negotiable. ask every lender what their origination fee is and compare.' },
  { label: 'appraisal fee',             range: '$400–$700',      timing: 'at closing', tip: 'you pay this even if the appraisal tanks the deal.' },
  { label: 'home inspection',           range: '$300–$600',      timing: 'at closing', tip: 'not always at closing — usually paid before. budget for this early.' },
  { label: 'title insurance',           range: '$1,000–$2,500',  timing: 'at closing', tip: 'protects you from prior ownership disputes. required by most lenders.' },
  { label: 'title search/examination',  range: '$200–$500',      timing: 'at closing', tip: 'your title company researches the ownership history of the home.' },
  { label: 'attorney fees',             range: '$500–$1,500',    timing: 'at closing', tip: 'required in many states. even where optional, worth it.' },
  { label: 'escrow setup',              range: '$500–$1,000',    timing: 'at closing', tip: 'lenders collect prepaid property tax and insurance to set up your escrow account.' },
  { label: 'prepaid homeowners insurance', range: '$800–$2,000', timing: 'at closing', tip: 'first year\'s premium often due at closing — can\'t usually roll into the loan.' },
  { label: 'recording fees',            range: '$50–$250',       timing: 'at closing', tip: 'county fee for officially recording the property deed transfer. unavoidable.' },
  { label: 'property taxes (prepaid)',   range: '2–3 months',    timing: 'at closing', tip: 'lender collects a cushion upfront. depends on your county tax cycle.' },
  // ONGOING
  { label: 'property tax',              range: '1–2% of value/yr', timing: 'ongoing', tip: 'reassessed when you buy. can jump 50%+ from what the previous owner paid.' },
  { label: 'homeowners insurance',      range: '$100–$300/mo',   timing: 'ongoing', tip: 'varies wildly by location, age of home, and coverage. flood and earthquake are separate.' },
  { label: 'HOA fees',                  range: '$100–$800/mo',   timing: 'ongoing', tip: 'common in condos and planned communities. can increase yearly. check the HOA financials.' },
  { label: 'PMI (under 20% down)',      range: '$100–$350/mo',   timing: 'ongoing', tip: 'private mortgage insurance. goes away once you hit 20% equity. put 20% down to avoid it.' },
  { label: 'utilities',                 range: '$150–$400/mo',   timing: 'ongoing', tip: 'usually higher than an apartment. ask the seller for 12 months of utility bills.' },
  { label: 'lawn/snow/trash/pest',      range: '$100–$400/mo',   timing: 'ongoing', tip: 'costs that just don\'t exist when you rent. add up fast.' },
  // SURPRISE
  { label: 'HVAC replacement',          range: '$5,000–$15,000', timing: 'surprise', tip: 'average lifespan 15–20 years. ask the age. if it\'s old, budget for this in year 1–3.' },
  { label: 'roof replacement',          range: '$8,000–$25,000', timing: 'surprise', tip: 'asphalt shingles last 20–30 years. get the age from the seller and inspection report.' },
  { label: 'water heater',              range: '$800–$1,500',    timing: 'surprise', tip: '10–15 year lifespan. cheap fix but always happens at the worst time.' },
  { label: 'plumbing issues',           range: '$200–$10,000',   timing: 'surprise', tip: 'ranges from a minor fix to full repipe. older homes (pre-1970) are higher risk.' },
  { label: 'foundation repairs',        range: '$2,000–$40,000', timing: 'surprise', tip: 'the one that can wreck you. always get a foundation-specific inspection on older homes.' },
  { label: 'mold remediation',          range: '$1,500–$10,000', timing: 'surprise', tip: 'very common in humid climates. check the basement and attic in the inspection.' },
  { label: 'electrical updates',        range: '$1,000–$8,000',  timing: 'surprise', tip: 'older homes may have knob-and-tube or aluminum wiring. inspectors flag this.' },
  { label: 'window replacements',       range: '$300–$900/each', timing: 'surprise', tip: 'single-pane windows kill your energy bill. budget to replace if they\'re old.' },
];

const TIMING_COLOR: Record<CostItem['timing'], string> = {
  'at closing': colors.orange,
  'ongoing':    colors.blue,
  'surprise':   colors.red,
};
const TIMING_BG: Record<CostItem['timing'], string> = {
  'at closing': colors.orangeBg,
  'ongoing':    colors.blueBg,
  'surprise':   colors.redBg,
};

interface Props { onUpgrade: () => void; }

export default function HiddenCostsScreen({ onUpgrade }: Props) {
  const { isPro } = useAppStore();
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState<CostItem['timing'] | 'all'>('all');

  const toggle = (i: number) => {
    const next = new Set(checked);
    next.has(i) ? next.delete(i) : next.add(i);
    setChecked(next);
  };

  const filtered = filter === 'all' ? COSTS : COSTS.filter(c => c.timing === filter);
  const checkedCount = [...checked].filter(i => COSTS[i] && (filter === 'all' || COSTS[i].timing === filter)).length;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={{ alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 }}>
        <Text style={{ color: colors.textLight, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 3 }}>
          pro feature
        </Text>
        <Text style={{ fontSize: 20, fontWeight: '900', color: colors.text, marginVertical: 4 }}>
          hidden costs checklist
        </Text>
        <Text style={{ color: colors.textMed, fontSize: 13, textAlign: 'center' }}>
          everything nobody tells you before you sign
        </Text>
      </View>

      {/* filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, marginBottom: 12 }}>
        {(['all', 'at closing', 'ongoing', 'surprise'] as const).map(f => (
          <TouchableOpacity
            key={f}
            onPress={() => !isPro ? onUpgrade() : setFilter(f)}
            activeOpacity={0.8}
            style={{
              paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100,
              borderWidth: 1.5,
              borderColor: filter === f ? colors.text : colors.border,
              backgroundColor: filter === f ? colors.text : 'transparent',
            }}>
            <Text style={{ fontSize: 12, fontWeight: '800', color: filter === f ? '#fff' : colors.textMed, textTransform: 'capitalize' }}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* progress */}
      {isPro && (
        <View style={{ paddingHorizontal: 16, marginBottom: 10 }}>
          <Text style={{ fontSize: 12, color: colors.textMed }}>
            {checkedCount}/{filtered.length} reviewed
          </Text>
        </View>
      )}

      {/* list */}
      <View style={{ position: 'relative' }}>
        <View style={{ paddingHorizontal: 16, gap: 8 }} pointerEvents={isPro ? 'auto' : 'none'}>
          {filtered.map((item, i) => {
            const realIdx = COSTS.indexOf(item);
            const done    = checked.has(realIdx);
            const tc      = TIMING_COLOR[item.timing];
            const tb      = TIMING_BG[item.timing];
            return (
              <TouchableOpacity
                key={realIdx}
                onPress={() => toggle(realIdx)}
                activeOpacity={0.85}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 14, padding: 14,
                  borderWidth: 2,
                  borderColor: done ? colors.green : colors.border,
                  borderBottomWidth: 3,
                  borderBottomColor: done ? colors.greenDark : colors.border,
                  flexDirection: 'row', gap: 12, alignItems: 'flex-start',
                  opacity: done ? 0.6 : 1,
                }}>
                {/* checkbox */}
                <View style={{
                  width: 24, height: 24, borderRadius: 7,
                  backgroundColor: done ? colors.green : colors.surface,
                  borderWidth: done ? 0 : 2, borderColor: colors.border,
                  alignItems: 'center', justifyContent: 'center',
                  marginTop: 1,
                }}>
                  {done && <Check size={14} color="#fff" />}
                </View>

                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: done ? colors.textMed : colors.text, flex: 1, marginRight: 8 }}>
                      {item.label}
                    </Text>
                    <View style={{ backgroundColor: tb, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 }}>
                      <Text style={{ fontSize: 9, fontWeight: '800', color: tc }}>{item.timing.toUpperCase()}</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: tc, marginBottom: 4 }}>
                    {item.range}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textMed, lineHeight: 17 }}>
                    {item.tip}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* blur + lock overlay */}
        {!isPro && (
          <View style={styles.overlay} pointerEvents="box-none">
            <TouchableOpacity onPress={onUpgrade} activeOpacity={0.9} style={styles.lockCard}>
              <View style={styles.lockIcon}>
                <AlertTriangle size={24} color={colors.orange} />
              </View>
              <Text style={styles.lockTitle}>unlock hidden costs</Text>
              <Text style={styles.lockSub}>
                {COSTS.length} costs buyers get blindsided by.{'\n'}check them all off before you close.
              </Text>
              <View style={{ marginTop: 12 }}>
                <Pill text="get pro →" color={colors.purple} bg={colors.purpleBg} />
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.88)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  lockCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 24, alignItems: 'center',
    borderWidth: 2, borderColor: colors.orange + '40',
    shadowColor: colors.orange, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 16, elevation: 8,
    maxWidth: 280, width: '100%',
  },
  lockIcon: {
    width: 52, height: 52, borderRadius: 14, backgroundColor: colors.orangeBg,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12, borderWidth: 2, borderColor: colors.orange + '30',
  },
  lockTitle: { fontSize: 16, fontWeight: '900', color: colors.text, marginBottom: 6 },
  lockSub:   { fontSize: 13, color: colors.textMed, textAlign: 'center', lineHeight: 19 },
});