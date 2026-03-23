<template>
  <CrudTable
    :entity="entity"
    :service="productShipmentService"
    :title="`${t$('businessApp.productShipment.home.title')} del mes: ${openPeriod?.month}, año: ${openPeriod?.year}`"
  >
    <template #create-button>
      <router-link :to="{ name: 'ProductShipmentCreate' }" custom v-slot="{ navigate }">
        <button
          @click="navigate"
          id="jh-create-entity"
          data-cy="entityCreateButton"
          class="btn btn-primary jh-create-entity create-product-shipment"
        >
          <font-awesome-icon icon="plus" />
          <span v-text="t$('businessApp.productShipment.home.createLabel')"></span>
        </button>
      </router-link>
    </template>

    <template #cell-type="{ item }">
      {{ t$('businessApp.ExitType.' + item.type) }}
    </template>
  </CrudTable>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import CrudTable from '@/components/crud/CrudTable.vue';
import { entity } from './product-shipment.entity';
import ProductShipmentService from './product-shipment.service';
import { usePeriodStore } from '@/store';

const periodStore = usePeriodStore();
const openPeriod = computed(() => periodStore.period);

const { t: t$ } = useI18n();

const productShipmentService = new ProductShipmentService();
</script>
