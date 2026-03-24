<script setup lang="ts">
import { computed, inject, reactive, ref, nextTick, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useVuelidate } from '@vuelidate/core';
import { useRouter } from 'vue-router';

import MultiItemSave from '@/components/crud/MultiItemSave.vue';

import ProductShipmentService from './product-shipment.service';
import { useValidation } from '@/shared/composables';
import { useAlertService } from '@/shared/alert/alert.service';

import ProductService from '@/entities/product/product.service';
import type { IProduct } from '@/shared/model/product.model';

import AreaService from '@/entities/area/area.service';
import type { IArea } from '@/shared/model/area.model';

import { ExitType } from '@/shared/model/enumerations/exit-type.model';
import { ProductShipment, type IProductShipment } from '@/shared/model/product-shipment.model';

import { createAutoComplete } from '@/components/auto-complete';

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

import { usePeriodStore } from '@/store';
import { debounce } from 'lodash';

type AutoItem = any;

const { t: t$ } = useI18n();
const router = useRouter();
const previousState = () => router.go(-1);

const productShipmentService = inject('productShipmentService', () => new ProductShipmentService());
const alertService = inject('alertService', () => useAlertService(), true);
const areaService = inject('areaService', () => new AreaService());
const productService = inject('productService', () => new ProductService());

const periodStore = usePeriodStore();
const openPeriod = computed(() => periodStore.period);

const productShipments = ref<IProductShipment[]>([]);

const areas: Ref<IArea[]> = ref([]);
const products: Ref<IProduct[]> = ref([]);
const productLoading = ref(false);

const exitTypeValues: Ref<string[]> = ref(Object.keys(ExitType).filter(item => item !== 'VENTA'));

const isSaving = ref(false);

// Validaciones (mismas que product-shipment-update)
const validations = useValidation();
const validationRules = {
  day: {
    required: validations.required(t$('entity.validation.required').toString()),
    integer: validations.integer(t$('entity.validation.number').toString()),
  },
  count: {
    required: validations.required(t$('entity.validation.required').toString()),
  },
  type: {
    required: validations.required(t$('entity.validation.required').toString()),
  },
  product: {
    required: validations.required(t$('entity.validation.required').toString()),
  },
  area: {
    required: validations.required(t$('entity.validation.required').toString()),
  },
  period: {},
};

// Modelo del formulario
const formModel = reactive(new ProductShipment()) as IProductShipment;
const vForm$ = useVuelidate(validationRules as any, formModel as any);

// Key para forzar recreación del ProductAutoComplete cuando se resetea el formulario
const productAutoCompleteKey = ref(0);

const resetForm = async () => {
  // limpiamos el producto y count, los sticky fields los mantiene MultiItemSave
  (formModel as any).product = undefined;
  (formModel as any).count = null;

  productAutoCompleteKey.value += 1;

  await nextTick();
  vForm$.value.$reset();
};

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

const handleSelect = (item: IProduct) => {
  formModel.product = item as any;
};

const loadAreas = async () => {
  try {
    // Si no hay tipo seleccionado, trae todas
    if (!formModel.type) {
      const res = await areaService().retrieve();
      areas.value = res.data;
      return;
    }

    if (formModel.type === ExitType.VENTA) {
      const res = await areaService().retrieve(formModel.type);
      areas.value = res.data;
    } else {
      const res = await areaService().retrieve();
      areas.value = res.data;
    }
  } catch (err: any) {
    // no rompemos el form
    areas.value = [];
  }
};

initRelationships();

const addProductShipmentFromForm = async () => {
  vForm$.value.$touch();
  if (vForm$.value.$invalid) return;

  // Asignar periodo abierto si existe
  if (openPeriod.value) {
    (formModel as any).period = openPeriod.value;
  }

  productShipments.value.push({ ...(formModel as any) });
  await resetForm();
};

