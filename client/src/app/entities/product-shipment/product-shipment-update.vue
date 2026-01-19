<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <form name="editForm" novalidate @submit.prevent="save()">
        <h2
          id="businessApp.productShipment.home.createOrEditLabel"
          data-cy="ProductShipmentCreateUpdateHeading"
          v-text="t$('businessApp.productShipment.home.createOrEditLabel')"
        ></h2>
        <div>
          <div class="form-group" v-if="productShipment.id">
            <label for="id" v-text="t$('global.field.id')"></label>
            <input type="text" class="form-control" id="id" name="id" v-model="productShipment.id" readonly />
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('businessApp.productShipment.day')" for="product-shipment-day"></label>
            <input
              type="number"
              class="form-control"
              name="day"
              id="product-shipment-day"
              data-cy="day"
              :class="{ valid: !v$.day.$invalid, invalid: v$.day.$invalid }"
              v-model.number="v$.day.$model"
              required
            />
            <div v-if="v$.day.$anyDirty && v$.day.$invalid">
              <small class="form-text text-danger" v-for="error of v$.day.$errors" :key="error.$uid">{{ error.$message }}</small>
            </div>
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('businessApp.productShipment.product')" for="product-shipment-product"></label>
            <select
              class="form-control"
              id="product-shipment-product"
              data-cy="product"
              name="product"
              v-model="productShipment.product"
              required
            >
              <option v-if="!productShipment.product" :value="null" selected></option>
              <option
                :value="
                  productShipment.product && productOption.id === productShipment.product.id ? productShipment.product : productOption
                "
                v-for="productOption in products"
                :key="productOption.id"
              >
                {{ productOption.name }}
              </option>
            </select>
          </div>
          <div v-if="v$.product.$anyDirty && v$.product.$invalid">
            <small class="form-text text-danger" v-for="error of v$.product.$errors" :key="error.$uid">{{ error.$message }}</small>
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('businessApp.productShipment.count')" for="product-shipment-count"></label>
            <input
              type="number"
              class="form-control"
              name="count"
              id="product-shipment-count"
              data-cy="count"
              :class="{ valid: !v$.count.$invalid, invalid: v$.count.$invalid }"
              v-model.number="v$.count.$model"
              required
            />
            <div v-if="v$.count.$anyDirty && v$.count.$invalid">
              <small class="form-text text-danger" v-for="error of v$.count.$errors" :key="error.$uid">{{ error.$message }}</small>
            </div>
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('businessApp.productShipment.type')" for="product-shipment-type"></label>
            <select
              class="form-control"
              name="type"
              :class="{ valid: !v$.type.$invalid, invalid: v$.type.$invalid }"
              v-model="v$.type.$model"
              id="product-shipment-type"
              data-cy="type"
              required
            >
              <option v-for="exitType in exitTypeValues" :key="exitType" :value="exitType" :label="t$('businessApp.ExitType.' + exitType)">
                {{ exitType }}
              </option>
            </select>
            <div v-if="v$.type.$anyDirty && v$.type.$invalid">
              <small class="form-text text-danger" v-for="error of v$.type.$errors" :key="error.$uid">{{ error.$message }}</small>
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
<script lang="ts" src="./product-shipment-update.component.ts"></script>
