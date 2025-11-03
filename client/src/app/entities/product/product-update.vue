<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <form name="editForm" novalidate @submit.prevent="save()">
        <h2
          id="businessApp.product.home.createOrEditLabel"
          data-cy="ProductCreateUpdateHeading"
          v-text="t$('businessApp.product.home.createOrEditLabel')"
        ></h2>
        <b-container fluid>
          <div class="form-group" v-if="product.id">
            <label for="id" v-text="t$('global.field.id')"></label>
            <input type="text" class="form-control" id="id" name="id" v-model="product.id" readonly />
          </div>
          <b-form-row v-if="!product.id">
            <b-col>
              <div class="form-group">
                <label class="form-control-label" v-text="t$('businessApp.product.hasCode')" for="product-hasCode"></label>
                <input
                  type="checkbox"
                  class="form-check"
                  name="hasCode"
                  id="product-hasCode"
                  data-cy="hasCode"
                  :class="{ valid: !v$.hasCode.$invalid, invalid: v$.hasCode.$invalid }"
                  v-model="v$.hasCode.$model"
                />
              </div>
            </b-col>
            <b-col>
              <div class="form-group">
                <label class="form-control-label" v-text="t$('businessApp.product.code')" for="product-code"></label>
                <input
                  type="text"
                  class="form-control"
                  name="code"
                  id="product-code"
                  data-cy="code"
                  :class="{ valid: !v$.code.$invalid, invalid: v$.code.$invalid }"
                  v-model="v$.code.$model"
                  required
                />
                <div v-if="v$.code.$anyDirty && v$.code.$invalid">
                  <small class="form-text text-danger" v-for="error of v$.code.$errors" :key="error.$uid">{{ error.$message }}</small>
                </div>
              </div>
            </b-col>
          </b-form-row>
          <b-form-row>
            <b-col>
              <div class="form-group">
                <label class="form-control-label" v-text="t$('businessApp.product.name')" for="product-name"></label>
                <input
                  type="text"
                  class="form-control"
                  name="name"
                  id="product-name"
                  data-cy="name"
                  :class="{ valid: !v$.name.$invalid, invalid: v$.name.$invalid }"
                  v-model="v$.name.$model"
                  required
                />
                <div v-if="v$.name.$anyDirty && v$.name.$invalid">
                  <small class="form-text text-danger" v-for="error of v$.name.$errors" :key="error.$uid">{{ error.$message }}</small>
                </div>
              </div>
            </b-col>
            <b-col>
              <div class="form-group">
                <label class="form-control-label" v-text="t$('businessApp.product.description')" for="product-description"></label>
                <b-form-textarea
                  id="product-description"
                  v-model="v$.description.$model"
                  :class="{ valid: !v$.description.$invalid, invalid: v$.description.$invalid }"
                  :placeholder="t$('businessApp.product.description')"
                  rows="3"
                ></b-form-textarea>
              </div>
            </b-col>
          </b-form-row>

          <b-form-row>
            <b-col>
              <div class="form-group">
                <label class="form-control-label" v-text="t$('businessApp.product.costPrice')" for="product-costPrice"></label>
                <input
                  type="number"
                  class="form-control"
                  name="costPrice"
                  id="product-costPrice"
                  data-cy="costPrice"
                  :class="{ valid: !v$.costPrice.$invalid, invalid: v$.costPrice.$invalid }"
                  v-model.number="v$.costPrice.$model"
                  required
                />
                <div v-if="v$.costPrice.$anyDirty && v$.costPrice.$invalid">
                  <small class="form-text text-danger" v-for="error of v$.costPrice.$errors" :key="error.$uid">{{ error.$message }}</small>
                </div>
              </div>
            </b-col>
            <b-col>
              <div class="form-group">
                <label class="form-control-label" v-text="t$('businessApp.product.profitMargin')" for="product-profitMargin"></label>
                <input
                  type="number"
                  class="form-control"
                  name="profitMargin"
                  id="product-profitMargin"
                  data-cy="profitMargin"
                  :class="{ valid: !v$.profitMargin.$invalid, invalid: v$.profitMargin.$invalid }"
                  v-model.number="v$.profitMargin.$model"
                  required
                />
                <div v-if="v$.profitMargin.$anyDirty && v$.profitMargin.$invalid">
                  <small class="form-text text-danger" v-for="error of v$.profitMargin.$errors" :key="error.$uid">{{
                    error.$message
                  }}</small>
                </div>
              </div>
            </b-col>
          </b-form-row>
          <b-form-row>
            <b-col>
              <div class="form-group">
                <label class="form-control-label" v-text="t$('businessApp.product.um')" for="product-um"></label>
                <select class="form-control" id="product-um" data-cy="um" name="um" v-model="product.um" required>
                  <option v-if="!product.um" :value="null" selected></option>
                  <option
                    :value="product.um && umOption.id === product.um.id ? product.um : umOption"
                    v-for="umOption in ums"
                    :key="umOption.id"
                  >
                    {{ umOption.name }}
                  </option>
                </select>
                <div v-if="v$.um.$anyDirty && v$.um.$invalid">
                  <small class="form-text text-danger" v-for="error of v$.um.$errors" :key="error.$uid">{{ error.$message }}</small>
                </div>
              </div>
            </b-col>
            <b-col>
              <div class="form-group">
                <label class="form-control-label" v-text="t$('businessApp.product.productLine')" for="product-productLine"></label>
                <select
                  class="form-control"
                  id="product-productLine"
                  data-cy="productLine"
                  name="productLine"
                  v-model="product.productLine"
                  required
                >
                  <option v-if="!product.productLine" :value="null" selected></option>
                  <option
                    :value="
                      product.productLine && productLineOption.id === product.productLine.id ? product.productLine : productLineOption
                    "
                    v-for="productLineOption in productLines"
                    :key="productLineOption.id"
                  >
                    {{ productLineOption.name }}
                  </option>
                </select>
                <div v-if="v$.productLine.$anyDirty && v$.productLine.$invalid">
                  <small class="form-text text-danger" v-for="error of v$.productLine.$errors" :key="error.$uid">{{
                    error.$message
                  }}</small>
                </div>
              </div>
            </b-col>
          </b-form-row>
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
        </b-container>
      </form>
    </div>
  </div>
</template>
<script lang="ts" src="./product-update.component.ts"></script>
