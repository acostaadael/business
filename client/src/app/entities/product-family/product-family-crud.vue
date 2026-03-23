<template>
  <CrudTable :entity="entity" :service="productFamilyService" :title="t$('businessApp.productFamily.home.title')">
    <template #create-button>
      <router-link :to="{ name: 'ProductFamilyCreate' }" custom v-slot="{ navigate }">
        <button @click="navigate" id="jh-create-entity" data-cy="entityCreateButton" class="btn btn-primary jh-create-entity">
          <font-awesome-icon icon="plus" />
          <span v-text="t$('businessApp.productFamily.home.createLabel')"></span>
        </button>
      </router-link>
    </template>
  </CrudTable>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import CrudTable from '@/components/crud/CrudTable.vue';
import { entity } from './product-family.entity';
import ProductFamilyService from './product-family.service';

const { t: t$ } = useI18n();

const productFamilyService = new ProductFamilyService();
</script>
