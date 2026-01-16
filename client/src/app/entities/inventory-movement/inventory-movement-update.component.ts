import { type Ref, computed, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';

import InventoryMovementService from './inventory-movement.service';
import { useValidation } from '@/shared/composables';
import { useAlertService } from '@/shared/alert/alert.service';

import PeriodService from '@/entities/period/period.service';
import { type IPeriod } from '@/shared/model/period.model';
import CompanyService from '@/entities/company/company.service';
import { type ICompany } from '@/shared/model/company.model';
import ProductService from '@/entities/product/product.service';
import { type IProduct } from '@/shared/model/product.model';
import AreaService from '@/entities/area/area.service';
import { type IArea } from '@/shared/model/area.model';
import { type IInventoryMovement, InventoryMovement } from '@/shared/model/inventory-movement.model';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'InventoryMovementUpdate',
  setup() {
    const inventoryMovementService = inject('inventoryMovementService', () => new InventoryMovementService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const inventoryMovement: Ref<IInventoryMovement> = ref(new InventoryMovement());

    const periodService = inject('periodService', () => new PeriodService());

    const periods: Ref<IPeriod[]> = ref([]);

    const companyService = inject('companyService', () => new CompanyService());

    const companies: Ref<ICompany[]> = ref([]);

    const productService = inject('productService', () => new ProductService());

    const products: Ref<IProduct[]> = ref([]);

    const areaService = inject('areaService', () => new AreaService());

    const areas: Ref<IArea[]> = ref([]);
    const isSaving = ref(false);
    const currentLanguage = inject('currentLanguage', () => computed(() => navigator.language ?? 'es'), true);

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);

    const retrieveInventoryMovement = async inventoryMovementId => {
      try {
        const res = await inventoryMovementService().find(inventoryMovementId);
        inventoryMovement.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.inventoryMovementId) {
      retrieveInventoryMovement(route.params.inventoryMovementId);
    }

    const initRelationships = () => {
      periodService()
        .retrieve()
        .then(res => {
          periods.value = res.data;
        });
      companyService()
        .retrieve()
        .then(res => {
          companies.value = res.data;
        });
      productService()
        .retrieve()
        .then(res => {
          products.value = res.data;
        });
      areaService()
        .retrieve()
        .then(res => {
          areas.value = res.data;
        });
    };

    initRelationships();

    const distinctSource = () => inventoryMovement.value.target?.id !== inventoryMovement.value.source?.id;

    const { t: t$ } = useI18n();
    const validations = useValidation();
    const validationRules = {
      day: {
        required: validations.required(t$('entity.validation.required').toString()),
        integer: validations.integer(t$('entity.validation.number').toString()),
      },
      count: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
      product: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
      source: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
      target: {
        required: validations.required(t$('entity.validation.required').toString()),
        distinct: distinctSource,
      },
    };
    const v$ = useVuelidate(validationRules, inventoryMovement as any);
    v$.value.$validate();

    return {
      inventoryMovementService,
      alertService,
      inventoryMovement,
      previousState,
      isSaving,
      currentLanguage,
      periods,
      companies,
      products,
      areas,
      v$,
      t$,
    };
  },
  created(): void {},
  methods: {
    save(): void {
      this.isSaving = true;
      if (this.inventoryMovement.id) {
        this.inventoryMovementService()
          .update(this.inventoryMovement)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showInfo(this.t$('businessApp.inventoryMovement.updated', { param: param.id }));
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      } else {
        this.inventoryMovementService()
          .create(this.inventoryMovement)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showSuccess(this.t$('businessApp.inventoryMovement.created', { param: param.id }).toString());
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      }
    },
  },
});
