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
            <span>{{ `${product.costPrice} $` }}</span>
          </dd>
          <dt>
            <span v-text="t$('businessApp.product.sellingPrice')"></span>
          </dt>
          <dd>
            <span>{{ `${product.sellingPrice} $` }}</span>
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
              <span>{{ product.um.name }}</span>
            </div>
          </dd>
          <dt>
            <span v-text="t$('businessApp.product.productLine')"></span>
          </dt>
          <dd>
            <div v-if="product.productLine">
              <span>{{ product.productLine.name }}</span>
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

<script setup lang="ts">
import { type Ref, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import ProductService from './product.service';
import { type IProduct } from '@/shared/model/product.model';
import { useAlertService } from '@/shared/alert/alert.service';

const productService = inject('productService', () => new ProductService());
const alertService = inject('alertService', () => useAlertService(), true);

const route = useRoute();
const router = useRouter();

const previousState = () => router.go(-1);

// Mantiene el mismo comportamiento del componente original (producto inicial vacío)
const product: Ref<IProduct> = ref({} as IProduct);

const retrieveProduct = async (productId: string | number) => {
  try {
    const res = await productService().find(productId);
    product.value = res;
  } catch (error: any) {
    alertService.showHttpError(error.response);
  }
};

if (route.params?.productId) {
  retrieveProduct(route.params.productId as any);
}

const { t: t$ } = useI18n();
</script>
