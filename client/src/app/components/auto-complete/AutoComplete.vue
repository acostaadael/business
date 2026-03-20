<script setup lang="ts">
import { ref, computed, watch, withDefaults, defineProps, nextTick, toRefs } from 'vue';

// Exported generic props type so consumers can import and reuse with a concrete item type
export type AutoCompleteProps<T = any> = {
  items?: T[];
  modelValue?: T | null | undefined;
  itemKey?: keyof T | ((item: T) => string | number) | string | ((item: any) => string | number);
  itemLabel?: keyof T | ((item: T) => string) | string | ((item: any) => string);
  placeholder?: string;
  debounce?: number;
  clearable?: boolean;
  // optional custom renderer function for label (fallback to itemLabel)
  renderItemLabel?: (item: T) => string | number | undefined;
  // optional max width (e.g. '400px' or '50%'); if not set the component will use 100% of parent
  maxWidth?: string | null;
};

// Internal alias for the item type used inside this component (default to any)
type Item = any;

// Use typed defineProps + withDefaults to provide runtime defaults while keeping TS types
const props = withDefaults(defineProps<AutoCompleteProps<any>>(), {
  items: () => [] as any[],
  modelValue: undefined,
  itemKey: undefined,
  itemLabel: undefined,
  placeholder: '',
  debounce: 300,
  clearable: true,
  renderItemLabel: undefined,
  maxWidth: undefined,
});

// expose common props as refs so template can reference them directly
const { placeholder, clearable, modelValue, maxWidth } = toRefs(props as any);

// Typed emits: update:modelValue (item|null|undefined), search (query string), select (item), clear ()
const emit = defineEmits<{
  (e: 'update:modelValue', value: any | null | undefined): void;
  (e: 'search', query: string): void;
  (e: 'select', item: any): void;
  (e: 'clear'): void;
}>();

const query = ref('');
const isOpen = ref(false);
const highlighted = ref(-1);
let debounceTimer: number | undefined;
const inputRef = ref<HTMLInputElement | null>(null);

const items = computed(() => props.items || ([] as any[]));

function getKey(item: Item) {
  if (!item) return undefined;
  const keyProp: any = props.itemKey as any;
  if (typeof keyProp === 'function') return keyProp(item);
  if (keyProp != null) return item[keyProp as string];
  // fallback to stringified value
  return JSON.stringify(item);
}

function getLabel(item: Item) {
  if (item == null) return '';
  // first try custom renderItemLabel prop
  if (props.renderItemLabel && typeof props.renderItemLabel === 'function') return String(props.renderItemLabel(item));
  const labelProp: any = props.itemLabel as any;
  if (typeof labelProp === 'function') return labelProp(item);
  if (labelProp != null) return item[labelProp as string];
  // if item is primitive
  if (typeof item === 'string' || typeof item === 'number') return String(item);
  // try common keys
  if ((item as any).label) return (item as any).label;
  if ((item as any).name) return (item as any).name;
  return String(item);
}

// clear() emit undefined to indicate cleared selection (works better with models typed as T | undefined)
function clear() {
  emit('update:modelValue', undefined);
  emit('clear');
  query.value = '';
  isOpen.value = false;
}

// keep input showing label of selected modelValue
watch(
  () => props.modelValue,
  v => {
    if (v == null) {
      query.value = '';
    } else {
      query.value = getLabel(v as any);
    }
  },
);

// when user types, emit search with debounce
function onInput(e: Event) {
  const val = (e.target as HTMLInputElement).value;
  query.value = val;
  // open the dropdown
  isOpen.value = true;
  highlighted.value = -1;

  if (debounceTimer) window.clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(() => {
    emit('search', val);
  }, props.debounce);
}

function select(item: Item) {
  emit('update:modelValue', item);
  emit('select', item);
  query.value = getLabel(item);
  isOpen.value = false;
}

function toggleOpen() {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    // when opening, reset highlight
    highlighted.value = -1;
    // request fresh search with current query
    emit('search', query.value);
  }
}

function onFocus() {
  // open on focus (optional)
  isOpen.value = true;
  emit('search', query.value);
}

