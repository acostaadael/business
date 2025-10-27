import { type Ref, defineComponent, inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import AreaService from './area.service';
import { type IArea } from '@/shared/model/area.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'Area',
  setup() {
    const { t: t$ } = useI18n();
    const areaService = inject('areaService', () => new AreaService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const areas: Ref<IArea[]> = ref([]);

    const isFetching = ref(false);

    const clear = () => {};

    const retrieveAreas = async () => {
      isFetching.value = true;
      try {
        const res = await areaService().retrieve();
        areas.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSyncList = () => {
      retrieveAreas();
    };

    onMounted(async () => {
      await retrieveAreas();
    });

    const removeId: Ref<number> = ref(null);
    const removeEntity = ref<any>(null);
    const prepareRemove = (instance: IArea) => {
      removeId.value = instance.id;
      removeEntity.value.show();
    };
    const closeDialog = () => {
      removeEntity.value.hide();
    };
    const removeArea = async () => {
      try {
        await areaService().delete(removeId.value);
        const message = t$('businessApp.area.deleted', { param: removeId.value }).toString();
        alertService.showInfo(message, { variant: 'danger' });
        removeId.value = null;
        retrieveAreas();
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    return {
      areas,
      handleSyncList,
      isFetching,
      retrieveAreas,
      clear,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeArea,
      t$,
    };
  },
});
