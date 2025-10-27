import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'

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
      parts.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    } catch (error) {
      lastError.value = error
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function addPart (payload) {
    const docRef = await addDoc(collection(db, 'parts'), {
      createdAt: new Date().toISOString(),
      ...payload,
    })
    parts.value = [{ id: docRef.id, ...payload }, ...parts.value]
    return { id: docRef.id, ...payload }
  }

  async function updatePart (id, patch) {
    await updateDoc(doc(db, 'parts', id), {
      ...patch,
      updatedAt: new Date().toISOString(),
    })
    parts.value = parts.value.map((part) =>
      part.id === id ? { ...part, ...patch } : part
    )
    return parts.value.find((part) => part.id === id)
  }

  async function removePart (id) {
    await deleteDoc(doc(db, 'parts', id))
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

