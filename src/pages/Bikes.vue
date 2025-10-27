<script setup>
import { reactive, ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useBikeStore } from '../store/bikes'
import BikeCard from '../components/BikeCard.vue'
import BikeForm from '../components/BikeForm.vue'

const bikeStore = useBikeStore()

const currentYear = new Date().getFullYear()

const form = reactive({
  manufacturer: '',
  model: '',
  year: currentYear,
  firstRegistration: '',
  mileage: 0,
  notes: '',
  image: '',
  purchasePrice: 0,
})

const showForm = ref(false)
const showEditModal = ref(false)

const sortedBikes = computed(() =>
  [...bikeStore.bikes].sort((a, b) => b.mileage - a.mileage)
)

onMounted(async () => {
  if (!bikeStore.bikes.length) {
    await bikeStore.fetchBikes()
  }

  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

function resetForm() {
  form.manufacturer = ''
  form.model = ''
  form.year = currentYear
  form.firstRegistration = ''
  form.mileage = 0
  form.notes = ''
  form.image = ''
  form.purchasePrice = 0
}

async function submit() {
  await bikeStore.addBike({ ...form })
  resetForm()
  showForm.value = false
}

function removeBike(id) {
  if (confirm('Dieses Bike wirklich löschen?')) {
    bikeStore.removeBike(id)
  }
}

function openEdit(bike) {
  bikeStore.startEdit(bike)
  showEditModal.value = true
}

async function updateBike(payload) {
  if (!bikeStore.selectedBike) return
  await bikeStore.updateBike(bikeStore.selectedBike.id, payload)
  showEditModal.value = false
}

function handleEditFile(file) {
  if (!bikeStore.selectedBike) return
  bikeStore.selectedBike.image = file ?? ''
}

function closeEdit() {
  bikeStore.cancelEdit()
  showEditModal.value = false
}

function handleKeydown(event) {
  if (event.key === 'Escape') {
    if (showEditModal.value) {
      closeEdit()
    }
    if (showForm.value) {
      resetForm()
      showForm.value = false
    }
  }
}
</script>

<template>
  <section class="space-y-6">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-semibold">Bikes</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Verwalte deine Motorräder und behalte Wartung und Laufleistung im Blick.
        </p>
      </div>
      <button
        class="rounded-full bg-accent px-4 py-2 text-sm font-medium text-slate-900 shadow hover:bg-yellow-400"
        @click="showForm = !showForm"
      >
        {{ showForm ? 'Abbrechen' : 'Neues Bike' }}
      </button>
    </header>

    <div v-if="showForm" class="card space-y-4">
      <h3 class="text-lg font-semibold">Bike anlegen</h3>
      <BikeForm
        v-model="form"
        submit-label="Speichern"
        @file="(file) => (form.file = file)"
        @submit="submit"
        @cancel="() => {
          resetForm()
          showForm = false
        }"
      />
    </div>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <div v-for="bike in sortedBikes" :key="bike.id" class="relative">
        <BikeCard :bike="bike" />
        <div class="absolute right-4 top-4 flex gap-2">
          <button
            class="rounded-full bg-white/80 p-2 text-sm text-slate-500 shadow hover:text-blue-500 dark:bg-slate-900"
            @click="openEdit(bike)"
          >
            ✎
          </button>
          <button
            class="rounded-full bg-white/80 p-2 text-sm text-slate-500 shadow hover:text-red-500 dark:bg-slate-900"
            @click="removeBike(bike.id)"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
    <p v-if="!bikeStore.bikes.length" class="text-sm text-slate-500 dark:text-slate-400">
      Noch keine Bikes angelegt.
    </p>

    <div
      v-if="showEditModal && bikeStore.selectedBike"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div class="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl dark:bg-surface">
        <header class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold">Bike bearbeiten</h3>
          <button class="text-sm text-slate-500 hover:text-slate-800" @click="closeEdit">Schließen</button>
        </header>
        <BikeForm
          v-model="bikeStore.selectedBike"
          submit-label="Aktualisieren"
          @file="handleEditFile"
          @submit="updateBike"
          @cancel="closeEdit"
        />
      </div>
    </div>
  </section>
</template>

