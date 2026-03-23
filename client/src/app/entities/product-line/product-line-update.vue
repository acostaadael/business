<!-- eslint-disable prettier/prettier -->
<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <form name="editForm" novalidate @submit.prevent="save()">
        <h2
          id="businessApp.productLine.home.createOrEditLabel"
          data-cy="ProductLineCreateUpdateHeading"
          v-text="t$('businessApp.productLine.home.createOrEditLabel')"
        ></h2>
        <div>
          <div class="form-group" v-if="productLine.id">
            <label for="id" v-text="t$('global.field.id')"></label>
            <input type="text" class="form-control" id="id" name="id" v-model="productLine.id" readonly />
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('businessApp.productLine.name')" for="product-line-name"></label>
            <input
              type="text"
              class="form-control"
              name="name"
              id="product-line-name"
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
            <label class="form-control-label" v-text="t$('businessApp.productLine.description')" for="product-line-description"></label>
            <input
              type="text"
              class="form-control"
              name="description"
              id="product-line-description"
              data-cy="description"
              :class="{ valid: !v$.description.$invalid, invalid: v$.description.$invalid }"
              v-model="v$.description.$model"
            />
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('businessApp.productLine.productFamily')" for="product-line-productFamily"></label>
            <select
              class="form-control"
              id="product-line-productFamily"
              data-cy="productFamily"
              name="productFamily"
              v-model="productLine.productFamily"
              required
            >
              <option :value="null"></option>
              <option
                :value="
                  productLine.productFamily && productFamilyOption.id === productLine.productFamily.id
                    ? productLine.productFamily
                    : productFamilyOption
                "
                v-for="productFamilyOption in productFamilies"
                :key="productFamilyOption.id"
              >
                {{ productFamilyOption.name }}
              </option>
            </select>
            <div v-if="v$.productFamily.$anyDirty && v$.productFamily.$invalid">
              <small class="form-text text-danger" v-for="error of v$.productFamily.$errors" :key="error.$uid">{{ error.$message }}</small>
            </div>
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

import ProductLineService from './product-line.service';
import { useValidation } from '@/shared/composables';
import { useAlertService } from '@/shared/alert/alert.service';

import ProductFamilyService from '@/entities/product-family/product-family.service';
import { type IProductFamily } from '@/shared/model/product-family.model';
import { type IProductLine, ProductLine } from '@/shared/model/product-line.model';

const productLineService = inject('productLineService', () => new ProductLineService());
const productFamilyService = inject('productFamilyService', () => new ProductFamilyService());
const alertService = inject('alertService', () => useAlertService(), true);

const productLine: Ref<IProductLine> = ref(new ProductLine());
const productFamilies: Ref<IProductFamily[]> = ref([]);
const isSaving = ref(false);
const currentLanguage = inject('currentLanguage', () => computed(() => navigator.language ?? 'es'), true);

const route = useRoute();
const router = useRouter();

const previousState = () => router.go(-1);

const retrieveProductLine = async (productLineId: string | number) => {
  try {
    productLine.value = await productLineService().find(Number(productLineId));
  } catch (error: any) {
    alertService.showHttpError(error.response);
  }
};

if (route.params?.productLineId) {
  retrieveProductLine(route.params.productLineId as any);
}

const initRelationships = async () => {
  try {
    const res = await productFamilyService().retrieve();
    productFamilies.value = res.data;
  } catch {
    productFamilies.value = [];
  }
};

initRelationships();

const { t: t$ } = useI18n();
const validations = useValidation();

const validationRules = {
  name: {
    required: validations.required(t$('entity.validation.required').toString()),
  },
  description: {},
  productFamily: {
    required: validations.required(t$('entity.validation.required').toString()),
  },
};

const v$ = useVuelidate(validationRules as any, productLine as any);
v$.value.$validate();

const save = async (): Promise<void> => {
  isSaving.value = true;

  try {
    if (productLine.value.id) {
      const param = await productLineService().update(productLine.value);
      isSaving.value = false;
      previousState();
      alertService.showInfo(t$('businessApp.productLine.updated', { param: param.id }));
    } else {
      const param = await productLineService().create(productLine.value);
      isSaving.value = false;
      previousState();
      alertService.showSuccess(t$('businessApp.productLine.created', { param: param.id }).toString());
    }
  } catch (error: any) {
    isSaving.value = false;
    alertService.showHttpError(error.response);
  }
};
</script>
