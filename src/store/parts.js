import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'

function normalizePart (docSnapshot) {
  const data = docSnapshot.data ? docSnapshot.data() : docSnapshot
  return {
    id: docSnapshot.id ?? data.id,
    bikeId: data.bikeId ?? '',
    name: data.name ?? '',
    manufacturer: data.manufacturer ?? '',
    installedAt: data.installedAt ?? new Date().toISOString().slice(0, 10),
    notes: data.notes ?? '',
    price: Number(data.price) || 0,
    createdAt: data.createdAt ?? '',
    updatedAt: data.updatedAt ?? '',
  }
}

export const usePartStore = defineStore('parts', () => {
  const parts = ref([])
  const isLoading = ref(false)
  const lastError = ref(null)

  async function fetchParts () {
    isLoading.value = true
    lastError.value = null
    try {
      const q = query(collection(db, 'parts'), orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      parts.value = snapshot.docs.map((doc) => normalizePart(doc))
    } catch (error) {
      lastError.value = error
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function addPart (payload) {
    const docRef = await addDoc(collection(db, 'parts'), {
      bikeId: payload.bikeId ?? '',
      name: payload.name ?? '',
      manufacturer: payload.manufacturer ?? '',
      installedAt: payload.installedAt ?? new Date().toISOString().slice(0, 10),
      notes: payload.notes ?? '',
      price: Number(payload.price) || 0,
      createdAt: new Date().toISOString(),
    })
    const part = normalizePart({ id: docRef.id, ...payload })
    parts.value = [part, ...parts.value]
    return part
  }

  async function updatePart (id, patch) {
    const updatePayload = {
      ...patch,
      price: patch.price != null ? Number(patch.price) : undefined,
      updatedAt: new Date().toISOString(),
    }
    await updateDoc(doc(db, 'parts', id), updatePayload)
    parts.value = parts.value.map((part) =>
      part.id === id
        ? normalizePart({ ...part, ...patch, price: updatePayload.price ?? part.price })
        : part
    )
    return parts.value.find((part) => part.id === id)
  }

  async function removePart (id) {
    await deleteDoc(doc(db, 'parts', id))
    parts.value = parts.value.filter((part) => part.id !== id)
  }

  const totalParts = computed(() => parts.value.length)
  const totalPartCost = computed(() =>
    parts.value.reduce((sum, part) => sum + (Number(part.price) || 0), 0)
  )

  return {
    parts,
    isLoading,
    lastError,
    totalParts,
    totalPartCost,
    fetchParts,
    addPart,
    updatePart,
    removePart,
  }
})

