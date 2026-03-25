<script setup lang="ts">
import { computed, inject, onMounted, ref, type Ref, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { debounce } from 'lodash';

import { createAutoComplete } from '@/components/auto-complete';

import ProductService from '@/entities/product/product.service';
import type { IProduct } from '@/shared/model/product.model';

import AreaService from '@/entities/area/area.service';
import type { IArea } from '@/shared/model/area.model';

import { useAlertService } from '@/shared/alert/alert.service';
import { usePeriodStore } from '@/store';
import { SaleType } from '@/shared/model/enumerations/sale-type.model';
import { ExitType } from '@/shared/model/enumerations/exit-type.model';
import SaleService from '@/entities/sale/sale.service';

type SaleItem = {
  product: IProduct;
  count: number;
  unitPrice: number;
  total: number;
};

const { t: t$ } = useI18n();

const alertService = inject('alertService', () => useAlertService(), true);
const productService = inject('productService', () => new ProductService());
const areaService = inject('areaService', () => new AreaService());
const saleService = inject('saleService', () => new SaleService());

const periodStore = usePeriodStore();
const openPeriod = computed(() => periodStore.period);

// --- Form state (vale / ticket)
const day = ref<number>(new Date().getDate());
const area: Ref<IArea | null> = ref(null);
const areas: Ref<IArea[]> = ref([]);

// Tipo de pago
const saleType = ref<SaleType>(SaleType.EFECTIVO);
const transferNumber = ref<string>('');
const saleTypeValues = [SaleType.EFECTIVO, SaleType.TRANSFERENCIA] as const;

// Mantener estado consistente: si no es transferencia, no guardamos número.
watch(saleType, newVal => {
  if (newVal !== SaleType.TRANSFERENCIA) transferNumber.value = '';
});

// Ref para enfocar el input cuando falte el número de transferencia
const transferNumberInput = ref<HTMLInputElement | null>(null);

// --- Buscar productos por nombre o código
const products: Ref<IProduct[]> = ref([]);
const productLoading = ref(false);

const ProductAutoComplete = createAutoComplete<IProduct>();

function productDisplayLabel(p: IProduct) {
  const code = p.code ? `${p.code} - ` : '';
  const um = p.um?.name ? ` (${p.um.name})` : '';
  return `${code}${p.name ?? ''}${um}`;
}

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
}, 300);

const selectedProduct: Ref<IProduct | undefined> = ref();
const count = ref<number>(1);

// Key para forzar recreación del ProductAutoComplete cuando se limpia selección
const productAutoCompleteKey = ref(0);

const saleItems = ref<SaleItem[]>([]);

function addItem() {
  if (!selectedProduct.value) return;
  const qty = Number(count.value || 0);
  if (!Number.isFinite(qty) || qty <= 0) return;

  const p = selectedProduct.value;
  const unitPrice = Number(p.sellingPrice ?? 0);
  const existing = saleItems.value.find(it => it.product.id && it.product.id === p.id);
  if (existing) {
    existing.count += qty;
    existing.total = existing.count * existing.unitPrice;
  } else {
    saleItems.value.push({
      product: p,
      count: qty,
      unitPrice,
      total: qty * unitPrice,
    });
  }

  selectedProduct.value = undefined;
  productAutoCompleteKey.value += 1;
  count.value = 1;
}

function removeItem(index: number) {
  saleItems.value.splice(index, 1);
}

const totalCount = computed(() => saleItems.value.reduce((acc, it) => acc + (it.count || 0), 0));
const totalAmount = computed(() => saleItems.value.reduce((acc, it) => acc + (it.total || 0), 0));

const isSaving = ref(false);

async function confirmSale() {
  if (!openPeriod.value) {
    alertService.showError('No hay un período abierto. Abre un período para registrar ventas.');
    return;
  }
  if (!area.value) {
    alertService.showError('Selecciona un área de venta.');
    return;
  }
  if (!saleItems.value.length) {
    alertService.showError('Agrega al menos un producto al vale.');
    return;
  }
  if (saleType.value === SaleType.TRANSFERENCIA) {
    const tn = transferNumber.value?.trim() ?? '';
    if (!tn) {
      alertService.showError('Ingresa el número de transferencia.');
      await nextTick();
      transferNumberInput.value?.focus();
      return;
    }
  }

  const shipments = saleItems.value.map(it => ({
    type: ExitType.VENTA,
    day: day.value,
    area: area.value ?? undefined,
    product: it.product,
    count: it.count,
  }));

  const payload = {
    sale: {
      day: day.value,
      type: saleType.value,
      transferNumber: saleType.value === SaleType.TRANSFERENCIA ? transferNumber.value.trim() : undefined,
      area: area.value ?? undefined,
    },
    shipments,
  };

  isSaving.value = true;
  try {
    await saleService().register(payload as any);
    alertService.showSuccess('Venta registrada correctamente.');

    // reset vale
    saleItems.value = [];
    selectedProduct.value = undefined;
    count.value = 1;
    saleType.value = SaleType.EFECTIVO;
    transferNumber.value = '';
  } catch (error: any) {
    alertService.showHttpError(error.response);
  } finally {
    isSaving.value = false;
  }
}

// --- Cargar áreas
const areasLoading = ref(false);

async function loadAreas() {
  areasLoading.value = true;
  try {
    const res = await areaService().retrieve({ page: 0, size: 200, sort: 'name,ASC', type: 'VENTA' });
    areas.value = res.data ?? [];
  } catch (error: any) {
    alertService.showHttpError(error.response);
    areas.value = [];
  } finally {
    areasLoading.value = false;
  }
}

