<template>
  <div>
    <h2 id="page-heading" data-cy="InventaryHeading">
      <span v-text="t$('businessApp.inventary.home.title')" id="inventary-heading"></span>
      <div class="d-flex justify-content-end">
        <button class="btn btn-info mr-2" @click="handleSyncList" :disabled="isFetching">
          <font-awesome-icon icon="sync" :spin="isFetching"></font-awesome-icon>
          <span v-text="t$('businessApp.inventary.home.refreshListLabel')"></span>
        </button>
      </div>
    </h2>
    <br />
    <div class="alert alert-warning" v-if="!isFetching && inventaries && inventaries.length === 0">
      <span v-text="t$('businessApp.inventary.home.notFound')"></span>
    </div>
    <div class="table-responsive" v-if="inventaries && inventaries.length > 0">
      <table class="table table-striped" aria-describedby="inventaries">
        <thead>
          <tr>
            <th scope="row" @click="changeOrder('id')">
              <span v-text="t$('global.field.id')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'id'"></jhi-sort-indicator>
            </th>
            <th scope="row" @click="changeOrder('product.name')">
              <span v-text="t$('businessApp.inventary.product')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'product.name'"></jhi-sort-indicator>
            </th>
            <th scope="row">
              <span v-text="t$('businessApp.inventary.count')"></span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="inventary in inventaries" :key="inventary.id" data-cy="entityTable">
            <td>
              {{ inventary.id }}
            </td>
            <td>
              <div v-if="inventary.product">
                <router-link :to="{ name: 'ProductView', params: { productId: inventary.product.id } }">{{
                  inventary.product.name
                }}</router-link>
              </div>
            </td>
            <td>{{ inventary.count }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-show="inventaries && inventaries.length > 0">
      <div class="row justify-content-center">
        <jhi-item-count :page="page" :total="queryCount" :itemsPerPage="itemsPerPage"></jhi-item-count>
      </div>
      <div class="row justify-content-center">
        <b-pagination size="md" :total-rows="totalItems" v-model="page" :per-page="itemsPerPage"></b-pagination>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./inventary.component.ts"></script>
