<script>
export default {
  name: 'InicioView',
  methods: {
    goTo(path) {
      this.$router.push(path);
    }
  }
}
</script>
<template>
  <div class="inicio-container">
    <div class="welcome-section">
      <div class="welcome-badge">Panel principal</div>
      <h1 class="welcome-title">Bienvenido al Sistema de Constancias</h1>
      <p class="welcome-subtitle">Selecciona una opción para comenzar</p>
    </div>
    <div class="shortcuts-grid">
      <div class="shortcut-card" @click="goTo('genera_constancias')">
        <div class="card-accent-line"></div>
        <div class="card-icon-wrap">
          <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="currentColor">
            <path d="M440-280h80v-160h160v-80H520v-160h-80v160H280v80h160v160Zm40 200q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
          </svg>
        </div>
        <div class="card-body">
          <h3 class="card-title">Generar constancia(s)</h3>
          <p class="card-desc">Crear constancias para participantes, ponentes, organizadores y más</p>
        </div>
        <div class="card-arrow">
          <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
            <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/>
          </svg>
        </div>
      </div>
      <div class="shortcut-card" @click="goTo('/historial')">
        <div class="card-accent-line"></div>
        <div class="card-icon-wrap">
          <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="currentColor">
            <path d="M480-120q-138 0-240.5-91.5T122-440h82q14 104 92.5 172T480-200q117 0 198.5-81.5T760-480q0-117-81.5-198.5T480-760q-69 0-129 32t-101 88h110v80H120v-240h80v94q51-64 124.5-99T480-840q75 0 140.5 28.5t114 77q48.5 48.5 77 114T840-480q0 75-28.5 140.5t-77 114q-48.5 48.5-114 77T480-120Zm112-192L440-464v-216h80v184l128 128-56 56Z"/>
          </svg>
        </div>
        <div class="card-body">
          <h3 class="card-title">Historial</h3>
          <p class="card-desc">Consultar, descargar y administrar constancias emitidas</p>
        </div>
        <div class="card-arrow">
          <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
            <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.inicio-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: 48px;
  gap: 48px;
}

.welcome-section {
  text-align: center;
}

.welcome-badge {
  display: inline-block;
  padding: 4px 14px;
  background: var(--primary-bg);
  color: var(--primary);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-radius: 20px;
  margin-bottom: 16px;
}

.welcome-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.welcome-subtitle {
  font-size: 1.05rem;
  color: var(--text-secondary);
}

.shortcuts-grid {
  display: flex;
  gap: 28px;
  flex-wrap: wrap;
  justify-content: center;
}

.shortcut-card {
  background: var(--surface);
  border-radius: 16px;
  width: 320px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.shortcut-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 40px -12px rgba(var(--primary-rgb), 0.15), var(--shadow-lg);
  border-color: var(--primary);
}

.card-accent-line {
  height: 4px;
  background: linear-gradient(90deg, var(--primary), #c0392b);
  flex-shrink: 0;
}

.card-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--primary-bg), #fff);
  color: var(--primary);
  margin: 24px 0 0 24px;
  flex-shrink: 0;
}

.card-body {
  padding: 20px 24px 24px;
}

.card-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.card-desc {
  font-size: 0.88rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.card-arrow {
  position: absolute;
  bottom: 20px;
  right: 20px;
  color: var(--border);
  transition: all 0.3s ease;
}

.shortcut-card:hover .card-arrow {
  color: var(--primary);
  transform: translateX(4px);
}
</style>
