import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { purchasePro, restorePurchases, PlanId } from '../services/revenueCat';
import { maybeRequestReview } from '../services/reviewPrompt';

export type { PlanId };

export interface ListItem { id: string; label: string; val: number; }

export const DEFAULT_EXPENSES: ListItem[] = [
  { id: 'rent',      label: 'rent / current housing',        val: 0 },
  { id: 'food',      label: 'groceries & eating out',        val: 0 },
  { id: 'transport', label: 'gas, car insurance, transit',   val: 0 },
  { id: 'phone',     label: 'phone bill',                    val: 0 },
  { id: 'subs',      label: 'streaming, gym, subscriptions', val: 0 },
  { id: 'health',    label: 'health & medical',              val: 0 },
  { id: 'fun',       label: 'going out / entertainment',     val: 0 },
  { id: 'other',     label: 'everything else',               val: 0 },
];

export const DEFAULT_DEBTS: ListItem[] = [
  { id: 'student', label: 'student loans',  val: 0 },
  { id: 'cards',   label: 'credit cards',   val: 0 },
  { id: 'otherd',  label: 'other debt',     val: 0 },
];

const pv = (v: string | number): number => {
  const c = typeof v === 'string' ? v.replace(/[^0-9.]/g, '') : v;
  const p = parseFloat(c as string);
  return isNaN(p) ? 0 : p;
};

