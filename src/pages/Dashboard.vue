<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useBikeStore } from '../store/bikes'
import { useMaintenanceStore } from '../store/maintenance'
import { useFuelStore } from '../store/fuel'
import { formatNumber, formatCurrency } from '../utils/formatters'
import BikeCard from '../components/BikeCard.vue'
import StatsChart from '../components/StatsChart.vue'

const bikeStore = useBikeStore()
const maintenanceStore = useMaintenanceStore()
const fuelStore = useFuelStore()

const { bikes, totalCount, totalMileage } = storeToRefs(bikeStore)
const { totalCost: maintenanceCost } = storeToRefs(maintenanceStore)
const {
  totalCost: fuelCost,
  averageConsumption,
  totalDistance,
  totalLiters,
} = storeToRefs(fuelStore)

const defaultFuelAverage = Object.freeze({ lPer100km: 0, costPerKm: 0 })

onMounted(async () => {
  if (!bikes.value.length) {
    await bikeStore.fetchBikes()
  }
  if (!maintenanceStore.maintenance.length) {
    await maintenanceStore.fetchMaintenance()
  }
  if (!fuelStore.entries.length) {
    await fuelStore.fetchEntries()
  }
})

const stats = computed(() => {
  const mileage = totalMileage.value ?? 0
  const maintenance = maintenanceCost.value ?? 0
  const fuel = fuelCost.value ?? 0
  const purchase = bikeStore.bikes.reduce(
    (sum, bike) => sum + (Number(bike.purchasePrice) || 0),
    0
  )
  const combinedCost = fuel + maintenance + purchase * 0.3
  const distance = totalDistance.value ?? 0
  const liters = totalLiters.value ?? 0
  const avgConsumption = averageConsumption.value?.lPer100km ?? 0
  const estimatedDistance = !distance && avgConsumption > 0
    ? (liters / avgConsumption) * 100
    : 0
  const effectiveOperationalDistance = distance || estimatedDistance
  const operationalCostPerKm = effectiveOperationalDistance
    ? fuel / effectiveOperationalDistance
    : 0
  const totalCostPerKm = mileage
    ? (fuel + maintenance + purchase * 0.3) / mileage
    : 0
  const avgFuelPrice = liters ? fuel / liters : 0

  return {
    bikes: totalCount.value ?? 0,
    mileage,
    combinedCost,
    fuelCost: fuel,
    fuelAverage: averageConsumption.value ?? defaultFuelAverage,
    totalCostPerKm,
    operationalCostPerKm,
    averageFuelPrice: avgFuelPrice,
  }
})

