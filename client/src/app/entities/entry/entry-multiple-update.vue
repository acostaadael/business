<script setup lang="ts">
import { type Ref, inject, reactive, ref, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { debounce } from 'lodash';
import { useVuelidate } from '@vuelidate/core';

import MultiItemSave from '@/components/crud/MultiItemSave.vue';
import { createAutoComplete } from '@/components/auto-complete';

import EntryService from './entry.service';
import { useValidation } from '@/shared/composables';
import { useAlertService } from '@/shared/alert/alert.service';

import AreaService from '@/entities/area/area.service';
import { type IArea } from '@/shared/model/area.model';
import ProductService from '@/entities/product/product.service';
import { type IProduct } from '@/shared/model/product.model';
import { Entry, type IEntry } from '@/shared/model/entry.model';
import { useRouter } from 'vue-router';

const { t: t$ } = useI18n();
const router = useRouter();
const previousState = () => router.go(-1);

const entryService = inject('entryService', () => new EntryService());
const alertService = inject('alertService', () => useAlertService(), true);
const areaService = inject('areaService', () => new AreaService());
const productService = inject('productService', () => new ProductService());

// Columnas coherentes con el formulario/tabla (no hay 'um' en Entry)
const columns = [
  { key: 'product', label: 'businessApp.entry.product', type: 'text' },
  { key: 'count', label: 'businessApp.entry.count', type: 'number' },
  { key: 'day', label: 'businessApp.entry.day', type: 'number' },
  { key: 'area', label: 'businessApp.entry.area', type: 'text' },
];

const entries = ref<IEntry[]>([]);

const areas: Ref<IArea[]> = ref([]);
const products: Ref<IProduct[]> = ref([]);
const productLoading = ref(false);

const isSaving = ref(false);

const initRelationships = () => {
  areaService()
    .retrieve()
    .then(res => {
      areas.value = res.data;
    })
    .catch((error: any) => alertService.showHttpError(error.response));

  productService()
    .retrieve()
    .then(res => {
      products.value = res.data;
    })
    .catch((error: any) => alertService.showHttpError(error.response));
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

// AutoComplete tipado igual que en entry-update
const ProductAutoComplete = createAutoComplete<IProduct>();

function getItemName(item: IProduct) {
  return item?.name ?? '';
}
function getItemUm(item: IProduct) {
  return item.um?.name ?? '';
}
function getItemLabel(item: IProduct) {
  return `${getItemName(item)} (${getItemUm(item)})`;
}

// Validaciones (idénticas a entry-update)
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

// 1) Validación del formulario (newItem) para mostrar errores como en entry-update
const formModel = reactive(new Entry()) as IEntry;
const vForm$ = useVuelidate(validationRules, formModel as any);

// Key para forzar recreación del ProductAutoComplete cuando se resetea el formulario
const productAutoCompleteKey = ref(0);

const resetForm = async () => {
  // Reset explícito para evitar que queden referencias/reacividad antigua
  (formModel as any).product = undefined;
  (formModel as any).count = null;
  // Reiniciar el día al valor inicial deseado al agregar un nuevo ítem
  // Forzar recreación del autocomplete para limpiar su estado interno (query/selected label)
  productAutoCompleteKey.value += 1;

  await nextTick();
  // Asegurar que sigue limpio después del tick
  vForm$.value.$reset();
};

// Helpers puros para validar items existentes (sin hooks/lifecycle)
function validateItemSync(item: IEntry) {
  const v$ = useVuelidate(validationRules, item as any, { $autoDirty: true });
  v$.value.$touch();
  return v$;
}

const saveEntries = async (updatedEntries: IEntry[]) => {
  // Validar todos antes de guardar
  const validationsList = updatedEntries.map(it => validateItemSync(it));
  const hasInvalid = validationsList.some(v => v.value.$invalid);
  if (hasInvalid) return;

  isSaving.value = true;
  try {
    // Por ahora: crear todas en paralelo (si necesitas update vs create, lo ajustamos)
    await entryService().createMany(updatedEntries);
    alertService.showSuccess(t$('businessApp.entry.created').toString());
    previousState();
  } catch (error: any) {
    alertService.showHttpError(error.response);
  } finally {
    isSaving.value = false;
  }
};

const addEntryFromForm = async () => {
  vForm$.value.$touch();
  if (vForm$.value.$invalid) return;
  entries.value.push({ ...(formModel as any) });
  await resetForm();
};
</script>

<template>
  <div>
    <MultiItemSave
      :items="entries"
      :onSave="saveEntries"
      :createItem="() => reactive(new Entry())"
      maxWidth="80%"
      :notFound="t$('businessApp.entry.home.notFound')"
      :stickyFields="['area', 'day']"
      :addOnEnter="true"
    >
      <template #form>
        <h2
          id="businessApp.entry.multiUpdate.title"
          data-cy="EntryCreateUpdateHeading"
          v-text="t$('businessApp.entry.multiUpdate.title')"
        ></h2>
        <b-form-row>
          <b-col>
            <label class="form-control-label" v-text="t$('businessApp.entry.area')" for="entry-area"></label>
            <select class="form-control" id="entry-area" data-cy="area" name="area" v-model="formModel.area" required>
              <option v-if="!formModel.area" :value="null" selected></option>
              <option
                :value="formModel.area && areaOption.id === formModel.area.id ? formModel.area : areaOption"
                v-for="areaOption in areas"
                :key="areaOption.id"
              >
                {{ areaOption.name }}
              </option>
            </select>
            <div v-if="vForm$.area.$anyDirty && vForm$.area.$invalid">
              <small class="form-text text-danger" v-for="error of vForm$.area.$errors" :key="error.$uid">{{ error.$message }}</small>
            </div>
          </b-col>
          <b-col>
            <label class="form-control-label" v-text="t$('businessApp.entry.day')" for="entry-day"></label>
            <input
              type="number"
              class="form-control"
              name="day"
              id="entry-day"
              data-cy="day"
              :class="{ valid: !vForm$.day.$invalid, invalid: vForm$.day.$invalid }"
              v-model.number="vForm$.day.$model"
              required
            />
            <div v-if="vForm$.day.$anyDirty && vForm$.day.$invalid">
              <small class="form-text text-danger" v-for="error of vForm$.day.$errors" :key="error.$uid">{{ error.$message }}</small>
            </div>
          </b-col>
        </b-form-row>
        <b-form-row>
          <b-col>
            <label class="form-control-label" v-text="t$('businessApp.entry.product')" for="product"></label>
            <ProductAutoComplete
              :key="productAutoCompleteKey"
              :items="products"
              v-model="formModel.product"
              item-key="id"
              item-label="name"
              :loading="productLoading"
              placeholder="Selecciona un producto"
              clearable
              @select="(item: IProduct) => (formModel.product = item)"
              @search="searchProducts"
              @clear="() => (formModel.product = undefined)"
              :renderItemLabel="getItemLabel"
            >
              <template #item="{ item }">
                <div>
                  <strong>{{ getItemName(item) }}</strong> ({{ getItemUm(item) }})
                </div>
              </template>
            </ProductAutoComplete>

            <div v-if="vForm$.product.$anyDirty && vForm$.product.$invalid">
              <small class="form-text text-danger" v-for="error of vForm$.product.$errors" :key="error.$uid">{{ error.$message }}</small>
            </div>
          </b-col>
          <b-col>
            <label class="form-control-label" v-text="t$('businessApp.entry.count')" for="entry-count"></label>
            <input
              type="number"
              class="form-control"
              name="count"
              id="entry-count"
              data-cy="count"
              :class="{ valid: !vForm$.count.$invalid, invalid: vForm$.count.$invalid }"
              v-model.number="vForm$.count.$model"
              @keydown.enter.prevent="addEntryFromForm"
              required
            />
            <div v-if="vForm$.count.$anyDirty && vForm$.count.$invalid">
              <small class="form-text text-danger" v-for="error of vForm$.count.$errors" :key="error.$uid">{{ error.$message }}</small>
            </div>
          </b-col>
        </b-form-row>
      </template>

      <template #table-title>
        <h5 class="mb-2" v-text="t$('businessApp.entry.multiUpdate.entryItem')"></h5>
      </template>

      <template #table-headers>
        <th v-for="column in columns" :key="column.key">{{ t$(column.label) }}</th>
      </template>

      <template #table-rows="{ item }">
        <td v-for="column in columns" :key="column.key">
          <span v-if="column.key === 'product'">{{ item.product?.name }}</span>
          <span v-else-if="column.key === 'area'">{{ item.area?.name }}</span>
          <span v-else-if="column.key === 'count'">{{ `${item.count} ${item.product?.um?.name}` }}</span>
          <span v-else>{{ item[column.key] }}</span>
        </td>
      </template>
    </MultiItemSave>
  </div>
</template>

<style scoped>
/* Estilos específicos opcionales para este formulario */
</style>
