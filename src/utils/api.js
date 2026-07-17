const API_BASE = 'http://localhost:8082'

export async function api(path, options = {}) {
  const token = localStorage.getItem('token')
  const headers = {
    ...(options.body && !(options.body instanceof FormData)
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  })

  if (response.status === 401) {
    localStorage.clear()
    window.location.href = '/'
    throw new Error('Sesion expirada')
  }

  return response
}
