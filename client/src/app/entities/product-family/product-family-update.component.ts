import { type Ref, computed, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';

import ProductFamilyService from './product-family.service';
import { useValidation } from '@/shared/composables';
import { useAlertService } from '@/shared/alert/alert.service';

import ProductCategoryService from '@/entities/product-category/product-category.service';
import { type IProductCategory } from '@/shared/model/product-category.model';
import { type IProductFamily, ProductFamily } from '@/shared/model/product-family.model';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ProductFamilyUpdate',
  setup() {
    const productFamilyService = inject('productFamilyService', () => new ProductFamilyService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const productFamily: Ref<IProductFamily> = ref(new ProductFamily());

    const productCategoryService = inject('productCategoryService', () => new ProductCategoryService());

    const productCategories: Ref<IProductCategory[]> = ref([]);
    const isSaving = ref(false);
    const currentLanguage = inject('currentLanguage', () => computed(() => navigator.language ?? 'es'), true);

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);

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

    const initRelationships = () => {
      productCategoryService()
        .retrieve()
        .then(res => {
          productCategories.value = res.data;
        });
    };

    initRelationships();

    const { t: t$ } = useI18n();
    const validations = useValidation();
    const validationRules = {
      name: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
      description: {},
      productCategory: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
    };
    const v$ = useVuelidate(validationRules, productFamily as any);
    v$.value.$validate();

    return {
      productFamilyService,
      alertService,
      productFamily,
      previousState,
      isSaving,
      currentLanguage,
      productCategories,
      v$,
      t$,
    };
  },
  created(): void {},
  methods: {
    save(): void {
      this.isSaving = true;
      if (this.productFamily.id) {
        this.productFamilyService()
          .update(this.productFamily)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showInfo(this.t$('businessApp.productFamily.updated', { param: param.id }));
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      } else {
        this.productFamilyService()
          .create(this.productFamily)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showSuccess(this.t$('businessApp.productFamily.created', { param: param.id }).toString());
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      }
    },
  },
});
