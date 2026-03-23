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

<script setup lang="ts">
import { type Ref, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import ProductLineService from './product-line.service';
import { type IProductLine } from '@/shared/model/product-line.model';
import { useAlertService } from '@/shared/alert/alert.service';

const productLineService = inject('productLineService', () => new ProductLineService());
const alertService = inject('alertService', () => useAlertService(), true);

const route = useRoute();
const router = useRouter();

const previousState = () => router.go(-1);

const productLine: Ref<IProductLine> = ref({} as IProductLine);

const retrieveProductLine = async (productLineId: string | number) => {
  try {
    productLine.value = await productLineService().find(Number(productLineId));
  } catch (error: any) {
    alertService.showHttpError(error.response);
  }
};

if (route.params?.productLineId) {
  retrieveProductLine(route.params.productLineId as any);
}

const { t: t$ } = useI18n();
</script>
