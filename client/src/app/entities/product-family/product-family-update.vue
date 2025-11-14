<!-- eslint-disable prettier/prettier -->
<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <form name="editForm" novalidate @submit.prevent="save()">
        <h2
          id="businessApp.productFamily.home.createOrEditLabel"
          data-cy="ProductFamilyCreateUpdateHeading"
          v-text="t$('businessApp.productFamily.home.createOrEditLabel')"
        ></h2>
        <div>
          <div class="form-group" v-if="productFamily.id">
            <label for="id" v-text="t$('global.field.id')"></label>
            <input type="text" class="form-control" id="id" name="id" v-model="productFamily.id" readonly />
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('businessApp.productFamily.name')" for="product-family-name"></label>
            <input
              type="text"
              class="form-control"
              name="name"
              id="product-family-name"
              data-cy="name"
              :class="{ valid: !v$.name.$invalid, invalid: v$.name.$invalid }"
              v-model="v$.name.$model"
              required
            />
            <div v-if="v$.name.$anyDirty && v$.name.$invalid">
              <small class="form-text text-danger" v-for="error of v$.name.$errors" :key="error.$uid">{{ error.$message }}</small>
            </div>
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('businessApp.productFamily.description')" for="product-family-description"></label>
            <input
              type="text"
              class="form-control"
              name="description"
              id="product-family-description"
              data-cy="description"
              :class="{ valid: !v$.description.$invalid, invalid: v$.description.$invalid }"
              v-model="v$.description.$model"
            />
          </div>
          <div class="form-group">
            <label
              class="form-control-label"
              v-text="t$('businessApp.productFamily.productCategory')"
              for="product-family-productCategory"
            ></label>
            <select
              class="form-control"
              id="product-family-productCategory"
              data-cy="productCategory"
              name="productCategory"
              v-model="productFamily.productCategory"
              required
            >
              <option :value="null"></option>
              <option
                :value="
                  productFamily.productCategory && productCategoryOption.id === productFamily.productCategory.id
                    ? productFamily.productCategory
                    : productCategoryOption
                "
                v-for="productCategoryOption in productCategories"
                :key="productCategoryOption.id"
              >
                {{ productCategoryOption.name }}
              </option>
            </select>
            <div v-if="v$.productCategory.$anyDirty && v$.productCategory.$invalid">
              <small class="form-text text-danger" v-for="error of v$.productCategory.$errors" :key="error.$uid">{{
                error.$message
              }}</small>
            </div>
          </div>
        </div>
        <div>
          <button type="button" id="cancel-save" data-cy="entityCreateCancelButton" class="btn btn-secondary" @click="previousState()">
            <font-awesome-icon icon="ban"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.cancel')"></span>
          </button>
          <button
            type="submit"
            id="save-entity"
            data-cy="entityCreateSaveButton"
            :disabled="v$.$invalid || isSaving"
            class="btn btn-primary"
          >
            <font-awesome-icon icon="save"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.save')"></span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
<script lang="ts" src="./product-family-update.component.ts"></script>
