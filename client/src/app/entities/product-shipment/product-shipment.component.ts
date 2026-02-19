import { type Ref, computed, defineComponent, inject, onMounted, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import ProductShipmentService from './product-shipment.service';
import { type IProductShipment } from '@/shared/model/product-shipment.model';
import useDataUtils from '@/shared/data/data-utils.service';
import { useAlertService } from '@/shared/alert/alert.service';
import { debounce } from 'lodash';
import { usePeriodStore } from '@/store';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ProductShipment',
  setup() {
    const { t: t$ } = useI18n();
    const dataUtils = useDataUtils();
    const productShipmentService = inject('productShipmentService', () => new ProductShipmentService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const itemsPerPage = ref(20);
    const queryCount: Ref<number> = ref(null);
    const page: Ref<number> = ref(1);
    const propOrder = ref('id');
    const reverse = ref(false);
    const totalItems = ref(0);
    const searchText = ref('');

    const router = useRouter();
    const previousState = () => router.go(-1);

    const periodStore = usePeriodStore();
    const openPeriod = computed(() => periodStore.period);

    const productShipments: Ref<IProductShipment[]> = ref([]);

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

    const retrieveProductShipments = async () => {
      if (!openPeriod.value) previousState();
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
        const res = await productShipmentService().retrieve(paginationQuery);
        totalItems.value = Number(res.headers['x-total-count']);
        queryCount.value = totalItems.value;
        productShipments.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSyncList = () => {
      clear();
    };

    onMounted(async () => {
      await retrieveProductShipments();
    });

    const removeId: Ref<number> = ref(null);
    const removeEntity = ref<any>(null);
    const prepareRemove = (instance: IProductShipment) => {
      removeId.value = instance.id;
      removeEntity.value.show();
    };
    const closeDialog = () => {
      removeEntity.value.hide();
    };
    const removeProductShipment = async () => {
      try {
        await productShipmentService().delete(removeId.value);
        const message = t$('businessApp.productShipment.deleted', { param: removeId.value }).toString();
        alertService.showInfo(message, { variant: 'danger' });
        removeId.value = null;
        clear();
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

    watch([propOrder, reverse], async () => {
      if (page.value === 1) {
        // first page, retrieve new data
        await retrieveProductShipments();
      } else {
        // reset the pagination
        clear();
      }
    });

    // Whenever page changes, switch to the new page.
    watch(page, async () => {
      await retrieveProductShipments();
    });

    const onInput = debounce(async () => {
      await retrieveProductShipments();
      // Perform your action here
    }, 500);

    return {
      productShipments,
      handleSyncList,
      isFetching,
      retrieveProductShipments,
      clear,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeProductShipment,
      itemsPerPage,
      queryCount,
      page,
      propOrder,
      reverse,
      totalItems,
      changeOrder,
      t$,
      ...dataUtils,
      openPeriod,
      searchText,
      onInput,
    };
  },
});
