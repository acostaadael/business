<template>
  <b-navbar data-cy="navbar" toggleable="md" type="dark" class="jh-navbar">
    <!-- Botón menú (siempre visible) -->
    <b-button variant="link" class="jh-left-menu-btn" @click.prevent="openLeftMenu" aria-label="Abrir menú">
      <font-awesome-icon icon="bars" />
    </b-button>

    <!-- Menú lateral izquierdo -->
    <b-sidebar
      id="left-sidebar"
      v-model="leftMenuOpen"
      title="Menu"
      shadow
      backdrop
      bg-variant="light"
      text-variant="dark"
      :width="sidebarWidth"
      @hidden="onSidebarHidden"
      class="jh-left-sidebar"
    >
      <div class="px-3 py-2">
        <b-nav vertical pills class="jh-left-sidebar-nav">
          <b-nav-item to="/" exact @click="closeLeftMenu">
            <font-awesome-icon icon="home" class="mr-2" />
            <span v-text="t$('global.menu.home')"></span>
          </b-nav-item>

          <template v-if="authenticated">
            <details class="jh-left-collapsible" open>
              <summary class="jh-left-collapsible-summary">
                <!-- Misma apariencia/color que un item (Inicio): quitar text-muted -->
                <span class="small text-uppercase" v-text="t$('global.menu.entities.main')"></span>
              </summary>
              <div class="jh-left-collapsible-body">
                <entities-menu></entities-menu>
              </div>
            </details>

            <template v-if="hasAnyAuthority('ROLE_ADMIN')">
              <div class="dropdown-divider my-2"></div>

              <details class="jh-left-collapsible">
                <summary class="jh-left-collapsible-summary">
                  <span class="small text-uppercase" v-text="t$('global.menu.economy.main')"></span>
                </summary>
                <div class="jh-left-collapsible-body">
                  <economy-menu></economy-menu>
                </div>
              </details>

              <div class="dropdown-divider my-2"></div>

              <details class="jh-left-collapsible">
                <summary class="jh-left-collapsible-summary">
                  <span class="small text-uppercase" v-text="t$('global.menu.report.main')"></span>
                </summary>
                <div class="jh-left-collapsible-body">
                  <report-menu></report-menu>
                </div>
              </details>

              <div class="dropdown-divider my-2"></div>

              <details class="jh-left-collapsible">
                <summary class="jh-left-collapsible-summary">
                  <span class="small text-uppercase" v-text="t$('global.menu.admin.main')"></span>
                </summary>
                <div class="jh-left-collapsible-body">
                  <b-nav-item to="/company" @click="closeLeftMenu">
                    <font-awesome-icon icon="asterisk" class="mr-2" />
                    <span v-text="t$('global.menu.admin.company')"></span>
                  </b-nav-item>
                  <b-nav-item to="/admin/user-management" @click="closeLeftMenu">
                    <font-awesome-icon icon="users" class="mr-2" />
                    <span v-text="t$('global.menu.admin.userManagement')"></span>
                  </b-nav-item>
                  <b-nav-item v-if="openAPIEnabled" to="/admin/docs" @click="closeLeftMenu">
                    <font-awesome-icon icon="book" class="mr-2" />
                    <span v-text="t$('global.menu.admin.apidocs')"></span>
                  </b-nav-item>
                </div>
              </details>
              <div class="dropdown-divider my-2"></div>

              <b-nav-item to="cash-register" @click="closeLeftMenu">
                <font-awesome-icon icon="cash-register" class="mr-2" />
                <span>Ventas</span>
              </b-nav-item>
            </template>
          </template>

          <div class="dropdown-divider my-2"></div>

          <!-- Acciones de cuenta removidas del menú lateral -->
          <!--
          <template v-if="authenticated">
            <b-nav-item href="javascript:void(0);" @click="logout(); closeLeftMenu();">
              <font-awesome-icon icon="sign-out-alt" class="mr-2" />
              <span v-text="t$('global.menu.account.logout')"></span>
            </b-nav-item>
          </template>
          -->

          <template v-if="!authenticated">
            <b-nav-item
              href="javascript:void(0);"
              @click="
                openLogin();
                closeLeftMenu();
              "
            >
              <font-awesome-icon icon="sign-in-alt" class="mr-2" />
              <span v-text="t$('global.menu.account.login')"></span>
            </b-nav-item>
          </template>
        </b-nav>
      </div>
    </b-sidebar>

    <b-navbar-brand class="logo" b-link to="/">
      <span class="logo-img"></span>
      <span v-text="t$('global.title')" class="navbar-title"></span>
    </b-navbar-brand>
    <b-navbar-toggle
      right
      class="jh-navbar-toggler d-lg-none"
      href="javascript:void(0);"
      data-toggle="collapse"
      target="header-tabs"
      aria-expanded="false"
      aria-label="Toggle navigation"
      @click.prevent="openLeftMenu"
    >
      <font-awesome-icon icon="bars" />
    </b-navbar-toggle>

    <b-collapse is-nav id="header-tabs">
      <b-navbar-nav class="ml-auto">
        <!-- Inicio removido del menú superior -->
        <!--
        <b-nav-item to="/" exact>
          <span>
            <font-awesome-icon icon="home" />
            <span v-text="t$('global.menu.home')"></span>
          </span>
        </b-nav-item>
        -->

        <b-nav-item-dropdown id="languagesnavBarDropdown" right v-if="languages && Object.keys(languages).length > 1">
          <template #button-content>
            <font-awesome-icon icon="flag" />
            <span class="no-bold" v-text="t$('global.menu.language')"></span>
          </template>
          <b-dropdown-item
            v-for="(value, key) in languages"
            :key="`lang-${key}`"
            @click="changeLanguage(key)"
            :class="{ active: isActiveLanguage(key) }"
          >
            {{ value.name }}
          </b-dropdown-item>
        </b-nav-item-dropdown>

        <b-nav-item-dropdown
          right
          href="javascript:void(0);"
          id="account-menu"
          :class="{ 'router-link-active': subIsActive('/account') }"
          active-class="active"
          class="pointer"
          data-cy="accountMenu"
        >
          <template #button-content>
            <span class="navbar-dropdown-menu">
              <font-awesome-icon icon="user" />
              <span class="no-bold" v-text="t$('global.menu.account.main')"></span>
            </span>
          </template>

          <!-- Encabezado: usuario autenticado -->
          <template v-if="authenticated">
            <b-dropdown-item-button class="jh-account-header" disabled>
              <font-awesome-icon icon="user" />
              <span class="ml-2">{{ username }}</span>
            </b-dropdown-item-button>
            <b-dropdown-divider />
          </template>

          <b-dropdown-item data-cy="settings" to="/account/settings" v-if="authenticated" active-class="active">
            <font-awesome-icon icon="wrench" />
            <span v-text="t$('global.menu.account.settings')"></span>
          </b-dropdown-item>
          <b-dropdown-item data-cy="logout" v-if="authenticated" @click="logout()" id="logout" active-class="active">
            <font-awesome-icon icon="sign-out-alt" />
            <span v-text="t$('global.menu.account.logout')"></span>
          </b-dropdown-item>
          <b-dropdown-item data-cy="login" v-if="!authenticated" @click="openLogin()" id="login" active-class="active">
            <font-awesome-icon icon="sign-in-alt" />
            <span v-text="t$('global.menu.account.login')"></span>
          </b-dropdown-item>
        </b-nav-item-dropdown>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<script lang="ts" src="./jhi-navbar.component.ts"></script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/* ==========================================================================
    Navbar
    ========================================================================== */

