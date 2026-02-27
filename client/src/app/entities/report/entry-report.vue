<template>
  <ReportTable
    :title="t$('businessApp.report.reports.entry')"
    :data="entries"
    :columns="entriesColumns"
    :total-columns="['total_price']"
    filename="reporte-inventario"
  />
</template>

<script setup lang="ts">
import ReportTable from '@/components/reports/ReportTable.vue';
import { useI18n } from 'vue-i18n';
import { inject, onMounted, ref } from 'vue';
import EntryService from '@/entities/entry/entry.service';
import { useRoute, useRouter } from 'vue-router';
import { useAlertService } from '@/shared/alert/alert.service';
import type { Ref } from 'vue';
import type { IEntry } from '@/shared/model/entry.model';

const entryService = inject('entryService', () => new EntryService());
const alertService = inject('alertService', () => useAlertService(), true);

const { t: t$ } = useI18n();
const entries: Ref<IEntry[]> = ref([]);

const route = useRoute();

const retrieveEntries = async () => {
  try {
    const paginationQuery = {
      page: 0,
      size: Number.MAX_SAFE_INTEGER,
      sort: 'id,ASC',
      periodId: Number(route.params.periodId),
    };

    const res = await entryService().retrieve(paginationQuery);
    entries.value = res.data.map((item: IEntry) => ({
      ...item,
      unit_price: item.product?.costPrice,
      total_price: item.product?.costPrice && item.count ? item.product?.costPrice * item.count : 0,
    }));
  } catch (err: any) {
    alertService.showHttpError(err.response);
  }
};

onMounted(async () => {
  await retrieveEntries();
});

const entriesColumns = [
  {
    key: 'product',
    label: t$('businessApp.entry.product'),
    render: (row: IEntry) => `${row.product?.name} (${row.product?.um?.name})`,
  },
  { key: 'count', label: t$('businessApp.entry.count') },
  {
    key: 'unit_price',
    label: t$('businessApp.entry.unitPrice'),
    render: (row: IEntry) => `${row.unit_price} $`,
  },
  {
    key: 'total_price',
    label: t$('businessApp.entry.totalPrice'),
    render: (row: IEntry) => `${row.total_price} $`,
  },
  { key: 'area', label: t$('businessApp.entry.area'), render: (row: IEntry) => row.area?.name },
];
</script>
