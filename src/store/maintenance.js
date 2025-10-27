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

export const useMaintenanceStore = defineStore('maintenance', () => {
  const maintenance = ref([])
  const isLoading = ref(false)
  const lastError = ref(null)

  async function fetchMaintenance () {
    isLoading.value = true
    lastError.value = null
    try {
      maintenance.value = await request('/maintenance')
    } catch (error) {
      lastError.value = error
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function addEntry (payload) {
    const entry = await request('/maintenance', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    maintenance.value = [entry, ...maintenance.value]
    return entry
  }

  async function updateEntry (id, patch) {
    const updated = await request(`/maintenance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patch),
    })
    maintenance.value = maintenance.value.map((entry) =>
      entry.id === id ? updated : entry
    )
    return updated
  }

  async function removeEntry (id) {
    await request(`/maintenance/${id}`, { method: 'DELETE' })
    maintenance.value = maintenance.value.filter((entry) => entry.id !== id)
  }

  const totalEntries = computed(() => maintenance.value.length)
  const totalCost = computed(() =>
    maintenance.value.reduce((sum, entry) => sum + (Number(entry.cost) || 0), 0)
  )

  return {
    maintenance,
    isLoading,
    lastError,
    totalEntries,
    totalCost,
    fetchMaintenance,
    addEntry,
    updateEntry,
    removeEntry,
  }
})

