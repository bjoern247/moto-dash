<script setup>
import { reactive, ref, computed } from 'vue'
import { useBikeStore } from '../store/bikes'
import BikeCard from '../components/BikeCard.vue'

const bikeStore = useBikeStore()

const currentYear = new Date().getFullYear()

const form = reactive({
  name: '',
  year: currentYear,
  mileage: 0,
  image: '',
  notes: '',
})

const showForm = ref(false)

const sortedBikes = computed(() =>
  [...bikeStore.bikes].sort((a, b) => b.mileage - a.mileage)
)

function resetForm() {
  form.name = ''
  form.year = currentYear
  form.mileage = 0
  form.image = ''
  form.notes = ''
}

function submit() {
  bikeStore.addBike({ ...form })
  resetForm()
  showForm.value = false
}

function removeBike(id) {
  if (confirm('Dieses Bike wirklich löschen?')) {
    bikeStore.removeBike(id)
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

    <form v-if="showForm" class="card space-y-4" @submit.prevent="submit">
      <h3 class="text-lg font-semibold">Bike anlegen</h3>
      <div class="grid gap-4 sm:grid-cols-2">
        <label class="flex flex-col gap-1 text-sm">
          <span>Name</span>
          <input v-model="form.name" required class="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700" />
        </label>
        <label class="flex flex-col gap-1 text-sm">
          <span>Baujahr</span>
          <input
            type="number"
            v-model.number="form.year"
            :min="1950"
            :max="currentYear"
            class="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700"
          />
        </label>
        <label class="flex flex-col gap-1 text-sm">
          <span>Kilometerstand</span>
          <input
            type="number"
            v-model.number="form.mileage"
            min="0"
            class="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700"
          />
        </label>
        <label class="flex flex-col gap-1 text-sm">
          <span>Bild URL</span>
          <input v-model="form.image" class="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700" />
        </label>
      </div>
      <label class="flex flex-col gap-1 text-sm">
        <span>Notizen</span>
        <textarea v-model="form.notes" rows="3" class="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700" />
      </label>
      <div class="flex justify-end gap-2">
        <button type="button" class="rounded-lg border px-4 py-2" @click="resetForm">Reset</button>
        <button type="submit" class="rounded-lg bg-slate-900 px-4 py-2 text-white dark:bg-white dark:text-slate-900">Speichern</button>
      </div>
    </form>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <div v-for="bike in sortedBikes" :key="bike.id" class="relative">
        <BikeCard :bike="bike" />
        <button
          class="absolute right-4 top-4 rounded-full bg-white/80 p-2 text-sm text-slate-500 shadow hover:text-red-500 dark:bg-slate-900"
          @click="removeBike(bike.id)"
        >
          ✕
        </button>
      </div>
    </div>
    <p v-if="!bikeStore.bikes.length" class="text-sm text-slate-500 dark:text-slate-400">
      Noch keine Bikes angelegt.
    </p>
  </section>
</template>

