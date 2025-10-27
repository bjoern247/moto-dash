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
      entries.value = snapshot.docs.map((doc) => normalizeEntry(doc.id, doc.data()))
    } catch (error) {
      lastError.value = error
      throw error
    } finally {
      isLoading.value = false
    }
  }

  function normalizeEntry (id, data) {
    const liters = Number(data.liters) || 0
    const pricePerLiter = Number(data.pricePerLiter ?? data.unitPrice ?? data.cost ?? 0)
    const totalCost = Number(data.totalCost ?? liters * pricePerLiter)
    const distance = Number(data.distance) || 0

    return {
      id,
      bikeId: data.bikeId ?? null,
      date: data.date ?? new Date().toISOString().slice(0, 10),
      notes: data.notes ?? '',
      liters,
      distance,
      pricePerLiter,
      totalCost,
    }
  }

  async function addEntry (payload) {
    const liters = Number(payload.liters) || 0
    const pricePerLiter = Number(payload.cost) || 0
    const totalCost = liters * pricePerLiter

    const docRef = await addDoc(collection(db, 'fuel'), {
      bikeId: payload.bikeId ?? null,
      date: payload.date ?? new Date().toISOString().slice(0, 10),
      notes: payload.notes ?? '',
      liters,
      distance: Number(payload.distance) || 0,
      pricePerLiter,
      totalCost,
      createdAt: new Date().toISOString(),
    })

    const entry = normalizeEntry(docRef.id, {
      ...payload,
      liters,
      pricePerLiter,
      totalCost,
    })

    entries.value = [entry, ...entries.value]
    return entry
  }

  async function updateEntry (id, patch) {
    const liters = patch.liters != null ? Number(patch.liters) : undefined
    const pricePerLiter = patch.cost != null ? Number(patch.cost) : undefined

    const updatePayload = {
      ...patch,
      updatedAt: new Date().toISOString(),
    }

    if (liters != null) {
      updatePayload.liters = liters
    }
    if (pricePerLiter != null) {
      updatePayload.pricePerLiter = pricePerLiter
    }

    const current = entries.value.find((entry) => entry.id === id)
    const nextLiters = liters != null ? liters : current?.liters ?? 0
    const nextPricePerLiter = pricePerLiter != null ? pricePerLiter : current?.pricePerLiter ?? 0
    updatePayload.totalCost = nextLiters * nextPricePerLiter

    await updateDoc(doc(db, 'fuel', id), updatePayload)

    entries.value = entries.value.map((entry) =>
      entry.id === id
        ? normalizeEntry(id, {
            ...entry,
            ...patch,
            liters: nextLiters,
            pricePerLiter: nextPricePerLiter,
            totalCost: updatePayload.totalCost,
          })
        : entry
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
    entries.value.reduce((sum, entry) => sum + (Number(entry.totalCost) || 0), 0)
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
        const pricePerLiter = Number(entry.pricePerLiter ?? entry.cost) || 0
        const total = Number(entry.totalCost ?? liters * pricePerLiter)
        acc.totalLiters += liters
        acc.totalDistance += distance
        acc.totalCost += total
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

