import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { collection, addDoc, doc, getDocs, updateDoc, deleteDoc, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'

export const useMaintenanceStore = defineStore('maintenance', () => {
  const maintenance = ref([])
  const isLoading = ref(false)
  const lastError = ref(null)

  async function fetchMaintenance () {
    isLoading.value = true
    lastError.value = null
    try {
      const q = query(collection(db, 'maintenance'), orderBy('date', 'desc'))
      const snapshot = await getDocs(q)
      maintenance.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    } catch (error) {
      lastError.value = error
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function addEntry (payload) {
    const docRef = await addDoc(collection(db, 'maintenance'), {
      createdAt: new Date().toISOString(),
      ...payload,
    })
    maintenance.value = [{ id: docRef.id, ...payload }, ...maintenance.value]
    return { id: docRef.id, ...payload }
  }

  async function updateEntry (id, patch) {
    await updateDoc(doc(db, 'maintenance', id), {
      ...patch,
      updatedAt: new Date().toISOString(),
    })
    maintenance.value = maintenance.value.map((entry) =>
      entry.id === id ? { ...entry, ...patch } : entry
    )
    return maintenance.value.find((entry) => entry.id === id)
  }

  async function removeEntry (id) {
    await deleteDoc(doc(db, 'maintenance', id))
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

