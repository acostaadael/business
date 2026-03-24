<template>
  <div>
    <b-dropdown-item to="/period">
      <font-awesome-icon icon="fa-calendar" />
      <span v-text="t$('global.menu.economy.period')"></span>
    </b-dropdown-item>
    <b-dropdown-item to="/entry" v-if="ifOpenPeriod">
      <font-awesome-icon icon="fa-box" />
      <span v-text="t$('global.menu.economy.entry')"></span>
    </b-dropdown-item>
    <!-- <b-dropdown-item to="/product-shipment" v-if="ifOpenPeriod">
      <font-awesome-icon icon="fa-box" />
      <span v-text="t$('global.menu.economy.productShipment')"></span>
    </b-dropdown-item> -->
    <b-dropdown-item to="/inventory-movement" v-if="ifOpenPeriod">
      <font-awesome-icon icon="fa-store" />
      <span v-text="t$('global.menu.economy.inventoryMovement')"></span>
    </b-dropdown-item>
    <b-dropdown-item to="/inventary">
      <font-awesome-icon icon="fa-store" />
      <span v-text="t$('global.menu.economy.inventary')"></span>
    </b-dropdown-item>
    <!-- jhipster-needle-add-entity-to-menu - JHipster will add entities to the menu here -->
  </div>
</template>

<script lang="ts" src="./economy-menu.component.ts"></script>
