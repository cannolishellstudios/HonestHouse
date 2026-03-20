import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Wallet, CreditCard, ShoppingCart, Target, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useAppStore } from '../store/store';
import { colors } from '../theme/colors';
import { ChunkyCard, ProgressRing, InputModal, ExpandableList } from '../components';

const fm  = (n: number) => Math.round(n).toLocaleString();
const fK  = (n: number) =>
  n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `$${Math.round(n / 1e3)}k` : `$${fm(n)}`;

// ─── Collapsible section ──────────────────────────────────────────────────────
function Section({
  title, subtitle, children, defaultOpen = false,
}: { title: string; subtitle?: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View style={{ marginBottom: 6 }}>
      <TouchableOpacity
        onPress={() => setOpen(o => !o)}
        activeOpacity={0.65}
        style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          paddingVertical: 10, paddingHorizontal: 2,
        }}>
        <View>
          <Text style={{ fontSize: 12, fontWeight: '800', color: colors.textMed, textTransform: 'uppercase', letterSpacing: 0.8 }}>
            {title}
          </Text>
          {subtitle && !open && (
            <Text style={{ fontSize: 11, color: colors.textLight, marginTop: 1 }}>{subtitle}</Text>
          )}
        </View>
        {open
          ? <ChevronUp  size={16} color={colors.textLight} />
          : <ChevronDown size={16} color={colors.textLight} />}
      </TouchableOpacity>
      {open && (
        <View style={{ marginTop: 4, marginBottom: 10 }}>
          {children}
        </View>
      )}
    </View>
  );
}

