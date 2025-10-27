import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const bikesCollection = collection(db, 'bikes')

function formatDisplayName (manufacturer = '', model = '', fallback = '') {
  const name = [manufacturer, model].map((part) => part?.trim()).filter(Boolean).join(' ')
  return name || fallback || 'Unbenanntes Bike'
}

function mapBikeDoc (snapshot) {
  const data = snapshot.data()
  const manufacturer = data.manufacturer ?? ''
  const model = data.model ?? ''
  const name = data.name ?? formatDisplayName(manufacturer, model, data.displayName)
  return {
    id: snapshot.id,
    manufacturer,
    model,
    year: data.year ?? new Date().getFullYear(),
    firstRegistration: data.firstRegistration ?? '',
    mileage: data.mileage ?? 0,
    notes: data.notes ?? '',
    image: data.image ?? '',
    purchasePrice: Number(data.purchasePrice) || 0,
    name,
    createdAt: data.createdAt ?? '',
    updatedAt: data.updatedAt ?? '',
  }
}

const selectedBike = ref(null)

function startEdit (bike) {
  selectedBike.value = { ...bike, file: null }
}

function cancelEdit () {
  selectedBike.value = null
}

export const useBikeStore = defineStore('bikes', () => {
  const bikes = ref([])
  const isLoading = ref(false)
  const lastError = ref(null)

  async function fetchBikes () {
    isLoading.value = true
    lastError.value = null
    try {
      const q = query(bikesCollection, orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      bikes.value = snapshot.docs.map(mapBikeDoc)
    } catch (error) {
      lastError.value = error
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function addBike (payload) {
    const data = { ...payload }
    const imageUrl = data.image ?? ''
    const docRef = await addDoc(bikesCollection, {
      manufacturer: '',
      model: '',
      year: new Date().getFullYear(),
      firstRegistration: '',
      mileage: 0,
      notes: '',
      image: imageUrl,
      purchasePrice: Number(data.purchasePrice) || 0,
      createdAt: new Date().toISOString(),
      ...data,
    })
    const snapshot = await getDocs(query(bikesCollection, orderBy('createdAt', 'desc')))
    bikes.value = snapshot.docs.map(mapBikeDoc)
    return bikes.value.find((bike) => bike.id === docRef.id)
  }

  async function updateBike (id, payload) {
    const patch = { ...payload }
    const imageUrl = patch.image ?? ''
    const purchasePrice = Number(patch.purchasePrice) || 0
    await updateDoc(doc(db, 'bikes', id), {
      ...patch,
      image: imageUrl,
       purchasePrice,
      updatedAt: new Date().toISOString(),
    })
    await fetchBikes()
    selectedBike.value = null
    return bikes.value.find((bike) => bike.id === id)
  }

  async function removeBike (id) {
    await deleteDoc(doc(db, 'bikes', id))
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
    selectedBike,
    totalCount,
    totalMileage,
    fetchBikes,
    addBike,
    updateBike,
    removeBike,
    startEdit,
    cancelEdit,
  }
})

