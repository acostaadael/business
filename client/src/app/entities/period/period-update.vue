<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <form name="editForm" novalidate @submit.prevent="save()">
        <h2
          id="businessApp.period.home.createOrEditLabel"
          data-cy="PeriodCreateUpdateHeading"
          v-text="t$('businessApp.period.home.createOrEditLabel')"
        ></h2>
        <div>
          <div class="form-group" v-if="period.id">
            <label for="id" v-text="t$('global.field.id')"></label>
            <input type="text" class="form-control" id="id" name="id" v-model="period.id" readonly />
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('businessApp.period.month')" for="period-month"></label>
            <input
              type="number"
              class="form-control"
              name="month"
              id="period-month"
              data-cy="month"
              :class="{ valid: !v$.month.$invalid, invalid: v$.month.$invalid }"
              v-model.number="v$.month.$model"
              required
            />
            <div v-if="v$.month.$anyDirty && v$.month.$invalid">
              <small class="form-text text-danger" v-for="error of v$.month.$errors" :key="error.$uid">{{ error.$message }}</small>
            </div>
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('businessApp.period.year')" for="period-year"></label>
            <input
              type="number"
              class="form-control"
              name="year"
              id="period-year"
              data-cy="year"
              :class="{ valid: !v$.year.$invalid, invalid: v$.year.$invalid }"
              v-model.number="v$.year.$model"
              required
            />
            <div v-if="v$.year.$anyDirty && v$.year.$invalid">
              <small class="form-text text-danger" v-for="error of v$.year.$errors" :key="error.$uid">{{ error.$message }}</small>
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
<script lang="ts" src="./period-update.component.ts"></script>
