<template>
  <CrudTable :entity="entity" :service="productLineService" :title="t$('businessApp.productLine.home.title')">
    <template #create-button>
      <router-link :to="{ name: 'ProductLineCreate' }" custom v-slot="{ navigate }">
        <button @click="navigate" id="jh-create-entity" data-cy="entityCreateButton" class="btn btn-primary jh-create-entity">
          <font-awesome-icon icon="plus" />
          <span v-text="t$('businessApp.productLine.home.createLabel')"></span>
        </button>
      </router-link>
    </template>
  </CrudTable>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import CrudTable from '@/components/crud/CrudTable.vue';
import { entity } from './product-line.entity';
import ProductLineService from './product-line.service';

const { t: t$ } = useI18n();

const productLineService = new ProductLineService();
</script>
