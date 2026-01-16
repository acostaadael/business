import { type Ref, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import InventoryMovementService from './inventory-movement.service';
import { type IInventoryMovement } from '@/shared/model/inventory-movement.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'InventoryMovementDetails',
  setup() {
    const inventoryMovementService = inject('inventoryMovementService', () => new InventoryMovementService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);
    const inventoryMovement: Ref<IInventoryMovement> = ref({});

    const retrieveInventoryMovement = async inventoryMovementId => {
      try {
        const res = await inventoryMovementService().find(inventoryMovementId);
        inventoryMovement.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.inventoryMovementId) {
      retrieveInventoryMovement(route.params.inventoryMovementId);
    }

    return {
      alertService,
      inventoryMovement,

      previousState,
      t$: useI18n().t,
    };
  },
});
