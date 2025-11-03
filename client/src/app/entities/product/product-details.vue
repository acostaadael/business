<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <div v-if="product">
        <h2 class="jh-entity-heading" data-cy="productDetailsHeading">
          <span v-text="t$('businessApp.product.detail.title')"></span> {{ product.id }}
        </h2>
        <dl class="row jh-entity-details">
          <dt>
            <span v-text="t$('businessApp.product.code')"></span>
          </dt>
          <dd>
            <span>{{ product.code }}</span>
          </dd>
          <dt>
            <span v-text="t$('businessApp.product.name')"></span>
          </dt>
          <dd>
            <span>{{ product.name }}</span>
          </dd>
          <dt>
            <span v-text="t$('businessApp.product.description')"></span>
          </dt>
          <dd>
            <span>{{ product.description }}</span>
          </dd>
          <dt>
            <span v-text="t$('businessApp.product.costPrice')"></span>
          </dt>
          <dd>
            <span>{{ product.costPrice }}</span>
          </dd>
          <dt>
            <span v-text="t$('businessApp.product.profitMargin')"></span>
          </dt>
          <dd>
            <span>{{ product.profitMargin }}</span>
          </dd>
          <dt>
            <span v-text="t$('businessApp.product.hasCode')"></span>
          </dt>
          <dd>
            <span>{{ product.hasCode }}</span>
          </dd>
          <dt>
            <span v-text="t$('businessApp.product.um')"></span>
          </dt>
          <dd>
            <div v-if="product.um">
              <router-link :to="{ name: 'UmView', params: { umId: product.um.id } }">{{ product.um.id }}</router-link>
            </div>
          </dd>
          <dt>
            <span v-text="t$('businessApp.product.productLine')"></span>
          </dt>
          <dd>
            <div v-if="product.productLine">
              <router-link :to="{ name: 'ProductLineView', params: { productLineId: product.productLine.id } }">{{
                product.productLine.id
              }}</router-link>
            </div>
          </dd>
        </dl>
        <button type="submit" @click.prevent="previousState()" class="btn btn-info" data-cy="entityDetailsBackButton">
          <font-awesome-icon icon="arrow-left"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.back')"></span>
        </button>
        <router-link v-if="product.id" :to="{ name: 'ProductEdit', params: { productId: product.id } }" custom v-slot="{ navigate }">
          <button @click="navigate" class="btn btn-primary">
            <font-awesome-icon icon="pencil-alt"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.edit')"></span>
          </button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./product-details.component.ts"></script>
