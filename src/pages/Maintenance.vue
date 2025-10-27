<script setup>
import { ref, computed } from 'vue'
import { useMaintenanceStore } from '../store/maintenance'
import { useBikeStore } from '../store/bikes'
import { formatDate, formatNumber, formatCurrency } from '../utils/formatters'
import MaintenanceForm from '../components/MaintenanceForm.vue'

const maintenanceStore = useMaintenanceStore()
const bikeStore = useBikeStore()

const showForm = ref(false)
const selectedBike = ref('')

const filteredEntries = computed(() => {
  const entries = maintenanceStore.maintenance
  if (!selectedBike.value) {
    return [...entries].sort((a, b) => new Date(b.date) - new Date(a.date))
  }
  return [...entries]
    .filter((entry) => entry.bikeId === selectedBike.value)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
})

function removeEntry(id) {
  if (confirm('Eintrag wirklich löschen?')) {
    maintenanceStore.removeEntry(id)
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
        <h2 class="text-2xl font-semibold">Wartungslog</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Verfolge alle Wartungsarbeiten, Intervalle und Kosten.
        </p>
      </div>
      <button
        class="rounded-full bg-accent px-4 py-2 text-sm font-medium text-slate-900 shadow hover:bg-yellow-400"
        @click="showForm = !showForm"
      >
        {{ showForm ? 'Schließen' : 'Eintrag hinzufügen' }}
      </button>
    </header>

    <MaintenanceForm v-if="showForm" @submit="showForm = false" @cancel="showForm = false" />

    <div class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <span>Gesamtkosten:</span>
        <span class="font-medium text-slate-900 dark:text-slate-100">
          {{ formatCurrency(maintenanceStore.totalCost) }}
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

    <div class="space-y-3">
      <article
        v-for="entry in filteredEntries"
        :key="entry.id"
        class="card flex flex-col gap-3"
      >
        <header class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 class="text-lg font-semibold">{{ entry.type }}</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              {{ formatDate(entry.date) }} · {{ bikeName(entry.bikeId) }}
            </p>
          </div>
          <div class="flex items-center gap-3">
            <span class="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {{ formatNumber(entry.mileage, 0) }} km
            </span>
            <span class="text-lg font-semibold text-accent">
              {{ formatCurrency(entry.cost) }}
            </span>
            <button
              class="rounded-lg border px-3 py-1 text-sm hover:border-red-400 hover:text-red-500"
              @click="removeEntry(entry.id)"
            >
              Löschen
            </button>
          </div>
        </header>
        <p v-if="entry.notes" class="text-sm text-slate-600 dark:text-slate-300">{{ entry.notes }}</p>
      </article>
      <p v-if="!filteredEntries.length" class="text-sm text-slate-500 dark:text-slate-400">
        Noch keine Wartungseinträge vorhanden.
      </p>
    </div>
  </section>
</template>

