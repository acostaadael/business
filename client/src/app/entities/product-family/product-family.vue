<template>
  <div>
    <h2 id="page-heading" data-cy="ProductFamilyHeading">
      <span v-text="t$('businessApp.productFamily.home.title')" id="product-family-heading"></span>
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
        <router-link :to="{ name: 'ProductFamilyCreate' }" custom v-slot="{ navigate }">
          <button
            @click="navigate"
            id="jh-create-entity"
            data-cy="entityCreateButton"
            class="btn btn-primary jh-create-entity create-product-family"
          >
            <font-awesome-icon icon="plus"></font-awesome-icon>
            <span v-text="t$('businessApp.productFamily.home.createLabel')"></span>
          </button>
        </router-link>
      </div>
    </h2>
    <br />
    <div class="alert alert-warning" v-if="!isFetching && productFamilies && productFamilies.length === 0">
      <span v-text="t$('businessApp.productFamily.home.notFound')"></span>
    </div>
    <div class="table-responsive" v-if="productFamilies && productFamilies.length > 0">
      <table class="table table-striped" aria-describedby="productFamilies">
        <thead>
          <tr>
            <th scope="row" @click="changeOrder('id')">
              <span v-text="t$('global.field.id')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'id'"></jhi-sort-indicator>
            </th>
            <th scope="row" @click="changeOrder('name')">
              <span v-text="t$('businessApp.productFamily.name')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'name'"></jhi-sort-indicator>
            </th>
            <th scope="row" @click="changeOrder('description')">
              <span v-text="t$('businessApp.productFamily.description')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'description'"></jhi-sort-indicator>
            </th>
            <th scope="row" @click="changeOrder('productCategory.id')">
              <span v-text="t$('businessApp.productFamily.productCategory')"></span>
              <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" :field-name="'productCategory.id'"></jhi-sort-indicator>
            </th>
            <th scope="row"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="productFamily in productFamilies" :key="productFamily.id" data-cy="entityTable">
            <td>
              <router-link :to="{ name: 'ProductFamilyView', params: { productFamilyId: productFamily.id } }">{{
                productFamily.id
              }}</router-link>
            </td>
            <td>{{ productFamily.name }}</td>
            <td>{{ productFamily.description }}</td>
            <td>
              <div v-if="productFamily.productCategory">
                <router-link :to="{ name: 'ProductCategoryView', params: { productCategoryId: productFamily.productCategory.id } }">{{
                  productFamily.productCategory.name
                }}</router-link>
              </div>
            </td>
            <td class="text-right">
              <div class="btn-group">
                <router-link
                  :to="{ name: 'ProductFamilyView', params: { productFamilyId: productFamily.id } }"
                  custom
                  v-slot="{ navigate }"
                >
                  <button @click="navigate" class="btn btn-info btn-sm details" data-cy="entityDetailsButton">
                    <font-awesome-icon icon="eye"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.view')"></span>
                  </button>
                </router-link>
                <router-link
                  :to="{ name: 'ProductFamilyEdit', params: { productFamilyId: productFamily.id } }"
                  custom
                  v-slot="{ navigate }"
                >
                  <button @click="navigate" class="btn btn-primary btn-sm edit" data-cy="entityEditButton">
                    <font-awesome-icon icon="pencil-alt"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.edit')"></span>
                  </button>
                </router-link>
                <b-button
                  @click="prepareRemove(productFamily)"
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
          id="businessApp.productFamily.delete.question"
          data-cy="productFamilyDeleteDialogHeading"
          v-text="t$('entity.delete.title')"
        ></span>
      </template>
      <div class="modal-body">
        <p id="jhi-delete-productFamily-heading" v-text="t$('businessApp.productFamily.delete.question', { id: removeId })"></p>
      </div>
      <template #modal-footer>
        <div>
          <button type="button" class="btn btn-secondary" v-text="t$('entity.action.cancel')" @click="closeDialog()"></button>
          <button
            type="button"
            class="btn btn-primary"
            id="jhi-confirm-delete-productFamily"
            data-cy="entityConfirmDeleteButton"
            v-text="t$('entity.action.delete')"
            @click="removeProductFamily()"
          ></button>
        </div>
      </template>
    </b-modal>
    <div v-show="productFamilies && productFamilies.length > 0">
      <div class="row justify-content-center">
        <jhi-item-count :page="page" :total="queryCount" :itemsPerPage="itemsPerPage"></jhi-item-count>
      </div>
      <div class="row justify-content-center">
        <b-pagination size="md" :total-rows="totalItems" v-model="page" :per-page="itemsPerPage"></b-pagination>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./product-family.component.ts"></script>
