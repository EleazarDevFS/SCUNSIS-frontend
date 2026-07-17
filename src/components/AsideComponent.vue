<script>
import { useAuth } from '../store/auth.js';
import { useRoute } from 'vue-router';

export default {
  data() {
    return {
      navItems: [
        { view: 'InicioView', path: '/inicio', label: 'Inicio', icon: 'home' },
        { view: 'GenConsView', path: '/genera_constancias', label: 'Generar Constancia(s)', icon: 'add' },
        { view: 'HistorialView', path: '/historial', label: 'Historial', icon: 'history' },
        { view: 'ConfiguracionView', path: '/configuracion', label: 'Configuración', icon: 'settings' },
      ]
    };
  },
  computed: {
    currentPath() {
      return this.$route.path;
    }
  },
  methods: {
    isActive(path) {
      return this.currentPath === path;
    },
    goTo(path) {
      this.$router.push(path);
    },
    logOut() {
      const { logout } = useAuth();
      logout();
      this.$router.push('/');
    }
  }
}
</script>
<template>
  <aside class="sidebar">
    <nav class="sidebar-nav">
      <button
        v-for="item in navItems"
        :key="item.view"
        class="nav-item"
        :class="{ active: isActive(item.path) }"
        @click="goTo(item.path)"
      >
        <svg v-if="item.icon === 'home'" xmlns="http://www.w3.org/2000/svg" height="22px" viewBox="0 -960 960 960" width="22px" fill="currentColor">
          <path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z"/>
        </svg>
        <svg v-if="item.icon === 'add'" xmlns="http://www.w3.org/2000/svg" height="22px" viewBox="0 -960 960 960" width="22px" fill="currentColor">
          <path d="M440-280h80v-160h160v-80H520v-160h-80v160H280v80h160v160Zm40 200q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
        </svg>
        <svg v-if="item.icon === 'history'" xmlns="http://www.w3.org/2000/svg" height="22px" viewBox="0 -960 960 960" width="22px" fill="currentColor">
          <path d="M480-120q-138 0-240.5-91.5T122-440h82q14 104 92.5 172T480-200q117 0 198.5-81.5T760-480q0-117-81.5-198.5T480-760q-69 0-129 32t-101 88h110v80H120v-240h80v94q51-64 124.5-99T480-840q75 0 140.5 28.5t114 77q48.5 48.5 77 114T840-480q0 75-28.5 140.5t-77 114q-48.5 48.5-114 77T480-120Zm112-192L440-464v-216h80v184l128 128-56 56Z"/>
        </svg>
        <svg v-if="item.icon === 'settings'" xmlns="http://www.w3.org/2000/svg" height="22px" viewBox="0 -960 960 960" width="22px" fill="currentColor">
          <path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z"/>
        </svg>
        <span class="nav-label">{{ item.label }}</span>
      </button>
    </nav>
    <div class="sidebar-footer">
      <button class="nav-item logout-btn" @click="logOut">
        <svg xmlns="http://www.w3.org/2000/svg" height="22px" viewBox="0 -960 960 960" width="22px" fill="currentColor">
          <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z"/>
        </svg>
        <span class="nav-label">Cerrar sesión</span>
      </button>
    </div>
  </aside>
</template>
<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--sidebar-bg);
  color: var(--sidebar-text);
  overflow-y: auto;
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px 12px;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: var(--sidebar-text);
  cursor: pointer;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-weight: 500;
  text-align: left;
  transition: all var(--transition);
  width: 100%;
}

.nav-item:hover {
  background: var(--sidebar-hover);
  color: #fff;
}

.nav-item.active {
  background: var(--sidebar-active);
  color: #fff;
}

.nav-label {
  white-space: nowrap;
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid rgba(255,255,255,0.06);
}

.logout-btn {
  color: var(--sidebar-text);
}
.logout-btn:hover {
  background: rgba(220, 38, 38, 0.12);
  color: #ef4444;
}
</style>