.jh-navbar {
  /* Azul claro */
  background-color: #dbeafe; /* tailwind blue-100 */
  padding: 0.2em 1em;
  border-bottom: 1px solid rgba(30, 64, 175, 0.18);
}

/* Texto/links del navbar sobre fondo azul claro */
.jh-navbar :deep(.nav-link),
.jh-navbar :deep(.navbar-brand),
.jh-navbar .no-bold {
  color: #0f172a; /* slate-900 */
}

.jh-navbar :deep(.nav-link:hover),
.jh-navbar :deep(.navbar-brand:hover) {
  color: #0b1220;
}

.jh-navbar a.nav-link,
.jh-navbar .no-bold {
  font-weight: 500;
}

.jh-navbar .jh-navbar-toggler {
  color: #0f172a;
  font-size: 1.5em;
  padding: 10px;
}

.jh-navbar .jh-navbar-toggler:hover {
  color: #0b1220;
}

.jh-left-menu-btn {
  color: #0f172a;
  font-size: 1.35rem;
  padding: 0.25rem 0.5rem;
  text-decoration: none;
}

.jh-left-menu-btn:hover {
  color: #0b1220;
}

.navbar-title {
  display: inline-block;
  color: #0f172a;
}

/* ==========================================================================
    Logo styles
    ========================================================================== */
.navbar-brand.logo {
  padding: 0 7px;
}

.logo .logo-img {
  height: 45px;
  display: inline-block;
  vertical-align: middle;
  width: 45px;
}

.logo-img {
  height: 100%;
  background: url('../../../content/images/logo-jhipster.png') no-repeat center center;
  background-size: contain;
  width: 100%;
  filter: drop-shadow(0 0 0.05rem white);
  margin: 0 5px;
}

