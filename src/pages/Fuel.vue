<script setup>
import { ref, computed } from 'vue'
import { useFuelStore } from '../store/fuel'
import { useBikeStore } from '../store/bikes'
import { formatDate, formatNumber, formatCurrency } from '../utils/formatters'
import FuelForm from '../components/FuelForm.vue'
import StatsChart from '../components/StatsChart.vue'

const fuelStore = useFuelStore()
const bikeStore = useBikeStore()

const showForm = ref(false)
const selectedBike = ref('')

const filteredEntries = computed(() => {
  const entries = fuelStore.entries
  const sorted = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date))
  if (!selectedBike.value) return sorted
  return sorted.filter((entry) => entry.bikeId === selectedBike.value)
})

const chartData = computed(() => {
  const entries = filteredEntries.value.slice(0, 10).reverse()
  return {
    labels: entries.map((entry) => formatDate(entry.date)),
    datasets: [
      {
        label: 'Liter',
        data: entries.map((entry) => entry.liters),
        backgroundColor: '#facc1520',
        borderColor: '#facc15',
        borderWidth: 2,
        tension: 0.3,
      },
      {
        label: 'Kosten',
        data: entries.map((entry) => Number(entry.totalCost) || ((Number(entry.liters) || 0) * (Number(entry.pricePerLiter ?? entry.cost) || 0))),
        backgroundColor: '#38bdf820',
        borderColor: '#38bdf8',
        borderWidth: 2,
        tension: 0.3,
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: { ticks: { color: '#94a3b8' }, grid: { color: '#1f293333' } },
    x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
  },
  plugins: {
    legend: { labels: { color: '#94a3b8' } },
  },
}

function bikeName(id) {
  return bikeStore.bikes.find((bike) => bike.id === id)?.name ?? 'Unbekanntes Bike'
}

function removeEntry(id) {
  if (confirm('Tank-Log löschen?')) {
    fuelStore.removeEntry(id)
  }
}
</script>

<template>
  <section class="space-y-6">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-semibold">Tankbuch</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Behalte Verbrauch und Kosten deiner Bikes im Blick.
        </p>
      </div>
      <button
        class="rounded-full bg-accent px-4 py-2 text-sm font-medium text-slate-900 shadow hover:bg-yellow-400"
        @click="showForm = !showForm"
      >
        {{ showForm ? 'Schließen' : 'Tankstopp erfassen' }}
      </button>
    </header>

    <FuelForm v-if="showForm" @submit="showForm = false" @cancel="showForm = false" />

    <section class="grid gap-6 lg:grid-cols-3">
      <article class="card space-y-3 lg:col-span-2">
        <header class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 class="text-lg font-semibold">Verbrauch & Kosten</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Darstellung der letzten Einträge.
            </p>
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
        </header>
        <div class="h-72">
          <StatsChart :data="chartData" :options="chartOptions" />
        </div>
      </article>
      <article class="card space-y-2">
        <h3 class="text-lg font-semibold">Kennzahlen</h3>
        <dl class="space-y-2 text-sm">
          <div class="flex justify-between">
            <dt>Einträge</dt>
            <dd class="font-medium">{{ fuelStore.totalEntries }}</dd>
          </div>
          <div class="flex justify-between">
            <dt>Gesamtliter</dt>
            <dd class="font-medium">{{ formatNumber(fuelStore.totalLiters, 1) }} L</dd>
          </div>
          <div class="flex justify-between">
            <dt>Gesamtkosten</dt>
            <dd class="font-medium">{{ formatCurrency(fuelStore.totalCost) }}</dd>
          </div>
          <div class="flex justify-between">
            <dt>Ø Preis pro Liter</dt>
            <dd class="font-medium">{{ formatCurrency(fuelStore.totalLiters ? fuelStore.totalCost / fuelStore.totalLiters : 0) }}</dd>
          </div>
          <div class="flex justify-between">
            <dt>Ø Liter/100km</dt>
            <dd class="font-medium">{{ formatNumber(fuelStore.averageConsumption.lPer100km) }}</dd>
          </div>
          <div class="flex justify-between">
            <dt>Ø Kosten/km</dt>
            <dd class="font-medium">{{ formatCurrency(fuelStore.averageConsumption.costPerKm) }}</dd>
          </div>
        </dl>
      </article>
    </section>

    <section class="space-y-3">
      <h3 class="text-lg font-semibold">Tank-Logs</h3>
      <div class="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
        <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead class="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <tr>
              <th class="px-4 py-3">Datum</th>
              <th class="px-4 py-3">Bike</th>
              <th class="px-4 py-3">Liter</th>
              <th class="px-4 py-3">Kosten</th>
              <th class="px-4 py-3">Distanz</th>
              <th class="px-4 py-3">Notiz</th>
              <th class="px-4 py-3 text-right">Aktionen</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white text-sm dark:divide-slate-700 dark:bg-surface">
            <tr v-for="entry in filteredEntries" :key="entry.id">
              <td class="px-4 py-3">{{ formatDate(entry.date) }}</td>
              <td class="px-4 py-3">{{ bikeName(entry.bikeId) }}</td>
              <td class="px-4 py-3">{{ formatNumber(entry.liters, 1) }} L</td>
            <td class="px-4 py-3">{{ formatCurrency(entry.totalCost ?? (Number(entry.liters) || 0) * (Number(entry.pricePerLiter ?? entry.cost) || 0)) }}</td>
              <td class="px-4 py-3">{{ formatNumber(entry.distance, 0) }} km</td>
              <td class="px-4 py-3">{{ entry.notes || '—' }}</td>
              <td class="px-4 py-3 text-right">
                <button class="text-sm text-red-500 hover:underline" @click="removeEntry(entry.id)">
                  Löschen
                </button>
              </td>
            </tr>
            <tr v-if="!filteredEntries.length">
              <td colspan="7" class="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                Noch keine Tank-Logs vorhanden.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </section>
</template>

