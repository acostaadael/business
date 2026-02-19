<template>
  <div>
    <b-dropdown-item href="http://localhost:8080/api/reports/inventaries" target="_blank">
      <font-awesome-icon icon="fa-store" />
      <span v-text="t$('global.menu.report.inventary')"></span>
    </b-dropdown-item>
    <!-- jhipster-needle-add-entity-to-menu - JHipster will add entities to the menu here -->
  </div>
</template>

<script lang="ts" src="./report-menu.component.ts"></script>
