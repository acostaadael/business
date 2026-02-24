import { type Ref, computed, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';

import ProductShipmentService from './product-shipment.service';
import { useValidation } from '@/shared/composables';
import { useAlertService } from '@/shared/alert/alert.service';

import ProductService from '@/entities/product/product.service';
import { type IProduct } from '@/shared/model/product.model';
import CompanyService from '@/entities/company/company.service';
import { type ICompany } from '@/shared/model/company.model';
import { type IProductShipment, ProductShipment } from '@/shared/model/product-shipment.model';
import { ExitType } from '@/shared/model/enumerations/exit-type.model';
import Autocomplete from '@/components/forms/Autocomplete.vue';
import type { AutocompleteItem } from '@/components/forms/Autocomplete.vue';
import AreaService from '../area/area.service';
import type { IArea } from '@/shared/model/area.model';
import type { AreaType } from '@/shared/model/enumerations/area-type.model.ts';

export default defineComponent({
  compatConfig: { MODE: 3 },
  components: {
    Autocomplete,
  },
  name: 'ProductShipmentUpdate',
  setup() {
    const productShipmentService = inject('productShipmentService', () => new ProductShipmentService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const productShipment: Ref<IProductShipment> = ref(new ProductShipment());

    const productService = inject('productService', () => new ProductService());

    const products: Ref<AutocompleteItem[]> = ref([]);
    const productLoading = ref(false);

    const areaService = inject('areaService', () => new AreaService());

    const areas: Ref<IArea[]> = ref([]);

    const companyService = inject('companyService', () => new CompanyService());

    const companies: Ref<ICompany[]> = ref([]);

    const productShipments: Ref<IProductShipment[]> = ref([]);
    const exitTypeValues: Ref<string[]> = ref(Object.keys(ExitType));
    const isSaving = ref(false);
    const currentLanguage = inject('currentLanguage', () => computed(() => navigator.language ?? 'es'), true);

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);

    const retrieveProductShipment = async productShipmentId => {
      try {
        const res = await productShipmentService().find(productShipmentId);
        productShipment.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.productShipmentId) {
      retrieveProductShipment(route.params.productShipmentId);
    }

    const searchProducts = async (term: string) => {
      if (term.length >= 2) {
        productLoading.value = true;
        try {
          const paginationQuery = {
            page: 0,
            size: 20,
            globalSearch: term,
          };

          const res = await productService().retrieve(paginationQuery);
          res.data.map((item: IProduct) => {
            item.name = `${item.name} (${item.um?.name})`;
          });

          products.value = res.data;
        } catch (err) {
          alertService.showHttpError(err.response);
        } finally {
          productLoading.value = false;
        }
      } else {
        products.value = [];
      }
    };

    const handleSelect = (item: IProduct) => {
      productShipment.value.product = item;
    };

    const initRelationships = () => {
      productService()
        .retrieve()
        .then(res => {
          products.value = res.data;
        });
      productShipmentService()
        .retrieve()
        .then(res => {
          productShipments.value = res.data;
        });
    };

    const loadAreas = async () => {
      try {
        const res = await areaService().retrieve(productShipment.value.type);
        areas.value = res.data;
      } catch (e) {
        console.log(e);
      }
    };

    initRelationships();

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
      type: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
      product: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
      area: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
      period: {},
    };
    const v$ = useVuelidate(validationRules, productShipment as any);
    v$.value.$validate();

    return {
      productShipmentService,
      alertService,
      productShipment,
      previousState,
      exitTypeValues,
      isSaving,
      currentLanguage,
      products,
      companies,
      areas,
      productShipments,
      productLoading,
      searchProducts,
      handleSelect,
      loadAreas,
      v$,
      t$,
    };
  },
  created(): void {},
  methods: {
    save(): void {
      this.isSaving = true;
      if (this.productShipment.id) {
        this.productShipmentService()
          .update(this.productShipment)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showInfo(this.t$('businessApp.productShipment.updated', { param: param.id }));
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      } else {
        this.productShipmentService()
          .create(this.productShipment)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showSuccess(this.t$('businessApp.productShipment.created', { param: param.id }).toString());
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      }
    },
  },
});
