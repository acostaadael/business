import { type Ref, defineComponent, inject, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import PeriodService from './period.service';
import { type IPeriod } from '@/shared/model/period.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'Period',
  setup() {
    const { t: t$ } = useI18n();
    const periodService = inject('periodService', () => new PeriodService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const itemsPerPage = ref(20);
    const queryCount: Ref<number> = ref(null);
    const page: Ref<number> = ref(1);
    const propOrder = ref('id');
    const reverse = ref(false);
    const totalItems = ref(0);

    const periods: Ref<IPeriod[]> = ref([]);

    const isFetching = ref(false);

    const clear = () => {
      page.value = 1;
    };

    const sort = (): Array<any> => {
      const result = [`${propOrder.value},${reverse.value ? 'desc' : 'asc'}`];
      if (propOrder.value !== 'id') {
        result.push('id');
      }
      return result;
    };

    const retrievePeriods = async () => {
      isFetching.value = true;
      try {
        const paginationQuery = {
          page: page.value - 1,
          size: itemsPerPage.value,
          sort: sort(),
        };
        const res = await periodService().retrieve(paginationQuery);
        totalItems.value = Number(res.headers['x-total-count']);
        queryCount.value = totalItems.value;
        periods.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSyncList = () => {
      retrievePeriods();
    };

    onMounted(async () => {
      await retrievePeriods();
    });

    const month: Ref<number> = ref(null);
    const year: Ref<number> = ref(null);
    const closePeriodEntity = ref<any>(null);
    const prepareRemove = (instance: IPeriod) => {
      month.value = instance.month;
      year.value = instance.year;
      closePeriodEntity.value.show();
    };
    const closeDialog = () => {
      closePeriodEntity.value.hide();
    };
    const removePeriod = async () => {
      try {
        await periodService().delete(removeId.value);
        const message = t$('businessApp.period.deleted', { param: removeId.value }).toString();
        alertService.showInfo(message, { variant: 'danger' });
        month.value = null;
        year.value = null;
        retrievePeriods();
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const changeOrder = (newOrder: string) => {
      if (propOrder.value === newOrder) {
        reverse.value = !reverse.value;
      } else {
        reverse.value = false;
      }
      propOrder.value = newOrder;
    };

    // Whenever order changes, reset the pagination
    watch([propOrder, reverse], async () => {
      if (page.value === 1) {
        // first page, retrieve new data
        await retrievePeriods();
      } else {
        // reset the pagination
        clear();
      }
    });

    // Whenever page changes, switch to the new page.
    watch(page, async () => {
      await retrievePeriods();
    });

    return {
      periods,
      handleSyncList,
      isFetching,
      retrievePeriods,
      clear,
      month,
      year,
      closePeriodEntity,
      prepareRemove,
      closeDialog,
      removePeriod,
      itemsPerPage,
      queryCount,
      page,
      propOrder,
      reverse,
      totalItems,
      changeOrder,
      t$,
    };
  },
});
