<template>
  <div>
    <h2 id="page-heading" data-cy="InventoryMovementHeading">
      <span
        v-text="`${t$('businessApp.inventoryMovement.home.title')} del mes: ${openPeriod.month}, año: ${openPeriod.year}`"
        id="inventory-movement-heading"
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
        <router-link :to="{ name: 'InventoryMovementCreate' }" custom v-slot="{ navigate }">
          <button
            @click="navigate"
            id="jh-create-entity"
            data-cy="entityCreateButton"
            class="btn btn-primary jh-create-entity create-inventory-movement"
          >
            <font-awesome-icon icon="plus"></font-awesome-icon>
            <span v-text="t$('businessApp.inventoryMovement.home.createLabel')"></span>
          </button>
        </router-link>
      </div>
    </h2>
    <br />
    <div class="alert alert-warning" v-if="!isFetching && inventoryMovements && inventoryMovements.length === 0">
      <span v-text="t$('businessApp.inventoryMovement.home.notFound')"></span>
    </div>
    <div class="table-responsive" v-if="inventoryMovements && inventoryMovements.length > 0">
      <table class="table table-striped" aria-describedby="inventoryMovements">
        <thead>
          <tr>
            <th scope="row" @click="changeOrder('product.id')">
              <span v-text="t$('businessApp.inventoryMovement.product')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'product.id'"></jhi-sort-indicator>
            </th>
            <th scope="row" @click="changeOrder('count')">
              <span v-text="t$('businessApp.inventoryMovement.count')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'count'"></jhi-sort-indicator>
            </th>
            <th scope="row" @click="changeOrder('day')">
              <span v-text="t$('businessApp.inventoryMovement.day')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'day'"></jhi-sort-indicator>
            </th>
            <th scope="row" @click="changeOrder('source.id')">
              <span v-text="t$('businessApp.inventoryMovement.source')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'source.id'"></jhi-sort-indicator>
            </th>
            <th scope="row" @click="changeOrder('target.id')">
              <span v-text="t$('businessApp.inventoryMovement.target')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'target.id'"></jhi-sort-indicator>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="inventoryMovement in inventoryMovements" :key="inventoryMovement.id" data-cy="entityTable">
            <td>
              <div v-if="inventoryMovement.product">
                <router-link :to="{ name: 'ProductView', params: { productId: inventoryMovement.product.id } }">{{
                  `${inventoryMovement.product.name} (${inventoryMovement.product?.um?.name})`
                }}</router-link>
              </div>
            </td>
            <td>{{ inventoryMovement.count }}</td>
            <td>{{ inventoryMovement.day }}</td>
            <td>
              <div v-if="inventoryMovement.source">
                {{ inventoryMovement.source.name }}
              </div>
            </td>
            <td>
              <div v-if="inventoryMovement.target">
                {{ inventoryMovement.target.name }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <b-modal ref="removeEntity" id="removeEntity">
      <template #modal-title>
        <span
          id="businessApp.inventoryMovement.delete.question"
          data-cy="inventoryMovementDeleteDialogHeading"
          v-text="t$('entity.delete.title')"
        ></span>
      </template>
      <div class="modal-body">
        <p id="jhi-delete-inventoryMovement-heading" v-text="t$('businessApp.inventoryMovement.delete.question', { id: removeId })"></p>
      </div>
      <template #modal-footer>
        <div>
          <button type="button" class="btn btn-secondary" v-text="t$('entity.action.cancel')" @click="closeDialog()"></button>
          <button
            type="button"
            class="btn btn-primary"
            id="jhi-confirm-delete-inventoryMovement"
            data-cy="entityConfirmDeleteButton"
            v-text="t$('entity.action.delete')"
            @click="removeInventoryMovement()"
          ></button>
        </div>
      </template>
    </b-modal>
    <div v-show="inventoryMovements && inventoryMovements.length > 0">
      <div class="row justify-content-center">
        <jhi-item-count :page="page" :total="queryCount" :itemsPerPage="itemsPerPage"></jhi-item-count>
      </div>
      <div class="row justify-content-center">
        <b-pagination size="md" :total-rows="totalItems" v-model="page" :per-page="itemsPerPage"></b-pagination>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./inventory-movement.component.ts"></script>
