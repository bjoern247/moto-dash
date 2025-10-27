<script setup>
import { ref, computed, reactive } from 'vue'
import { useTourStore } from '../store/tours'
import { useBikeStore } from '../store/bikes'
import { formatNumber, formatDate } from '../utils/formatters'
import TourForm from '../components/TourForm.vue'

const tourStore = useTourStore()
const bikeStore = useBikeStore()

const showForm = ref(false)
const selectedBike = ref('')

const form = reactive({
  bikeId: '',
  name: '',
  start: '',
  end: '',
  distance: 0,
  notes: '',
})

const filteredTours = computed(() => {
  const tours = [...tourStore.tours].sort((a, b) => new Date(b.createdAt ?? b.id) - new Date(a.createdAt ?? a.id))
  if (!selectedBike.value) return tours
  return tours.filter((tour) => tour.bikeId === selectedBike.value)
})

function resetForm() {
  form.bikeId = ''
  form.name = ''
  form.start = ''
  form.end = ''
  form.distance = 0
  form.notes = ''
}

function submit() {
  tourStore.addTour({
    ...form,
    createdAt: new Date().toISOString(),
  })
  resetForm()
  showForm.value = false
}

function removeTour(id) {
  if (confirm('Tour löschen?')) {
    tourStore.removeTour(id)
  }
}

function bikeName(id) {
  return bikeStore.bikes.find((bike) => bike.id === id)?.name ?? 'Unbekanntes Bike'
}
</script>

<template>
  <section class="space-y-6">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-semibold">Touren</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Dokumentiere deine Touren, GPX-Dateien und Highlights.
        </p>
      </div>
      <button
        class="rounded-full bg-accent px-4 py-2 text-sm font-medium text-slate-900 shadow hover:bg-yellow-400"
        @click="showForm = !showForm"
      >
        {{ showForm ? 'Schließen' : 'Tour erfassen' }}
      </button>
    </header>

    <TourForm v-if="showForm" @submit="showForm = false" @cancel="showForm = false" />

    <div class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
        <span>Touren insgesamt:</span>
        <span class="font-medium text-slate-900 dark:text-slate-100">{{ tourStore.totalTours }}</span>
        <span>· Distanz:</span>
        <span class="font-medium text-slate-900 dark:text-slate-100">
          {{ formatNumber(tourStore.totalDistance, 0) }} km
        </span>
      </div>
      <select
        v-model="selectedBike"
        class="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700"
      >
        <option value="">Alle Bikes</option>
        <option v-for="bike in bikeStore.bikes" :key="bike.id" :value="bike.id">
          {{ bike.name }}
        </option>
      </select>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <article
        v-for="tour in filteredTours"
        :key="tour.id"
        class="card flex flex-col gap-3"
      >
        <header class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 class="text-lg font-semibold">{{ tour.name }}</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              {{ bikeName(tour.bikeId) }}
            </p>
          </div>
          <span class="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {{ formatNumber(tour.distance, 0) }} km
          </span>
        </header>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          {{ tour.start || 'Start unbekannt' }} → {{ tour.end || 'Ziel unbekannt' }}
        </p>
        <p v-if="tour.notes" class="text-sm text-slate-600 dark:text-slate-300">{{ tour.notes }}</p>
        <footer class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{{ formatDate(tour.createdAt || tour.id) }}</span>
          <button class="text-red-500 hover:underline" @click="removeTour(tour.id)">
            Löschen
          </button>
        </footer>
      </article>
    </div>
    <p v-if="!filteredTours.length" class="text-sm text-slate-500 dark:text-slate-400">
      Noch keine Touren erfasst.
    </p>
  </section>
</template>

