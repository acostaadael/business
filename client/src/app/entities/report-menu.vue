<template>
  <div>
    <b-dropdown-item to="/inventary-param-report">
      <font-awesome-icon icon="fa-store" />
      <span v-text="t$('global.menu.report.inventary')"></span>
    </b-dropdown-item>
    <b-dropdown-item to="/entry-param-report">
      <font-awesome-icon icon="fa-box" />
      <span v-text="t$('global.menu.report.entry')"></span>
    </b-dropdown-item>
    <b-dropdown-item to="/exit-param-report">
      <font-awesome-icon icon="fa-box" />
      <span v-text="t$('global.menu.report.exit')"></span>
    </b-dropdown-item>
    <!-- jhipster-needle-add-entity-to-menu - JHipster will add entities to the menu here -->
  </div>
</template>

<script lang="ts" src="./report-menu.component.ts"></script>
