import { type Ref, computed, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';

import EntryService from './entry.service';
import { useValidation } from '@/shared/composables';
import { useAlertService } from '@/shared/alert/alert.service';

import AreaService from '@/entities/area/area.service';
import { type IArea } from '@/shared/model/area.model';
import ProductService from '@/entities/product/product.service';
import { type IProduct } from '@/shared/model/product.model';
import { Entry, type IEntry } from '@/shared/model/entry.model';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'EntryUpdate',
  setup() {
    const entryService = inject('entryService', () => new EntryService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const entry: Ref<IEntry> = ref(new Entry());

    const areaService = inject('areaService', () => new AreaService());

    const areas: Ref<IArea[]> = ref([]);

    const productService = inject('productService', () => new ProductService());

    const products: Ref<IProduct[]> = ref([]);
    const isSaving = ref(false);
    const currentLanguage = inject('currentLanguage', () => computed(() => navigator.language ?? 'es'), true);

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);

    const retrieveEntry = async entryId => {
      try {
        const res = await entryService().find(entryId);
        entry.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.entryId) {
      retrieveEntry(route.params.entryId);
    }

    const initRelationships = () => {
      areaService()
        .retrieve()
        .then(res => {
          areas.value = res.data;
        });
      productService()
        .retrieve()
        .then(res => {
          products.value = res.data;
        });
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
      area: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
      product: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
    };
    const v$ = useVuelidate(validationRules, entry as any);
    v$.value.$validate();

    return {
      entryService,
      alertService,
      entry,
      previousState,
      isSaving,
      currentLanguage,
      areas,
      products,
      v$,
      t$,
    };
  },
  created(): void {},
  methods: {
    save(): void {
      this.isSaving = true;
      if (this.entry.id) {
        this.entryService()
          .update(this.entry)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showInfo(this.t$('businessApp.entry.updated', { param: param.id }));
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      } else {
        this.entryService()
          .create(this.entry)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showSuccess(this.t$('businessApp.entry.created', { param: param.id }).toString());
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      }
    },
  },
});
