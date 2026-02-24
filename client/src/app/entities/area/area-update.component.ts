import { type Ref, computed, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';

import AreaService from './area.service';
import { useValidation } from '@/shared/composables';
import { useAlertService } from '@/shared/alert/alert.service';
import { AreaType } from '@/shared/model/enumerations/area-type.model.ts';

import { Area, type IArea } from '@/shared/model/area.model';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'AreaUpdate',
  setup() {
    const areaService = inject('areaService', () => new AreaService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const area: Ref<IArea> = ref(new Area());
    const isSaving = ref(false);
    const currentLanguage = inject('currentLanguage', () => computed(() => navigator.language ?? 'es'), true);
    const areaTypeValues: Ref<string[]> = ref(Object.keys(AreaType));

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);

    const retrieveArea = async areaId => {
      try {
        const res = await areaService().find(areaId);
        area.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.areaId) {
      retrieveArea(route.params.areaId);
    }

    const { t: t$ } = useI18n();
    const validations = useValidation();
    const validationRules = {
      name: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
      type: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
      description: {},
    };
    const v$ = useVuelidate(validationRules, area as any);
    v$.value.$validate();

    return {
      areaService,
      alertService,
      area,
      previousState,
      isSaving,
      currentLanguage,
      areaTypeValues,
      v$,
      t$,
    };
  },
  created(): void {},
  methods: {
    save(): void {
      this.isSaving = true;
      if (this.area.id) {
        this.areaService()
          .update(this.area)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showInfo(this.t$('businessApp.area.updated', { param: param.id }));
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      } else {
        this.areaService()
          .create(this.area)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showSuccess(this.t$('businessApp.area.created', { param: param.id }).toString());
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      }
    },
  },
});
