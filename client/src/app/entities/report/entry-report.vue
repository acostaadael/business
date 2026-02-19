<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <form name="editForm" novalidate @submit.prevent="save()">
        <h2 id="businessApp.report.params.main" data-cy="ReportParamsHeading" v-text="t$('businessApp.report.params.main')"></h2>
        <div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('businessApp.report.params.period')" for="period-param"></label>
            <select class="form-control" id="period-param" data-cy="period-param" name="period" v-model="reportParam.period" required>
              <option :value="null"></option>
              <option
                :value="reportParam.period && periodOption.id === reportParam.period.id ? reportParam.period : periodOption"
                v-for="periodOption in periods"
                :key="periodOption.id"
              >
                {{ `Mes: ${periodOption.month}; Año: ${periodOption.year}` }}
              </option>
            </select>
            <div v-if="v$.period.$anyDirty && v$.period.$invalid">
              <small class="form-text text-danger" v-for="error of v$.period.$errors" :key="error.$uid">{{ error.$message }}</small>
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
            <font-awesome-icon icon="save"></font-awesome-icon>&nbsp;<span v-text="t$('businessApp.report.actions.generate')"></span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
<script lang="ts" src="./entry-report.component.ts"></script>
