<!-- eslint-disable prettier/prettier -->
<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <form name="editForm" novalidate @submit.prevent="save()">
        <h2
          id="businessApp.productLine.home.createOrEditLabel"
          data-cy="ProductLineCreateUpdateHeading"
          v-text="t$('businessApp.productLine.home.createOrEditLabel')"
        ></h2>
        <div>
          <div class="form-group" v-if="productLine.id">
            <label for="id" v-text="t$('global.field.id')"></label>
            <input type="text" class="form-control" id="id" name="id" v-model="productLine.id" readonly />
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('businessApp.productLine.name')" for="product-line-name"></label>
            <input
              type="text"
              class="form-control"
              name="name"
              id="product-line-name"
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
            <label class="form-control-label" v-text="t$('businessApp.productLine.description')" for="product-line-description"></label>
            <input
              type="text"
              class="form-control"
              name="description"
              id="product-line-description"
              data-cy="description"
              :class="{ valid: !v$.description.$invalid, invalid: v$.description.$invalid }"
              v-model="v$.description.$model"
            />
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('businessApp.productLine.productFamily')" for="product-line-productFamily"></label>
            <select
              class="form-control"
              id="product-line-productFamily"
              data-cy="productFamily"
              name="productFamily"
              v-model="productLine.productFamily"
              required
            >
              <option :value="null"></option>
              <option
                :value="
                  productLine.productFamily && productFamilyOption.id === productLine.productFamily.id
                    ? productLine.productFamily
                    : productFamilyOption
                "
                v-for="productFamilyOption in productFamilies"
                :key="productFamilyOption.id"
              >
                {{ productFamilyOption.name }}
              </option>
            </select>
            <div v-if="v$.productFamily.$anyDirty && v$.productFamily.$invalid">
              <small class="form-text text-danger" v-for="error of v$.productFamily.$errors" :key="error.$uid">{{ error.$message }}</small>
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
<script lang="ts" src="./product-line-update.component.ts"></script>