const chartData = computed(() => {
  const list = bikes.value ?? []
  return {
    labels: list.map((bike) => bike.name),
    datasets: [
      {
        label: 'Kilometerstand',
        data: list.map((bike) => bike.mileage),
        backgroundColor: '#eab30820',
        borderColor: '#eab308',
        borderWidth: 2,
        tension: 0.25,
        barPercentage: 0.45,
        categoryPercentage: 0.45,
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      ticks: { color: '#94a3b8' },
      grid: { color: '#1f293333' },
    },
    x: {
      ticks: { color: '#94a3b8' },
      grid: { display: false },
    },
  },
  plugins: {
    legend: { labels: { color: '#cbd5f5' } },
  },
}
</script>

<template>
  <section class="space-y-6">
    <header class="flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-lg">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-semibold">Willkommen bei MotoDash</h2>
          <p class="text-slate-300">Dein Cockpit für Wartung, Touren und Verbrauchsdaten.</p>
        </div>
        <RouterLink
          :to="{ name: 'bikes' }"
          class="rounded-full bg-accent px-4 py-2 text-sm font-medium text-slate-900 shadow hover:bg-yellow-400"
        >
          Neues Bike anlegen
        </RouterLink>
      </div>
      <dl class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-xl bg-white/10 p-4">
          <dt class="text-sm text-slate-200">Bikes</dt>
          <dd class="text-2xl font-semibold">{{ stats.bikes }}</dd>
        </div>
        <div class="rounded-xl bg-white/10 p-4">
          <dt class="text-sm text-slate-200">Gesamtkilometer</dt>
          <dd class="text-2xl font-semibold">{{ formatNumber(stats.mileage, 0) }} km</dd>
        </div>
        <div class="rounded-xl bg-white/10 p-4">
          <dt class="text-sm text-slate-200">Gesamtkosten</dt>
          <dd class="text-2xl font-semibold">{{ formatCurrency(stats.combinedCost) }}</dd>
        </div>
        <div class="rounded-xl bg-white/10 p-4">
          <dt class="text-sm text-slate-200">Treibstoffkosten</dt>
          <dd class="text-2xl font-semibold">{{ formatCurrency(stats.fuelCost) }}</dd>
        </div>
      </dl>
    </header>

    <section class="grid gap-6 lg:grid-cols-3">
      <div class="lg:col-span-2">
        <article class="card h-full">
          <header class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold">Kilometerstände</h3>
            <RouterLink :to="{ name: 'maintenance' }" class="text-sm text-accent hover:underline">
              Details ansehen
            </RouterLink>
          </header>
          <div class="h-72">
            <StatsChart :data="chartData" :options="chartOptions" axis-orientation="horizontal" />
          </div>
        </article>
      </div>
      <div class="space-y-4">
        <article class="card">
          <header class="mb-3">
            <h3 class="text-lg font-semibold">Verbrauch</h3>
          </header>
          <ul class="space-y-2 text-sm text-slate-500 dark:text-slate-400">
            <li class="flex justify-between">
              <span>Ø Liter/100km</span>
              <span class="font-medium text-slate-900 dark:text-slate-100">
                {{ formatNumber(stats.fuelAverage.lPer100km) }}
              </span>
            </li>
            <li class="flex justify-between">
              <span>Ø Preis pro Liter</span>
              <span class="font-medium text-slate-900 dark:text-slate-100">
                {{ formatCurrency(stats.averageFuelPrice) }}
              </span>
            </li>
            <li class="flex justify-between">
              <span>Kosten pro km (Betrieb)</span>
              <span class="font-medium text-slate-900 dark:text-slate-100">
                {{ formatCurrency(stats.operationalCostPerKm) }}
              </span>
            </li>
            <li class="flex justify-between">
              <span>Kosten pro km (Gesamt)</span>
              <span class="font-medium text-slate-900 dark:text-slate-100">
                {{ formatCurrency(stats.totalCostPerKm) }}
              </span>
            </li>
          </ul>
        </article>
        <article class="card">
          <header class="mb-3">
            <h3 class="text-lg font-semibold">Letzte Bikes</h3>
          </header>
          <ul class="space-y-3">
            <li
              v-for="bike in bikeStore.bikes.slice(0, 3)"
              :key="bike.id"
              class="rounded-lg bg-slate-100 px-4 py-3 dark:bg-slate-800"
            >
              <p class="font-medium text-slate-900 dark:text-slate-100">{{ bike.name }}</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                {{ bike.year }} · {{ formatNumber(bike.mileage, 0) }} km
              </p>
            </li>
            <li v-if="!bikeStore.bikes.length" class="text-sm text-slate-500 dark:text-slate-400">
              Noch keine Bikes angelegt.
            </li>
          </ul>
        </article>
      </div>
    </section>

    <section class="space-y-4">
      <header class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">Deine Bikes</h3>
        <RouterLink :to="{ name: 'bikes' }" class="text-sm text-accent hover:underline">
          Alle ansehen
        </RouterLink>
      </header>
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <BikeCard v-for="bike in bikeStore.bikes" :key="bike.id" :bike="bike" />
      </div>
      <p v-if="!bikeStore.bikes.length" class="text-sm text-slate-500 dark:text-slate-400">
        Lege dein erstes Bike an, um das Dashboard zu füllen.
      </p>
    </section>
  </section>
</template>

