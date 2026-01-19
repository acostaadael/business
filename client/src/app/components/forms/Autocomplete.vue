<template>
  <div class="autocomplete">
    <div class="input-wrapper">
      <input
        ref="inputRef"
        v-model="searchTerm"
        :placeholder="placeholder"
        @input="handleInput"
        @keydown="handleKeyDown"
        @focus="handleFocus"
        @blur="handleBlur"
        :disabled="disabled"
        class="autocomplete-input"
      />
      <div v-if="loading" class="loading-indicator">
        <span class="spinner"></span>
      </div>
      <button v-if="searchTerm && !disabled" @click="clearSearch" class="clear-btn" type="button">✕</button>
    </div>

    <!-- Suggestions Dropdown -->
    <div v-if="showSuggestions && filteredItems.length > 0" class="suggestions-dropdown" ref="dropdownRef">
      <ul class="suggestions-list">
        <li
          v-for="(item, index) in filteredItems"
          :key="getItemKey(item)"
          @click="selectItem(item)"
          @mouseenter="hoveredIndex = index"
          :class="[
            'suggestion-item',
            {
              hovered: hoveredIndex === index,
              selected: isItemSelected(item),
            },
          ]"
        >
          <slot name="item" :item="item" :search-term="searchTerm">
            <span v-html="highlightMatch(item)"></span>
          </slot>
          <span v-if="showItemDescription(item)" class="item-description">
            {{ getItemDescription(item) }}
          </span>
        </li>
      </ul>
    </div>

    <!-- Selected Items (for multi-select) -->
    <div v-if="multiple && selectedItems.length > 0" class="selected-tags">
      <span v-for="item in selectedItems" :key="getItemKey(item)" class="selected-tag">
        {{ getItemValue(item) }}
        <button @click="removeItem(item)" class="remove-tag" type="button">✕</button>
      </span>
    </div>

    <!-- No Results -->
    <div v-if="showSuggestions && filteredItems.length === 0 && searchTerm" class="no-results">
      {{ noResultsText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

// TypeScript Interfaces
export interface AutocompleteItem {
  [key: string]: any;
  id?: string | number;
  value: string;
  description?: string;
  disabled?: boolean;
}

export interface AutocompleteProps {
  modelValue?: AutocompleteItem | AutocompleteItem[] | string;
  items?: AutocompleteItem[];
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  multiple?: boolean;
  minChars?: number;
  debounce?: number;
  filterMethod?: (item: AutocompleteItem, searchTerm: string) => boolean;
  itemValue?: string;
  itemText?: string;
  itemDescription?: string;
  itemKey?: string;
  returnObject?: boolean;
  noResultsText?: string;
}

// Props with defaults
const props = withDefaults(defineProps<AutocompleteProps>(), {
  items: () => [],
  placeholder: 'Escribe para buscar...',
  disabled: false,
  loading: false,
  multiple: false,
  minChars: 1,
  debounce: 300,
  itemValue: 'value',
  itemText: 'value',
  itemDescription: 'description',
  itemKey: 'id',
  returnObject: true,
  noResultsText: 'No se encontraron resultados',
});

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: AutocompleteItem | AutocompleteItem[] | string];
  search: [searchTerm: string];
  select: [item: AutocompleteItem];
  clear: [];
  focus: [];
  blur: [];
}>();

// Refs
const searchTerm = ref('');
const showSuggestions = ref(false);
const hoveredIndex = ref(-1);
const selectedItems = ref<AutocompleteItem[]>([]);
const inputRef = ref<HTMLInputElement | null>(null);
const dropdownRef = ref<HTMLElement | null>(null);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

// Computed
const filteredItems = computed(() => {
  if (!searchTerm.value || searchTerm.value.length < props.minChars) {
    return [];
  }

  if (props.filterMethod) {
    return props.items.filter(item => props.filterMethod!(item, searchTerm.value));
  }

  const term = searchTerm.value.toLowerCase();
  return props.items.filter(item => {
    const value = getItemValue(item).toLowerCase();
    const text = getItemText(item).toLowerCase();
    return value.includes(term) || text.includes(term);
  });
});

// Methods
const getItemValue = (item: AutocompleteItem): string => {
  return item[props.itemValue] || item.value || String(item);
};

const getItemText = (item: AutocompleteItem): string => {
  return item[props.itemText] || item.value || String(item);
};

const getItemDescription = (item: AutocompleteItem): string => {
  return item[props.itemDescription] || '';
};

const getItemKey = (item: AutocompleteItem): string | number => {
  return item[props.itemKey] || getItemValue(item);
};

const showItemDescription = (item: AutocompleteItem): boolean => {
  return !!getItemDescription(item);
};

const isItemSelected = (item: AutocompleteItem): boolean => {
  if (props.multiple) {
    return selectedItems.value.some(selected => getItemKey(selected) === getItemKey(item));
  }
  return false;
};