/* ==========================================================================
    Sidebar styles
    ========================================================================== */
.jh-left-sidebar {
  z-index: 1050;
}

.jh-left-sidebar :deep(.b-sidebar) {
  background-color: #dbeafe; /* mismo azul claro */
  color: #0f172a;
}

.jh-left-sidebar :deep(.b-sidebar-header) {
  background-color: #dbeafe;
  color: #0f172a;
  border-bottom: 1px solid rgba(30, 64, 175, 0.18);
}

.jh-left-sidebar :deep(.b-sidebar-backdrop) {
  background-color: rgba(15, 23, 42, 0.25);
}

.jh-left-sidebar-nav :deep(a.nav-link) {
  color: #0f172a;
}

.jh-left-sidebar-nav :deep(a.nav-link:hover) {
  color: #0f172a;
  background-color: rgba(30, 64, 175, 0.1);
}

.jh-left-sidebar-nav :deep(a.nav-link.active) {
  background-color: rgba(30, 64, 175, 0.18);
  color: #0f172a;
}

/* Left menu: uniformar color de todos los items igual que 'Compañias' */
.jh-left-sidebar-nav :deep(a.nav-link),
.jh-left-sidebar-nav :deep(.dropdown-item),
.jh-left-sidebar-nav :deep(a),
.jh-left-sidebar-nav :deep(.nav-item > a) {
  color: #0f172a !important;
}

.jh-left-sidebar-nav :deep(a.nav-link:hover),
.jh-left-sidebar-nav :deep(.dropdown-item:hover),
.jh-left-sidebar-nav :deep(a:hover) {
  color: #0f172a !important;
}

.jh-left-sidebar-nav :deep(a.nav-link.active),
.jh-left-sidebar-nav :deep(.dropdown-item.active) {
  color: #0f172a !important;
}

.jh-left-collapsible {
  margin: 0.25rem 0;
}

.jh-left-collapsible-summary {
  list-style: none;
  cursor: pointer;
  padding: 0.35rem 0.5rem;
  border-radius: 0.25rem;
  color: #0f172a;
}

.jh-left-collapsible-summary::-webkit-details-marker {
  display: none;
}

.jh-left-collapsible-summary:hover {
  background-color: rgba(30, 64, 175, 0.1);
}

.jh-left-collapsible-body {
  padding-left: 0.25rem;
}

/* Texto muted para cabeceras de secciones */
.jh-left-sidebar :deep(.text-muted) {
  color: rgba(15, 23, 42, 0.65) !important;
}

/* Asegura que los íconos (FontAwesome svg) hereden el mismo color del texto del navbar */
.jh-navbar :deep(svg),
.jh-navbar :deep(.svg-inline--fa) {
  color: currentColor;
  fill: currentColor;
}

/* En el dropdown de idioma, fuerza el mismo color para el ícono y el label */
.jh-navbar :deep(#languagesnavBarDropdown__BV_toggle_),
.jh-navbar :deep(#languagesnavBarDropdown__BV_toggle_ svg),
.jh-navbar :deep(#languagesnavBarDropdown__BV_toggle_ .svg-inline--fa) {
  color: #0f172a;
  fill: #0f172a;
}

.jh-navbar :deep(#languagesnavBarDropdown__BV_toggle_:hover),
.jh-navbar :deep(#languagesnavBarDropdown__BV_toggle_:hover svg),
.jh-navbar :deep(#languagesnavBarDropdown__BV_toggle_:hover .svg-inline--fa) {
  color: #0b1220;
  fill: #0b1220;
}

/* En el dropdown de cuenta, fuerza el mismo color para el ícono y el label */
.jh-navbar :deep(#account-menu__BV_toggle_),
.jh-navbar :deep(#account-menu__BV_toggle_ svg),
.jh-navbar :deep(#account-menu__BV_toggle_ .svg-inline--fa) {
  color: #0f172a;
  fill: #0f172a;
}

.jh-navbar :deep(#account-menu__BV_toggle_:hover),
.jh-navbar :deep(#account-menu__BV_toggle_:hover svg),
.jh-navbar :deep(#account-menu__BV_toggle_:hover .svg-inline--fa) {
  color: #0b1220;
  fill: #0b1220;
}

.jh-account-header {
  opacity: 1;
  font-weight: 600;
  cursor: default;
}

.jh-account-header:deep(svg),
.jh-account-header :deep(svg),
.jh-account-header :deep(.svg-inline--fa) {
  color: #0f172a;
  fill: #0f172a;
}
</style>