function onKeydown(e: KeyboardEvent) {
  if (!isOpen.value) {
    if (e.key === 'ArrowDown') {
      isOpen.value = true;
      emit('search', query.value);
    }
    return;
  }
  const len = items.value.length;
  if (e.key === 'ArrowDown') {
    highlighted.value = Math.min(len - 1, highlighted.value + 1);
    e.preventDefault();
  } else if (e.key === 'ArrowUp') {
    highlighted.value = Math.max(-1, highlighted.value - 1);
    e.preventDefault();
  } else if (e.key === 'Enter') {
    if (highlighted.value >= 0 && highlighted.value < len) select(items.value[highlighted.value] as Item);
    e.preventDefault();
  } else if (e.key === 'Escape') {
    isOpen.value = false;
    e.preventDefault();
  }
}

function onItemMouseEnter(index: number) {
  highlighted.value = index;
}

async function editSelected() {
  // allow editing the selected label: focus input and open dropdown
  isOpen.value = true;
  // reset query so user can type
  query.value = '';
  await nextTick();
  inputRef.value?.focus();
}

// close on outside click - lightweight implementation
if (typeof window !== 'undefined') {
  window.addEventListener('click', ev => {
    // Some browsers support composedPath(), others expose event.path; normalize
    const path = typeof (ev as any).composedPath === 'function' ? (ev as any).composedPath() : (ev as any).path || [ev.target];
    const root = document.querySelector('[data-autocomplete-root]');
    if (!root) return;
    if (path && !path.includes(root)) {
      isOpen.value = false;
    }
  });
}
</script>

<template>
  <div class="auto-complete" data-autocomplete-root :style="{ maxWidth: maxWidth ?? '100%' }">
    <div class="input-wrap">
      <!-- If there's a selected value, show a rendered label slot (editable on click) -->
      <div v-if="props.modelValue" class="ac-selected" @click.stop.prevent="editSelected()">
        <slot name="label" :item="props.modelValue">
          {{ getLabel(props.modelValue) }}
        </slot>
      </div>

      <!-- show input when no modelValue (or when user opens to edit via editSelected it will be visible because modelValue may still exist but we want input editable) -->
      <input
        v-show="!props.modelValue || isOpen"
        ref="inputRef"
        class="ac-input"
        :placeholder="placeholder"
        v-model="query"
        @input="onInput"
        @focus="onFocus"
        @keydown="onKeydown"
        autocomplete="off"
        aria-autocomplete="list"
        :aria-expanded="isOpen"
      />

      <button v-if="clearable && query" type="button" class="ac-clear" @click="clear" aria-label="Clear">×</button>

      <button type="button" class="ac-toggle" @click="toggleOpen" aria-label="Toggle">▾</button>
    </div>

    <ul v-if="isOpen" class="ac-list" role="listbox">
      <li v-if="items.length === 0" class="ac-empty">No hay resultados</li>
      <li
        v-for="(item, idx) in items"
        :key="getKey(item) + '-' + idx"
        :class="['ac-item', { highlighted: idx === highlighted }]"
        @click="select(item)"
        @mouseenter="onItemMouseEnter(idx)"
        role="option"
        :aria-selected="idx === highlighted"
      >
        <slot name="item" :item="item" :index="idx">
          {{ getLabel(item) }}
        </slot>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.auto-complete {
  position: relative;
  width: 100%;
  font-family: inherit;
}
.input-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}
.ac-input {
  flex: 1 1 auto;
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.ac-selected {
  flex: 1 1 auto;
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
}
.ac-toggle,
.ac-clear {
  background: #fff; /* ensure visible background */
  border: 1px solid #ccc; /* Agrega un borde */
  border-radius: 4px; /* Opcional: redondea las esquinas */
  cursor: pointer;
  padding: 4px 8px;
  color: #333;
  box-sizing: border-box;
}
.ac-toggle:hover,
.ac-clear:hover {
  background: #f6f6f6;
}
.ac-list {
  position: absolute;
  left: 0;
  right: 0;
  margin-top: 6px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  max-height: 240px;
  overflow: auto;
  z-index: 50;
  list-style: none;
  padding: 4px 0;
}
.ac-item {
  padding: 8px 12px;
  cursor: pointer;
}
.ac-item.highlighted {
  background: #f0f6ff;
}
.ac-empty {
  padding: 8px 12px;
  color: #666;
}
</style>
