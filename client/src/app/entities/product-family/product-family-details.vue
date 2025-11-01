<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <div v-if="productFamily">
        <h2 class="jh-entity-heading" data-cy="productFamilyDetailsHeading">
          <span v-text="t$('businessApp.productFamily.detail.title')"></span> {{ productFamily.id }}
        </h2>
        <dl class="row jh-entity-details">
          <dt>
            <span v-text="t$('businessApp.productFamily.name')"></span>
          </dt>
          <dd>
            <span>{{ productFamily.name }}</span>
          </dd>
          <dt>
            <span v-text="t$('businessApp.productFamily.description')"></span>
          </dt>
          <dd>
            <span>{{ productFamily.description }}</span>
          </dd>
          <dt>
            <span v-text="t$('businessApp.productFamily.productCategory')"></span>
          </dt>
          <dd>
            <div v-if="productFamily.productCategory">
              <router-link :to="{ name: 'ProductCategoryView', params: { productCategoryId: productFamily.productCategory.id } }">{{
                productFamily.productCategory.id
              }}</router-link>
            </div>
          </dd>
        </dl>
        <button type="submit" @click.prevent="previousState()" class="btn btn-info" data-cy="entityDetailsBackButton">
          <font-awesome-icon icon="arrow-left"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.back')"></span>
        </button>
        <router-link
          v-if="productFamily.id"
          :to="{ name: 'ProductFamilyEdit', params: { productFamilyId: productFamily.id } }"
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

<script lang="ts" src="./product-family-details.component.ts"></script>
