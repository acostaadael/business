import { computed, type ComputedRef, defineComponent, inject, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

import type LoginService from '@/account/login.service';
import { usePeriodStore } from '@/store';

export default defineComponent({
  compatConfig: { MODE: 3 },
  setup() {
    const loginService = inject<LoginService>('loginService');

    const authenticated = inject<ComputedRef<boolean>>('authenticated');
    const username = inject<ComputedRef<string>>('currentUsername');
    const periodStore = usePeriodStore();
    const ifOpenPeriod = computed(() => periodStore.period);

    const openLogin = () => {
      loginService.openLogin();
    };

    return {
      authenticated,
      ifOpenPeriod,
      username,
      openLogin,
      t$: useI18n().t,
    };
  },
});
