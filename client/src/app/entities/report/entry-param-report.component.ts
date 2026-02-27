import { type Ref, computed, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';

import { useValidation } from '@/shared/composables';

import { ReportParam, type IReportParam } from '@/shared/model/report-param.model';
import PeriodService from '@/entities/period/period.service.ts';
import type { IPeriod } from '@/shared/model/period.model.ts';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'EntryParamReport',
  setup() {
    const periodService = inject('periodService', () => new PeriodService());

    const reportParam: Ref<IReportParam> = ref(new ReportParam());
    const currentLanguage = inject('currentLanguage', () => computed(() => navigator.language ?? 'es'), true);

    const periods: Ref<IPeriod[]> = ref([]);
    const router = useRouter();

    const previousState = () => router.go(-1);

    const initRelationships = () => {
      const paginationQuery = {
        page: 0,
        size: 12,
        sort: ['id', 'desc'],
      };
      periodService()
        .retrieve(paginationQuery)
        .then(res => {
          periods.value = res.data;
        });
    };
    initRelationships();

    const { t: t$ } = useI18n();
    const validations = useValidation();
    const validationRules = {
      period: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
    };
    const v$ = useVuelidate(validationRules, reportParam as any);
    v$.value.$validate();

    return {
      reportParam,
      periods,
      previousState,
      currentLanguage,
      v$,
      t$,
      router,
    };
  },
  created(): void {},
  methods: {
    save(): void {
      this.router.push(`/entry-report/${this.reportParam.period?.id}`);
    },
  },
});
