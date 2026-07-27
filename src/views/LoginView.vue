<script setup>
import { ref } from 'vue'
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router'
import Logo from '../components/Logo.vue'
import { useAuth } from '../store/auth.js'

const toast = useToast()
const router = useRouter()
const { login: authLogin } = useAuth()

const username = ref('')
const password = ref('')
const loading = ref(false)

async function login() {
  if (!username.value || !password.value) {
    toast.error('Por favor ingresa usuario y contraseña')
    return
  }
  loading.value = true
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value })
    })
    const data = await response.json()
    if (response.ok && data.success) {
      authLogin(data.token, data.username, data.role, data.mustChangePassword)
      toast.success('¡Iniciaste sesión exitosamente!')
      setTimeout(() => {
        if (data.mustChangePassword) {
          router.push('/cambiar-contrasenia')
        } else {
          router.push('/inicio')
        }
      }, 300)
    } else {
      toast.error(data.message || 'Error al iniciar sesión')
    }
  } catch (err) {
    toast.error('No se pudo conectar al servidor')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="brand-panel">
        <div class="brand-content">
          <Logo class="brand-logo" />
          <h1 class="brand-title">SC-UNSIS</h1>
          <p class="brand-sub">Sistema de Constancias Universitarias</p>
          <div class="brand-divider"></div>
          <p class="brand-desc">Gestión eficiente de constancias académicas y reconocimientos</p>
          <div class="brand-features">
            <span class="feature"><svg xmlns="http://www.w3.org/2000/svg" height="14px" viewBox="0 -960 960 960" width="14px" fill="currentColor"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg> Generación automatizada</span>
            <span class="feature"><svg xmlns="http://www.w3.org/2000/svg" height="14px" viewBox="0 -960 960 960" width="14px" fill="currentColor"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg> Carga masiva Excel</span>
            <span class="feature"><svg xmlns="http://www.w3.org/2000/svg" height="14px" viewBox="0 -960 960 960" width="14px" fill="currentColor"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg> Historial completo</span>
          </div>
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
            <h2 class="form-title">Bienvenido</h2>
            <p class="form-sub">Ingresa tus credenciales para acceder</p>
          </div>
          <form @submit.prevent="login" class="login-form">
            <div class="field-group">
              <label class="field-label">
                <svg xmlns="http://www.w3.org/2000/svg" height="14px" viewBox="0 -960 960 960" width="14px" fill="currentColor"><path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm0-80q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560ZM160-160v-112q0-34 17.5-62.5T224-346q62-31 126-46.5T480-408q66 0 130 15.5T736-346q29 15 46.5 43.5T800-240v112H160Zm80-80h480v-32q0-11-5.5-20T700-290q-54-27-109-40.5T480-344q-56 0-111 13.5T260-290q-9 5-14.5 14t-5.5 20v32Z"/></svg>
                Usuario
              </label>
              <div class="input-wrapper">
                <input v-model="username" type="text" placeholder="Ingresa tu usuario" />
              </div>
            </div>
            <div class="field-group">
              <label class="field-label">
                <svg xmlns="http://www.w3.org/2000/svg" height="14px" viewBox="0 -960 960 960" width="14px" fill="currentColor"><path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm240-120q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80Z"/></svg>
                Contraseña
              </label>
              <div class="input-wrapper">
                <input v-model="password" type="password" placeholder="Ingresa tu contraseña" />
              </div>
            </div>
            <v-btn
              color="primary"
              variant="flat"
              size="large"
              block
              :loading="loading"
              @click="login"
              class="login-btn"
            >
              Iniciar sesión
            </v-btn>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-wrapper {
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

.login-card {
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

/* ---- Brand Panel (left) ---- */
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
  font-size: 0.82rem;
  opacity: 0.6;
  line-height: 1.6;
  margin-bottom: 24px;
}

.brand-features {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
  max-width: 220px;
  margin: 0 auto;
}

.feature {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  opacity: 0.7;
}

.feature svg {
  flex-shrink: 0;
  color: #4ade80;
}

/* Shapes decoration */
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

/* ---- Form Panel (right) ---- */
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
}

.form-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.form-sub {
  font-size: 0.88rem;
  color: var(--text-secondary);
}

.login-form {
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

.input-wrapper input:hover:not(:focus) {
  border-color: #d1d5db;
}

.login-btn {
  margin-top: 4px;
  height: 48px;
  font-weight: 700;
  font-size: 0.95rem;
  text-transform: none;
  letter-spacing: 0.5px;
  border-radius: 10px;
  box-shadow: 0 4px 14px rgba(var(--primary-rgb), 0.25);
  transition: all 0.25s ease;
}

.login-btn:hover {
  box-shadow: 0 6px 20px rgba(var(--primary-rgb), 0.35);
  transform: translateY(-1px);
}

/* ---- Responsive ---- */
@media (max-width: 700px) {
  .login-card {
    flex-direction: column;
    max-width: 400px;
  }
  .brand-panel {
    flex: 0 0 auto;
    padding: 32px 24px;
  }
  .brand-features { display: none; }
  .brand-desc { display: none; }
  .form-panel {
    padding: 28px 24px;
  }
}
</style>
