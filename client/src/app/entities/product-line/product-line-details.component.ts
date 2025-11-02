import { type Ref, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import ProductLineService from './product-line.service';
import { type IProductLine } from '@/shared/model/product-line.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ProductLineDetails',
  setup() {
    const productLineService = inject('productLineService', () => new ProductLineService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);
    const productLine: Ref<IProductLine> = ref({});

    const retrieveProductLine = async productLineId => {
      try {
        const res = await productLineService().find(productLineId);
        productLine.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.productLineId) {
      retrieveProductLine(route.params.productLineId);
    }

    return {
      alertService,
      productLine,

      previousState,
      t$: useI18n().t,
    };
  },
});
