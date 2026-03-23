import { type Ref, computed, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import type LoginService from '@/account/login.service';
import type AccountService from '@/account/account.service';
import languages from '@/shared/config/languages';
import EntitiesMenu from '@/entities/entities-menu.vue';
import EconomyMenu from '@/entities/economy-menu.vue';
import ReportMenu from '@/entities/report-menu.vue';

import { useStore } from '@/store';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'JhiNavbar',
  components: {
    'entities-menu': EntitiesMenu,
    'economy-menu': EconomyMenu,
    'report-menu': ReportMenu,
  },
  setup() {
    const loginService = inject<LoginService>('loginService');
    const accountService = inject<AccountService>('accountService');
    const currentLanguage = inject('currentLanguage', () => computed(() => navigator.language ?? 'es'), true);
    const changeLanguage = inject<(lang: string) => Promise<void>>('changeLanguage');

    const isActiveLanguage = (key: string) => {
      return key === currentLanguage.value;
    };

    const router = useRouter();
    const store = useStore();

    // Sidebar izquierda
    const leftMenuOpen = ref(false);
    const sidebarWidth = computed(() => '320px');

    const openLeftMenu = () => {
      leftMenuOpen.value = true;
    };

    const toggleLeftMenu = () => {
      leftMenuOpen.value = !leftMenuOpen.value;
    };

    const closeLeftMenu = () => {
      leftMenuOpen.value = false;
    };

    const onSidebarHidden = () => {
      leftMenuOpen.value = false;
    };

    // Cierra el menú en cualquier navegación
    router.afterEach(() => {
      leftMenuOpen.value = false;
    });

    const version = `v${APP_VERSION}`;
    const hasAnyAuthorityValues: Ref<any> = ref({});

    const openAPIEnabled = computed(() => store.activeProfiles.indexOf('api-docs') > -1);
    const inProduction = computed(() => store.activeProfiles.indexOf('prod') > -1);
    const authenticated = computed(() => store.authenticated);

    const username = computed(() => store.account?.login ?? '');

    const openLogin = () => {
      loginService?.openLogin();
    };

    const subIsActive = (input: string | string[]) => {
      const paths = Array.isArray(input) ? input : [input];
      return paths.some(path => {
        return router.currentRoute.value.path.indexOf(path) === 0; // current path starts with this path string
      });
    };

    const logout = async () => {
      localStorage.removeItem('jhi-authenticationToken');
      sessionStorage.removeItem('jhi-authenticationToken');
      store.logout();
      if (router.currentRoute.value.path !== '/') {
        router.push('/');
      }
    };

    return {
      logout,
      subIsActive,
      accountService,
      openLogin,
      changeLanguage: changeLanguage ?? (async () => undefined),
      languages: languages(),
      isActiveLanguage,
      version,
      currentLanguage,
      hasAnyAuthorityValues,
      openAPIEnabled,
      inProduction,
      authenticated,
      username,
      t$: useI18n().t,
      leftMenuOpen,
      sidebarWidth,
      openLeftMenu,
      toggleLeftMenu,
      closeLeftMenu,
      onSidebarHidden,
    };
  },
  methods: {
    hasAnyAuthority(authorities: any): boolean {
      this.accountService?.hasAnyAuthorityAndCheckAuth(authorities).then(value => {
        if (this.hasAnyAuthorityValues[authorities] !== value) {
          this.hasAnyAuthorityValues = { ...this.hasAnyAuthorityValues, [authorities]: value };
        }
      });
      return this.hasAnyAuthorityValues[authorities] ?? false;
    },
  },
});
