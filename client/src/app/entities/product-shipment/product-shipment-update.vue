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
          <b-form-row>
            <b-col>
              <div class="form-group">
                <label class="form-control-label" v-text="t$('businessApp.productShipment.type')" for="product-shipment-type"></label>
                <select
                  class="form-control"
                  name="type"
                  :class="{ valid: !v$.type.$invalid, invalid: v$.type.$invalid }"
                  v-model="v$.type.$model"
                  id="product-shipment-type"
                  data-cy="type"
                  @change="loadAreas"
                  required
                >
                  <option
                    v-for="exitType in exitTypeValues"
                    :key="exitType"
                    :value="exitType"
                    :label="t$('businessApp.ExitType.' + exitType)"
                  >
                    {{ exitType }}
                  </option>
                </select>
                <div v-if="v$.type.$anyDirty && v$.type.$invalid">
                  <small class="form-text text-danger" v-for="error of v$.type.$errors" :key="error.$uid">{{ error.$message }}</small>
                </div>
              </div>
            </b-col>
            <b-col>
              <div class="form-group">
                <label class="form-control-label" v-text="t$('businessApp.productShipment.area')" for="productShipment-area"></label>
                <select
                  class="form-control"
                  id="productShipment-area"
                  data-cy="area"
                  name="area"
                  v-model="productShipment.area"
                  :disabled="!productShipment.type"
                  required
                >
                  <option v-if="!productShipment.area" :value="null" selected></option>
                  <option
                    :value="productShipment.area && areaOption.id === productShipment.area.id ? productShipment.area : areaOption"
                    v-for="areaOption in areas"
                    :key="areaOption.id"
                  >
                    {{ `${areaOption.name} (${areaOption.type})` }}
                  </option>
                </select>
              </div>
              <div v-if="v$.area.$anyDirty && v$.area.$invalid">
                <small class="form-text text-danger" v-for="error of v$.area.$errors" :key="error.$uid">{{ error.$message }}</small>
              </div>
            </b-col>
          </b-form-row>
          <b-form-row>
            <b-col cols="6">
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
            </b-col>
          </b-form-row>
          <b-form-row>
            <b-col>
              <label class="form-control-label" v-text="t$('businessApp.productShipment.product')" for="product"></label>
              <Autocomplete
                id="product"
                v-model="productShipment.product"
                :items="products"
                placeholder="Buscar productos..."
                item-text="name"
                :loading="productLoading"
                :min-chars="2"
                @search="searchProducts"
                @select="handleSelect"
              />
              <div v-if="v$.product.$anyDirty && v$.product.$invalid">
                <small class="form-text text-danger" v-for="error of v$.product.$errors" :key="error.$uid">{{ error.$message }}</small>
              </div>
            </b-col>
            <b-col>
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
            </b-col>
          </b-form-row>
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
