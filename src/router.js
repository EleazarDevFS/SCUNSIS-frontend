import { createRouter, createWebHistory } from 'vue-router'
import LoginView from './views/LoginView.vue'
import HomeView from './views/InicioView.vue'
import GenConsView from './views/GenConsView.vue'
import HistorialView from './views/HistorialView.vue'
import ConfiguracionView from './views/ConfiguracionView.vue'
import ChangePasswordView from './views/ChangePasswordView.vue'

const routes = [
  { path: '/', component: LoginView },
  { path: '/cambiar-contrasenia', component: ChangePasswordView, meta: { requiresAuth: true } },
  { path: '/inicio', component: HomeView, meta: { requiresAuth: true } },
  { path: '/genera_constancias', component: GenConsView, meta: { requiresAuth: true } },
  { path: '/historial', component: HistorialView, meta: { requiresAuth: true } },
  { path: '/configuracion', component: ConfiguracionView, meta: { requiresAuth: true, requiresRole: 'ADMIN' } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')
  const mustChangePassword = localStorage.getItem('mustChangePassword') === 'true'

  if (to.meta.requiresAuth && !token) {
    next('/')
    return
  }

  if (to.meta.requiresRole && to.meta.requiresRole !== role) {
    next('/inicio')
    return
  }

  if (to.path === '/' && token) {
    if (mustChangePassword) {
      next('/cambiar-contrasenia')
    } else {
      next('/inicio')
    }
    return
  }

  if (token && mustChangePassword && to.path !== '/cambiar-contrasenia') {
    next('/cambiar-contrasenia')
    return
  }

  next()
})

export default router
