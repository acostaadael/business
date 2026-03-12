<script setup lang="ts">
import { type Ref, computed, inject, ref, reactive } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { useI18n } from 'vue-i18n';
import { debounce } from 'lodash';
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
import { createAutoComplete } from '@/components/auto-complete';
import { AreaType } from '@/shared/model/enumerations/area-type.model.ts';

const entryService = inject('entryService', () => new EntryService());
const alertService = inject('alertService', () => useAlertService(), true);
const areaService = inject('areaService', () => new AreaService());
const productService = inject('productService', () => new ProductService());

const entry: IEntry = reactive(new Entry());
const areas: Ref<IArea[]> = ref([]);

const products: Ref<IProduct[]> = ref([]);
const productLoading = ref(false);

const isSaving = ref(false);
const currentLanguage = inject('currentLanguage', () => computed(() => navigator.language ?? 'es'), true);

const route = useRoute();
const router = useRouter();

const previousState = () => router.go(-1);

const retrieveEntry = async (entryId: number) => {
  try {
    const data = await entryService().find(entryId);
    if (data) {
      Object.assign(entry, data);
    }
  } catch (error: any) {
    alertService.showHttpError(error.response);
  }
};

if (route.params?.entryId) {
  retrieveEntry(Number(route.params.entryId));
}

const initRelationships = () => {
  areaService()
    .retrieve(AreaType.ALMACEN)
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

const searchProducts = debounce(async (query: string) => {
  productLoading.value = true;
  try {
    const paginationQuery = {
      page: 0,
      size: 20,
      globalSearch: query,
    };
    const res = await productService().retrieve(paginationQuery);
    products.value = res.data;
  } catch (error: any) {
    alertService.showHttpError(error.response);
  } finally {
    productLoading.value = false;
  }
}, 500);

const handleSelect = (item: IProduct) => {
  entry.product = item;
};

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

const save = async () => {
  if (v$.value.$invalid) return;
  isSaving.value = true;
  try {
    const result = await entryService().create(entry);
    alertService.showSuccess(t$('businessApp.entry.created', { param: result.id }).toString());
    previousState();
  } catch (error: any) {
    alertService.showHttpError(error.response);
  } finally {
    isSaving.value = false;
  }
};

// Create a typed alias for the AutoComplete component specialized to IProduct via factory
const ProductAutoComplete = createAutoComplete<IProduct>();

// helper to safely access slot item properties (avoids template TS errors for unknown)
function getItemName(item: any) {
  return item?.name ?? '';
}
function getItemId(item: any) {
  return item?.id ?? '';
}
</script>
<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <form name="editForm" novalidate @submit.prevent="save()">
        <h2
          id="businessApp.entry.home.createOrEditLabel"
          data-cy="EntryCreateUpdateHeading"
          v-text="t$('businessApp.entry.home.createOrEditLabel')"
        ></h2>
        <div>
          <b-form-row>
            <b-col>
              <label class="form-control-label" v-text="t$('businessApp.entry.product')" for="product"></label>
              <ProductAutoComplete
                :items="products"
                v-model="entry.product"
                item-key="id"
                item-label="name"
                :loading="productLoading"
                placeholder="Selecciona un producto"
                clearable
                @select="(item: IProduct) => (entry.product = item)"
                @search="searchProducts"
              >
                <template #item="{ item }">
                  <!-- Personalización de la representación de los elementos usando helpers -->
                  <div>
                    <strong>{{ getItemName(item) }}</strong> (ID: {{ getItemId(item) }})
                  </div>
                </template>
              </ProductAutoComplete>

              <div v-if="v$.product.$anyDirty && v$.product.$invalid">
                <small class="form-text text-danger" v-for="error of v$.product.$errors" :key="error.$uid">{{ error.$message }}</small>
              </div>
            </b-col>
            <b-col>
              <div class="form-group">
                <label class="form-control-label" v-text="t$('businessApp.entry.count')" for="entry-count"></label>
                <input
                  type="number"
                  class="form-control"
                  name="count"
                  id="entry-count"
                  data-cy="count"
                  :class="{ valid: !v$.count.$invalid, invalid: v$.count.$invalid }"
                  v-model.number="v$.count.$model"
                  required
                />
                <div v-if="v$.count.$anyDirty && v$.count.$invalid">
                  <small class="form-text text-danger" v-for="error of v$.count.$errors" :key="error.$uid">{{ error.$message }}</small>
                </div>
              </div>
            </b-col>
          </b-form-row>
          <b-form-row>
            <b-col>
              <div class="form-group">
                <label class="form-control-label" v-text="t$('businessApp.entry.area')" for="entry-area"></label>
                <select class="form-control" id="entry-area" data-cy="area" name="area" v-model="entry.area" required>
                  <option v-if="!entry.area" :value="null" selected></option>
                  <option
                    :value="entry.area && areaOption.id === entry.area.id ? entry.area : areaOption"
                    v-for="areaOption in areas"
                    :key="areaOption.id"
                  >
                    {{ areaOption.name }}
                  </option>
                </select>
              </div>
              <div v-if="v$.area.$anyDirty && v$.area.$invalid">
                <small class="form-text text-danger" v-for="error of v$.area.$errors" :key="error.$uid">{{ error.$message }}</small>
              </div>
            </b-col>
            <b-col>
              <div class="form-group">
                <label class="form-control-label" v-text="t$('businessApp.entry.day')" for="entry-day"></label>
                <input
                  type="number"
                  class="form-control"
                  name="day"
                  id="entry-day"
                  data-cy="day"
                  :class="{ valid: !v$.day.$invalid, invalid: v$.day.$invalid }"
                  v-model.number="v$.day.$model"
                  required
                />
                <div v-if="v$.day.$anyDirty && v$.day.$invalid">
                  <small class="form-text text-danger" v-for="error of v$.day.$errors" :key="error.$uid">{{ error.$message }}</small>
                </div>
              </div>
            </b-col>
          </b-form-row>
        </div>
        <div>
          <button type="button" id="cancel-save" data-cy="entityCreateCancelButton" class="btn btn-secondary" @click="previousState()">
            <FontAwesomeIcon icon="ban"></FontAwesomeIcon>&nbsp;<span v-text="t$('entity.action.cancel')"></span>
          </button>
          <button
            type="submit"
            id="save-entity"
            data-cy="entityCreateSaveButton"
            :disabled="v$.$invalid || isSaving"
            class="btn btn-primary"
          >
            <FontAwesomeIcon icon="save"></FontAwesomeIcon>&nbsp;<span v-text="t$('entity.action.save')"></span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
<style scoped></style>
