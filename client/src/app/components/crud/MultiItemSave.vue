<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

type StickyFields<T> = Array<keyof T> | ((item: T) => Partial<T>);

interface MultiItemSaveProps<T> {
  items: T[];
  notFound: string;
  /**
   * Ancho máximo del bloque (form + tabla). Ej: '900px' o '100%'.
   * Si no se define, ocupa el 100% del contenedor padre.
   */
  maxWidth?: string;
  onSave: (items: T[]) => void;
  createItem: () => T;

  /**
   * Campos del formulario que deben mantenerse (no reiniciarse) luego de presionar Add.
   *
   * Opciones:
   *  - Array de keys: ['day', 'periodId']
   *  - Función que devuelve un objeto parcial con valores a preservar
   */
  stickyFields?: StickyFields<T>;

  /**
   * Si es true, no se bloquea Enter a nivel del form (útil si el formulario
   * quiere capturar Enter en un input específico para hacer Add).
   *
   * Default: false (Enter no hace submit / no hace Add).
   */
  addOnEnter?: boolean;

  /** Título opcional mostrado encima de la tabla (si hay items). */
  tableTitle?: string;
}

const props = defineProps<MultiItemSaveProps<any>>();

const { t: t$ } = useI18n();
const router = useRouter();
const previousState = () => router.go(-1);

// Mantener un modelo de formulario reactivo (objeto), no un Ref expuesto al padre
const newItem = reactive(props.createItem());

const hasItems = computed(() => (props.items?.length ?? 0) > 0);

const pickStickyValues = (currentItem: any) => {
  const sticky = props.stickyFields;
  if (!sticky) return {};

  if (typeof sticky === 'function') {
    return sticky(currentItem) ?? {};
  }

  const out: any = {};
  for (const key of sticky) {
    out[key as any] = currentItem?.[key as any];
  }
  return out;
};

const resetForm = () => {
  const stickyValues = pickStickyValues(newItem as any);
  Object.assign(newItem, props.createItem(), stickyValues);
};

const addItem = () => {
  props.items.push({ ...(newItem as any) });
  resetForm();
};

const removeItem = (index: number) => {
  props.items.splice(index, 1);
};

const saveItems = () => {
  if (!hasItems.value) return;
  props.onSave(props.items);
};
</script>

<template>
  <div class="multi-item-save__container" :style="{ maxWidth: props.maxWidth ?? '100%' }">
    <form class="multi-item-save__form" @submit.prevent v-on:keydown.enter.prevent="props.addOnEnter ? undefined : true">
      <div class="multi-item-save__form-col">
        <div class="multi-item-save__form-body">
          <slot name="form" :newItem="newItem" :addItem="addItem" />
        </div>

        <div class="multi-item-save__form-actions">
          <slot name="form-actions" :addItem="addItem" :newItem="newItem" />
        </div>
      </div>
    </form>

    <div class="mt-3" v-if="hasItems">
      <div class="multi-item-save__table-title" v-if="props.tableTitle || $slots['table-title']">
        <slot name="table-title">
          <h5 class="mb-2">{{ props.tableTitle }}</h5>
        </slot>
      </div>

      <div class="table-responsive">
        <table class="table table-bordered">
          <thead>
            <tr>
              <slot name="table-headers" />
              <th>{{ t$('entity.action.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in props.items" :key="index">
              <slot name="table-rows" :item="item" />
              <td>
                <button type="button" class="btn btn-danger btn-sm" @click.prevent="removeItem(index)">
                  {{ t$('entity.action.delete') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <p v-else class="text-muted mt-3 text-center multi-item-save__empty">{{ props.notFound }}</p>

    <div class="multi-item-save__footer">
      <button type="button" id="cancel-save" data-cy="entityCreateCancelButton" class="btn btn-secondary" @click="previousState()">
        <FontAwesomeIcon icon="ban"></FontAwesomeIcon>&nbsp;<span v-text="t$('entity.action.cancel')"></span>
      </button>
      <button type="button" class="btn btn-primary" @click="saveItems" :disabled="!hasItems">
        <FontAwesomeIcon icon="save"></FontAwesomeIcon>&nbsp;<span v-text="t$('entity.action.save')"></span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.multi-item-save__container {
  width: 100%;
  margin: 0 auto; /* centra el bloque para que form y tabla coincidan */
}

.multi-item-save__form {
  width: 100%;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  border: 1px solid #ddd;
  padding: 8px;
  vertical-align: middle;
  white-space: nowrap; /* evita que las columnas se rompan en móvil */
}

.table th {
  background-color: #f2f2f2;
  text-align: left;
}

.multi-item-save__form-col {
  display: flex;
  flex-direction: column;
  gap: 0.75rem; /* separación entre el form y las acciones */
}

.multi-item-save__form-body {
  flex: 1;
  min-width: 0;
}

.multi-item-save__form-actions {
  display: flex;
  justify-content: center; /* botón Add centrado */
  margin-top: 0.5rem; /* separación respecto a los campos */
}

.multi-item-save__footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8.5rem;
  margin-top: 1rem;
}

.multi-item-save__table-title {
  width: 100%;
}
</style>
