<template>
  <CrudTable :entity="entity" :service="companyService" :title="t$('businessApp.company.home.title')">
    <template #create-button>
      <router-link :to="{ name: 'CompanyCreate' }" custom v-slot="{ navigate }">
        <button
          @click="navigate"
          id="jh-create-entity"
          data-cy="entityCreateButton"
          class="btn btn-primary jh-create-entity create-company"
        >
          <font-awesome-icon icon="plus" />
          <span v-text="t$('businessApp.company.home.createLabel')"></span>
        </button>
      </router-link>
    </template>

    <template #cell-active="{ item }">
      <button
        class="btn btn-danger btn-sm deactivated"
        @click="changeStatus(item, true)"
        v-if="!item.active"
        v-text="t$('businessApp.company.deactivated')"
      ></button>
      <button
        class="btn btn-success btn-sm"
        @click="changeStatus(item, false)"
        v-if="item.active"
        v-text="t$('businessApp.company.activated')"
      ></button>
    </template>
  </CrudTable>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import CrudTable from '@/components/crud/CrudTable.vue';
import { entity } from './company.entity';
import CompanyService from './company.service';
import type { ICompany } from '@/shared/model/company.model';

const { t: t$ } = useI18n();

const companyService = new CompanyService();

const changeStatus = async (company: ICompany, status: boolean) => {
  if (!company?.id) return;

  const previous = company.active;
  company.active = status;

  try {
    // Preferimos PATCH (partialUpdate) porque solo cambia active.
    await companyService.partialUpdate({ id: company.id, active: status } as ICompany);
  } catch (e) {
    // Fallback por si el backend no soporta PATCH para este recurso.
    try {
      await companyService.update(company);
    } catch {
      company.active = previous;
    }
  }
};
</script>
