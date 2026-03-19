import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Wallet, CreditCard, ShoppingCart, Target, Plus, Minus } from 'lucide-react-native';
import { useAppStore } from '../store/store';
import { colors } from '../theme/colors';
import { ChunkyCard, ProgressRing, InputModal, ExpandableList } from '../components';

const fm = (n: number) => Math.round(n).toLocaleString();
const fK = (n: number) => n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `$${Math.round(n / 1e3)}k` : `$${fm(n)}`;

export default function MathScreen() {
  const store = useAppStore();
  const c = store.getCalcs();
  const tE = store.totalExpenses(), tD = store.totalDebt();
  const [mv, setMV] = useState(false);
  const [ml, setML] = useState('');
  const [mval, setMVal] = useState(0);
  const [mpfx, setMPfx] = useState('$');
  const [mfn, setMFn] = useState<(v: string) => void>(() => () => {});
  const [sl, setSL] = useState(false);

  const open = (label: string, val: number, pfx: string, fn: (v: string) => void) => {
    setML(label); setMVal(val); setMPfx(pfx); setMFn(() => fn); setMV(true);
  };
  const openF = (k: string, l: string, pfx = '$') => open(l, (store as any)[k], pfx, v => store.setField(k, v));
  const openE = (id: string, l: string, val: number) => open(l, val, '$', v => store.setExpense(id, v));
  const openD = (id: string, l: string, val: number) => open(l, val, '$', v => store.setDebt(id, v));

  const dC = c.dti <= 28 ? colors.green : c.dti <= 36 ? colors.yellow : c.dti <= 43 ? colors.orange : colors.red;
  const dL = c.dti <= 28 ? "you're golden" : c.dti <= 36 ? 'getting tight' : c.dti <= 43 ? 'danger zone' : 'too high';
  const rC = c.rd >= 75 ? colors.green : c.rd >= 50 ? colors.yellow : c.rd >= 25 ? colors.orange : colors.red;
  const hg = store.goal > 0, gOk = c.gPay <= c.mx && c.gPay > 0;
  const S = { paddingHorizontal: 16, marginBottom: 10 } as const;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* HERO */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, paddingTop: 12 }}>
        <View style={{ position: 'relative' }}>
          <ProgressRing value={c.rd} max={100} size={90} strokeWidth={10} color={rC} />
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 22, fontWeight: '900', color: rC }}>{Math.round(c.rd)}</Text>
            <Text style={{ fontSize: 9, fontWeight: '800', color: colors.textMed, textTransform: 'uppercase' }}>score</Text>
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.textLight, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 2 }}>you can afford</Text>
          <Text style={{ fontSize: 36, fontWeight: '900', color: c.mx > 0 ? colors.green : colors.red, letterSpacing: -2 }}>
            ${fm(c.mx)}<Text style={{ fontSize: 16, color: colors.textLight, fontWeight: '700' }}>/mo</Text>
          </Text>
          <Text style={{ color: colors.textMed, fontSize: 13 }}>
            {c.price > 0 ? <>that's a house around <Text style={{ color: colors.text, fontWeight: '800' }}>{fK(c.price)}</Text></> : 'enter your numbers below to find out'}
          </Text>
        </View>
      </View>

      {/* GOAL */}
      <View style={S}>
        <ChunkyCard color={hg ? (gOk ? colors.green : colors.orange) : colors.blue} shadowColor={hg ? (gOk ? colors.greenDark : colors.orangeDark) : colors.blueDark}
          onPress={() => openF('goal', 'your dream house price')}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: hg ? (gOk ? colors.greenBg : colors.orangeBg) : colors.blueBg, alignItems: 'center', justifyContent: 'center' }}>
              <Target size={20} color={hg ? (gOk ? colors.green : colors.orange) : colors.blue} />
            </View>
            <View style={{ flex: 1 }}>
              {!hg ? <><Text style={{ color: colors.text, fontSize: 13, fontWeight: '800' }}>set a goal house price (optional)</Text><Text style={{ color: colors.textLight, fontSize: 11 }}>we'll show you what it takes to get there</Text></>
              : gOk ? <><Text style={{ color: colors.green, fontSize: 13, fontWeight: '800' }}>you can afford your {fK(store.goal)} goal!</Text><Text style={{ color: colors.textMed, fontSize: 11 }}>${fm(c.gPay)}/mo — ${fm(c.mx - c.gPay)} under your max</Text></>
              : <><Text style={{ color: colors.text, fontSize: 13, fontWeight: '800' }}>goal: {fK(store.goal)}</Text><Text style={{ color: colors.orange, fontSize: 11, fontWeight: '700' }}>need ${fm(c.gGap)} more/mo to afford this</Text></>}
            </View>
            <Text style={{ fontSize: 16, fontWeight: '900', color: hg ? colors.text : colors.blue }}>{hg ? fK(store.goal) : 'set'}</Text>
          </View>
        </ChunkyCard>
      </View>

      {/* INCOME */}
      <View style={S}>
        <ChunkyCard color={colors.green} shadowColor={colors.greenDark} onPress={() => openF('take', 'what hits your bank account each month')}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: colors.greenBg, alignItems: 'center', justifyContent: 'center' }}><Wallet size={20} color={colors.green} /></View>
            <View style={{ flex: 1 }}><Text style={{ color: colors.text, fontSize: 13, fontWeight: '800' }}>your take-home pay</Text><Text style={{ color: colors.textLight, fontSize: 11 }}>after taxes — what actually hits your account</Text></View>
            <Text style={{ fontSize: 22, fontWeight: '900', color: colors.text }}>${fm(store.take)}</Text>
          </View>
        </ChunkyCard>
      </View>

      {/* DEBTS */}
      <View style={S}><ExpandableList title="monthly debt payments" items={store.debts} onEdit={openD} color={colors.red} bgColor={colors.redBg} shadowColor={colors.redDark} total={tD} icon={<CreditCard size={20} color={colors.red} />} /></View>

      {/* EXPENSES */}
      <View style={S}><ExpandableList title="what it costs to be you" items={store.expenses} onEdit={openE} color={colors.yellow} bgColor={colors.yellowBg} shadowColor={colors.yellowDark} total={tE} icon={<ShoppingCart size={20} color={colors.yellow} />} /></View>

      {/* DTI */}
      <View style={S}>
        <ChunkyCard>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <ProgressRing value={c.dti} max={60} size={56} strokeWidth={6} color={dC} />
            <View>
              <Text style={{ fontSize: 16, fontWeight: '900', color: dC }}>{Math.round(c.dti)}% DTI</Text>
              <Text style={{ fontSize: 12, fontWeight: '700', color: dC }}>{dL}</Text>
              <Text style={{ fontSize: 11, color: colors.textLight }}>lenders want under 36%</Text>
            </View>
          </View>
        </ChunkyCard>
      </View>

      {/* PAYMENT BREAKDOWN */}
      <View style={S}>
        <ChunkyCard>
          <Text style={{ color: colors.textMed, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>where your payment goes</Text>
          {[{ l: 'the bank (P&I)', v: c.pi, cl: colors.green }, { l: 'property tax', v: c.taxes, cl: colors.yellow }, { l: 'insurance', v: c.ins, cl: colors.blue }, { l: 'repairs fund', v: c.maint, cl: colors.orange }].map(({ l, v, cl }) => {
            const pct = c.mx > 0 ? Math.min(100, (v / c.mx) * 100) : 0;
            return <View key={l} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <View style={{ width: 36, alignItems: 'flex-end' }}><Text style={{ fontSize: 12, fontWeight: '800', color: cl }}>${fm(v)}</Text></View>
              <View style={{ flex: 1 }}><Text style={{ fontSize: 12, fontWeight: '700', color: colors.text, marginBottom: 3 }}>{l}</Text>
                <View style={{ backgroundColor: colors.surface, borderRadius: 100, height: 8, overflow: 'hidden' }}><View style={{ height: '100%', borderRadius: 100, width: `${pct}%`, backgroundColor: cl }} /></View></View>
            </View>;
          })}
        </ChunkyCard>
      </View>

      {/* LOAN TOGGLE */}
      <View style={S}>
        <TouchableOpacity onPress={() => setSL(!sl)} activeOpacity={0.8}
          style={{ padding: 10, borderRadius: 12, borderWidth: 2, borderColor: sl ? colors.blue : colors.border, backgroundColor: sl ? colors.blueBg : colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          {sl ? <Minus size={14} color={colors.blue} /> : <Plus size={14} color={colors.textMed} />}
          <Text style={{ fontSize: 12, fontWeight: '800', color: sl ? colors.blue : colors.textMed }}>{sl ? 'hide' : 'down payment, rates & loan stuff'}</Text>
        </TouchableOpacity>
      </View>
      {sl && <View style={S}><ChunkyCard>
        {[{ k: 'dp', l: 'down payment saved', pfx: '$', dec: false },
          { k: 'rate', l: 'interest rate', pfx: '', dec: true },
          { k: 'term', l: 'loan length (years)', pfx: '', dec: false },
          { k: 'hoa', l: 'monthly HOA', pfx: '$', dec: false }].map(({ k, l, pfx, dec }, i, a) =>
          <TouchableOpacity key={k} onPress={() => openF(k, l, pfx)} activeOpacity={0.7}
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: i < a.length - 1 ? 2 : 0, borderBottomColor: colors.surface }}>
            <Text style={{ color: colors.textMed, fontSize: 13, fontWeight: '700' }}>{l}</Text>
            <View style={{ backgroundColor: colors.surface, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 }}>
              <Text style={{ color: colors.text, fontSize: 14, fontWeight: '800' }}>{pfx}{dec ? (store as any)[k].toFixed(1) : fm((store as any)[k])}{k === 'rate' ? '%' : ''}</Text>
            </View>
          </TouchableOpacity>
        )}
      </ChunkyCard></View>}

      <InputModal visible={mv} label={ml} value={mval} prefix={mpfx} onSave={mfn} onClose={() => setMV(false)} />
    </ScrollView>
  );
}
