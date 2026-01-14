<template>
  <div>
    <h2 id="page-heading" data-cy="InventaryHeading">
      <span v-text="t$('businessApp.inventary.home.title')" id="inventary-heading"></span>
      <div class="d-flex justify-content-end">
        <b-form-input
          class="mr-2"
          id="input-small"
          type="search"
          v-model="searchText"
          :style="{ width: 40 + 'ch' }"
          :placeholder="t$('entity.action.search')"
          @input="onInput"
        ></b-form-input>
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
            <th scope="row" @click="changeOrder('area.name')">
              <span v-text="t$('businessApp.inventary.area')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'area.name'"></jhi-sort-indicator>
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
            <td>
              <div v-if="inventary.area">
                {{ inventary.area.name }}
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
