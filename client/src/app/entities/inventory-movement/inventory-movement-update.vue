<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <form name="editForm" novalidate @submit.prevent="save()">
        <h2
          id="businessApp.inventoryMovement.home.createOrEditLabel"
          data-cy="InventoryMovementCreateUpdateHeading"
          v-text="t$('businessApp.inventoryMovement.home.createOrEditLabel')"
        ></h2>
        <div>
          <div class="form-group" v-if="inventoryMovement.id">
            <label for="id" v-text="t$('global.field.id')"></label>
            <input type="text" class="form-control" id="id" name="id" v-model="inventoryMovement.id" readonly />
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('businessApp.inventoryMovement.day')" for="inventory-movement-day"></label>
            <input
              type="number"
              class="form-control"
              name="day"
              id="inventory-movement-day"
              data-cy="day"
              :class="{ valid: !v$.day.$invalid, invalid: v$.day.$invalid }"
              v-model.number="v$.day.$model"
              required
            />
            <div v-if="v$.day.$anyDirty && v$.day.$invalid">
              <small class="form-text text-danger" v-for="error of v$.day.$errors" :key="error.$uid">{{ error.$message }}</small>
            </div>
          </div>
          <b-form-row>
            <b-col>
              <div class="form-group">
                <label
                  class="form-control-label"
                  v-text="t$('businessApp.inventoryMovement.product')"
                  for="inventory-movement-product"
                ></label>
                <select
                  class="form-control"
                  id="inventory-movement-product"
                  data-cy="product"
                  name="product"
                  v-model="inventoryMovement.product"
                  required
                >
                  <option v-if="!inventoryMovement.product" :value="null" selected></option>
                  <option
                    :value="
                      inventoryMovement.product && productOption.id === inventoryMovement.product.id
                        ? inventoryMovement.product
                        : productOption
                    "
                    v-for="productOption in products"
                    :key="productOption.id"
                  >
                    {{ `${productOption.name} (${productOption.um?.name})` }}
                  </option>
                </select>
              </div>
              <div v-if="v$.product.$anyDirty && v$.product.$invalid">
                <small class="form-text text-danger" v-for="error of v$.product.$errors" :key="error.$uid">{{ error.$message }}</small>
              </div>
            </b-col>
            <b-col>
              <div class="form-group">
                <label class="form-control-label" v-text="t$('businessApp.inventoryMovement.count')" for="inventory-movement-count"></label>
                <input
                  type="number"
                  class="form-control"
                  name="count"
                  id="inventory-movement-count"
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
          <b-form-row>
            <b-col>
              <div class="form-group">
                <label
                  class="form-control-label"
                  v-text="t$('businessApp.inventoryMovement.source')"
                  for="inventory-movement-source"
                ></label>
                <select
                  class="form-control"
                  id="inventory-movement-source"
                  data-cy="source"
                  name="source"
                  v-model="inventoryMovement.source"
                  required
                >
                  <option v-if="!inventoryMovement.source" :value="null" selected></option>
                  <option
                    :value="
                      inventoryMovement.source && areaOption.id === inventoryMovement.source.id ? inventoryMovement.source : areaOption
                    "
                    v-for="areaOption in areas"
                    :key="areaOption.id"
                  >
                    {{ areaOption.name }}
                  </option>
                </select>
              </div>
              <div v-if="v$.source.$anyDirty && v$.source.$invalid">
                <small class="form-text text-danger" v-for="error of v$.source.$errors" :key="error.$uid">{{ error.$message }}</small>
              </div>
            </b-col>
            <b-col>
              <div class="form-group">
                <label
                  class="form-control-label"
                  v-text="t$('businessApp.inventoryMovement.target')"
                  for="inventory-movement-target"
                ></label>
                <select
                  class="form-control"
                  id="inventory-movement-target"
                  data-cy="target"
                  name="target"
                  v-model="inventoryMovement.target"
                  required
                  :disabled="!inventoryMovement.source"
                >
                  <option v-if="!inventoryMovement.target" :value="null" selected></option>
                  <option
                    :value="
                      inventoryMovement.target && areaOption.id === inventoryMovement.target.id ? inventoryMovement.target : areaOption
                    "
                    v-for="areaOption in areas"
                    :key="areaOption.id"
                  >
                    {{ areaOption.name }}
                  </option>
                </select>
              </div>
              <div v-if="v$.target.$anyDirty && v$.target.$invalid">
                <small class="form-text text-danger" v-for="error of v$.target.$errors" :key="error.$uid">{{ error.$message }}</small>
                <small
                  class="form-text text-danger"
                  v-if="inventoryMovement.target && v$.target.distinct"
                  v-text="t$('entity.validation.differentFrom', { value: inventoryMovement.source?.name })"
                ></small>
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
<script lang="ts" src="./inventory-movement-update.component.ts"></script>
