<template>
  <div>
    <h2 id="page-heading" data-cy="PeriodHeading">
      <span v-text="t$('businessApp.period.home.title')" id="period-heading"></span>
      <div class="d-flex justify-content-end">
        <button class="btn btn-info mr-2" @click="handleSyncList" :disabled="isFetching">
          <font-awesome-icon icon="sync" :spin="isFetching"></font-awesome-icon>
          <span v-text="t$('businessApp.period.home.refreshListLabel')"></span>
        </button>
        <router-link :to="{ name: 'PeriodCreate' }" custom v-slot="{ navigate }">
          <button
            @click="navigate"
            id="jh-create-entity"
            data-cy="entityCreateButton"
            class="btn btn-primary jh-create-entity create-period"
          >
            <font-awesome-icon icon="plus"></font-awesome-icon>
            <span v-text="t$('businessApp.period.home.createLabel')"></span>
          </button>
        </router-link>
      </div>
    </h2>
    <br />
    <div class="alert alert-warning" v-if="!isFetching && periods && periods.length === 0">
      <span v-text="t$('businessApp.period.home.notFound')"></span>
    </div>
    <div class="table-responsive" v-if="periods && periods.length > 0">
      <table class="table table-striped" aria-describedby="periods">
        <thead>
          <tr>
            <th scope="row" @click="changeOrder('id')">
              <span v-text="t$('global.field.id')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'id'"></jhi-sort-indicator>
            </th>
            <th scope="row" @click="changeOrder('month')">
              <span v-text="t$('businessApp.period.month')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'month'"></jhi-sort-indicator>
            </th>
            <th scope="row" @click="changeOrder('year')">
              <span v-text="t$('businessApp.period.year')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'year'"></jhi-sort-indicator>
            </th>
            <th scope="row" @click="changeOrder('status')">
              <span v-text="t$('businessApp.period.status')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'status'"></jhi-sort-indicator>
            </th>
            <th scope="row"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="period in periods" :key="period.id" data-cy="entityTable">
            <td>
              {{ period.id }}
            </td>
            <td>{{ period.month }}</td>
            <td>{{ period.year }}</td>
            <td v-text="t$('businessApp.PeriodStatus.' + period.status)"></td>
            <td class="text-right">
              <div class="btn-group" v-if="period.status === PeriodStatus.OPEN">
                <b-button
                  @click="prepareClose(period)"
                  variant="danger"
                  class="btn btn-sm"
                  data-cy="entityCloseButton"
                  v-b-modal.removeEntity
                >
                  <font-awesome-icon icon="times"></font-awesome-icon>
                  <span class="d-none d-md-inline" v-text="t$('entity.action.close')"></span>
                </b-button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <b-modal ref="closePeriodEntity" id="closePeriodEntity">
      <template #modal-title>
        <span id="businessApp.period.close.question" data-cy="closePeriodDialogHeading" v-text="t$('entity.close.title')"></span>
      </template>
      <div class="modal-body">
        <p id="jhi-close-period-heading" v-text="t$('businessApp.period.close.question', { month: month, year: year })"></p>
      </div>
      <template #modal-footer>
        <div>
          <button type="button" class="btn btn-secondary" v-text="t$('entity.action.cancel')" @click="closeDialog()"></button>
          <button
            type="button"
            class="btn btn-primary"
            id="jhi-confirm-close-period"
            data-cy="entityConfirmCloseButton"
            v-text="t$('entity.action.close')"
            @click="closePeriod()"
          ></button>
        </div>
      </template>
    </b-modal>
    <div v-show="periods && periods.length > 0">
      <div class="row justify-content-center">
        <jhi-item-count :page="page" :total="queryCount" :itemsPerPage="itemsPerPage"></jhi-item-count>
      </div>
      <div class="row justify-content-center">
        <b-pagination size="md" :total-rows="totalItems" v-model="page" :per-page="itemsPerPage"></b-pagination>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./period.component.ts">
import { PeriodStatus } from '@/shared/model/enumerations/period-status.model.js';
</script>
