import { type Ref, defineComponent, inject, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import ProductFamilyService from './product-family.service';
import { type IProductFamily } from '@/shared/model/product-family.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ProductFamily',
  setup() {
    const { t: t$ } = useI18n();
    const productFamilyService = inject('productFamilyService', () => new ProductFamilyService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const itemsPerPage = ref(20);
    const queryCount: Ref<number> = ref(null);
    const page: Ref<number> = ref(1);
    const propOrder = ref('id');
    const reverse = ref(false);
    const totalItems = ref(0);

    const productFamilies: Ref<IProductFamily[]> = ref([]);

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

    const retrieveProductFamilys = async () => {
      isFetching.value = true;
      try {
        const paginationQuery = {
          page: page.value - 1,
          size: itemsPerPage.value,
          sort: sort(),
        };
        const res = await productFamilyService().retrieve(paginationQuery);
        totalItems.value = Number(res.headers['x-total-count']);
        queryCount.value = totalItems.value;
        productFamilies.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSyncList = () => {
      retrieveProductFamilys();
    };

    onMounted(async () => {
      await retrieveProductFamilys();
    });

    const removeId: Ref<number> = ref(null);
    const removeEntity = ref<any>(null);
    const prepareRemove = (instance: IProductFamily) => {
      removeId.value = instance.id;
      removeEntity.value.show();
    };
    const closeDialog = () => {
      removeEntity.value.hide();
    };
    const removeProductFamily = async () => {
      try {
        await productFamilyService().delete(removeId.value);
        const message = t$('businessApp.productFamily.deleted', { param: removeId.value }).toString();
        alertService.showInfo(message, { variant: 'danger' });
        removeId.value = null;
        retrieveProductFamilys();
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
        await retrieveProductFamilys();
      } else {
        // reset the pagination
        clear();
      }
    });

    // Whenever page changes, switch to the new page.
    watch(page, async () => {
      await retrieveProductFamilys();
    });

    return {
      productFamilies,
      handleSyncList,
      isFetching,
      retrieveProductFamilys,
      clear,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeProductFamily,
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
