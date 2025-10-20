import { type Ref, computed, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';

import PeriodService from './period.service';
import { useValidation } from '@/shared/composables';
import { useAlertService } from '@/shared/alert/alert.service';

import { type IPeriod, Period } from '@/shared/model/period.model';
import { PeriodStatus } from '@/shared/model/enumerations/period-status.model';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'PeriodUpdate',
  setup() {
    const periodService = inject('periodService', () => new PeriodService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const period: Ref<IPeriod> = ref(new Period());
    const periodStatusValues: Ref<string[]> = ref(Object.keys(PeriodStatus));
    const isSaving = ref(false);
    const currentLanguage = inject('currentLanguage', () => computed(() => navigator.language ?? 'es'), true);

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);

    const retrievePeriod = async periodId => {
      try {
        const res = await periodService().find(periodId);
        period.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.periodId) {
      retrievePeriod(route.params.periodId);
    }

    const { t: t$ } = useI18n();
    const validations = useValidation();
    const validationRules = {
      month: {
        required: validations.required(t$('entity.validation.required').toString()),
        integer: validations.integer(t$('entity.validation.number').toString()),
      },
      year: {
        required: validations.required(t$('entity.validation.required').toString()),
        integer: validations.integer(t$('entity.validation.number').toString()),
      },
      status: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
    };
    const v$ = useVuelidate(validationRules, period as any);
    v$.value.$validate();

    return {
      periodService,
      alertService,
      period,
      previousState,
      periodStatusValues,
      isSaving,
      currentLanguage,
      v$,
      t$,
    };
  },
  created(): void {},
  methods: {
    save(): void {
      this.isSaving = true;
      if (this.period.id) {
        this.periodService()
          .update(this.period)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showInfo(this.t$('businessApp.period.updated', { param: param.id }));
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      } else {
        this.periodService()
          .create(this.period)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showSuccess(this.t$('businessApp.period.created', { param: param.id }).toString());
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      }
    },
  },
});
