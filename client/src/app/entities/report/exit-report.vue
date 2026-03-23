<template>
  <ReportTable
    :title="`${t$('businessApp.report.reports.exit')} (Mes: ${period.month}; Año: ${period.year})`"
    :data="productShipments"
    :columns="productShipmentsColumns"
    :total-columns="['total_price']"
    filename="reporte-inventario"
  />
</template>

<script setup lang="ts">
import ReportTable from '@/components/reports/ReportTable.vue';
import { useI18n } from 'vue-i18n';
import { inject, onMounted, ref } from 'vue';
import ProductShipmentService from '@/entities/product-shipment/product-shipment.service';
import { useRoute } from 'vue-router';
import { useAlertService } from '@/shared/alert/alert.service';
import type { Ref } from 'vue';
import type { IProductShipment } from '@/shared/model/product-shipment.model';
import { type IPeriod, Period } from '@/shared/model/period.model.ts';
import PeriodService from '@/entities/period/period.service.ts';

const productShipmentService = inject('productShipmentService', () => new ProductShipmentService());
const periodService = inject('periodService', () => new PeriodService());
const alertService = inject('alertService', () => useAlertService(), true);

const { t: t$ } = useI18n();
const productShipments: Ref<IProductShipment[]> = ref([]);
const period: Ref<IPeriod> = ref(new Period());

const route = useRoute();

const retrieveProductShipments = async () => {
  try {
    const paginationQuery = {
      page: 0,
      size: Number.MAX_SAFE_INTEGER,
      sort: 'id,ASC',
      periodId: Number(route.params.periodId),
      exitType: route.params.exitType,
    };

    const res = await productShipmentService().retrieve(paginationQuery);
    productShipments.value = res.data.map((item: IProductShipment) => ({
      ...item,
      unit_price: item.product?.costPrice,
      total_price: item.product?.costPrice && item.count ? item.product?.costPrice * item.count : 0,
    }));
  } catch (err: any) {
    alertService.showHttpError(err.response);
  }
};

const retrievePeriod = async () => {
  try {
    const res = await periodService().find(Number(route.params.periodId));
    period.value = res;
  } catch (error: any) {
    alertService.showHttpError(error.response);
  }
};

onMounted(async () => {
  await retrieveProductShipments();
  await retrievePeriod();
});

const productShipmentsColumns = [
  {
    key: 'product',
    label: t$('businessApp.productShipment.product'),
    render: (row: IProductShipment) => `${row.product?.name}`,
  },
  {
    key: 'count',
    label: t$('businessApp.productShipment.count'),
    render: (row: IProductShipment) => `${row.count} ${row.product?.um?.name}`,
  },
  {
    key: 'unit_price',
    label: t$('businessApp.productShipment.unitPrice'),
    render: (row: IProductShipment) => `${row.unit_price} $`,
  },
  {
    key: 'total_price',
    label: t$('businessApp.productShipment.totalPrice'),
    render: (row: IProductShipment) => `${row.total_price} $`,
  },
  { key: 'area', label: t$('businessApp.productShipment.area'), render: (row: IProductShipment) => row.area?.name },
  { key: 'type', label: t$('businessApp.productShipment.type'), render: (row: IProductShipment) => row.type },
];
</script>
