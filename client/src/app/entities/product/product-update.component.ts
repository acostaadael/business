import { type Ref, computed, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';

import ProductService from './product.service';
import { useValidation } from '@/shared/composables';
import { useAlertService } from '@/shared/alert/alert.service';

import UmService from '@/entities/um/um.service';
import { type IUm } from '@/shared/model/um.model';
import ProductLineService from '@/entities/product-line/product-line.service';
import { type IProductLine } from '@/shared/model/product-line.model';
import { type IProduct, Product } from '@/shared/model/product.model';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ProductUpdate',
  setup() {
    const productService = inject('productService', () => new ProductService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const product: Ref<IProduct> = ref(new Product());

    const umService = inject('umService', () => new UmService());

    const ums: Ref<IUm[]> = ref([]);

    const productLineService = inject('productLineService', () => new ProductLineService());

    const productLines: Ref<IProductLine[]> = ref([]);
    const isSaving = ref(false);
    const currentLanguage = inject('currentLanguage', () => computed(() => navigator.language ?? 'es'), true);

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);

    const retrieveProduct = async productId => {
      try {
        const res = await productService().find(productId);
        product.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.productId) {
      retrieveProduct(route.params.productId);
    }

    const initRelationships = () => {
      umService()
        .retrieve()
        .then(res => {
          ums.value = res.data;
        });
      productLineService()
        .retrieve()
        .then(res => {
          productLines.value = res.data;
        });
    };

    initRelationships();

    const { t: t$ } = useI18n();
    const validations = useValidation();
    const validationRules = {
      code: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
      name: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
      description: {},
      costPrice: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
      profitMargin: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
      hasCode: {},
      um: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
      productLine: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
    };
    const v$ = useVuelidate(validationRules, product as any);
    v$.value.$validate();

    return {
      productService,
      alertService,
      product,
      previousState,
      isSaving,
      currentLanguage,
      ums,
      productLines,
      v$,
      t$,
    };
  },
  created(): void {},
  methods: {
    save(): void {
      this.isSaving = true;
      if (this.product.id) {
        this.productService()
          .update(this.product)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showInfo(this.t$('businessApp.product.updated', { param: param.id }));
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      } else {
        this.productService()
          .create(this.product)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showSuccess(this.t$('businessApp.product.created', { param: param.id }).toString());
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      }
    },
  },
});
