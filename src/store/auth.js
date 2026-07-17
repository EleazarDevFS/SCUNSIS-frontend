import { reactive } from 'vue'

const user = reactive({
  token: localStorage.getItem('token') || null,
  username: localStorage.getItem('username') || null,
  role: localStorage.getItem('role') || null,
  isAuthenticated: !!localStorage.getItem('token')
})

export function useAuth() {
  function login(token, username, role) {
    user.token = token
    user.username = username
    user.role = role
    user.isAuthenticated = true
    localStorage.setItem('token', token)
    localStorage.setItem('username', username)
    localStorage.setItem('role', role)
  }

  function logout() {
    user.token = null
    user.username = null
    user.role = null
    user.isAuthenticated = false
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('role')
  }

  return { user, login, logout }
}