interface S {
  // ── persisted fields ───────────────────────────────────────────────────────
  take: number; dp: number; rate: number; term: number; ptax: number;
  monthlyIns: number; hoa: number; goal: number;
  expenses: ListItem[]; debts: ListItem[];
  done: Record<string, boolean>;
  hasOnboarded: boolean;
  isPro: boolean;
  // ── transient (not persisted) ──────────────────────────────────────────────
  isPurchasing: boolean;
  isRestoring: boolean;
  // ── actions ────────────────────────────────────────────────────────────────
  setField: (k: string, v: string | number) => void;
  setExpense: (id: string, v: string | number) => void;
  setDebt: (id: string, v: string | number) => void;
  toggleDone: (id: string) => void;
  completeOnboarding: () => void;
  setPro: (v: boolean) => void;
  triggerPurchase: (planId: PlanId) => Promise<boolean>;
  triggerRestore: () => Promise<boolean>;
  syncProStatus: () => Promise<void>;
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

export const useAppStore = create<S>()(
  persist(
    (set, get) => ({
      // ── default state ───────────────────────────────────────────────────────
      take: 0, dp: 0, rate: 6.5, term: 30, ptax: 1.2, monthlyIns: 100, hoa: 0, goal: 0,
      expenses: DEFAULT_EXPENSES, debts: DEFAULT_DEBTS,
      done: {}, hasOnboarded: false, isPro: false,
      isPurchasing: false, isRestoring: false,

      // ── actions ─────────────────────────────────────────────────────────────
      setField: (k, v) => set({ [k]: pv(v) }),
      setExpense: (id, v) => {
        const p = pv(v);
        set(s => ({ expenses: s.expenses.map(e => e.id === id ? { ...e, val: p } : e) }));
      },
      setDebt: (id, v) => {
        const p = pv(v);
        set(s => ({ debts: s.debts.map(d => d.id === id ? { ...d, val: p } : d) }));
      },
  toggleDone: (id) => {
    const wasDone = get().done[id];
    set(s => ({ done: { ...s.done, [id]: !s.done[id] } }));
    if (!wasDone) {
      // user just marked a step done — good moment to ask for a review
      const st = get();
      const hasIncome   = st.take > 0;
      const hasExpenses = st.totalExpenses() > 0;
      const { rd }      = st.getCalcs();
      maybeRequestReview({ hasIncome, hasExpenses, readinessScore: rd });
    }
  },
  completeOnboarding: () => set({ hasOnboarded: true }),
      setPro: (v) => set({ isPro: v }),

      triggerPurchase: async (planId) => {
        set({ isPurchasing: true });
        try {
          const result = await purchasePro(planId);
          if (result.success) set({ isPro: true });
          return result.success;
        } catch {
          return false;
        } finally {
          set({ isPurchasing: false });
        }
      },

      triggerRestore: async () => {
        set({ isRestoring: true });
        try {
          const result = await restorePurchases();
          if (result.success) set({ isPro: true });
          return result.success;
        } catch {
          return false;
        } finally {
          set({ isRestoring: false });
        }
      },

      syncProStatus: async () => {
        // No-op until real RevenueCat SDK is wired up.
        // Once you install react-native-purchases, replace with:
        //   const active = await checkProStatus();
        //   set({ isPro: active });
        return;
      },

      totalExpenses: () => get().expenses.reduce((s, e) => s + e.val, 0),
      totalDebt:     () => get().debts.reduce((s, d) => s + d.val, 0),

      getCalcs: () => {
        const st = get();
        const { take, dp, rate, term, ptax, monthlyIns, hoa, goal } = st;
        const tE = st.totalExpenses(), tD = st.totalDebt();

        const available = Math.max(0, take - tD - tE);
        const estTaxEscrow = available * 0.13;
        const estMaint     = available * 0.05;
        const pi = Math.max(0, available - estTaxEscrow - monthlyIns - hoa - estMaint);

        const mr = rate / 100 / 12;
        const np = term * 12;
        let loan = 0;
        if (mr > 0 && pi > 0)
          loan = pi * ((Math.pow(1 + mr, np) - 1) / (mr * Math.pow(1 + mr, np)));

        const price = loan + dp;
        const grossApprox = take * 1.3;
        const dti = grossApprox > 0 ? ((tD + pi) / grossApprox) * 100 : 0;

        const yd: Calcs['yd'] = [];
        let bal = loan, cumInt = 0, cumPrinc = 0;
        for (let y = 0; y <= term; y++) {
          yd.push({ y, b: Math.max(0, bal), e: Math.min(price, price - Math.max(0, bal) + dp), intPaid: cumInt, princPaid: cumPrinc });
          let yInt = 0, yPrinc = 0;
          for (let m = 0; m < 12; m++) {
            if (bal <= 0) break;
            const intM   = bal * mr;
            const princM = Math.min(pi - intM, bal);
            yInt   += intM;
            yPrinc += princM;
            bal    -= princM;
          }
          cumInt  += yInt;
          cumPrinc += yPrinc;
        }
        const tInt = Math.max(0, cumInt);

        const gPrice = goal || price;
        const gLoan  = Math.max(0, gPrice - dp);
        const gPay = mr > 0 && gLoan > 0
          ? gLoan * (mr * Math.pow(1 + mr, np)) / (Math.pow(1 + mr, np) - 1) +
            gPrice * (ptax / 100) / 12 + monthlyIns + hoa
          : 0;
        const gGap = Math.max(0, gPay - available);

        const rd = Math.min(100,
          (take  > 0               ? 20 : 0) +
          (tD   === 0              ? 20 : tD < take * 0.1 ? 12 : 4) +
          (dp   >= price * 0.2     ? 20 : dp > 0 ? 8 : 0) +
          (tE   > 0                ? 20 : 0) +
          (available > take * 0.15 ? 20 : available > 0 ? 10 : 0)
        );

        const taxes = price > 0 ? price * (ptax / 100) / 12 : available * 0.1;
        return { mx: available, loan, price, dti, pi, taxes, ins: monthlyIns, maint: estMaint, rd, tInt, gPay, gGap, gPrice, yd };
      },
    }),
    {
      name: 'honesthouse-store',          // AsyncStorage key
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist what matters — skip transient UI state
      partialize: (s) => ({
        take:       s.take,
        dp:         s.dp,
        rate:       s.rate,
        term:       s.term,
        ptax:       s.ptax,
        monthlyIns: s.monthlyIns,
        hoa:        s.hoa,
        goal:       s.goal,
        expenses:   s.expenses,
        debts:      s.debts,
        done:       s.done,
        hasOnboarded: s.hasOnboarded,  // ← this is the key one
        isPro:      s.isPro,           // ← and this
      }),
    }
  )
);