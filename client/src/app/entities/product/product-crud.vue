<template>
  <CrudTable :entity="entity" :service="productService" :title="t$('businessApp.product.home.title')">
    <template #create-button>
      <router-link :to="{ name: 'ProductCreate' }" custom v-slot="{ navigate }">
        <button
          @click="navigate"
          id="jh-create-entity"
          data-cy="entityCreateButton"
          class="btn btn-primary jh-create-entity create-product"
        >
          <font-awesome-icon icon="plus" />
          <span v-text="t$('businessApp.product.home.createLabel')"></span>
        </button>
      </router-link>
    </template>
  </CrudTable>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import CrudTable from '@/components/crud/CrudTable.vue';
import { entity } from './product.entity';
import ProductService from './product.service';

const { t: t$ } = useI18n();

const productService = new ProductService();
</script>
