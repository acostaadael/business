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
                productFamily.productCategory.name
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

<script setup lang="ts">
import { type Ref, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import ProductFamilyService from './product-family.service';
import { type IProductFamily } from '@/shared/model/product-family.model';
import { useAlertService } from '@/shared/alert/alert.service';

const productFamilyService = inject('productFamilyService', () => new ProductFamilyService());
const alertService = inject('alertService', () => useAlertService(), true);

const route = useRoute();
const router = useRouter();

const previousState = () => router.go(-1);

const productFamily: Ref<IProductFamily> = ref({} as IProductFamily);

const retrieveProductFamily = async (productFamilyId: string | number) => {
  try {
    productFamily.value = await productFamilyService().find(Number(productFamilyId));
  } catch (error: any) {
    alertService.showHttpError(error.response);
  }
};

if (route.params?.productFamilyId) {
  retrieveProductFamily(route.params.productFamilyId as any);
}

const { t: t$ } = useI18n();
</script>
