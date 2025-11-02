import { type Ref, computed, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';

import ProductLineService from './product-line.service';
import { useValidation } from '@/shared/composables';
import { useAlertService } from '@/shared/alert/alert.service';

import ProductFamilyService from '@/entities/product-family/product-family.service';
import { type IProductFamily } from '@/shared/model/product-family.model';
import { type IProductLine, ProductLine } from '@/shared/model/product-line.model';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ProductLineUpdate',
  setup() {
    const productLineService = inject('productLineService', () => new ProductLineService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const productLine: Ref<IProductLine> = ref(new ProductLine());

    const productFamilyService = inject('productFamilyService', () => new ProductFamilyService());

    const productFamilies: Ref<IProductFamily[]> = ref([]);
    const isSaving = ref(false);
    const currentLanguage = inject('currentLanguage', () => computed(() => navigator.language ?? 'es'), true);

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);

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

    const initRelationships = () => {
      productFamilyService()
        .retrieve()
        .then(res => {
          productFamilies.value = res.data;
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
      productFamily: {},
    };
    const v$ = useVuelidate(validationRules, productLine as any);
    v$.value.$validate();

    return {
      productLineService,
      alertService,
      productLine,
      previousState,
      isSaving,
      currentLanguage,
      productFamilies,
      v$,
      t$,
    };
  },
  created(): void {},
  methods: {
    save(): void {
      this.isSaving = true;
      if (this.productLine.id) {
        this.productLineService()
          .update(this.productLine)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showInfo(this.t$('businessApp.productLine.updated', { param: param.id }));
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      } else {
        this.productLineService()
          .create(this.productLine)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showSuccess(this.t$('businessApp.productLine.created', { param: param.id }).toString());
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      }
    },
  },
});
