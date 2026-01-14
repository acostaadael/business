import { type Ref, computed, defineComponent, inject, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import EntryService from './entry.service';
import { type IEntry } from '@/shared/model/entry.model';
import { useAlertService } from '@/shared/alert/alert.service';
import { usePeriodStore } from '@/store';
import { useDateFormat } from '@/shared/composables';
import { debounce } from 'lodash';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'Entry',
  setup() {
    const { t: t$ } = useI18n();
    const entryService = inject('entryService', () => new EntryService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const { formatDateShort: formatDate } = useDateFormat();

    const itemsPerPage = ref(20);
    const queryCount: Ref<number> = ref(null);
    const page: Ref<number> = ref(1);
    const propOrder = ref('id');
    const reverse = ref(false);
    const totalItems = ref(0);
    const searchText = ref('');

    const periodStore = usePeriodStore();
    const openPeriod = computed(() => periodStore.period);

    const entries: Ref<IEntry[]> = ref([]);

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

    const retrieveEntrys = async () => {
      isFetching.value = true;
      try {
        const paginationQuery =
          searchText.value == ''
            ? {
                page: page.value - 1,
                size: itemsPerPage.value,
                sort: sort(),
              }
            : {
                page: page.value - 1,
                size: itemsPerPage.value,
                globalSearch: searchText.value,
                sort: sort(),
              };
        const res = await entryService().retrieve(paginationQuery);
        totalItems.value = Number(res.headers['x-total-count']);
        queryCount.value = totalItems.value;
        entries.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSyncList = () => {
      retrieveEntrys();
    };

    onMounted(async () => {
      await retrieveEntrys();
    });

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
        await retrieveEntrys();
      } else {
        // reset the pagination
        clear();
      }
    });

    // Whenever page changes, switch to the new page.
    watch(page, async () => {
      await retrieveEntrys();
    });

    const onInput = debounce(async () => {
      await retrieveEntrys();
      // Perform your action here
    }, 500);

    return {
      formatDate,
      entries,
      handleSyncList,
      isFetching,
      retrieveEntrys,
      clear,
      itemsPerPage,
      queryCount,
      page,
      propOrder,
      reverse,
      totalItems,
      changeOrder,
      t$,
      openPeriod,
      searchText,
      onInput,
    };
  },
});
