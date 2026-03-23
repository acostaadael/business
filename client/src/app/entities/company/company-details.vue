<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <div v-if="company">
        <h2 class="jh-entity-heading" data-cy="companyDetailsHeading">
          <span v-text="t$('businessApp.company.detail.title')"></span> {{ company.id }}
        </h2>
        <dl class="row jh-entity-details">
          <dt>
            <span v-text="t$('businessApp.company.name')"></span>
          </dt>
          <dd>
            <span>{{ company.name }}</span>
          </dd>
          <dt>
            <span v-text="t$('businessApp.company.active')"></span>
          </dt>
          <dd>
            <span>{{ company.active }}</span>
          </dd>
        </dl>
        <button type="submit" @click.prevent="previousState()" class="btn btn-info" data-cy="entityDetailsBackButton">
          <font-awesome-icon icon="arrow-left"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.back')"></span>
        </button>
        <router-link v-if="company.id" :to="{ name: 'CompanyEdit', params: { companyId: company.id } }" custom v-slot="{ navigate }">
          <button @click="navigate" class="btn btn-primary">
            <font-awesome-icon icon="pencil-alt"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.edit')"></span>
          </button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import CompanyService from './company.service';
import type { ICompany } from '@/shared/model/company.model';
import { useAlertService } from '@/shared/alert/alert.service';

const companyService = inject('companyService', () => new CompanyService());
const alertService = inject('alertService', () => useAlertService(), true);

const route = useRoute();
const router = useRouter();

const { t: t$ } = useI18n();

const previousState = () => router.go(-1);
const company = ref<ICompany>({});

const retrieveCompany = async (companyId: number | string) => {
  try {
    company.value = await companyService().find(companyId);
  } catch (error: any) {
    alertService.showHttpError(error.response);
  }
};

if (route.params?.companyId) {
  retrieveCompany(route.params.companyId as any);
}
</script>
