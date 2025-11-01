import { type Ref, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import ProductFamilyService from './product-family.service';
import { type IProductFamily } from '@/shared/model/product-family.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ProductFamilyDetails',
  setup() {
    const productFamilyService = inject('productFamilyService', () => new ProductFamilyService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);
    const productFamily: Ref<IProductFamily> = ref({});

    const retrieveProductFamily = async productFamilyId => {
      try {
        const res = await productFamilyService().find(productFamilyId);
        productFamily.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.productFamilyId) {
      retrieveProductFamily(route.params.productFamilyId);
    }

    return {
      alertService,
      productFamily,

      previousState,
      t$: useI18n().t,
    };
  },
});
