import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { litersPer100km, costPerKilometer } from '../utils/formatters'
import { apiRequest } from '../utils/api'

export const useFuelStore = defineStore('fuel', () => {
  const entries = ref([])
  const isLoading = ref(false)
  const lastError = ref(null)

  async function fetchEntries () {
    isLoading.value = true
    lastError.value = null
    try {
      entries.value = await apiRequest('/fuel')
    } catch (error) {
      lastError.value = error
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function addEntry (payload) {
    const entry = await apiRequest('/fuel', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    entries.value = [entry, ...entries.value]
    return entry
  }

  async function updateEntry (id, patch) {
    const updated = await apiRequest(`/fuel/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patch),
    })
    entries.value = entries.value.map((entry) =>
      entry.id === id ? updated : entry
    )
    return updated
  }

  async function removeEntry (id) {
    await apiRequest(`/fuel/${id}`, { method: 'DELETE' })
    entries.value = entries.value.filter((entry) => entry.id !== id)
  }

  const totalEntries = computed(() => entries.value.length)
  const totalLiters = computed(() =>
    entries.value.reduce((sum, entry) => sum + (Number(entry.liters) || 0), 0)
  )
  const totalCost = computed(() =>
    entries.value.reduce((sum, entry) => sum + (Number(entry.cost) || 0), 0)
  )

  const averageConsumption = computed(() => {
    const fallback = {
      lPer100km: 0,
      costPerKm: 0,
    }

    if (!entries.value.length) {
      return fallback
    }
    const stats = entries.value.reduce(
      (acc, entry) => {
        const liters = Number(entry.liters) || 0
        const distance = Number(entry.distance) || 0
        const cost = Number(entry.cost) || 0
        acc.totalLiters += liters
        acc.totalDistance += distance
        acc.totalCost += cost
        return acc
      },
      { totalLiters: 0, totalDistance: 0, totalCost: 0 }
    )

    return {
      lPer100km: litersPer100km(stats.totalLiters, stats.totalDistance),
      costPerKm: costPerKilometer(stats.totalCost, stats.totalDistance),
    }
  })

  return {
    entries,
    isLoading,
    lastError,
    totalEntries,
    totalLiters,
    totalCost,
    averageConsumption,
    fetchEntries,
    addEntry,
    updateEntry,
    removeEntry,
  }
})

