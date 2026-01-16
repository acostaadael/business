import { type Ref, computed, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';

import CompanyService from './company.service';
import { useValidation } from '@/shared/composables';
import { useAlertService } from '@/shared/alert/alert.service';

import { Company, type ICompany } from '@/shared/model/company.model';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'CompanyUpdate',
  setup() {
    const companyService = inject('companyService', () => new CompanyService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const company: Ref<ICompany> = ref(new Company());
    const isSaving = ref(false);
    const currentLanguage = inject('currentLanguage', () => computed(() => navigator.language ?? 'es'), true);

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);

    const retrieveCompany = async companyId => {
      try {
        const res = await companyService().find(companyId);
        company.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.companyId) {
      retrieveCompany(route.params.companyId);
    }

    const { t: t$ } = useI18n();
    const validations = useValidation();
    const validationRules = {
      name: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
      active: {},
    };
    const v$ = useVuelidate(validationRules, company as any);
    v$.value.$validate();

    return {
      companyService,
      alertService,
      company,
      previousState,
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
      if (this.company.id) {
        this.companyService()
          .update(this.company)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showInfo(this.t$('businessApp.company.updated', { param: param.id }));
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      } else {
        this.companyService()
          .create(this.company)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showSuccess(this.t$('businessApp.company.created', { param: param.id }).toString());
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      }
    },
  },
});
