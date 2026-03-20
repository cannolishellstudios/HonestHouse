import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Lock, ChevronDown } from 'lucide-react-native';
import { useAppStore } from '../store/store';
import { colors } from '../theme/colors';
import { ChunkyCard, Pill, InputModal } from '../components';

const fm = (n: number) => Math.round(n).toLocaleString();
const fK = (n: number) =>
  n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `$${Math.round(n / 1e3)}k` : `$${fm(n)}`;

interface Props { onUpgrade: () => void; }

export default function RentVsBuyScreen({ onUpgrade }: Props) {
  const store    = useAppStore();
  const { isPro } = store;
  const c        = store.getCalcs();

  // ── pull rent from math tab if user entered it, otherwise 0 ──────────────
  const storedRent = store.expenses.find(e => e.id === 'rent')?.val ?? 0;

  const [monthlyRent,      setMonthlyRent]      = useState(storedRent);
  const [rentGrowth,       setRentGrowth]       = useState(3);
  const [homeAppreciation, setHomeAppreciation] = useState(4);
  const [years,            setYears]            = useState(7);

  // ── input modal state ─────────────────────────────────────────────────────
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLabel,   setModalLabel]   = useState('');
  const [modalValue,   setModalValue]   = useState(0);
  const [modalPrefix,  setModalPrefix]  = useState('$');
  const [modalSave,    setModalSave]    = useState<(v: string) => void>(() => () => {});

  const openInput = (label: string, value: number, prefix: string, onSave: (v: string) => void) => {
    setModalLabel(label);
    setModalValue(value);
    setModalPrefix(prefix);
    setModalSave(() => onSave);
    setModalVisible(true);
  };

  // ── calculations ──────────────────────────────────────────────────────────
  const totalRentCost = (() => {
    let total = 0, r = monthlyRent;
    for (let y = 0; y < years; y++) {
      total += r * 12;
      r *= (1 + rentGrowth / 100);
    }
    return total;
  })();

  const mr = store.rate / 100 / 12;
  const np = store.term * 12;
  const piPayment = c.loan > 0 && mr > 0
    ? c.loan * (mr * Math.pow(1 + mr, np)) / (Math.pow(1 + mr, np) - 1)
    : 0;
  const monthlyBuyCost = piPayment + c.taxes + c.ins + store.hoa + c.maint;
  const closingCosts   = c.price * 0.04;
  const sellingCosts   = c.price * 0.06;

  const equityAfterYears = (() => {
    if (c.loan <= 0 || mr <= 0) return store.dp;
    let bal = c.loan;
    for (let m = 0; m < years * 12; m++) {
      const intM   = bal * mr;
      const princM = Math.max(0, piPayment - intM);
      bal -= princM;
      if (bal <= 0) break;
    }
    const appreciated = c.price * Math.pow(1 + homeAppreciation / 100, years);
    return Math.max(0, appreciated - Math.max(0, bal) - sellingCosts);
  })();

  const totalBuyCost    = monthlyBuyCost * 12 * years + closingCosts - equityAfterYears + store.dp;
  const dpOpportunity   = store.dp * (Math.pow(1.08, years) - 1);
  const totalBuyWithOpp = totalBuyCost + dpOpportunity;

  const buyWins = totalBuyWithOpp < totalRentCost;
  const diff    = Math.abs(totalRentCost - totalBuyWithOpp);

  // ── editable assumption row ────────────────────────────────────────────────
  const AssumptionRow = ({
    label, value, displayValue, onEdit,
  }: { label: string; value: number; displayValue: string; onEdit: () => void }) => (
    <TouchableOpacity
      onPress={onEdit}
      activeOpacity={0.7}
      style={{
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.surface,
      }}>
      <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Text style={{ fontSize: 14, fontWeight: '800', color: colors.purple }}>{displayValue}</Text>
        <ChevronDown size={14} color={colors.textLight} />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ paddingBottom: 100 }}>

      {/* header */}
      <View style={{ alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: '900', color: colors.text, marginVertical: 4 }}>
          rent vs. buy calculator
        </Text>
        <Text style={{ color: colors.textMed, fontSize: 13, textAlign: 'center' }}>
          the real answer — not the one your parents told you
        </Text>
      </View>

      {/* ── assumptions card — always visible, editable ── */}
      <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
        <ChunkyCard color={colors.purple} shadowColor={colors.purpleDark}>
          <Text style={{ fontSize: 12, fontWeight: '800', color: colors.textMed, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
            your numbers — tap to edit
          </Text>
          <AssumptionRow
            label="your monthly rent"
            value={monthlyRent}
            displayValue={monthlyRent > 0 ? `$${fm(monthlyRent)}/mo` : 'tap to set'}
            onEdit={() => openInput('your monthly rent', monthlyRent, '$', v => setMonthlyRent(parseFloat(v) || 0))}
          />
          <AssumptionRow
            label="rent increase per year"
            value={rentGrowth}
            displayValue={`${rentGrowth}%`}
            onEdit={() => openInput('annual rent increase %', rentGrowth, '', v => setRentGrowth(parseFloat(v) || 3))}
          />
          <AssumptionRow
            label="home appreciation per year"
            value={homeAppreciation}
            displayValue={`${homeAppreciation}%`}
            onEdit={() => openInput('annual appreciation %', homeAppreciation, '', v => setHomeAppreciation(parseFloat(v) || 4))}
          />
          <AssumptionRow
            label="how many years"
            value={years}
            displayValue={`${years} yrs`}
            onEdit={() => openInput('years to compare', years, '', v => setYears(Math.max(1, parseInt(v) || 7)))}
          />
          {monthlyRent === 0 && (
            <View style={{ marginTop: 8, backgroundColor: colors.yellowBg, borderRadius: 8, padding: 10 }}>
              <Text style={{ fontSize: 12, color: colors.yellowDark, fontWeight: '700' }}>
                ☝️ tap "your monthly rent" above to enter your rent — the comparison won't work without it
              </Text>
            </View>
          )}
        </ChunkyCard>
      </View>

      {/* ── results (blurred if not pro) ── */}
      <View style={{ position: 'relative' }}>
        <View style={{ paddingHorizontal: 16, gap: 10 }} pointerEvents={isPro ? 'auto' : 'none'}>

          {/* winner card */}
          <ChunkyCard
            color={buyWins ? colors.green : colors.blue}
            shadowColor={buyWins ? colors.greenDark : colors.blueDark}>
            <Text style={{ fontSize: 17, fontWeight: '900', color: colors.text, marginBottom: 4 }}>
              over {years} years,{' '}
              <Text style={{ color: buyWins ? colors.green : colors.blue }}>
                {buyWins ? 'buying wins' : 'renting wins'}
              </Text>
              {' '}by {fK(diff)}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textMed, lineHeight: 18 }}>
              {buyWins
                ? `buying saves ~${fK(diff)} vs renting when you include equity built, appreciation, and rent you would have paid.`
                : `renting costs ~${fK(diff)} less when you include the opportunity cost of your down payment and true ownership costs.`}
            </Text>
          </ChunkyCard>

          {/* side by side totals */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <ChunkyCard style={{ flex: 1 }} color={colors.blue} shadowColor={colors.blueDark}>
              <Text style={{ fontSize: 10, fontWeight: '800', color: colors.blue, textTransform: 'uppercase', marginBottom: 6 }}>renting</Text>
              <Text style={{ fontSize: 20, fontWeight: '900', color: colors.text }}>{fK(totalRentCost)}</Text>
              <Text style={{ fontSize: 10, color: colors.textMed, marginTop: 2 }}>total spent · no equity</Text>
            </ChunkyCard>
            <ChunkyCard style={{ flex: 1 }} color={colors.green} shadowColor={colors.greenDark}>
              <Text style={{ fontSize: 10, fontWeight: '800', color: colors.green, textTransform: 'uppercase', marginBottom: 6 }}>buying</Text>
              <Text style={{ fontSize: 20, fontWeight: '900', color: colors.text }}>{fK(totalBuyWithOpp)}</Text>
              <Text style={{ fontSize: 10, color: colors.textMed, marginTop: 2 }}>net after equity</Text>
            </ChunkyCard>
          </View>

          {/* breakdown */}
          <ChunkyCard>
            <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text, marginBottom: 10 }}>what went into this</Text>
            {[
              { l: 'your rent',               v: `$${fm(monthlyRent)}/mo`, note: 'what you pay now' },
              { l: 'rent over ' + years + ' years', v: fK(totalRentCost), note: `with ${rentGrowth}% annual increase` },
              { l: 'buy monthly cost',        v: `$${fm(Math.round(monthlyBuyCost))}/mo`, note: 'mortgage + tax + insurance + repairs' },
              { l: 'closing costs',           v: fK(closingCosts),         note: '~4% of purchase price' },
              { l: 'selling costs',           v: fK(sellingCosts),         note: `~6% at year ${years}` },
              { l: 'equity built',            v: fK(equityAfterYears),     note: `paydown + ${homeAppreciation}% appreciation` },
              { l: 'down payment opp. cost',  v: fK(dpOpportunity),        note: 'if invested at 8% instead' },
            ].map(({ l, v, note }) => (
              <View key={l} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.surface }}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>{l}</Text>
                  <Text style={{ fontSize: 10, color: colors.textLight }}>{note}</Text>
                </View>
                <Text style={{ fontSize: 13, fontWeight: '800', color: colors.textMed }}>{v}</Text>
              </View>
            ))}
          </ChunkyCard>

          <ChunkyCard color={colors.yellow} shadowColor={colors.yellowDark}>
            <Text style={{ fontSize: 12, fontWeight: '800', color: colors.text, marginBottom: 4 }}>
              ⚠️ this is an estimate, not a guarantee
            </Text>
            <Text style={{ fontSize: 12, color: colors.textMed, lineHeight: 18 }}>
              nobody knows future appreciation or rent growth. try different numbers — if buying wins at both 3% AND 6% appreciation, you're in solid shape.
            </Text>
          </ChunkyCard>
        </View>

        {/* lock overlay for non-pro */}
        {!isPro && (
          <View style={styles.overlay} pointerEvents="box-none">
            <TouchableOpacity onPress={onUpgrade} activeOpacity={0.9} style={styles.lockCard}>
              <View style={styles.lockIcon}>
                <Lock size={24} color={colors.purple} />
              </View>
              <Text style={styles.lockTitle}>unlock rent vs. buy</Text>
              <Text style={styles.lockSub}>
                see whether buying or renting{'\n'}actually wins for your situation
              </Text>
              <View style={{ marginTop: 12 }}>
                <Pill text="get pro →" color={colors.purple} bg={colors.purpleBg} />
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <InputModal
        visible={modalVisible}
        label={modalLabel}
        value={modalValue}
        prefix={modalPrefix}
        onSave={modalSave}
        onClose={() => setModalVisible(false)}
      />
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
    borderWidth: 2, borderColor: colors.purple + '40',
    shadowColor: colors.purple, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 16, elevation: 8,
    maxWidth: 280, width: '100%',
  },
  lockIcon: {
    width: 52, height: 52, borderRadius: 14, backgroundColor: colors.purpleBg,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12, borderWidth: 2, borderColor: colors.purple + '30',
  },
  lockTitle: { fontSize: 16, fontWeight: '900', color: colors.text, marginBottom: 6 },
  lockSub:   { fontSize: 13, color: colors.textMed, textAlign: 'center', lineHeight: 19 },
});