export default function MathScreen() {
  const store = useAppStore();
  const c     = store.getCalcs();
  const tE    = store.totalExpenses();
  const tD    = store.totalDebt();

  // ─── modal state ────────────────────────────────────────────────────────────
  const [mv,   setMV]  = useState(false);
  const [ml,   setML]  = useState('');
  const [mval, setMVal] = useState(0);
  const [mpfx, setMPfx] = useState('$');
  const [mfn,  setMFn]  = useState<(v: string) => void>(() => () => {});

  const openModal = (label: string, val: number, pfx: string, fn: (v: string) => void) => {
    setML(label);
    setMVal(val);
    setMPfx(pfx);
    setMFn(() => fn);
    setMV(true);
  };

  const openF = (k: string, l: string, pfx = '$') =>
    openModal(l, (store as any)[k], pfx, v => store.setField(k, v));
  const openE = (id: string, l: string, val: number) =>
    openModal(l, val, '$', v => store.setExpense(id, v));
  const openD = (id: string, l: string, val: number) =>
    openModal(l, val, '$', v => store.setDebt(id, v));

  // ─── derived display values ──────────────────────────────────────────────
  const rC = c.rd >= 75 ? colors.green : c.rd >= 50 ? colors.yellow : c.rd >= 25 ? colors.orange : colors.red;
  const rLabel =
    c.rd >= 80 ? "you're ready" :
    c.rd >= 60 ? 'almost there' :
    c.rd >= 40 ? 'getting close' :
    c.rd >= 20 ? 'work to do' : 'just starting';

  // DTI: total monthly debt obligations / gross income estimate
  // Use take * 1.25 as gross approximation (20% tax assumption)
  const grossEst = store.take * 1.25;
  const dtiNum   = grossEst > 0 ? Math.round(((tD + c.pi) / grossEst) * 100) : 0;
  const dC =
    dtiNum <= 28 ? colors.green :
    dtiNum <= 36 ? colors.yellow :
    dtiNum <= 43 ? colors.orange : colors.red;
  const dtiLabel =
    dtiNum <= 28 ? "lenders love this — you're golden" :
    dtiNum <= 36 ? "acceptable — but tighter than ideal" :
    dtiNum <= 43 ? "yellow flag — lenders will hesitate" :
                   "red flag — most lenders will say no";

  const hg  = store.goal > 0;
  const gOk = c.gPay > 0 && c.gPay <= c.mx;

  // ─── hero affordability state ────────────────────────────────────────────
  const noDataYet = store.take === 0;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ paddingBottom: 120 }}>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 18,
        paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20,
        borderBottomWidth: 2, borderBottomColor: colors.surface,
      }}>
        {/* score ring — larger */}
        <View style={{ position: 'relative' }}>
          <ProgressRing value={c.rd} max={100} size={110} strokeWidth={11} color={rC} />
          <View style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 30, fontWeight: '900', color: rC, lineHeight: 34 }}>
              {Math.round(c.rd)}
            </Text>
            <Text style={{ fontSize: 9, fontWeight: '800', color: colors.textMed, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              score
            </Text>
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.textLight, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5 }}>
            you can afford
          </Text>

          {noDataYet ? (
            <>
              <Text style={{ fontSize: 28, fontWeight: '900', color: colors.textLight, letterSpacing: -1 }}>
                $— /mo
              </Text>
              <Text style={{ color: colors.textMed, fontSize: 12, marginTop: 2 }}>
                fill in your numbers below to find out
              </Text>
            </>
          ) : (
            <>
              <Text style={{ fontSize: 34, fontWeight: '900', color: c.mx > 0 ? colors.green : colors.red, letterSpacing: -1.5, lineHeight: 40 }}>
                ${fm(c.mx)}
                <Text style={{ fontSize: 16, color: colors.textLight, fontWeight: '700', letterSpacing: 0 }}>/mo</Text>
              </Text>
              <Text style={{ color: colors.textMed, fontSize: 12, marginTop: 2 }}>
                {c.price > 0
                  ? <>that's roughly a <Text style={{ color: colors.text, fontWeight: '800' }}>{fK(c.price)}</Text> house</>
                  : rLabel}
              </Text>
            </>
          )}
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>

        {/* ── SECTION: Goal ──────────────────────────────────────────────── */}
        <View style={{ marginBottom: 10 }}>
          <ChunkyCard
            color={hg ? (gOk ? colors.green : colors.orange) : colors.blue}
            shadowColor={hg ? (gOk ? colors.greenDark : colors.orangeDark) : colors.blueDark}
            onPress={() => openF('goal', 'target house price (optional)')}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={{
                width: 44, height: 44, borderRadius: 12,
                backgroundColor: hg ? (gOk ? colors.greenBg : colors.orangeBg) : colors.blueBg,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Target size={22} color={hg ? (gOk ? colors.green : colors.orange) : colors.blue} />
              </View>
              <View style={{ flex: 1 }}>
                {!hg ? (
                  <>
                    <Text style={{ color: colors.text, fontSize: 13, fontWeight: '800' }}>
                      set a goal house price
                    </Text>
                    <Text style={{ color: colors.textLight, fontSize: 11, marginTop: 1 }}>
                      optional — we'll tell you exactly what it takes
                    </Text>
                  </>
                ) : gOk ? (
                  <>
                    <Text style={{ color: colors.green, fontSize: 13, fontWeight: '800' }}>
                      ✓ you can afford your {fK(store.goal)} goal!
                    </Text>
                    <Text style={{ color: colors.textMed, fontSize: 11, marginTop: 1 }}>
                      ${fm(c.gPay)}/mo payment · ${fm(c.mx - c.gPay)}/mo to spare
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={{ color: colors.text, fontSize: 13, fontWeight: '800' }}>
                      goal: {fK(store.goal)}
                    </Text>
                    <Text style={{ color: colors.orange, fontSize: 11, fontWeight: '700', marginTop: 1 }}>
                      you need ${fm(c.gGap)} more/mo to hit this — see the plan tab
                    </Text>
                  </>
                )}
              </View>
              <Text style={{ fontSize: 14, fontWeight: '900', color: hg ? colors.text : colors.blue }}>
                {hg ? fK(store.goal) : 'set'}
              </Text>
            </View>
          </ChunkyCard>
        </View>

        {/* ── SECTION: Income ────────────────────────────────────────────── */}
        <View style={{ marginBottom: 10 }}>
          <ChunkyCard
            color={store.take > 0 ? colors.green : colors.border}
            shadowColor={store.take > 0 ? colors.greenDark : colors.border}
            onPress={() => openF('take', 'your monthly take-home pay')}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={{
                width: 44, height: 44, borderRadius: 12,
                backgroundColor: colors.greenBg, alignItems: 'center', justifyContent: 'center',
              }}>
                <Wallet size={22} color={colors.green} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 13, fontWeight: '800' }}>
                  your take-home pay
                </Text>
                <Text style={{ color: colors.textLight, fontSize: 11, marginTop: 1 }}>
                  after taxes — what actually hits your bank account
                </Text>
              </View>
              <Text style={{ fontSize: 20, fontWeight: '900', color: store.take > 0 ? colors.text : colors.textLight }}>
                {store.take > 0 ? `$${fm(store.take)}` : 'tap'}
              </Text>
            </View>
          </ChunkyCard>
        </View>

        {/* ── SECTION: Debts ─────────────────────────────────────────────── */}
        <View style={{ marginBottom: 10 }}>
          <ExpandableList
            title="monthly debt payments"
            items={store.debts}
            onEdit={openD}
            color={colors.red} bgColor={colors.redBg} shadowColor={colors.redDark}
            total={tD}
            icon={<CreditCard size={20} color={colors.red} />}
          />
        </View>

        {/* ── SECTION: Expenses ──────────────────────────────────────────── */}
        <View style={{ marginBottom: 16 }}>
          <ExpandableList
            title="what it costs to be you"
            items={store.expenses}
            onEdit={openE}
            color={colors.yellow} bgColor={colors.yellowBg} shadowColor={colors.yellowDark}
            total={tE}
            icon={<ShoppingCart size={20} color={colors.yellow} />}
          />
        </View>

        {/* ── DTI CARD — always show when income entered ─────────────────── */}
        {store.take > 0 && (
          <View style={{ marginBottom: 16 }}>
            <ChunkyCard color={dC} shadowColor={dC + 'aa'}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <ProgressRing value={Math.min(dtiNum, 60)} max={60} size={64} strokeWidth={7} color={dC} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: colors.textMed, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 }}>
                    debt-to-income ratio
                  </Text>
                  <Text style={{ fontSize: 20, fontWeight: '900', color: dC }}>
                    {dtiNum}%
                  </Text>
                  <Text style={{ fontSize: 12, color: dC, fontWeight: '700', marginTop: 1 }}>
                    {dtiLabel}
                  </Text>
                </View>
              </View>
              <View style={{ marginTop: 10, padding: 10, backgroundColor: dC + '15', borderRadius: 10 }}>
                <Text style={{ fontSize: 12, color: colors.textMed, lineHeight: 18 }}>
                  <Text style={{ fontWeight: '800', color: colors.text }}>what is DTI? </Text>
                  it's what percent of your gross paycheck goes to debt payments. mortgage + car + student loans + credit cards ÷ your income before taxes. lenders won't touch you above ~43%. under 36% is the sweet spot.
                </Text>
              </View>
            </ChunkyCard>
          </View>
        )}

        {/* ── COLLAPSIBLE: Where your payment goes ───────────────────────── */}
        {c.mx > 0 && (
          <Section
            title="where does my payment actually go?"
            subtitle="tap to see the breakdown">
            <ChunkyCard>
              <Text style={{ fontSize: 12, color: colors.textMed, marginBottom: 12, lineHeight: 18 }}>
                your monthly payment isn't just the loan. here's how <Text style={{ fontWeight: '800', color: colors.text }}>${fm(c.mx)}/mo</Text> breaks down:
              </Text>
              {[
                { l: 'mortgage (P&I)', v: c.pi,    cl: colors.green,  note: 'principal + interest to the bank' },
                { l: 'property tax',  v: c.taxes,  cl: colors.yellow, note: 'collected monthly, paid to county' },
                { l: 'home insurance',v: c.ins,    cl: colors.blue,   note: 'required by your lender' },
                { l: 'repairs fund',  v: c.maint,  cl: colors.orange, note: 'things will break — budget for it' },
              ].map(({ l, v, cl, note }) => {
                const pct = c.mx > 0 ? Math.min(100, Math.round((v / c.mx) * 100)) : 0;
                return (
                  <View key={l} style={{ marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <View>
                        <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text }}>{l}</Text>
                        <Text style={{ fontSize: 10, color: colors.textLight }}>{note}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 14, fontWeight: '900', color: cl }}>${fm(v)}</Text>
                        <Text style={{ fontSize: 10, color: colors.textLight }}>{pct}%</Text>
                      </View>
                    </View>
                    <View style={{ backgroundColor: colors.surface, borderRadius: 100, height: 8, overflow: 'hidden' }}>
                      <View style={{ height: '100%', borderRadius: 100, width: `${pct}%`, backgroundColor: cl }} />
                    </View>
                  </View>
                );
              })}
            </ChunkyCard>
          </Section>
        )}

        {/* ── COLLAPSIBLE: Loan settings ─────────────────────────────────── */}
        <Section
          title="loan settings"
          subtitle={`${store.rate}% rate · ${store.term}yr · $${fm(store.dp)} down`}>
          <ChunkyCard>
            <Text style={{ fontSize: 12, color: colors.textMed, marginBottom: 12, lineHeight: 18 }}>
              we use these to calculate your numbers. tap any row to update.
            </Text>
            {[
              { k: 'dp',   l: 'down payment saved',  sub: 'cash you have right now',          pfx: '$',  dec: false },
              { k: 'rate', l: 'interest rate',        sub: 'current 30yr avg ~6.5–7%',         pfx: '',   dec: true  },
              { k: 'term', l: 'loan length',          sub: '30yr most common · 15yr saves $$$', pfx: '',   dec: false },
              { k: 'hoa',  l: 'HOA fees',             sub: 'monthly condo/community fee',       pfx: '$',  dec: false },
            ].map(({ k, l, sub, pfx, dec }, i, a) => (
              <TouchableOpacity
                key={k}
                onPress={() => openF(k, l, pfx)}
                activeOpacity={0.7}
                style={{
                  flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                  paddingVertical: 12,
                  borderBottomWidth: i < a.length - 1 ? 1 : 0,
                  borderBottomColor: colors.surface,
                }}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={{ color: colors.text, fontSize: 13, fontWeight: '800' }}>{l}</Text>
                  <Text style={{ color: colors.textLight, fontSize: 10, marginTop: 1 }}>{sub}</Text>
                </View>
                <View style={{ backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 }}>
                  <Text style={{ color: colors.text, fontSize: 14, fontWeight: '800' }}>
                    {pfx}{dec ? (store as any)[k].toFixed(1) : fm((store as any)[k])}{k === 'rate' ? '%' : ''}{k === 'term' ? ' yrs' : ''}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ChunkyCard>
        </Section>

      </View>

      <InputModal
        visible={mv}
        label={ml}
        value={mval}
        prefix={mpfx}
        onSave={mfn}
        onClose={() => setMV(false)}
      />
    </ScrollView>
  );
}