import { type Ref, defineComponent, inject, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import ProductLineService from './product-line.service';
import { type IProductLine } from '@/shared/model/product-line.model';
import { useAlertService } from '@/shared/alert/alert.service';
import { debounce } from 'lodash';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ProductLine',
  setup() {
    const { t: t$ } = useI18n();
    const productLineService = inject('productLineService', () => new ProductLineService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const itemsPerPage = ref(10);
    const queryCount: Ref<number> = ref(null);
    const page: Ref<number> = ref(1);
    const propOrder = ref('id');
    const reverse = ref(false);
    const totalItems = ref(0);
    const searchText = ref('');

    const productLines: Ref<IProductLine[]> = ref([]);

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

    const retrieveProductLines = async () => {
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
        const res = await productLineService().retrieve(paginationQuery);
        totalItems.value = Number(res.headers['x-total-count']);
        queryCount.value = totalItems.value;
        productLines.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSyncList = () => {
      retrieveProductLines();
    };

    onMounted(async () => {
      await retrieveProductLines();
    });

    const removeId: Ref<number> = ref(null);
    const removeEntity = ref<any>(null);
    const prepareRemove = (instance: IProductLine) => {
      removeId.value = instance.id;
      removeEntity.value.show();
    };
    const closeDialog = () => {
      removeEntity.value.hide();
    };
    const removeProductLine = async () => {
      try {
        await productLineService().delete(removeId.value);
        const message = t$('businessApp.productLine.deleted', { param: removeId.value }).toString();
        alertService.showInfo(message, { variant: 'danger' });
        removeId.value = null;
        retrieveProductLines();
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
        closeDialog();
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
        await retrieveProductLines();
      } else {
        // reset the pagination
        clear();
      }
    });

    // Whenever page changes, switch to the new page.
    watch(page, async () => {
      await retrieveProductLines();
    });

    const onInput = debounce(async () => {
      await retrieveProductLines();
      // Perform your action here
    }, 500);

    return {
      productLines,
      handleSyncList,
      isFetching,
      retrieveProductLines,
      clear,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeProductLine,
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
