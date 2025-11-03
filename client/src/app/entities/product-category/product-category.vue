<template>
  <div>
    <h2 id="page-heading" data-cy="ProductCategoryHeading">
      <span v-text="t$('businessApp.productCategory.home.title')" id="product-category-heading"></span>
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
        <router-link :to="{ name: 'ProductCategoryCreate' }" custom v-slot="{ navigate }">
          <button
            @click="navigate"
            id="jh-create-entity"
            data-cy="entityCreateButton"
            class="btn btn-primary jh-create-entity create-product-category"
          >
            <font-awesome-icon icon="plus"></font-awesome-icon>
            <span v-text="t$('businessApp.productCategory.home.createLabel')"></span>
          </button>
        </router-link>
      </div>
    </h2>
    <br />
    <div class="alert alert-warning" v-if="!isFetching && productCategories && productCategories.length === 0">
      <span v-text="t$('businessApp.productCategory.home.notFound')"></span>
    </div>
    <div class="table-responsive" v-if="productCategories && productCategories.length > 0">
      <table class="table table-striped" aria-describedby="productCategories">
        <thead>
          <tr>
            <th scope="row" @click="changeOrder('id')">
              <span v-text="t$('global.field.id')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'id'"></jhi-sort-indicator>
            </th>
            <th scope="row" @click="changeOrder('name')">
              <span v-text="t$('businessApp.productCategory.name')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'name'"></jhi-sort-indicator>
            </th>
            <th scope="row" @click="changeOrder('description')">
              <span v-text="t$('businessApp.productCategory.description')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'description'"></jhi-sort-indicator>
            </th>
            <th scope="row"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="productCategory in productCategories" :key="productCategory.id" data-cy="entityTable">
            <td>
              <router-link :to="{ name: 'ProductCategoryView', params: { productCategoryId: productCategory.id } }">{{
                productCategory.id
              }}</router-link>
            </td>
            <td>{{ productCategory.name }}</td>
            <td>{{ productCategory.description }}</td>
            <td class="text-right">
              <div class="btn-group">
                <router-link
                  :to="{ name: 'ProductCategoryView', params: { productCategoryId: productCategory.id } }"
                  custom
                  v-slot="{ navigate }"
                >
                  <button @click="navigate" class="btn btn-info btn-sm details" data-cy="entityDetailsButton">
                    <font-awesome-icon icon="eye"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.view')"></span>
                  </button>
                </router-link>
                <router-link
                  :to="{ name: 'ProductCategoryEdit', params: { productCategoryId: productCategory.id } }"
                  custom
                  v-slot="{ navigate }"
                >
                  <button @click="navigate" class="btn btn-primary btn-sm edit" data-cy="entityEditButton">
                    <font-awesome-icon icon="pencil-alt"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.edit')"></span>
                  </button>
                </router-link>
                <b-button
                  @click="prepareRemove(productCategory)"
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
          id="businessApp.productCategory.delete.question"
          data-cy="productCategoryDeleteDialogHeading"
          v-text="t$('entity.delete.title')"
        ></span>
      </template>
      <div class="modal-body">
        <p id="jhi-delete-productCategory-heading" v-text="t$('businessApp.productCategory.delete.question', { id: removeId })"></p>
      </div>
      <template #modal-footer>
        <div>
          <button type="button" class="btn btn-secondary" v-text="t$('entity.action.cancel')" @click="closeDialog()"></button>
          <button
            type="button"
            class="btn btn-primary"
            id="jhi-confirm-delete-productCategory"
            data-cy="entityConfirmDeleteButton"
            v-text="t$('entity.action.delete')"
            @click="removeProductCategory()"
          ></button>
        </div>
      </template>
    </b-modal>
    <div v-show="productCategories && productCategories.length > 0">
      <div class="row justify-content-center">
        <jhi-item-count :page="page" :total="queryCount" :itemsPerPage="itemsPerPage"></jhi-item-count>
      </div>
      <div class="row justify-content-center">
        <b-pagination size="md" :total-rows="totalItems" v-model="page" :per-page="itemsPerPage"></b-pagination>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./product-category.component.ts"></script>
