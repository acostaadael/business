<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <form name="editForm" novalidate @submit.prevent="save()">
        <h2
          id="businessApp.company.home.createOrEditLabel"
          data-cy="CompanyCreateUpdateHeading"
          v-text="t$('businessApp.company.home.createOrEditLabel')"
        ></h2>
        <div>
          <div class="form-group" v-if="company.id">
            <label for="id" v-text="t$('global.field.id')"></label>
            <input type="text" class="form-control" id="id" name="id" v-model="company.id" readonly />
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('businessApp.company.name')" for="company-name"></label>
            <input
              type="text"
              class="form-control"
              name="name"
              id="company-name"
              data-cy="name"
              :class="{ valid: !v$.name.$invalid, invalid: v$.name.$invalid }"
              v-model="v$.name.$model"
              required
            />
            <div v-if="v$.name.$anyDirty && v$.name.$invalid">
              <small class="form-text text-danger" v-for="error of v$.name.$errors" :key="error.$uid">{{ error.$message }}</small>
            </div>
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('businessApp.company.active')" for="company-active"></label>
            <input
              type="checkbox"
              class="form-check"
              name="active"
              id="company-active"
              data-cy="active"
              :class="{ valid: !v$.active.$invalid, invalid: v$.active.$invalid }"
              v-model="v$.active.$model"
            />
          </div>
        </div>
        <div>
          <button type="button" id="cancel-save" data-cy="entityCreateCancelButton" class="btn btn-secondary" @click="previousState()">
            <font-awesome-icon icon="ban"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.cancel')"></span>
          </button>
          <button
            type="submit"
            id="save-entity"
            data-cy="entityCreateSaveButton"
            :disabled="v$.$invalid || isSaving"
            class="btn btn-primary"
          >
            <font-awesome-icon icon="save"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.save')"></span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';

import CompanyService from './company.service';
import { useValidation } from '@/shared/composables';
import { useAlertService } from '@/shared/alert/alert.service';

import { Company, type ICompany } from '@/shared/model/company.model';

const companyService = inject('companyService', () => new CompanyService());
const alertService = inject('alertService', () => useAlertService(), true);

const company = ref<ICompany>(new Company());
const isSaving = ref(false);

// Se mantiene por compatibilidad con el resto de la app (aunque este componente no lo use directamente)
const currentLanguage = inject('currentLanguage', () => computed(() => navigator.language ?? 'es'), true);
void currentLanguage;

const route = useRoute();
const router = useRouter();

const previousState = () => router.go(-1);

const retrieveCompany = async (companyId: number | string) => {
  try {
    const res = await companyService().find(companyId);
    company.value = res;
  } catch (error: any) {
    alertService.showHttpError(error.response);
  }
};

if (route.params?.companyId) {
  retrieveCompany(route.params.companyId as any);
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

const save = async (): Promise<void> => {
  isSaving.value = true;
  try {
    if (company.value.id) {
      const param = await companyService().update(company.value);
      isSaving.value = false;
      previousState();
      alertService.showInfo(t$('businessApp.company.updated', { param: param.id }));
    } else {
      const param = await companyService().create(company.value);
      isSaving.value = false;
      previousState();
      alertService.showSuccess(t$('businessApp.company.created', { param: param.id }).toString());
    }
  } catch (error: any) {
    isSaving.value = false;
    alertService.showHttpError(error.response);
  }
};
</script>
