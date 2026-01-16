<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <div v-if="inventoryMovement">
        <h2 class="jh-entity-heading" data-cy="inventoryMovementDetailsHeading">
          <span v-text="t$('businessApp.inventoryMovement.detail.title')"></span> {{ inventoryMovement.id }}
        </h2>
        <dl class="row jh-entity-details">
          <dt>
            <span v-text="t$('businessApp.inventoryMovement.day')"></span>
          </dt>
          <dd>
            <span>{{ inventoryMovement.day }}</span>
          </dd>
          <dt>
            <span v-text="t$('businessApp.inventoryMovement.count')"></span>
          </dt>
          <dd>
            <span>{{ inventoryMovement.count }}</span>
          </dd>
          <dt>
            <span v-text="t$('businessApp.inventoryMovement.period')"></span>
          </dt>
          <dd>
            <div v-if="inventoryMovement.period">
              <router-link :to="{ name: 'PeriodView', params: { periodId: inventoryMovement.period.id } }">{{
                inventoryMovement.period.id
              }}</router-link>
            </div>
          </dd>
          <dt>
            <span v-text="t$('businessApp.inventoryMovement.company')"></span>
          </dt>
          <dd>
            <div v-if="inventoryMovement.company">
              <router-link :to="{ name: 'CompanyView', params: { companyId: inventoryMovement.company.id } }">{{
                inventoryMovement.company.id
              }}</router-link>
            </div>
          </dd>
          <dt>
            <span v-text="t$('businessApp.inventoryMovement.product')"></span>
          </dt>
          <dd>
            <div v-if="inventoryMovement.product">
              <router-link :to="{ name: 'ProductView', params: { productId: inventoryMovement.product.id } }">{{
                inventoryMovement.product.id
              }}</router-link>
            </div>
          </dd>
          <dt>
            <span v-text="t$('businessApp.inventoryMovement.source')"></span>
          </dt>
          <dd>
            <div v-if="inventoryMovement.source">
              <router-link :to="{ name: 'AreaView', params: { areaId: inventoryMovement.source.id } }">{{
                inventoryMovement.source.id
              }}</router-link>
            </div>
          </dd>
          <dt>
            <span v-text="t$('businessApp.inventoryMovement.target')"></span>
          </dt>
          <dd>
            <div v-if="inventoryMovement.target">
              <router-link :to="{ name: 'AreaView', params: { areaId: inventoryMovement.target.id } }">{{
                inventoryMovement.target.id
              }}</router-link>
            </div>
          </dd>
        </dl>
        <button type="submit" @click.prevent="previousState()" class="btn btn-info" data-cy="entityDetailsBackButton">
          <font-awesome-icon icon="arrow-left"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.back')"></span>
        </button>
        <router-link
          v-if="inventoryMovement.id"
          :to="{ name: 'InventoryMovementEdit', params: { inventoryMovementId: inventoryMovement.id } }"
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

<script lang="ts" src="./inventory-movement-details.component.ts"></script>
