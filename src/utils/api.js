const DEFAULT_API_URL = 'http://192.168.178.41:4000'

export const API_URL = import.meta.env.VITE_API_URL ?? DEFAULT_API_URL

export async function apiRequest (path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `API Fehler (${response.status})`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

