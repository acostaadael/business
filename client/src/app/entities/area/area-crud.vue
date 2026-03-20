<template>
  <CrudTable :entity="entity" :service="areaService" :title="t$('businessApp.area.home.title')">
    <template #create-button>
      <router-link :to="{ name: 'AreaCreate' }" custom v-slot="{ navigate }">
        <button @click="navigate" id="jh-create-entity" data-cy="entityCreateButton" class="btn btn-primary jh-create-entity create-area">
          <font-awesome-icon icon="plus" />
          <span v-text="t$('businessApp.area.home.createLabel')"></span>
        </button>
      </router-link>
    </template>
  </CrudTable>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import CrudTable from '@/components/crud/CrudTable.vue';
import { entity } from './area.entity';
import AreaService from './area.service';

const { t: t$ } = useI18n();

const areaService = new AreaService();
</script>
