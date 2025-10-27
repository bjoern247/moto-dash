import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { litersPer100km, costPerKilometer } from '../utils/formatters'

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

export const useFuelStore = defineStore('fuel', () => {
  const entries = ref([])
  const isLoading = ref(false)
  const lastError = ref(null)

  async function fetchEntries () {
    isLoading.value = true
    lastError.value = null
    try {
      entries.value = await request('/fuel')
    } catch (error) {
      lastError.value = error
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function addEntry (payload) {
    const entry = await request('/fuel', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    entries.value = [entry, ...entries.value]
    return entry
  }

  async function updateEntry (id, patch) {
    const updated = await request(`/fuel/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patch),
    })
    entries.value = entries.value.map((entry) =>
      entry.id === id ? updated : entry
    )
    return updated
  }

  async function removeEntry (id) {
    await request(`/fuel/${id}`, { method: 'DELETE' })
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

