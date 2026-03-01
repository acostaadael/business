<template>
  <ReportTable
    :title="t$('businessApp.report.reports.inventary')"
    :data="inventaries"
    :columns="invetariesColumns"
    :total-columns="['total_price', 'total_selling_price']"
    filename="reporte-inventario"
  />
</template>

<script setup lang="ts">
import ReportTable from '@/components/reports/ReportTable.vue';
import { useI18n } from 'vue-i18n';
import { inject, onMounted, ref } from 'vue';
import InventaryService from '@/entities/inventary/inventary.service';
import { useRoute, useRouter } from 'vue-router';
import { useAlertService } from '@/shared/alert/alert.service';
import type { Ref } from 'vue';
import type { IInventary } from '@/shared/model/inventary.model';

const inventaryService = inject('inventaryService', () => new InventaryService());
const alertService = inject('alertService', () => useAlertService(), true);

const { t: t$ } = useI18n();
const inventaries: Ref<IInventary[]> = ref([]);

const route = useRoute();

const retrieveInventarys = async () => {
  try {
    const paginationQuery = {
      page: 0,
      size: Number.MAX_SAFE_INTEGER,
      sort: 'id,ASC',
      areaId: Number(route.params.areaId),
    };

    const res = await inventaryService().retrieve(paginationQuery);
    inventaries.value = res.data.map((item: IInventary) => ({
      ...item,
      unit_price: item.product?.costPrice,
      total_price: item.product?.costPrice && item.count ? item.product?.costPrice * item.count : 0,
      unit_selling_price: item.product?.sellingPrice,
      total_selling_price: item.product?.sellingPrice && item.count ? item.product?.sellingPrice * item.count : 0,
    }));
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
  {
    key: 'unit_price',
    label: t$('businessApp.inventary.unitPrice'),
    render: (row: IInventary) => `${row.unit_price} $`,
  },
  {
    key: 'total_price',
    label: t$('businessApp.inventary.totalPrice'),
    render: (row: IInventary) => `${row.total_price} $`,
  },
  {
    key: 'unit_selling_price',
    label: t$('businessApp.inventary.unitSellingPrice'),
    render: (row: IInventary) => `${row.unit_price} $`,
  },
  {
    key: 'total_selling_price',
    label: t$('businessApp.inventary.totalSellingPrice'),
    render: (row: IInventary) => `${row.total_price} $`,
  },
  { key: 'area', label: t$('businessApp.inventary.area'), render: (row: IInventary) => row.area?.name },
];
</script>
