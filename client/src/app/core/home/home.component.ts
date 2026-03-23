import { computed, type ComputedRef, defineComponent, inject, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type LoginService from '@/account/login.service';
import { usePeriodStore } from '@/store';
import SalesSparkline from './components/SalesSparkline.vue';
import { getSalesDashboard, type SalesDashboard } from './sales-dashboard.service';
import { getCategories, getFamilies, getLines, type IdName } from './product-hierarchy.service';

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

    const categories = ref<IdName[]>([]);
    const families = ref<IdName[]>([]);
    const lines = ref<IdName[]>([]);

    const selectedCategoryId = ref<number | null>(null);
    const selectedFamilyId = ref<number | null>(null);
    const selectedLineId = ref<number | null>(null);

    const isFamilyEnabled = computed(() => selectedCategoryId.value != null);
    const isLineEnabled = computed(() => selectedFamilyId.value != null);

    const openLogin = () => {
      loginService?.openLogin();
    };

    const refresh = async () => {
      if (!authenticated?.value) return;
      loading.value = true;
      loadError.value = null;
      try {
        dashboard.value = await getSalesDashboard({
          productCategoryId: selectedCategoryId.value ?? undefined,
          productFamilyId: selectedFamilyId.value ?? undefined,
          productLineId: selectedLineId.value ?? undefined,
        });
      } catch (e: any) {
        loadError.value = e?.response?.data?.message ?? e?.message ?? 'Error desconocido';
      } finally {
        loading.value = false;
      }
    };

    const loadHierarchy = async () => {
      categories.value = await getCategories();
      // Cascada: si no hay categoría seleccionada, familia/linea quedan vacías y deshabilitadas
      families.value = [];
      lines.value = [];
    };

    watch(selectedCategoryId, async newVal => {
      // Al cambiar categoría: resetear niveles inferiores
      selectedFamilyId.value = null;
      selectedLineId.value = null;
      lines.value = [];

      if (newVal == null) {
        families.value = [];
        await refresh();
        return;
      }

      families.value = await getFamilies(newVal);
      await refresh();
    });

    watch(selectedFamilyId, async newVal => {
      // Al cambiar familia: resetear línea
      selectedLineId.value = null;

      if (newVal == null) {
        lines.value = [];
        await refresh();
        return;
      }

      lines.value = await getLines(newVal);
      await refresh();
    });

    watch(selectedLineId, async () => {
      await refresh();
    });

    watch(
      () => authenticated?.value,
      async (isAuth, wasAuth) => {
        if (isAuth && !wasAuth) {
          dashboard.value = null;
          await loadHierarchy();
          await refresh();
        }
      },
    );

    onMounted(async () => {
      if (authenticated?.value) {
        await loadHierarchy();
      }
      await refresh();
    });

    const salesDaySeries = computed(() => {
      const list = dashboard.value?.salesByDay ?? [];
      // Convertimos a serie con huecos (1..31) para que el sparkline sea estable
      const maxDay = list.length ? Math.max(...list.map(i => i.day)) : 0;
      const days = Math.max(maxDay, 1);
      const map = new Map(list.map(i => [i.day, i.amount] as const));
      return Array.from({ length: days }, (_, idx) => map.get(idx + 1) ?? 0);
    });

    const bestDay = computed(() => {
      const items = dashboard.value?.salesByDay ?? [];
      if (!items.length) return null;
      return items.reduce((best, cur) => (cur.amount > best.amount ? cur : best), items[0]);
    });

    const bestDayLabel = computed(() => {
      if (!bestDay.value) return '—';
      return `Día ${bestDay.value.day}`;
    });

    const bestDayTotalLabel = computed(() => {
      if (!bestDay.value) return '';
      return `${formatMoney(bestDay.value.amount)}`;
    });

    const salesByDayBars = computed(() => {
      const items = dashboard.value?.salesByDay ?? [];
      const max = items.length ? Math.max(...items.map(i => i.amount)) : 0;
      const denom = max || 1;
      return items.map(i => ({
        day: i.day,
        total: i.amount,
        pct: Math.round((i.amount / denom) * 100),
      }));
    });

    const formatNumber = (n: any) => {
      const num = typeof n === 'number' ? n : parseFloat(String(n ?? 0));
      if (!Number.isFinite(num)) return '0';
      return new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 }).format(num);
    };

    const formatMoney = (n: any) => {
      const num = typeof n === 'number' ? n : parseFloat(String(n ?? 0));
      const safe = Number.isFinite(num) ? num : 0;
      return `${safe} $`;
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

      categories,
      families,
      lines,
      selectedCategoryId,
      selectedFamilyId,
      selectedLineId,
      isFamilyEnabled,
      isLineEnabled,

      salesDaySeries,
      salesByDayBars,
      bestDayLabel,
      bestDayTotalLabel,
      formatNumber,
      formatMoney,
    };
  },
});
