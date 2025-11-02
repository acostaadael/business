<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <div v-if="productLine">
        <h2 class="jh-entity-heading" data-cy="productLineDetailsHeading">
          <span v-text="t$('businessApp.productLine.detail.title')"></span> {{ productLine.id }}
        </h2>
        <dl class="row jh-entity-details">
          <dt>
            <span v-text="t$('businessApp.productLine.name')"></span>
          </dt>
          <dd>
            <span>{{ productLine.name }}</span>
          </dd>
          <dt>
            <span v-text="t$('businessApp.productLine.description')"></span>
          </dt>
          <dd>
            <span>{{ productLine.description }}</span>
          </dd>
          <dt>
            <span v-text="t$('businessApp.productLine.productFamily')"></span>
          </dt>
          <dd>
            <div v-if="productLine.productFamily">
              <router-link :to="{ name: 'ProductFamilyView', params: { productFamilyId: productLine.productFamily.id } }">{{
                productLine.productFamily.name
              }}</router-link>
            </div>
          </dd>
        </dl>
        <button type="submit" @click.prevent="previousState()" class="btn btn-info" data-cy="entityDetailsBackButton">
          <font-awesome-icon icon="arrow-left"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.back')"></span>
        </button>
        <router-link
          v-if="productLine.id"
          :to="{ name: 'ProductLineEdit', params: { productLineId: productLine.id } }"
          custom
          v-slot="{ navigate }"
        >
          <button @click="navigate" class="btn btn-primary">
            <font-awesome-icon icon="pencil-alt"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.edit')"></span>
          </button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./product-line-details.component.ts"></script>
