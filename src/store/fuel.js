import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { litersPer100km, costPerKilometer } from '../utils/formatters'
import { collection, addDoc, deleteDoc, doc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'

export const useFuelStore = defineStore('fuel', () => {
  const entries = ref([])
  const isLoading = ref(false)
  const lastError = ref(null)

  async function fetchEntries () {
    isLoading.value = true
    lastError.value = null
    try {
      const q = query(collection(db, 'fuel'), orderBy('date', 'desc'))
      const snapshot = await getDocs(q)
      entries.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    } catch (error) {
      lastError.value = error
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function addEntry (payload) {
    const docRef = await addDoc(collection(db, 'fuel'), {
      createdAt: new Date().toISOString(),
      ...payload,
    })
    entries.value = [{ id: docRef.id, ...payload }, ...entries.value]
    return { id: docRef.id, ...payload }
  }

  async function updateEntry (id, patch) {
    await updateDoc(doc(db, 'fuel', id), {
      ...patch,
      updatedAt: new Date().toISOString(),
    })
    entries.value = entries.value.map((entry) =>
      entry.id === id ? { ...entry, ...patch } : entry
    )
    return entries.value.find((entry) => entry.id === id)
  }

  async function removeEntry (id) {
    await deleteDoc(doc(db, 'fuel', id))
    entries.value = entries.value.filter((entry) => entry.id !== id)
  }

  const totalEntries = computed(() => entries.value.length)
  const totalLiters = computed(() =>
    entries.value.reduce((sum, entry) => sum + (Number(entry.liters) || 0), 0)
  )
  const totalCost = computed(() =>
    entries.value.reduce((sum, entry) => sum + (Number(entry.cost) || 0), 0)
  )
  const totalDistance = computed(() =>
    entries.value.reduce((sum, entry) => sum + (Number(entry.distance) || 0), 0)
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
    totalDistance,
    averageConsumption,
    fetchEntries,
    addEntry,
    updateEntry,
    removeEntry,
  }
})

