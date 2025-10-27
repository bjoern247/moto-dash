import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

async function request (path, options) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `API Fehler (${response.status})`)
  }
  if (response.status === 204) return null
  return response.json()
}

export const usePartStore = defineStore('parts', () => {
  const parts = ref([])
  const isLoading = ref(false)
  const lastError = ref(null)

  async function fetchParts () {
    isLoading.value = true
    lastError.value = null
    try {
      parts.value = await request('/parts')
    } catch (error) {
      lastError.value = error
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function addPart (payload) {
    const part = await request('/parts', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    parts.value = [part, ...parts.value]
    return part
  }

  async function updatePart (id, patch) {
    const updated = await request(`/parts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patch),
    })
    parts.value = parts.value.map((part) =>
      part.id === id ? updated : part
    )
    return updated
  }

  async function removePart (id) {
    await request(`/parts/${id}`, { method: 'DELETE' })
    parts.value = parts.value.filter((part) => part.id !== id)
  }

  const totalParts = computed(() => parts.value.length)

  return {
    parts,
    isLoading,
    lastError,
    totalParts,
    fetchParts,
    addPart,
    updatePart,
    removePart,
  }
})

