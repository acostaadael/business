<template>
  <CrudTable :entity="entity" :service="inventaryService" :title="t$('businessApp.inventary.home.title')" />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import CrudTable from '@/components/crud/CrudTable.vue';
import { entity } from './inventary.entity';
import InventaryService from './inventary.service';

const { t: t$ } = useI18n();

const inventaryService = new InventaryService();
</script>
