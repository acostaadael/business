import { type Ref, computed, defineComponent, inject, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import InventoryMovementService from './inventory-movement.service';
import { type IInventoryMovement } from '@/shared/model/inventory-movement.model';
import { useAlertService } from '@/shared/alert/alert.service';
import { usePeriodStore } from '@/store';
import { debounce } from 'lodash';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'InventoryMovement',
  setup() {
    const { t: t$ } = useI18n();
    const inventoryMovementService = inject('inventoryMovementService', () => new InventoryMovementService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const itemsPerPage = ref(20);
    const queryCount: Ref<number> = ref(null);
    const page: Ref<number> = ref(1);
    const propOrder = ref('id');
    const reverse = ref(false);
    const totalItems = ref(0);
    const searchText = ref('');

    const periodStore = usePeriodStore();
    const openPeriod = computed(() => periodStore.period);

    const inventoryMovements: Ref<IInventoryMovement[]> = ref([]);

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

    const retrieveInventoryMovements = async () => {
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
        const res = await inventoryMovementService().retrieve(paginationQuery);
        totalItems.value = Number(res.headers['x-total-count']);
        queryCount.value = totalItems.value;
        inventoryMovements.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSyncList = () => {
      retrieveInventoryMovements();
    };

    onMounted(async () => {
      await retrieveInventoryMovements();
    });

    const removeId: Ref<number> = ref(null);
    const removeEntity = ref<any>(null);
    const prepareRemove = (instance: IInventoryMovement) => {
      removeId.value = instance.id;
      removeEntity.value.show();
    };
    const closeDialog = () => {
      removeEntity.value.hide();
    };
    const removeInventoryMovement = async () => {
      try {
        await inventoryMovementService().delete(removeId.value);
        const message = t$('businessApp.inventoryMovement.deleted', { param: removeId.value }).toString();
        alertService.showInfo(message, { variant: 'danger' });
        removeId.value = null;
        retrieveInventoryMovements();
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
        await retrieveInventoryMovements();
      } else {
        // reset the pagination
        clear();
      }
    });

    // Whenever page changes, switch to the new page.
    watch(page, async () => {
      await retrieveInventoryMovements();
    });

    const onInput = debounce(async () => {
      await retrieveInventoryMovements();
      // Perform your action here
    }, 500);

    return {
      inventoryMovements,
      handleSyncList,
      isFetching,
      retrieveInventoryMovements,
      clear,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeInventoryMovement,
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
