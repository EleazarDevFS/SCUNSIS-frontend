<script>
import AsideComponent from './components/AsideComponent.vue';
import ActiveUser from './components/ActiveUser.vue';

export default {
  name: 'App',
  components: {
    AsideComponent,
    ActiveUser
  },
  mounted() {
    if (window.location.pathname !== '/') {
      document.body.style.background = '#EBE7E7';
    }
  }
}
</script>
<template>
  <div class="container-app">
    <template v-if="$route.path === '/'">
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
* {
  font-family: 'Poppins', sans-serif;
}
.login-center {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.container-app {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-wrap: wrap;
}
.header {
  width: 100%;
}
.layout-body {
  display: flex;
  flex-direction: row;
  flex: 1;
  height: calc(100vh - 80px);
  min-height: 0;
}
.main-content {
  flex: 1 1 0%;
  min-width: 0;
  height: 100vh;
  overflow-y: auto;
}
.aside {
  height: 100vh;
  width: 300px;
  min-width: 250px;
  max-width: 200px;
  flex: 0 0 250px;
  box-sizing: border-box;
}
</style>
