import { create } from 'zustand';

interface MathState {
  paycheck: number;
  sins: number;
  willToLive: number;
  escapeFund: number;
  setField: (field: keyof Omit<MathState, 'setField' | 'getCalculations'>, value: string) => void;
  getCalculations: () => {
    maxPayment: number;
    principal: number;
    taxes: number;
    maintenance: number;
  };
}

export const useMathStore = create<MathState>((set, get) => ({
  paycheck: 0,
  sins: 0,
  willToLive: 0,
  escapeFund: 0,

  setField: (field, value) => {
    const cleanValue = value.replace(/[^0-9.]/g, '');
    const parsed = parseFloat(cleanValue);
    set({ [field]: isNaN(parsed) ? 0 : parsed });
  },

  getCalculations: () => {
    const { paycheck, sins, willToLive, escapeFund } = get();
    const available = paycheck - (sins + willToLive + escapeFund);
    const maxPayment = Math.max(0, available);
    
    return {
      maxPayment,
      principal: maxPayment * 0.6,
      taxes: maxPayment * 0.3,
      maintenance: maxPayment * 0.1,
    };
  },
}));