<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <form name="editForm" novalidate @submit.prevent="save()" v-if="userAccount">
        <h2 id="myUserLabel" v-text="t$('userManagement.home.createOrEditLabel')"></h2>
        <div>
          <div class="form-group" :hidden="!userAccount.id">
            <label v-text="t$('global.field.id')"></label>
            <input type="text" class="form-control" name="id" v-model="userAccount.id" readonly />
          </div>

          <div class="form-group">
            <label class="form-control-label" v-text="t$('userManagement.login')"></label>
            <input
              type="text"
              class="form-control"
              name="login"
              :class="{ valid: !v$.userAccount.login.$invalid, invalid: v$.userAccount.login.$invalid }"
              v-model="v$.userAccount.login.$model"
            />

            <div v-if="v$.userAccount.login.$anyDirty && v$.userAccount.login.$invalid">
              <small class="form-text text-danger" v-if="!v$.userAccount.login.required" v-text="t$('entity.validation.required')"></small>

              <small
                class="form-text text-danger"
                v-if="!v$.userAccount.login.maxLength"
                v-text="t$('entity.validation.maxlength', { max: 50 })"
              ></small>

              <small
                class="form-text text-danger"
                v-if="!v$.userAccount.login.pattern"
                v-text="t$('entity.validation.patternLogin')"
              ></small>
            </div>
          </div>
          <div class="form-group">
            <label class="form-control-label" for="firstName" v-text="t$('userManagement.firstName')"></label>
            <input
              type="text"
              class="form-control"
              id="firstName"
              name="firstName"
              :placeholder="t$('settings.form[\'firstname.placeholder\']')"
              :class="{ valid: !v$.userAccount.firstName.$invalid, invalid: v$.userAccount.firstName.$invalid }"
              v-model="v$.userAccount.firstName.$model"
            />
            <div v-if="v$.userAccount.firstName.$anyDirty && v$.userAccount.firstName.$invalid">
              <small
                class="form-text text-danger"
                v-if="!v$.userAccount.firstName.maxLength"
                v-text="t$('entity.validation.maxlength', { max: 50 })"
              ></small>
            </div>
          </div>
          <div class="form-group">
            <label class="form-control-label" for="lastName" v-text="t$('userManagement.lastName')"></label>
            <input
              type="text"
              class="form-control"
              id="lastName"
              name="lastName"
              :placeholder="t$('settings.form[\'lastname.placeholder\']')"
              :class="{ valid: !v$.userAccount.lastName.$invalid, invalid: v$.userAccount.lastName.$invalid }"
              v-model="v$.userAccount.lastName.$model"
            />
            <div v-if="v$.userAccount.lastName.$anyDirty && v$.userAccount.lastName.$invalid">
              <small
                class="form-text text-danger"
                v-if="!v$.userAccount.lastName.maxLength"
                v-text="t$('entity.validation.maxlength', { max: 50 })"
              ></small>
            </div>
          </div>
          <div class="form-group">
            <label class="form-control-label" for="email" v-text="t$('userManagement.email')"></label>
            <input
              type="email"
              class="form-control"
              id="email"
              name="email"
              :placeholder="t$('global.form[\'email.placeholder\']')"
              :class="{ valid: !v$.userAccount.email.$invalid, invalid: v$.userAccount.email.$invalid }"
              v-model="v$.userAccount.email.$model"
              email
              required
            />
            <div v-if="v$.userAccount.email.$anyDirty && v$.userAccount.email.$invalid">
              <small
                class="form-text text-danger"
                v-if="!v$.userAccount.email.required"
                v-text="t$('global.messages.validate.email.required')"
              ></small>
              <small
                class="form-text text-danger"
                v-if="!v$.userAccount.email.email"
                v-text="t$('global.messages.validate.email.invalid')"
              ></small>
              <small
                class="form-text text-danger"
                v-if="!v$.userAccount.email.minLength"
                v-text="t$('global.messages.validate.email.minlength')"
              ></small>
              <small
                class="form-text text-danger"
                v-if="!v$.userAccount.email.maxLength"
                v-text="t$('global.messages.validate.email.maxlength')"
              ></small>
            </div>
          </div>
          <div class="form-check">
            <label class="form-check-label" for="activated">
              <input
                class="form-check-input"
                :disabled="userAccount.id === null"
                type="checkbox"
                id="activated"
                name="activated"
                v-model="userAccount.activated"
              />
              <span v-text="t$('userManagement.activated')"></span>
            </label>
          </div>

          <div class="form-group" v-if="languages && Object.keys(languages).length > 0">
            <label for="langKey" v-text="t$('userManagement.langKey')"></label>
            <select class="form-control" id="langKey" name="langKey" v-model="userAccount.langKey">
              <option v-for="(language, key) in languages" :value="key" :key="key">{{ language.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label v-text="t$('userManagement.profiles')"></label>
            <select class="form-control" multiple name="authority" v-model="userAccount.authorities">
              <option v-for="authority of authorities" :value="authority" :key="authority">{{ authority }}</option>
            </select>
          </div>
          <div class="form-group" v-if="!userAccount.id">
            <label class="form-control-label" for="firstPassword" v-text="t$('global.form[\'newpassword.label\']')"></label>
            <input
              type="password"
              class="form-control"
              id="firstPassword"
              name="password"
              :class="{ valid: !v$.userAccount.password.$invalid, invalid: v$.userAccount.password.$invalid }"
              v-model="v$.userAccount.password.$model"
              minlength="4"
              maxlength="50"
              required
              :placeholder="t$('global.form[\'newpassword.placeholder\']')"
              data-cy="firstPassword"
            />
            <div v-if="v$.userAccount.password.$anyDirty && v$.userAccount.password.$invalid">
              <small
                class="form-text text-danger"
                v-if="!v$.userAccount.password.requiredIf"
                v-text="t$('global.messages.validate.newpassword.required')"
              ></small>
              <small
                class="form-text text-danger"
                v-if="!v$.userAccount.password.minLength"
                v-text="t$('global.messages.validate.newpassword.minlength')"
              ></small>
              <small
                class="form-text text-danger"
                v-if="!v$.userAccount.password.maxLength"
                v-text="t$('global.messages.validate.newpassword.maxlength')"
              ></small>
            </div>
          </div>
          <div class="form-group" v-if="!userAccount.id">
            <label class="form-control-label" for="secondPassword" v-text="t$('global.form[\'confirmpassword.label\']')"></label>
            <input
              type="password"
              class="form-control"
              id="secondPassword"
              name="confirmPasswordInput"
              :class="{ valid: !v$.confirmPassword.$invalid, invalid: v$.confirmPassword.$invalid }"
              v-model="v$.confirmPassword.$model"
              minlength="4"
              maxlength="50"
              required
              :placeholder="t$('global.form[\'confirmpassword.placeholder\']')"
              data-cy="secondPassword"
            />
            <div v-if="v$.confirmPassword.$dirty && v$.confirmPassword.$invalid">
              <small
                class="form-text text-danger"
                v-if="!v$.confirmPassword.required"
                v-text="t$('global.messages.validate.confirmpassword.required')"
              ></small>
              <small
                class="form-text text-danger"
                v-if="!v$.confirmPassword.minLength"
                v-text="t$('global.messages.validate.confirmpassword.minlength')"
              ></small>
              <small
                class="form-text text-danger"
                v-if="!v$.confirmPassword.maxLength"
                v-text="t$('global.messages.validate.confirmpassword.maxlength')"
              ></small>
              <small
                class="form-text text-danger"
                v-if="!v$.confirmPassword.sameAsPassword"
                v-text="t$('global.messages.error.dontmatch')"
              ></small>
            </div>
          </div>
        </div>
        <div>
          <button type="button" class="btn btn-secondary" @click="previousState()">
            <font-awesome-icon icon="ban"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.cancel')"></span>
          </button>
          <button type="submit" :disabled="v$.userAccount.$invalid || v$.confirmPassword.$invalid || isSaving" class="btn btn-primary">
            <font-awesome-icon icon="save"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.save')"></span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts" src="./user-management-edit.component.ts"></script>
