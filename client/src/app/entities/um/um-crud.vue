<template>
  <CrudTable :entity="entity" :service="umService" :title="t$('businessApp.um.home.title')">
    <template #create-button>
      <router-link :to="{ name: 'UmCreate' }" custom v-slot="{ navigate }">
        <button @click="navigate" id="jh-create-entity" data-cy="entityCreateButton" class="btn btn-primary jh-create-entity create-um">
          <font-awesome-icon icon="plus" />
          <span v-text="t$('businessApp.um.home.createLabel')"></span>
        </button>
      </router-link>
    </template>
  </CrudTable>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import CrudTable from '@/components/crud/CrudTable.vue';
import { entity } from './um.entity';
import UmService from './um.service';

const { t: t$ } = useI18n();

const umService = new UmService();
</script>
