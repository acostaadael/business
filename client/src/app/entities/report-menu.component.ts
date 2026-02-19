import { defineComponent, inject } from 'vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ReportMenu',
  setup() {
    const i18n = useI18n();

    return {
      t$: i18n.t,
    };
  },
});
