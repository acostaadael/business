import AutoComplete from './AutoComplete.vue';
import type { DefineComponent } from 'vue';
import type { AutoCompleteProps } from './AutoComplete.vue';

// Factory that returns the component typed for a specific item type T
export function createAutoComplete<T>(): DefineComponent<AutoCompleteProps<T>> {
  return AutoComplete as unknown as DefineComponent<AutoCompleteProps<T>>;
}

export default AutoComplete;
