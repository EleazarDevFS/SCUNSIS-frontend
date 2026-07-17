<script>
import AsideComponent from './components/AsideComponent.vue';
import ActiveUser from './components/ActiveUser.vue';

export default {
  name: 'App',
  components: {
    AsideComponent,
    ActiveUser
  },
  computed: {
    isLoginPage() {
      return this.$route.path === '/';
    }
  },
  watch: {
    isLoginPage(val) {
      document.body.classList.toggle('login-page', val);
    }
  },
  mounted() {
    document.body.classList.toggle('login-page', this.isLoginPage);
  }
}
</script>
<template>
  <div class="container-app">
    <template v-if="isLoginPage">
      <div class="login-center">
        <router-view />
      </div>
    </template>
    <template v-else>
      <ActiveUser class="header" />
      <div class="layout-body">
        <AsideComponent class="aside" />
        <main class="main-content">
          <router-view />
        </main>
      </div>
    </template>
  </div>
</template>
<style>
.container-app {
  width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-wrap: wrap;
}
.login-center {
  width: 100vw;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.header {
  width: 100%;
  flex: 0 0 auto;
}
.layout-body {
  display: flex;
  flex: 1;
  min-height: 0;
}
.main-content {
  flex: 1;
  min-width: 0;
  height: calc(100vh - 64px);
  overflow-y: auto;
  background: var(--background);
}
.aside {
  width: 260px;
  min-width: 260px;
  flex: 0 0 260px;
}
</style>
