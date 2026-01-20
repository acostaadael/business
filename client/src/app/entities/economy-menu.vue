<template>
  <div>
    <b-dropdown-item to="/period">
      <font-awesome-icon icon="asterisk" />
      <span v-text="t$('global.menu.economy.period')"></span>
    </b-dropdown-item>
    <b-dropdown-item to="/entry">
      <font-awesome-icon icon="asterisk" />
      <span v-text="t$('global.menu.economy.entry')"></span>
    </b-dropdown-item>
    <b-dropdown-item to="/product-shipment">
      <font-awesome-icon icon="asterisk" />
      <span v-text="t$('global.menu.economy.productShipment')"></span>
    </b-dropdown-item>
    <b-dropdown-item to="/inventory-movement">
      <font-awesome-icon icon="asterisk" />
      <span v-text="t$('global.menu.economy.inventoryMovement')"></span>
    </b-dropdown-item>
    <b-dropdown-item to="/inventary">
      <font-awesome-icon icon="asterisk" />
      <span v-text="t$('global.menu.economy.inventary')"></span>
    </b-dropdown-item>
    <!-- jhipster-needle-add-entity-to-menu - JHipster will add entities to the menu here -->
  </div>
</template>

<script lang="ts" src="./economy-menu.component.ts"></script>
