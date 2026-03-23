<template>
  <CrudTable :entity="entity" :service="productCategoryService" :title="t$('businessApp.productCategory.home.title')">
    <template #create-button>
      <router-link :to="{ name: 'ProductCategoryCreate' }" custom v-slot="{ navigate }">
        <button
          @click="navigate"
          id="jh-create-entity"
          data-cy="entityCreateButton"
          class="btn btn-primary jh-create-entity create-product-category"
        >
          <font-awesome-icon icon="plus" />
          <span v-text="t$('businessApp.productCategory.home.createLabel')"></span>
        </button>
      </router-link>
    </template>
  </CrudTable>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import CrudTable from '@/components/crud/CrudTable.vue';
import { entity } from './product-category.entity';
import ProductCategoryService from './product-category.service';

const { t: t$ } = useI18n();

const productCategoryService = new ProductCategoryService();
</script>
