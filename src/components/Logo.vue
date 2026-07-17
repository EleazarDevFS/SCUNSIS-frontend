<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
const goToHome = () => {
  router.push('/inicio');
}
</script>
<template>
    <div id="logo" @click="goToHome" :class="{ clickable: $route.path !== '/' }">
      <img src="/public/img/image copy.png" alt="Logo UNSIS" />
    </div>
</template>

<style scoped>
#logo {
  display: flex;
  align-items: center;
  justify-content: center;
}

#logo.clickable {
  cursor: pointer;
}

#logo img {
  width: 64px;
  height: auto;
}
</style>
