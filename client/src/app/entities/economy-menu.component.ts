import { computed, defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import { usePeriodStore } from '@/store';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'EconomyMenu',
  setup() {
    const i18n = useI18n();
    const periodStore = usePeriodStore();
    const ifOpenPeriod = computed(() => periodStore.period);

    return {
      t$: i18n.t,
      ifOpenPeriod,
    };
  },
});
