<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <form name="editForm" novalidate @submit.prevent="save()">
        <h2
          id="businessApp.entry.home.createOrEditLabel"
          data-cy="EntryCreateUpdateHeading"
          v-text="t$('businessApp.entry.home.createOrEditLabel')"
        ></h2>
        <div>
          <div class="form-group" v-if="entry.id">
            <label for="id" v-text="t$('global.field.id')"></label>
            <input type="text" class="form-control" id="id" name="id" v-model="entry.id" readonly />
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('businessApp.entry.product')" for="entry-product"></label>
            <select class="form-control" id="entry-product" data-cy="product" name="product" v-model="entry.product" required>
              <option v-if="!entry.product" :value="null" selected></option>
              <option
                :value="entry.product && productOption.id === entry.product.id ? entry.product : productOption"
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
            <label class="form-control-label" v-text="t$('businessApp.entry.count')" for="entry-count"></label>
            <input
              type="number"
              class="form-control"
              name="count"
              id="entry-count"
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
            <label class="form-control-label" v-text="t$('businessApp.entry.area')" for="entry-area"></label>
            <select class="form-control" id="entry-area" data-cy="area" name="area" v-model="entry.area" required>
              <option v-if="!entry.area" :value="null" selected></option>
              <option
                :value="entry.area && areaOption.id === entry.area.id ? entry.area : areaOption"
                v-for="areaOption in areas"
                :key="areaOption.id"
              >
                {{ areaOption.name }}
              </option>
            </select>
          </div>
          <div v-if="v$.area.$anyDirty && v$.area.$invalid">
            <small class="form-text text-danger" v-for="error of v$.area.$errors" :key="error.$uid">{{ error.$message }}</small>
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('businessApp.entry.day')" for="entry-day"></label>
            <input
              type="number"
              class="form-control"
              name="day"
              id="entry-day"
              data-cy="day"
              :class="{ valid: !v$.day.$invalid, invalid: v$.day.$invalid }"
              v-model.number="v$.day.$model"
              required
            />
            <div v-if="v$.day.$anyDirty && v$.day.$invalid">
              <small class="form-text text-danger" v-for="error of v$.day.$errors" :key="error.$uid">{{ error.$message }}</small>
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
<script lang="ts" src="./entry-update.component.ts"></script>
