<template>
  <div class="home row">
    <div class="col-md-3">
      <span class="hipster img-fluid rounded"></span>
    </div>
    <div class="col-md-9">
      <h1 class="display-4" v-text="t$('home.title')"></h1>
      <p class="lead" v-text="t$('home.subtitle')"></p>
      <div>
        <div class="alert alert-success" v-if="authenticated">
          <span v-if="username" v-text="t$('home.logged.message', { username: username })"></span>
        </div>
        <div class="alert alert-success" v-if="ifOpenPeriod && authenticated">
          <span v-text="t$('home.openPeriod.message', { month: ifOpenPeriod?.month, year: ifOpenPeriod?.year })"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./home.component.ts"></script>
