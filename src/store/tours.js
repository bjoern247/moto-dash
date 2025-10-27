import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiRequest } from '../utils/api'

export const useTourStore = defineStore('tours', () => {
  const tours = ref([])
  const isLoading = ref(false)
  const lastError = ref(null)

  async function fetchTours () {
    isLoading.value = true
    lastError.value = null
    try {
      tours.value = await apiRequest('/tours')
    } catch (error) {
      lastError.value = error
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function addTour (payload) {
    const tour = await apiRequest('/tours', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    tours.value = [tour, ...tours.value]
    return tour
  }

  async function updateTour (id, patch) {
    const updated = await apiRequest(`/tours/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patch),
    })
    tours.value = tours.value.map((tour) =>
      tour.id === id ? updated : tour
    )
    return updated
  }

  async function removeTour (id) {
    await apiRequest(`/tours/${id}`, { method: 'DELETE' })
    tours.value = tours.value.filter((tour) => tour.id !== id)
  }

  const totalTours = computed(() => tours.value.length)
  const totalDistance = computed(() =>
    tours.value.reduce((sum, tour) => sum + (Number(tour.distance) || 0), 0)
  )

  return {
    tours,
    isLoading,
    lastError,
    totalTours,
    totalDistance,
    fetchTours,
    addTour,
    updateTour,
    removeTour,
  }
})

