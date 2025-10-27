import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiRequest } from '../utils/api'

export const usePartStore = defineStore('parts', () => {
  const parts = ref([])
  const isLoading = ref(false)
  const lastError = ref(null)

  async function fetchParts () {
    isLoading.value = true
    lastError.value = null
    try {
      parts.value = await apiRequest('/parts')
    } catch (error) {
      lastError.value = error
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function addPart (payload) {
    const part = await apiRequest('/parts', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    parts.value = [part, ...parts.value]
    return part
  }

  async function updatePart (id, patch) {
    const updated = await apiRequest(`/parts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patch),
    })
    parts.value = parts.value.map((part) =>
      part.id === id ? updated : part
    )
    return updated
  }

  async function removePart (id) {
    await apiRequest(`/parts/${id}`, { method: 'DELETE' })
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

