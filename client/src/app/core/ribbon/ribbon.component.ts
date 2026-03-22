import { computed, defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from '@/store';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'Ribbon',
  setup() {
    const store = useStore();
    const ribbonEnv = computed(() => store.ribbonOnProfiles);

    // Deshabilitado permanentemente: ocultar la cinta de entorno ("Development", etc.)
    const ribbonEnabled = computed(() => false);

    return {
      ribbonEnv,
      ribbonEnabled,
      t$: useI18n().t,
    };
  },
});
