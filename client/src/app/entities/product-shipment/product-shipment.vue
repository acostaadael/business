<template>
  <div>
    <h2 id="page-heading" data-cy="ProductShipmentHeading">
      <span
        v-text="`${t$('businessApp.productShipment.home.title')} del mes: ${openPeriod.month}, año: ${openPeriod.year}`"
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
        <router-link :to="{ name: 'ProductShipmentCreate' }" custom v-slot="{ navigate }">
          <button
            @click="navigate"
            id="jh-create-entity"
            data-cy="entityCreateButton"
            class="btn btn-primary jh-create-entity create-product-shipment"
          >
            <font-awesome-icon icon="plus"></font-awesome-icon>
            <span v-text="t$('businessApp.productShipment.home.createLabel')"></span>
          </button>
        </router-link>
      </div>
    </h2>
    <br />
    <div class="alert alert-warning" v-if="!isFetching && productShipments && productShipments.length === 0">
      <span v-text="t$('businessApp.productShipment.home.notFound')"></span>
    </div>
    <div class="table-responsive" v-if="productShipments && productShipments.length > 0">
      <table class="table table-striped" aria-describedby="productShipments">
        <thead>
          <tr>
            <th scope="row" @click="changeOrder('product.id')">
              <span v-text="t$('businessApp.productShipment.product')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'product.id'"></jhi-sort-indicator>
            </th>
            <th scope="row" @click="changeOrder('count')">
              <span v-text="t$('businessApp.productShipment.count')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'count'"></jhi-sort-indicator>
            </th>
            <th scope="row" @click="changeOrder('day')">
              <span v-text="t$('businessApp.productShipment.day')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'day'"></jhi-sort-indicator>
            </th>
            <th scope="row" @click="changeOrder('type')">
              <span v-text="t$('businessApp.productShipment.type')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'type'"></jhi-sort-indicator>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="productShipment in productShipments" :key="productShipment.id" data-cy="entityTable">
            <td>
              <div v-if="productShipment.product">
                <router-link :to="{ name: 'ProductView', params: { productId: productShipment.product.id } }">{{
                  `${productShipment.product.name} (${productShipment.product?.um?.name})`
                }}</router-link>
              </div>
            </td>
            <td>{{ productShipment.count }}</td>
            <td>{{ productShipment.day }}</td>
            <td v-text="t$('businessApp.ExitType.' + productShipment.type)"></td>
          </tr>
        </tbody>
        <span ref="infiniteScrollEl"></span>
      </table>
    </div>
    <b-modal ref="removeEntity" id="removeEntity">
      <template #modal-title>
        <span
          id="businessApp.productShipment.delete.question"
          data-cy="productShipmentDeleteDialogHeading"
          v-text="t$('entity.delete.title')"
        ></span>
      </template>
      <div class="modal-body">
        <p id="jhi-delete-productShipment-heading" v-text="t$('businessApp.productShipment.delete.question', { id: removeId })"></p>
      </div>
      <template #modal-footer>
        <div>
          <button type="button" class="btn btn-secondary" v-text="t$('entity.action.cancel')" @click="closeDialog()"></button>
          <button
            type="button"
            class="btn btn-primary"
            id="jhi-confirm-delete-productShipment"
            data-cy="entityConfirmDeleteButton"
            v-text="t$('entity.action.delete')"
            @click="removeProductShipment()"
          ></button>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script lang="ts" src="./product-shipment.component.ts"></script>
