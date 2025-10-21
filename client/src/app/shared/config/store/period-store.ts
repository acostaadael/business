import type { IPeriod } from '@/shared/model/period.model';
import { defineStore } from 'pinia';

export interface PeriodStateStorable {
  period: null | IPeriod;
}

export const defaultPeriodState: PeriodStateStorable = {
  period: null,
};

export const usePeriodStore = defineStore('periodStore', {
  state: (): PeriodStateStorable => ({ ...defaultPeriodState }),
  getters: {
    openPeriod: state => state.period,
  },
  actions: {
    setPeriod(period: IPeriod) {
      this.period = period;
    },
    closePeriod() {
      this.period = null;
    },
  },
});
