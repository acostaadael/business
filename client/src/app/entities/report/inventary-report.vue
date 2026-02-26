<template>
  <ReportTable title="Listado de inventarios" :data="inventaries" :columns="invetariesColumns" filename="reporte-inventario" />
</template>

<script setup lang="ts">
import ReportTable from '@/components/reports/ReportTable.vue';
import { useI18n } from 'vue-i18n';
import { inject, onMounted, ref } from 'vue';
import InventaryService from '@/entities/inventary/inventary.service';
import { useAlertService } from '@/shared/alert/alert.service';
import type { Ref } from 'vue';
import type { IInventary } from '@/shared/model/inventary.model';

const inventaryService = inject('inventaryService', () => new InventaryService());
const alertService = inject('alertService', () => useAlertService(), true);

const { t: t$ } = useI18n();
const inventaries: Ref<IInventary[]> = ref([]);

const retrieveInventarys = async () => {
  try {
    const paginationQuery = {
      page: 0,
      size: Number.MAX_SAFE_INTEGER,
      sort: 'id,ASC',
    };

    const res = await inventaryService().retrieve(paginationQuery);
    inventaries.value = res.data;
  } catch (err: any) {
    alertService.showHttpError(err.response);
  }
};

onMounted(async () => {
  await retrieveInventarys();
});

const invetariesColumns = [
  {
    key: 'product',
    label: t$('businessApp.inventary.product'),
    render: (row: IInventary) => `${row.product?.name} (${row.product?.um?.name})`,
  },
  { key: 'count', label: t$('businessApp.inventary.count') },
  { key: 'area', label: t$('businessApp.inventary.area'), render: (row: IInventary) => row.area?.name },
];
</script>