// Guardado igual al patrón de entry-multiple-update
const saveProductShipments = async (updatedItems: IProductShipment[]) => {
  // validar todos
  const invalid = updatedItems.some(item => {
    const v$ = useVuelidate(validationRules as any, item as any, { $autoDirty: true });
    v$.value.$touch();
    return v$.value.$invalid;
  });
  if (invalid) return;

  isSaving.value = true;
  try {
    // createMany es opcional en la interfaz, pero el service no lo implementa.
    // Usamos create en batch manual para mantener compat.
    const res = await productShipmentService().createMany(updatedItems);

    // El servidor envía los ids creados en el header X-<app>-params
    /* const paramsHeader = res?.headers?.['X-Business-Params'] ?? '';
    const createdIds = (paramsHeader ?? '').toString();*/
    alertService.showSuccess(t$('businessApp.productShipment.multiUpdate.createdMany'));
    previousState();
  } catch (error: any) {
    alertService.showHttpError(error.response);
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <div>
    <MultiItemSave
      :items="productShipments"
      :onSave="saveProductShipments"
      :createItem="() => reactive(new ProductShipment())"
      maxWidth="80%"
      :notFound="t$('businessApp.productShipment.home.notFound')"
      :stickyFields="['type', 'area', 'day']"
      :addOnEnter="true"
    >
      <template #form>
        <h2 id="businessApp.productShipment.multiUpdate.title" data-cy="ProductShipmentMultiUpdateHeading">
          {{ t$('businessApp.productShipment.multiUpdate.title') }}
        </h2>

        <b-form-row>
          <b-col cols="4">
            <div class="form-group">
              <label class="form-control-label" v-text="t$('businessApp.productShipment.type')" for="product-shipment-type"></label>
              <select
                class="form-control"
                name="type"
                :class="{ valid: !vForm$.type.$invalid, invalid: vForm$.type.$invalid }"
                v-model="vForm$.type.$model"
                id="product-shipment-type"
                data-cy="type"
                @change="loadAreas"
                required
              >
                <option
                  v-for="exitType in exitTypeValues"
                  :key="exitType"
                  :value="exitType"
                  :label="t$('businessApp.ExitType.' + exitType)"
                >
                  {{ exitType }}
                </option>
              </select>
              <div v-if="vForm$.type.$anyDirty && vForm$.type.$invalid">
                <small class="form-text text-danger" v-for="error of vForm$.type.$errors" :key="error.$uid">{{ error.$message }}</small>
              </div>
            </div>
          </b-col>

          <b-col cols="4">
            <div class="form-group">
              <label class="form-control-label" v-text="t$('businessApp.productShipment.area')" for="productShipment-area"></label>
              <select
                class="form-control"
                id="productShipment-area"
                data-cy="area"
                name="area"
                v-model="formModel.area"
                :disabled="!formModel.type"
                required
              >
                <option v-if="!formModel.area" :value="null" selected></option>
                <option
                  :value="formModel.area && areaOption.id === formModel.area.id ? formModel.area : areaOption"
                  v-for="areaOption in areas"
                  :key="areaOption.id"
                >
                  {{ `${areaOption.name} (${areaOption.type})` }}
                </option>
              </select>
            </div>
            <div v-if="vForm$.area.$anyDirty && vForm$.area.$invalid">
              <small class="form-text text-danger" v-for="error of vForm$.area.$errors" :key="error.$uid">{{ error.$message }}</small>
            </div>
          </b-col>
          <b-col cols="4">
            <div class="form-group">
              <label class="form-control-label" v-text="t$('businessApp.productShipment.day')" for="product-shipment-day"></label>
              <input
                type="number"
                class="form-control"
                name="day"
                id="product-shipment-day"
                data-cy="day"
                :class="{ valid: !vForm$.day.$invalid, invalid: vForm$.day.$invalid }"
                v-model.number="vForm$.day.$model"
                required
              />
              <div v-if="vForm$.day.$anyDirty && vForm$.day.$invalid">
                <small class="form-text text-danger" v-for="error of vForm$.day.$errors" :key="error.$uid">{{ error.$message }}</small>
              </div>
            </div>
          </b-col>
        </b-form-row>
        <b-form-row>
          <b-col>
            <label class="form-control-label" v-text="t$('businessApp.productShipment.product')" for="product"></label>
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
            <div class="form-group">
              <label class="form-control-label" v-text="t$('businessApp.productShipment.count')" for="product-shipment-count"></label>
              <input
                type="number"
                class="form-control"
                name="count"
                id="product-shipment-count"
                data-cy="count"
                :class="{ valid: !vForm$.count.$invalid, invalid: vForm$.count.$invalid }"
                v-model.number="vForm$.count.$model"
                @keydown.enter.prevent="addProductShipmentFromForm"
                required
              />
              <div v-if="vForm$.count.$anyDirty && vForm$.count.$invalid">
                <small class="form-text text-danger" v-for="error of vForm$.count.$errors" :key="error.$uid">{{ error.$message }}</small>
              </div>
            </div>
          </b-col>
        </b-form-row>
      </template>

      <template #table-title>
        <h5 class="mb-2" v-text="t$('businessApp.productShipment.multiUpdate.entryItem')"></h5>
      </template>

      <template #table-headers>
        <th>{{ t$('businessApp.productShipment.product') }}</th>
        <th>{{ t$('businessApp.productShipment.count') }}</th>
        <th>{{ t$('businessApp.productShipment.day') }}</th>
        <th>{{ t$('businessApp.productShipment.type') }}</th>
        <th>{{ t$('businessApp.productShipment.area') }}</th>
      </template>

      <template #table-rows="{ item }">
        <td>{{ item.product?.name ?? '' }}</td>
        <td>{{ `${item.count} ${item.product?.um?.name}` }}</td>
        <td>{{ item.day }}</td>
        <td>{{ t$('businessApp.ExitType.' + item.type) }}</td>
        <td>{{ item.area?.name ?? '' }}</td>
      </template>
    </MultiItemSave>
  </div>
</template>
