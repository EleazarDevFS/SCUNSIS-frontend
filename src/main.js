import './style.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'scunsisTheme',
    themes: {
      scunsisTheme: {
        dark: false,
        colors: {
          primary: '#7C0A02',
          secondary: '#2C3E50',
          accent: '#A11A1A',
          surface: '#FFFFFF',
          background: '#F5F2F0',
          error: '#DC2626',
          info: '#2563EB',
          success: '#16A34A',
          warning: '#D97706',
        }
      }
    }
  }
})

const app = createApp(App)
app.use(Toast, {
  position: 'bottom-right',
  timeout: 3000,
  transition: 'Vue-Toastification__bounce',
  maxToasts: 5,
  newestOnTop: true
}).use(router).use(vuetify)
app.mount('#app')