onMounted(async () => {
  await loadAreas();
});
</script>

<template>
  <div class="cash-register">
    <h2 class="mb-3">Caja / Punto de venta</h2>

    <div class="cr-card mb-3">
      <div class="cr-grid">
        <div>
          <label class="form-control-label">Período</label>
          <div class="cr-muted">
            <span v-if="openPeriod">Mes: {{ openPeriod.month }}, Año: {{ openPeriod.year }}</span>
            <span v-else>No hay período abierto</span>
          </div>
        </div>

        <div>
          <label class="form-control-label" for="cr-day">Día</label>
          <input id="cr-day" type="number" class="form-control" v-model.number="day" min="1" max="31" />
        </div>

        <div>
          <label class="form-control-label" for="cr-area">Área</label>
          <select id="cr-area" class="form-control" v-model="area" :disabled="areasLoading">
            <option :value="null">-- Selecciona --</option>
            <option v-for="a in areas" :key="a.id" :value="a">
              {{ a.name }}
            </option>
          </select>
        </div>
      </div>

      <b-form-row class="mt-3">
        <b-col cols="6">
          <label class="form-control-label" for="cr-sale-type">Tipo</label>
          <select id="cr-sale-type" class="form-control" v-model="saleType">
            <option v-for="st in saleTypeValues" :key="st" :value="st">
              {{ st }}
            </option>
          </select>
        </b-col>

        <b-col cols="6" v-if="saleType === SaleType.TRANSFERENCIA">
          <label class="form-control-label" for="cr-transfer-number">Nro. transferencia</label>
          <input
            id="cr-transfer-number"
            ref="transferNumberInput"
            type="text"
            class="form-control"
            v-model.trim="transferNumber"
            placeholder="Ej: 123456"
          />
        </b-col>
      </b-form-row>
    </div>

    <div class="cr-card mb-3">
      <h5 class="mb-2">Agregar productos al vale</h5>
      <b-form-row>
        <b-col cols="8">
          <label class="form-control-label">Producto (código o nombre)</label>
          <ProductAutoComplete
            :key="productAutoCompleteKey"
            :items="products"
            v-model="selectedProduct"
            item-key="id"
            item-label="name"
            :loading="productLoading"
            placeholder="Ej: 000123 o Arroz"
            clearable
            @search="searchProducts"
            @select="(item: IProduct) => (selectedProduct = item)"
            @clear="() => (selectedProduct = undefined)"
            :renderItemLabel="productDisplayLabel"
          >
            <template #item="{ item }">
              <div>
                <strong>{{ item.code ? item.code + ' - ' : '' }}{{ item.name }}</strong>
                <span v-if="item.um?.name"> ({{ item.um.name }})</span>
                <span class="cr-muted" v-if="item.sellingPrice != null"> — {{ item.sellingPrice }} $</span>
              </div>
            </template>
          </ProductAutoComplete>
        </b-col>
        <b-col cols="2">
          <label class="form-control-label" for="cr-count">Cant.</label>
          <input id="cr-count" type="number" class="form-control" v-model.number="count" min="1" @keydown.enter.prevent="addItem" />
        </b-col>
        <b-col cols="2" class="d-flex align-items-end">
          <button class="btn btn-primary w-100" type="button" @click="addItem" :disabled="!selectedProduct">Agregar</button>
        </b-col>
      </b-form-row>
    </div>

    <div class="cr-card">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h5 class="mb-0">Vale</h5>
        <div class="cr-muted">Items: {{ saleItems.length }} | Cantidad: {{ totalCount }} | Total: {{ totalAmount }} $</div>
      </div>

      <div v-if="saleItems.length === 0" class="cr-muted">Aún no hay productos en el vale.</div>

      <div v-else class="table-responsive">
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Producto</th>
              <th class="text-right">Cant.</th>
              <th class="text-right">Precio</th>
              <th class="text-right">Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(it, idx) in saleItems" :key="(it.product.id ?? idx) + '-' + idx">
              <td>
                {{ it.product.code ? it.product.code + ' - ' : '' }}{{ it.product.name }}
                <span v-if="it.product.um?.name" class="cr-muted"> ({{ it.product.um.name }})</span>
              </td>
              <td class="text-right">
                <input
                  type="number"
                  class="form-control form-control-sm cr-inline"
                  v-model.number="it.count"
                  min="1"
                  @input="it.total = it.count * it.unitPrice"
                />
              </td>
              <td class="text-right">{{ it.unitPrice }} $</td>
              <td class="text-right">{{ it.total }} $</td>
              <td class="text-right">
                <button class="btn btn-sm btn-outline-danger" type="button" @click="removeItem(idx)">Quitar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="d-flex justify-content-end mt-3">
        <button class="btn btn-success" type="button" @click="confirmSale" :disabled="isSaving || saleItems.length === 0">
          Confirmar venta
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cash-register {
  max-width: 1100px;
  margin: 0 auto;
}

.cr-card {
  background: #f6fbff;
  border: 1px solid #d8ecff;
  border-radius: 10px;
  padding: 16px;
}

.cr-grid {
  display: grid;
  grid-template-columns: 1fr 140px 1fr;
  gap: 12px;
}

.cr-muted {
  color: #5b6b7a;
}

.cr-inline {
  width: 90px;
  display: inline-block;
}

@media (max-width: 900px) {
  .cr-grid {
    grid-template-columns: 1fr;
  }
}
</style>
