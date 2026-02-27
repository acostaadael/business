import { type Ref, computed, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';

import { useValidation } from '@/shared/composables';

import { ReportParam, type IReportParam } from '@/shared/model/report-param.model';
import { useAlertService } from '@/shared/alert/alert.service.ts';
import AreaService from '@/entities/area/area.service.ts';
import type { IArea } from '@/shared/model/area.model.ts';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'EntryReport',
  setup() {
    const areaService = inject('areaService', () => new AreaService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const reportParam: Ref<IReportParam> = ref(new ReportParam());
    const isSaving = ref(false);
    const currentLanguage = inject('currentLanguage', () => computed(() => navigator.language ?? 'es'), true);

    const areas: Ref<IArea[]> = ref([]);
    const router = useRouter();

    const previousState = () => router.go(-1);

    const initRelationships = () => {
      areaService()
        .retrieve()
        .then(res => {
          areas.value = res.data;
        });
    };
    initRelationships();

    const { t: t$ } = useI18n();
    const validations = useValidation();
    const validationRules = {
      area: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
    };
    const v$ = useVuelidate(validationRules, reportParam as any);
    v$.value.$validate();

    return {
      reportParam,
      areas,
      previousState,
      isSaving,
      currentLanguage,
      v$,
      t$,
      router,
    };
  },
  created(): void {},
  methods: {
    save(): void {
      this.router.push(`/inventary-report/${this.reportParam.area?.id}`);
    },
  },
});
