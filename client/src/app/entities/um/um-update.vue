<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <form name="editForm" novalidate @submit.prevent="save()">
        <h2
          id="businessApp.um.home.createOrEditLabel"
          data-cy="UmCreateUpdateHeading"
          v-text="t$('businessApp.um.home.createOrEditLabel')"
        ></h2>
        <div>
          <div class="form-group" v-if="um.id">
            <label for="id" v-text="t$('global.field.id')"></label>
            <input type="text" class="form-control" id="id" name="id" v-model="um.id" readonly />
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('businessApp.um.name')" for="um-name"></label>
            <input
              type="text"
              class="form-control"
              name="name"
              id="um-name"
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
            <label class="form-control-label" v-text="t$('businessApp.um.description')" for="um-description"></label>
            <input
              type="text"
              class="form-control"
              name="description"
              id="um-description"
              data-cy="description"
              :class="{ valid: !v$.description.$invalid, invalid: v$.description.$invalid }"
              v-model="v$.description.$model"
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
import { type Ref, computed, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';

import UmService from './um.service';
import { useValidation } from '@/shared/composables';
import { useAlertService } from '@/shared/alert/alert.service';

import { type IUm, Um } from '@/shared/model/um.model';

const umService = inject('umService', () => new UmService());
const alertService = inject('alertService', () => useAlertService(), true);

const um: Ref<IUm> = ref(new Um());
const isSaving = ref(false);
const currentLanguage = inject('currentLanguage', () => computed(() => navigator.language ?? 'es'), true);

const route = useRoute();
const router = useRouter();

const previousState = () => router.go(-1);

const retrieveUm = async (umId: string | number) => {
  try {
    um.value = await umService().find(Number(umId));
  } catch (error: any) {
    alertService.showHttpError(error.response);
  }
};

if (route.params?.umId) {
  retrieveUm(route.params.umId as any);
}

const { t: t$ } = useI18n();
const validations = useValidation();

const validationRules = {
  name: {
    required: validations.required(t$('entity.validation.required').toString()),
  },
  description: {},
};

const v$ = useVuelidate(validationRules as any, um as any);
v$.value.$validate();

const save = async (): Promise<void> => {
  isSaving.value = true;

  try {
    if (um.value.id) {
      const param = await umService().update(um.value);
      isSaving.value = false;
      previousState();
      alertService.showInfo(t$('businessApp.um.updated', { param: param.id }));
    } else {
      const param = await umService().create(um.value);
      isSaving.value = false;
      previousState();
      alertService.showSuccess(t$('businessApp.um.created', { param: param.id }).toString());
    }
  } catch (error: any) {
    isSaving.value = false;
    alertService.showHttpError(error.response);
  }
};
</script>
