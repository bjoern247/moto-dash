import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiRequest } from '../utils/api'

export const useMaintenanceStore = defineStore('maintenance', () => {
  const maintenance = ref([])
  const isLoading = ref(false)
  const lastError = ref(null)

  async function fetchMaintenance () {
    isLoading.value = true
    lastError.value = null
    try {
      maintenance.value = await apiRequest('/maintenance')
    } catch (error) {
      lastError.value = error
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function addEntry (payload) {
    const entry = await apiRequest('/maintenance', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    maintenance.value = [entry, ...maintenance.value]
    return entry
  }

  async function updateEntry (id, patch) {
    const updated = await apiRequest(`/maintenance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patch),
    })
    maintenance.value = maintenance.value.map((entry) =>
      entry.id === id ? updated : entry
    )
    return updated
  }

  async function removeEntry (id) {
    await apiRequest(`/maintenance/${id}`, { method: 'DELETE' })
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

