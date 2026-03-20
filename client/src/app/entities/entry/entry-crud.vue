<template>
  <CrudTable
    :entity="entity"
    :service="entryService"
    :title="`${t$('businessApp.entry.home.title')} del mes: ${openPeriod?.month}, año: ${openPeriod?.year}`"
  >
    <template #create-button>
      <router-link :to="{ name: 'EntryCreate' }" custom v-slot="{ navigate }">
        <button @click="navigate" id="jh-create-entity" data-cy="entityCreateButton" class="btn btn-primary jh-create-entity create-entry">
          <font-awesome-icon icon="plus" />
          <span v-text="t$('businessApp.entry.home.createLabel')"></span>
        </button>
      </router-link>
    </template>
  </CrudTable>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import CrudTable from '@/components/crud/CrudTable.vue';
import { entity } from './entry.entity';
import EntryService from './entry.service';
import { usePeriodStore } from '@/store';
import { computed } from 'vue';

const periodStore = usePeriodStore();
const openPeriod = computed(() => periodStore.period);

const { t: t$ } = useI18n();

const entryService = new EntryService();
</script>
