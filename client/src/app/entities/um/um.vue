<template>
  <div>
    <h2 id="page-heading" data-cy="UmHeading">
      <span v-text="t$('businessApp.um.home.title')" id="um-heading"></span>
      <div class="d-flex justify-content-end">
        <b-col>
          <b-form-input
            class="mr-2"
            id="input-small"
            type="search"
            v-model="searchText"
            :style="{ width: 40 + 'ch' }"
            placeholder="Buscar"
            @input="onInput"
          ></b-form-input>
        </b-col>
        <router-link :to="{ name: 'UmCreate' }" custom v-slot="{ navigate }">
          <button @click="navigate" id="jh-create-entity" data-cy="entityCreateButton" class="btn btn-primary jh-create-entity create-um">
            <font-awesome-icon icon="plus"></font-awesome-icon>
            <span v-text="t$('businessApp.um.home.createLabel')"></span>
          </button>
        </router-link>
      </div>
    </h2>
    <br />
    <div class="alert alert-warning" v-if="!isFetching && ums && ums.length === 0">
      <span v-text="t$('businessApp.um.home.notFound')"></span>
    </div>
    <div class="table-responsive" v-if="ums && ums.length > 0">
      <table class="table table-striped" aria-describedby="ums">
        <thead>
          <tr>
            <th scope="row" @click="changeOrder('id')">
              <span v-text="t$('global.field.id')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'id'"></jhi-sort-indicator>
            </th>
            <th scope="row" @click="changeOrder('name')">
              <span v-text="t$('businessApp.um.name')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'name'"></jhi-sort-indicator>
            </th>
            <th scope="row" @click="changeOrder('description')">
              <span v-text="t$('businessApp.um.description')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'description'"></jhi-sort-indicator>
            </th>
            <th scope="row"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="um in ums" :key="um.id" data-cy="entityTable">
            <td>
              {{ um.id }}
            </td>
            <td>{{ um.name }}</td>
            <td>{{ um.description }}</td>
            <td class="text-right">
              <div class="btn-group">
                <router-link :to="{ name: 'UmEdit', params: { umId: um.id } }" custom v-slot="{ navigate }">
                  <button @click="navigate" class="btn btn-primary btn-sm edit" data-cy="entityEditButton">
                    <font-awesome-icon icon="pencil-alt"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.edit')"></span>
                  </button>
                </router-link>
                <b-button
                  @click="prepareRemove(um)"
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
        <span id="businessApp.um.delete.question" data-cy="umDeleteDialogHeading" v-text="t$('entity.delete.title')"></span>
      </template>
      <div class="modal-body">
        <p id="jhi-delete-um-heading" v-text="t$('businessApp.um.delete.question', { id: removeId })"></p>
      </div>
      <template #modal-footer>
        <div>
          <button type="button" class="btn btn-secondary" v-text="t$('entity.action.cancel')" @click="closeDialog()"></button>
          <button
            type="button"
            class="btn btn-primary"
            id="jhi-confirm-delete-um"
            data-cy="entityConfirmDeleteButton"
            v-text="t$('entity.action.delete')"
            @click="removeUm()"
          ></button>
        </div>
      </template>
    </b-modal>
    <div v-show="ums && ums.length > 0">
      <div class="row justify-content-center">
        <jhi-item-count :page="page" :total="queryCount" :itemsPerPage="itemsPerPage"></jhi-item-count>
      </div>
      <div class="row justify-content-center">
        <b-pagination size="md" :total-rows="totalItems" v-model="page" :per-page="itemsPerPage"></b-pagination>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./um.component.ts"></script>
