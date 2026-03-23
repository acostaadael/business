import { computed, type ComputedRef, defineComponent, inject, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type LoginService from '@/account/login.service';
import { usePeriodStore } from '@/store';
import SalesSparkline from './components/SalesSparkline.vue';
import { getSalesDashboard, type SalesDashboard } from './sales-dashboard.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  components: {
    SalesSparkline,
  },
  setup() {
    const loginService = inject<LoginService>('loginService');

    const authenticated = inject<ComputedRef<boolean>>('authenticated');
    const username = inject<ComputedRef<string>>('currentUsername');
    const periodStore = usePeriodStore();
    const ifOpenPeriod = computed(() => periodStore.period);

    const loading = ref(false);
    const loadError = ref<string | null>(null);
    const dashboard = ref<SalesDashboard | null>(null);

    const openLogin = () => {
      loginService?.openLogin();
    };

    const refresh = async () => {
      if (!authenticated?.value) return;
      loading.value = true;
      loadError.value = null;
      try {
        dashboard.value = await getSalesDashboard();
      } catch (e: any) {
        loadError.value = e?.response?.data?.message ?? e?.message ?? 'Error desconocido';
      } finally {
        loading.value = false;
      }
    };

    // Cuando el usuario se autentica desde el modal, este componente ya está montado.
    // Sin este watch, el dashboard no se vuelve a cargar hasta un F5.
    watch(
      () => authenticated?.value,
      async (isAuth, wasAuth) => {
        if (isAuth && !wasAuth) {
          dashboard.value = null;
          await refresh();
        }
      },
    );

    onMounted(async () => {
      await refresh();
    });

    const salesDaySeries = computed(() => {
      const list = dashboard.value?.salesByDay ?? [];
      // Convertimos a serie con huecos (1..31) para que el sparkline sea estable
      const maxDay = list.length ? Math.max(...list.map(i => i.day)) : 0;
      const days = Math.max(maxDay, 1);
      const map = new Map(list.map(i => [i.day, i.total] as const));
      return Array.from({ length: days }, (_, idx) => map.get(idx + 1) ?? 0);
    });

    const bestDay = computed(() => {
      const items = dashboard.value?.salesByDay ?? [];
      if (!items.length) return null;
      return items.reduce((best, cur) => (cur.total > best.total ? cur : best), items[0]);
    });

    const bestDayLabel = computed(() => {
      if (!bestDay.value) return '—';
      return `Día ${bestDay.value.day}`;
    });

    const bestDayTotalLabel = computed(() => {
      if (!bestDay.value) return '';
      return `${formatNumber(bestDay.value.total)} unidades`;
    });

    const salesByDayBars = computed(() => {
      const items = dashboard.value?.salesByDay ?? [];
      const max = items.length ? Math.max(...items.map(i => i.total)) : 0;
      const denom = max || 1;
      return items.map(i => ({
        day: i.day,
        total: i.total,
        pct: Math.round((i.total / denom) * 100),
      }));
    });

    const formatNumber = (n: any) => {
      const num = typeof n === 'number' ? n : parseFloat(String(n ?? 0));
      if (!Number.isFinite(num)) return '0';
      return new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 }).format(num);
    };

    return {
      authenticated,
      ifOpenPeriod,
      username,
      openLogin,
      t$: useI18n().t,

      loading,
      loadError,
      dashboard,
      refresh,

      salesDaySeries,
      salesByDayBars,
      bestDayLabel,
      bestDayTotalLabel,
      formatNumber,
    };
  },
});
