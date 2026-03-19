import { create } from 'zustand';

export interface ListItem { id: string; label: string; val: number; }

export const DEFAULT_EXPENSES: ListItem[] = [
  { id: 'rent', label: 'rent / current housing', val: 0 },
  { id: 'food', label: 'groceries & eating out', val: 0 },
  { id: 'transport', label: 'gas, car insurance, transit', val: 0 },
  { id: 'phone', label: 'phone bill', val: 0 },
  { id: 'subs', label: 'streaming, gym, subscriptions', val: 0 },
  { id: 'health', label: 'health & medical', val: 0 },
  { id: 'fun', label: 'going out / entertainment', val: 0 },
  { id: 'other', label: 'everything else', val: 0 },
];

export const DEFAULT_DEBTS: ListItem[] = [
  { id: 'student', label: 'student loans', val: 0 },
  { id: 'cards', label: 'credit cards', val: 0 },
  { id: 'otherd', label: 'other debt', val: 0 },
];

const pv = (v: string | number): number => {
  const c = typeof v === 'string' ? v.replace(/[^0-9.]/g, '') : v;
  const p = parseFloat(c as string);
  return isNaN(p) ? 0 : p;
};

interface S {
  take: number; dp: number; rate: number; term: number; ptax: number; monthlyIns: number; hoa: number; goal: number;
  expenses: ListItem[]; debts: ListItem[];
  done: Record<string, boolean>; hasOnboarded: boolean; isPro: boolean; streak: number;
  setField: (k: string, v: string | number) => void;
  setExpense: (id: string, v: string | number) => void;
  setDebt: (id: string, v: string | number) => void;
  toggleDone: (id: string) => void;
  completeOnboarding: () => void;
  setPro: (v: boolean) => void;
  totalExpenses: () => number;
  totalDebt: () => number;
  getCalcs: () => Calcs;
}

export interface Calcs {
  mx: number; loan: number; price: number; dti: number; pi: number;
  taxes: number; ins: number; maint: number; rd: number; tInt: number;
  gPay: number; gGap: number; gPrice: number;
  yd: { y: number; b: number; e: number; intPaid: number; princPaid: number }[];
}

export const useAppStore = create<S>((set, get) => ({
  take: 0, dp: 0, rate: 6.5, term: 30, ptax: 1.2, monthlyIns: 100, hoa: 0, goal: 0,
  expenses: DEFAULT_EXPENSES, debts: DEFAULT_DEBTS,
  done: {}, hasOnboarded: false, isPro: false, streak: 1,
  setField: (k, v) => set({ [k]: pv(v) }),
  setExpense: (id, v) => { const p = pv(v); set(s => ({ expenses: s.expenses.map(e => e.id === id ? { ...e, val: p } : e) })); },
  setDebt: (id, v) => { const p = pv(v); set(s => ({ debts: s.debts.map(d => d.id === id ? { ...d, val: p } : d) })); },
  toggleDone: (id) => set(s => ({ done: { ...s.done, [id]: !s.done[id] } })),
  completeOnboarding: () => set({ hasOnboarded: true }),
  setPro: (v) => set({ isPro: v }),
  totalExpenses: () => get().expenses.reduce((s, e) => s + e.val, 0),
  totalDebt: () => get().debts.reduce((s, d) => s + d.val, 0),
  getCalcs: () => {
    const st = get();
    const { take, dp, rate, term, ptax, monthlyIns, hoa, goal } = st;
    const tE = st.totalExpenses(), tD = st.totalDebt();
    const av = take - tD - tE, mx = Math.max(0, av);
    const mr = rate / 100 / 12, np = term * 12;
    const estTax = mx * 0.15, pi = Math.max(0, mx - estTax - monthlyIns - hoa);
    let loan = 0;
    if (mr > 0 && pi > 0) loan = pi * ((Math.pow(1 + mr, np) - 1) / (mr * Math.pow(1 + mr, np)));
    const price = loan + dp;
    const dti = take > 0 ? ((tD + mx) / take) * 100 : 0;
    // yearly amortization with interest/principal tracking
    const yd: Calcs['yd'] = [];
    let bal = loan, cumInt = 0, cumPrinc = 0;
    for (let y = 0; y <= term; y++) {
      yd.push({ y, b: Math.max(0, bal), e: price - Math.max(0, bal), intPaid: cumInt, princPaid: cumPrinc });
      let yInt = 0, yPrinc = 0;
      for (let m = 0; m < 12; m++) {
        const intM = bal * mr;
        const princM = pi - intM;
        yInt += intM; yPrinc += princM;
        bal -= princM;
      }
      cumInt += yInt; cumPrinc += yPrinc;
    }
    const tInt = Math.max(0, cumInt);
    // goal
    const gPrice = goal || price;
    const gLn = Math.max(0, gPrice - dp);
    const gPay = mr > 0 && gLn > 0 ? gLn * (mr * Math.pow(1 + mr, np)) / (Math.pow(1 + mr, np) - 1) + gPrice * (ptax / 100) / 12 + monthlyIns + hoa : 0;
    const gGap = Math.max(0, gPay - mx);
    // readiness
    const rd = Math.min(100, (take > 0 ? 20 : 0) + (tD === 0 ? 20 : tD < take * 0.1 ? 12 : 4) + (dp >= price * 0.2 ? 20 : dp > 0 ? 8 : 0) + (tE > 0 ? 20 : 0) + (av > take * 0.15 ? 20 : av > 0 ? 10 : 0));
    const taxes = mx * 0.1;
    return { mx, loan, price, dti, pi, taxes, ins: monthlyIns, maint: mx * 0.05, rd, tInt, gPay, gGap, gPrice, yd };
  },
}));
