import { type Ref, defineComponent, inject, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import UmService from './um.service';
import { type IUm } from '@/shared/model/um.model';
import { useAlertService } from '@/shared/alert/alert.service';
import debounce from 'lodash/debounce';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'Um',
  setup() {
    const { t: t$ } = useI18n();
    const umService = inject('umService', () => new UmService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const itemsPerPage = ref(20);
    const queryCount: Ref<number> = ref(null);
    const page: Ref<number> = ref(1);
    const propOrder = ref('id');
    const reverse = ref(false);
    const totalItems = ref(0);
    const searchText = ref('');

    const ums: Ref<IUm[]> = ref([]);

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

    const retrieveUms = async () => {
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
        const res = await umService().retrieve(paginationQuery);
        totalItems.value = Number(res.headers['x-total-count']);
        queryCount.value = totalItems.value;
        ums.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSyncList = () => {
      retrieveUms();
    };

    onMounted(async () => {
      await retrieveUms();
    });

    const removeId: Ref<number> = ref(null);
    const removeEntity = ref<any>(null);
    const prepareRemove = (instance: IUm) => {
      removeId.value = instance.id;
      removeEntity.value.show();
    };
    const closeDialog = () => {
      removeEntity.value.hide();
    };
    const removeUm = async () => {
      try {
        await umService().delete(removeId.value);
        const message = t$('businessApp.um.deleted', { param: removeId.value }).toString();
        alertService.showInfo(message, { variant: 'danger' });
        removeId.value = null;
        retrieveUms();
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
        await retrieveUms();
      } else {
        // reset the pagination
        clear();
      }
    });

    // Whenever page changes, switch to the new page.
    watch(page, async () => {
      await retrieveUms();
    });

    const onInput = debounce(async () => {
      await retrieveUms();
      // Perform your action here
    }, 500);

    return {
      ums,
      handleSyncList,
      isFetching,
      retrieveUms,
      clear,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeUm,
      itemsPerPage,
      queryCount,
      page,
      propOrder,
      reverse,
      totalItems,
      changeOrder,
      t$,
      searchText,
      onInput,
    };
  },
});
