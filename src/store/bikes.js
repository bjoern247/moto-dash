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

export const useBikeStore = defineStore('bikes', () => {
  const bikes = ref([])
  const isLoading = ref(false)
  const lastError = ref(null)

  async function fetchBikes () {
    isLoading.value = true
    lastError.value = null
    try {
      bikes.value = await request('/bikes')
    } catch (error) {
      lastError.value = error
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function addBike (payload) {
    const bike = await request('/bikes', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    bikes.value = [bike, ...bikes.value]
    return bike
  }

  async function updateBike (id, patch) {
    const updated = await request(`/bikes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patch),
    })
    bikes.value = bikes.value.map((bike) =>
      bike.id === id ? updated : bike
    )
    return updated
  }

  async function removeBike (id) {
    await request(`/bikes/${id}`, { method: 'DELETE' })
    bikes.value = bikes.value.filter((bike) => bike.id !== id)
  }

  const totalCount = computed(() => bikes.value.length)
  const totalMileage = computed(() =>
    bikes.value.reduce((sum, bike) => sum + (Number(bike.mileage) || 0), 0)
  )

  return {
    bikes,
    isLoading,
    lastError,
    totalCount,
    totalMileage,
    fetchBikes,
    addBike,
    updateBike,
    removeBike,
  }
})

