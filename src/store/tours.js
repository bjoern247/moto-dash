import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'

export const useTourStore = defineStore('tours', () => {
  const tours = ref([])
  const isLoading = ref(false)
  const lastError = ref(null)

  async function fetchTours () {
    isLoading.value = true
    lastError.value = null
    try {
      const q = query(collection(db, 'tours'), orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      tours.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    } catch (error) {
      lastError.value = error
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function addTour (payload) {
    const docRef = await addDoc(collection(db, 'tours'), {
      createdAt: new Date().toISOString(),
      ...payload,
    })
    tours.value = [{ id: docRef.id, ...payload }, ...tours.value]
    return { id: docRef.id, ...payload }
  }

  async function updateTour (id, patch) {
    await updateDoc(doc(db, 'tours', id), {
      ...patch,
      updatedAt: new Date().toISOString(),
    })
    tours.value = tours.value.map((tour) =>
      tour.id === id ? { ...tour, ...patch } : tour
    )
    return tours.value.find((tour) => tour.id === id)
  }

  async function removeTour (id) {
    await deleteDoc(doc(db, 'tours', id))
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

