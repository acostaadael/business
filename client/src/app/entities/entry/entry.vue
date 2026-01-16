<template>
  <div>
    <h2 id="page-heading" data-cy="EntryHeading">
      <span
        v-text="`${t$('businessApp.entry.home.title')} del mes: ${openPeriod.month}, año: ${openPeriod.year}`"
        id="entry-heading"
      ></span>
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
        <router-link :to="{ name: 'EntryCreate' }" custom v-slot="{ navigate }">
          <button
            @click="navigate"
            id="jh-create-entity"
            data-cy="entityCreateButton"
            class="btn btn-primary jh-create-entity create-entry"
          >
            <font-awesome-icon icon="plus"></font-awesome-icon>
            <span v-text="t$('businessApp.entry.home.createLabel')"></span>
          </button>
        </router-link>
      </div>
    </h2>
    <br />
    <div class="alert alert-warning" v-if="!isFetching && entries && entries.length === 0">
      <span v-text="t$('businessApp.entry.home.notFound')"></span>
    </div>
    <div class="table-responsive" v-if="entries && entries.length > 0">
      <table class="table table-striped" aria-describedby="entries">
        <thead>
          <tr>
            <th scope="row" @click="changeOrder('product.name')">
              <span v-text="t$('businessApp.entry.product')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'product.name'"></jhi-sort-indicator>
            </th>
            <th scope="row">
              <span v-text="t$('businessApp.entry.count')"></span>
            </th>
            <th scope="row" @click="changeOrder('day')">
              <span v-text="t$('businessApp.entry.day')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'day'"></jhi-sort-indicator>
            </th>
            <th scope="row">
              <span v-text="t$('businessApp.entry.area')"></span>
            </th>
            <th scope="col" @click="changeOrder('createdDate')">
              <span v-text="t$('businessApp.entry.createdDate')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'createdDate'"></jhi-sort-indicator>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in entries" :key="entry.id" data-cy="entityTable">
            <td>
              <div v-if="entry.product">
                <router-link :to="{ name: 'ProductView', params: { productId: entry.product.id } }">{{
                  `${entry.product.name} (${entry.product?.um?.name})`
                }}</router-link>
              </div>
            </td>
            <td>{{ entry.count }}</td>
            <td>{{ entry.day }}</td>
            <td>
              <div v-if="entry.area">
                {{ entry.area.name }}
              </div>
            </td>
            <td>{{ formatDate(entry.createdDate) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-show="entries && entries.length > 0">
      <div class="row justify-content-center">
        <jhi-item-count :page="page" :total="queryCount" :itemsPerPage="itemsPerPage"></jhi-item-count>
      </div>
      <div class="row justify-content-center">
        <b-pagination size="md" :total-rows="totalItems" v-model="page" :per-page="itemsPerPage"></b-pagination>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./entry.component.ts"></script>
