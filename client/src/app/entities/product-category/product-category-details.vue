<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <div v-if="productCategory">
        <h2 class="jh-entity-heading" data-cy="productCategoryDetailsHeading">
          <span v-text="t$('businessApp.productCategory.detail.title')"></span> {{ productCategory.id }}
        </h2>
        <dl class="row jh-entity-details">
          <dt>
            <span v-text="t$('businessApp.productCategory.name')"></span>
          </dt>
          <dd>
            <span>{{ productCategory.name }}</span>
          </dd>
          <dt>
            <span v-text="t$('businessApp.productCategory.description')"></span>
          </dt>
          <dd>
            <span>{{ productCategory.description }}</span>
          </dd>
        </dl>
        <button type="submit" @click.prevent="previousState()" class="btn btn-info" data-cy="entityDetailsBackButton">
          <font-awesome-icon icon="arrow-left"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.back')"></span>
        </button>
        <router-link
          v-if="productCategory.id"
          :to="{ name: 'ProductCategoryEdit', params: { productCategoryId: productCategory.id } }"
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

<script setup lang="ts">
import { type Ref, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import ProductCategoryService from './product-category.service';
import { type IProductCategory } from '@/shared/model/product-category.model';
import { useAlertService } from '@/shared/alert/alert.service';

const productCategoryService = inject('productCategoryService', () => new ProductCategoryService());
const alertService = inject('alertService', () => useAlertService(), true);

const route = useRoute();
const router = useRouter();

const previousState = () => router.go(-1);

const productCategory: Ref<IProductCategory> = ref({} as IProductCategory);

const retrieveProductCategory = async (productCategoryId: string | number) => {
  try {
    const res = await productCategoryService().find(Number(productCategoryId));
    productCategory.value = res;
  } catch (error: any) {
    alertService.showHttpError(error.response);
  }
};

if (route.params?.productCategoryId) {
  retrieveProductCategory(route.params.productCategoryId as any);
}

const { t: t$ } = useI18n();
</script>
