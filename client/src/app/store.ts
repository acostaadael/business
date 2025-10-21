import { useAccountStore as useStore } from '@/shared/config/store/account-store';
export type AccountStore = ReturnType<typeof useStore>;
export { useStore };

import { useTranslationStore } from '@/shared/config/store/translation-store';
export { useTranslationStore };

import { usePeriodStore } from '@/shared/config/store/period-store';
export type PeriodStore = ReturnType<typeof usePeriodStore>;
export { usePeriodStore };
