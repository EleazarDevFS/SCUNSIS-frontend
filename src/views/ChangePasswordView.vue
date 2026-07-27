<script setup>
import { ref } from 'vue'
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router'
import Logo from '../components/Logo.vue'
import { useAuth } from '../store/auth.js'
import { api } from '../utils/api.js'

const toast = useToast()
const router = useRouter()
const { user, logout } = useAuth()

const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)

async function changePassword() {
  if (!newPassword.value || !confirmPassword.value) {
    toast.error('Por favor completa todos los campos')
    return
  }
  if (newPassword.value.length < 4) {
    toast.error('La contraseña debe tener al menos 4 caracteres')
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    toast.error('Las contraseñas no coinciden')
    return
  }
  loading.value = true
  try {
    const response = await api('/api/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword: newPassword.value })
    })
    if (response.ok) {
      toast.success('Contraseña actualizada exitosamente')
      logout()
      setTimeout(() => router.push('/'), 300)
    } else {
      const data = await response.json()
      toast.error(data.message || 'Error al cambiar contraseña')
    }
  } catch {
    toast.error('No se pudo conectar al servidor')
  } finally {
    loading.value = false
  }
}

function cancel() {
  logout()
  router.push('/')
}
</script>

<template>
  <div class="change-password-wrapper">
    <div class="change-card">
      <div class="brand-panel">
        <div class="brand-content">
          <Logo class="brand-logo" />
          <h1 class="brand-title">SC-UNSIS</h1>
          <p class="brand-sub">Sistema de Constancias Universitarias</p>
          <div class="brand-divider"></div>
          <p class="brand-desc">Bienvenido, {{ user.username || 'usuario' }}. Por seguridad debes cambiar tu contraseña.</p>
        </div>
        <div class="brand-bg-shapes">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
          <div class="shape shape-3"></div>
        </div>
      </div>
      <div class="form-panel">
        <div class="form-container">
          <div class="form-header">
            <div class="lock-icon">
              <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="var(--primary)"><path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm240-120q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80Z"/></svg>
            </div>
            <h2 class="form-title">Cambiar contraseña</h2>
            <p class="form-sub">Este es tu primer inicio de sesión. Establece una nueva contraseña.</p>
          </div>
          <form @submit.prevent="changePassword" class="change-form">
            <div class="field-group">
              <label class="field-label">Nueva contraseña</label>
              <div class="input-wrapper">
                <input v-model="newPassword" type="password" placeholder="Nueva contraseña" minlength="4" />
              </div>
            </div>
            <div class="field-group">
              <label class="field-label">Confirmar contraseña</label>
              <div class="input-wrapper">
                <input v-model="confirmPassword" type="password" placeholder="Repite la contraseña" minlength="4" />
              </div>
            </div>
            <v-btn
              color="primary"
              variant="flat"
              size="large"
              block
              :loading="loading"
              @click="changePassword"
              class="change-btn"
            >
              Cambiar contraseña
            </v-btn>
            <v-btn
              variant="text"
              size="small"
              block
              @click="cancel"
              class="cancel-btn"
            >
              Cerrar sesión
            </v-btn>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.change-password-wrapper {
  position: relative;
  z-index: 1;
  animation: fadeInUp 0.7s ease;
  width: 100%;
  display: flex;
  justify-content: center;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.change-card {
  display: flex;
  width: 100%;
  max-width: 820px;
  min-height: 520px;
  background: #fff;
  border-radius: 24px;
  overflow: hidden;
  box-shadow:
    0 30px 60px -15px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.08);
}

.brand-panel {
  flex: 0 0 360px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(160deg, #1a0a0a 0%, #2d0a05 30%, #7C0A02 70%, #5c0800 100%);
  overflow: hidden;
  padding: 40px 32px;
}

.brand-content {
  position: relative;
  z-index: 2;
  text-align: center;
  color: #fff;
}

.brand-logo {
  margin-bottom: 16px;
}

.brand-logo :deep(img) {
  width: 80px;
  padding: 4px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
}

.brand-title {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  margin-bottom: 4px;
}

.brand-sub {
  font-size: 0.9rem;
  opacity: 0.75;
  font-weight: 500;
  margin-bottom: 20px;
}

.brand-divider {
  width: 48px;
  height: 3px;
  background: linear-gradient(90deg, rgba(255,255,255,0.8), rgba(255,255,255,0.2));
  border-radius: 2px;
  margin: 0 auto 20px;
}

.brand-desc {
  font-size: 0.85rem;
  opacity: 0.7;
  line-height: 1.5;
}

.brand-bg-shapes {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.08;
}

.shape-1 {
  width: 300px;
  height: 300px;
  background: #fff;
  top: -100px;
  right: -80px;
}

.shape-2 {
  width: 200px;
  height: 200px;
  background: #fff;
  bottom: -60px;
  left: -60px;
}

.shape-3 {
  width: 120px;
  height: 120px;
  background: #fff;
  bottom: 100px;
  right: -30px;
}

.form-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: #fff;
}

.form-container {
  width: 100%;
  max-width: 340px;
}

.form-header {
  margin-bottom: 28px;
  text-align: center;
}

.lock-icon {
  margin-bottom: 12px;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.form-sub {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.change-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.input-wrapper input {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid var(--border);
  border-radius: 10px;
  font-size: 0.92rem;
  background: var(--background);
  color: var(--text-primary);
  transition: all 0.25s ease;
  outline: none;
  box-sizing: border-box;
}

.input-wrapper input::placeholder {
  color: var(--text-muted);
  font-weight: 400;
}

.input-wrapper input:focus {
  border-color: var(--primary);
  background: var(--surface);
  box-shadow: 0 0 0 4px rgba(var(--primary-rgb), 0.1);
}

.change-btn {
  margin-top: 4px;
  height: 48px;
  font-weight: 700;
  font-size: 0.95rem;
  text-transform: none;
  letter-spacing: 0.5px;
  border-radius: 10px;
  box-shadow: 0 4px 14px rgba(var(--primary-rgb), 0.25);
}

.cancel-btn {
  color: var(--text-muted);
}

@media (max-width: 700px) {
  .change-card {
    flex-direction: column;
    max-width: 400px;
  }
  .brand-panel {
    flex: 0 0 auto;
    padding: 32px 24px;
  }
  .brand-desc { display: none; }
  .form-panel {
    padding: 28px 24px;
  }
}
</style>