const highlightMatch = (item: AutocompleteItem): string => {
  const text = getItemText(item);
  const term = searchTerm.value;
  if (!term) return text;

  const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

const handleInput = () => {
  if (debounceTimer) clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    showSuggestions.value = searchTerm.value.length >= props.minChars;
    emit('search', searchTerm.value);
  }, props.debounce);
};

const handleKeyDown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      hoveredIndex.value = Math.min(hoveredIndex.value + 1, filteredItems.value.length - 1);
      break;

    case 'ArrowUp':
      event.preventDefault();
      hoveredIndex.value = Math.max(hoveredIndex.value - 1, -1);
      break;

    case 'Enter':
      event.preventDefault();
      if (hoveredIndex.value >= 0) {
        selectItem(filteredItems.value[hoveredIndex.value]);
      }
      break;

    case 'Escape':
      showSuggestions.value = false;
      break;

    case 'Tab':
      showSuggestions.value = false;
      break;
  }
};

const selectItem = (item: AutocompleteItem) => {
  if (item.disabled) return;

  if (props.multiple) {
    if (!selectedItems.value.some(selected => getItemKey(selected) === getItemKey(item))) {
      selectedItems.value.push(item);
      updateModelValue();
    }
    searchTerm.value = '';
  } else {
    if (props.returnObject) {
      emit('update:modelValue', item);
    } else {
      emit('update:modelValue', getItemValue(item));
    }
    searchTerm.value = getItemText(item);
    emit('select', item);
  }

  showSuggestions.value = false;
  hoveredIndex.value = -1;
  inputRef.value?.focus();
};

const removeItem = (item: AutocompleteItem) => {
  selectedItems.value = selectedItems.value.filter(selected => getItemKey(selected) !== getItemKey(item));
  updateModelValue();
};

const clearSearch = () => {
  searchTerm.value = '';
  showSuggestions.value = false;
  if (!props.multiple) {
    emit('update:modelValue', '');
  }
  emit('clear');
  inputRef.value?.focus();
};

const updateModelValue = () => {
  if (props.multiple) {
    if (props.returnObject) {
      emit('update:modelValue', selectedItems.value);
    } else {
      emit('update:modelValue', selectedItems.value.map(getItemValue));
    }
  }
};

const handleFocus = () => {
  if (searchTerm.value.length >= props.minChars) {
    showSuggestions.value = true;
  }
  emit('focus');
};

const handleBlur = () => {
  // Delay hiding to allow for click events
  setTimeout(() => {
    showSuggestions.value = false;
  }, 200);
  emit('blur');
};

const handleClickOutside = (event: MouseEvent) => {
  if (!dropdownRef.value?.contains(event.target as Node) && !inputRef.value?.contains(event.target as Node)) {
    showSuggestions.value = false;
  }
};

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside);

  // Initialize from modelValue
  if (props.modelValue) {
    if (props.multiple && Array.isArray(props.modelValue)) {
      selectedItems.value = props.modelValue;
    } else if (!props.multiple && props.modelValue) {
      const item = props.modelValue as AutocompleteItem;
      searchTerm.value = getItemText(item);
    }
  }
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  if (debounceTimer) clearTimeout(debounceTimer);
});

// Watch for items changes to reset hover index
watch(filteredItems, () => {
  hoveredIndex.value = -1;
});
</script>

<style scoped>
.autocomplete {
  position: relative;
  width: 100%;
  max-width: 400px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.autocomplete-input {
  width: 100%;
  padding: 10px 40px 10px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s ease;
  outline: none;
}

.autocomplete-input:focus {
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.autocomplete-input:disabled {
  background-color: #f7fafc;
  cursor: not-allowed;
  opacity: 0.7;
}

.loading-indicator {
  position: absolute;
  right: 35px;
  display: flex;
  align-items: center;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e2e8f0;
  border-top-color: #4299e1;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.clear-btn {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  font-size: 18px;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.clear-btn:hover {
  color: #718096;
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 250px;
  overflow-y: auto;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  margin-top: 4px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 1000;
}

.suggestions-list {
  list-style: none;
  padding: 4px 0;
  margin: 0;
}

.suggestion-item {
  padding: 10px 12px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.15s ease;
  font-size: 14px;
}

.suggestion-item:hover {
  background-color: #edf2f7;
}

.suggestion-item.hovered {
  background-color: #e2e8f0;
}

.suggestion-item.selected {
  background-color: #bee3f8;
  color: #2c5282;
}

.suggestion-item:not(:last-child) {
  border-bottom: 1px solid #f7fafc;
}

.item-description {
  font-size: 12px;
  color: #718096;
  margin-left: 8px;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.selected-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background-color: #4299e1;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.remove-tag {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 12px;
  padding: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.remove-tag:hover {
  opacity: 1;
}

.no-results {
  padding: 12px;
  color: #718096;
  font-size: 14px;
  text-align: center;
}
</style>
