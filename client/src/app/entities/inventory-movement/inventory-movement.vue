<template>
  <div>
    <h2 id="page-heading" data-cy="InventoryMovementHeading">
      <span v-text="t$('businessApp.inventoryMovement.home.title')" id="inventory-movement-heading"></span>
      <div class="d-flex justify-content-end">
        <button class="btn btn-info mr-2" @click="handleSyncList" :disabled="isFetching">
          <font-awesome-icon icon="sync" :spin="isFetching"></font-awesome-icon>
          <span v-text="t$('businessApp.inventoryMovement.home.refreshListLabel')"></span>
        </button>
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
            <th scope="row" @click="changeOrder('id')">
              <span v-text="t$('global.field.id')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'id'"></jhi-sort-indicator>
            </th>
            <th scope="row" @click="changeOrder('day')">
              <span v-text="t$('businessApp.inventoryMovement.day')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'day'"></jhi-sort-indicator>
            </th>
            <th scope="row" @click="changeOrder('count')">
              <span v-text="t$('businessApp.inventoryMovement.count')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'count'"></jhi-sort-indicator>
            </th>
            <th scope="row" @click="changeOrder('period.id')">
              <span v-text="t$('businessApp.inventoryMovement.period')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'period.id'"></jhi-sort-indicator>
            </th>
            <th scope="row" @click="changeOrder('company.id')">
              <span v-text="t$('businessApp.inventoryMovement.company')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'company.id'"></jhi-sort-indicator>
            </th>
            <th scope="row" @click="changeOrder('product.id')">
              <span v-text="t$('businessApp.inventoryMovement.product')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'product.id'"></jhi-sort-indicator>
            </th>
            <th scope="row" @click="changeOrder('source.id')">
              <span v-text="t$('businessApp.inventoryMovement.source')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'source.id'"></jhi-sort-indicator>
            </th>
            <th scope="row" @click="changeOrder('target.id')">
              <span v-text="t$('businessApp.inventoryMovement.target')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'target.id'"></jhi-sort-indicator>
            </th>
            <th scope="row"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="inventoryMovement in inventoryMovements" :key="inventoryMovement.id" data-cy="entityTable">
            <td>
              <router-link :to="{ name: 'InventoryMovementView', params: { inventoryMovementId: inventoryMovement.id } }">{{
                inventoryMovement.id
              }}</router-link>
            </td>
            <td>{{ inventoryMovement.day }}</td>
            <td>{{ inventoryMovement.count }}</td>
            <td>
              <div v-if="inventoryMovement.period">
                <router-link :to="{ name: 'PeriodView', params: { periodId: inventoryMovement.period.id } }">{{
                  inventoryMovement.period.id
                }}</router-link>
              </div>
            </td>
            <td>
              <div v-if="inventoryMovement.company">
                <router-link :to="{ name: 'CompanyView', params: { companyId: inventoryMovement.company.id } }">{{
                  inventoryMovement.company.id
                }}</router-link>
              </div>
            </td>
            <td>
              <div v-if="inventoryMovement.product">
                <router-link :to="{ name: 'ProductView', params: { productId: inventoryMovement.product.id } }">{{
                  inventoryMovement.product.id
                }}</router-link>
              </div>
            </td>
            <td>
              <div v-if="inventoryMovement.source">
                <router-link :to="{ name: 'AreaView', params: { areaId: inventoryMovement.source.id } }">{{
                  inventoryMovement.source.id
                }}</router-link>
              </div>
            </td>
            <td>
              <div v-if="inventoryMovement.target">
                <router-link :to="{ name: 'AreaView', params: { areaId: inventoryMovement.target.id } }">{{
                  inventoryMovement.target.id
                }}</router-link>
              </div>
            </td>
            <td class="text-right">
              <div class="btn-group">
                <router-link
                  :to="{ name: 'InventoryMovementView', params: { inventoryMovementId: inventoryMovement.id } }"
                  custom
                  v-slot="{ navigate }"
                >
                  <button @click="navigate" class="btn btn-info btn-sm details" data-cy="entityDetailsButton">
                    <font-awesome-icon icon="eye"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.view')"></span>
                  </button>
                </router-link>
                <router-link
                  :to="{ name: 'InventoryMovementEdit', params: { inventoryMovementId: inventoryMovement.id } }"
                  custom
                  v-slot="{ navigate }"
                >
                  <button @click="navigate" class="btn btn-primary btn-sm edit" data-cy="entityEditButton">
                    <font-awesome-icon icon="pencil-alt"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.edit')"></span>
                  </button>
                </router-link>
                <b-button
                  @click="prepareRemove(inventoryMovement)"
                  variant="danger"
                  class="btn btn-sm"
                  data-cy="entityDeleteButton"
                  v-b-modal.removeEntity
                >
                  <font-awesome-icon icon="times"></font-awesome-icon>
                  <span class="d-none d-md-inline" v-text="t$('entity.action.delete')"></span>
                </b-button>
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
