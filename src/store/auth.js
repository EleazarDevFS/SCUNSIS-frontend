import { reactive } from 'vue'

const user = reactive({
  token: localStorage.getItem('token') || null,
  username: localStorage.getItem('username') || null,
  role: localStorage.getItem('role') || null,
  mustChangePassword: localStorage.getItem('mustChangePassword') === 'true',
  isAuthenticated: !!localStorage.getItem('token')
})

export function useAuth() {
  function login(token, username, role, mustChangePassword) {
    user.token = token
    user.username = username
    user.role = role
    user.mustChangePassword = !!mustChangePassword
    user.isAuthenticated = true
    localStorage.setItem('token', token)
    localStorage.setItem('username', username)
    localStorage.setItem('role', role)
    localStorage.setItem('mustChangePassword', mustChangePassword ? 'true' : 'false')
  }

  function updateToken(token) {
    user.token = token
    localStorage.setItem('token', token)
  }

  function logout() {
    user.token = null
    user.username = null
    user.role = null
    user.mustChangePassword = false
    user.isAuthenticated = false
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('role')
    localStorage.removeItem('mustChangePassword')
  }

  return { user, login, updateToken, logout }
}
