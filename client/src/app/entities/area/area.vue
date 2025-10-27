<template>
  <div>
    <h2 id="page-heading" data-cy="AreaHeading">
      <span v-text="t$('businessApp.area.home.title')" id="area-heading"></span>
      <div class="d-flex justify-content-end">
        <button class="btn btn-info mr-2" @click="handleSyncList" :disabled="isFetching">
          <font-awesome-icon icon="sync" :spin="isFetching"></font-awesome-icon>
          <span v-text="t$('businessApp.area.home.refreshListLabel')"></span>
        </button>
        <router-link :to="{ name: 'AreaCreate' }" custom v-slot="{ navigate }">
          <button @click="navigate" id="jh-create-entity" data-cy="entityCreateButton" class="btn btn-primary jh-create-entity create-area">
            <font-awesome-icon icon="plus"></font-awesome-icon>
            <span v-text="t$('businessApp.area.home.createLabel')"></span>
          </button>
        </router-link>
      </div>
    </h2>
    <br />
    <div class="alert alert-warning" v-if="!isFetching && areas && areas.length === 0">
      <span v-text="t$('businessApp.area.home.notFound')"></span>
    </div>
    <div class="table-responsive" v-if="areas && areas.length > 0">
      <table class="table table-striped" aria-describedby="areas">
        <thead>
          <tr>
            <th scope="row"><span v-text="t$('global.field.id')"></span></th>
            <th scope="row"><span v-text="t$('businessApp.area.name')"></span></th>
            <th scope="row"><span v-text="t$('businessApp.area.description')"></span></th>
            <th scope="row"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="area in areas" :key="area.id" data-cy="entityTable">
            <td>
              {{ area.id }}
            </td>
            <td>{{ area.name }}</td>
            <td>{{ area.description }}</td>
            <td class="text-right">
              <div class="btn-group">
                <router-link :to="{ name: 'AreaEdit', params: { areaId: area.id } }" custom v-slot="{ navigate }">
                  <button @click="navigate" class="btn btn-primary btn-sm edit" data-cy="entityEditButton">
                    <font-awesome-icon icon="pencil-alt"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.edit')"></span>
                  </button>
                </router-link>
                <b-button
                  @click="prepareRemove(area)"
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
        <span id="businessApp.area.delete.question" data-cy="areaDeleteDialogHeading" v-text="t$('entity.delete.title')"></span>
      </template>
      <div class="modal-body">
        <p id="jhi-delete-area-heading" v-text="t$('businessApp.area.delete.question', { id: removeId })"></p>
      </div>
      <template #modal-footer>
        <div>
          <button type="button" class="btn btn-secondary" v-text="t$('entity.action.cancel')" @click="closeDialog()"></button>
          <button
            type="button"
            class="btn btn-primary"
            id="jhi-confirm-delete-area"
            data-cy="entityConfirmDeleteButton"
            v-text="t$('entity.action.delete')"
            @click="removeArea()"
          ></button>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script lang="ts" src="./area.component.ts"></script>
