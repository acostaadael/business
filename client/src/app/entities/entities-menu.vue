<template>
  <div>
    <b-dropdown-item to="/period">
      <font-awesome-icon icon="asterisk" />
      <span v-text="t$('global.menu.entities.period')"></span>
    </b-dropdown-item>
    <b-dropdown-item to="/um">
      <font-awesome-icon icon="asterisk" />
      <span v-text="t$('global.menu.entities.um')"></span>
    </b-dropdown-item>
    <b-dropdown-item to="/area">
      <font-awesome-icon icon="asterisk" />
      <span v-text="t$('global.menu.entities.area')"></span>
    </b-dropdown-item>
    <b-dropdown-item to="/product-category">
      <font-awesome-icon icon="asterisk" />
      <span v-text="t$('global.menu.entities.productCategory')"></span>
    </b-dropdown-item>
    <!-- jhipster-needle-add-entity-to-menu - JHipster will add entities to the menu here -->
  </div>
</template>

<script lang="ts" src="./entities-menu.component.ts"></script>
