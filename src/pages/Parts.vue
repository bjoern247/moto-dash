<script setup>
import { reactive, ref, computed } from 'vue'
import { usePartStore } from '../store/parts'
import { useBikeStore } from '../store/bikes'
import { formatDate } from '../utils/formatters'
import PartForm from '../components/PartForm.vue'

const partStore = usePartStore()
const bikeStore = useBikeStore()

const showForm = ref(false)

const form = reactive({
  bikeId: '',
  name: '',
  manufacturer: '',
  installedAt: new Date().toISOString().slice(0, 10),
  notes: '',
})

const partsByBike = computed(() => {
  const groups = new Map()
  partStore.parts.forEach((part) => {
    const parts = groups.get(part.bikeId) ?? []
    parts.push(part)
    groups.set(part.bikeId, parts)
  })
  return groups
})

function bikeName(id) {
  return bikeStore.bikes.find((bike) => bike.id === id)?.name ?? 'Unbekanntes Bike'
}

function resetForm() {
  form.bikeId = ''
  form.name = ''
  form.manufacturer = ''
  form.installedAt = new Date().toISOString().slice(0, 10)
  form.notes = ''
}

function submit() {
  partStore.addPart({ ...form })
  resetForm()
  showForm.value = false
}

function removePart(id) {
  if (confirm('Ersatzteil löschen?')) {
    partStore.removePart(id)
  }
}
</script>

<template>
  <section class="space-y-6">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-semibold">Ersatzteile und Zubehör</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Verwalte Teile, Hersteller und Einbaudaten je Bike.
        </p>
      </div>
      <button
        class="rounded-full bg-accent px-4 py-2 text-sm font-medium text-slate-900 shadow hover:bg-yellow-400"
        @click="showForm = !showForm"
      >
        {{ showForm ? 'Schließen' : 'Teil hinzufügen' }}
      </button>
    </header>

    <PartForm v-if="showForm" @submit="showForm = false" @cancel="showForm = false" />

    <div v-if="!bikeStore.bikes.length" class="rounded-lg border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
      Lege zuerst ein Bike an, um Ersatzteile und Zubehör zuzuweisen.
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <article
        v-for="bike in bikeStore.bikes"
        :key="bike.id"
        class="card space-y-4"
      >
        <header class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">{{ bike.name }}</h3>
          <span class="text-xs uppercase text-slate-500 dark:text-slate-400">
            {{ partsByBike.get(bike.id)?.length ?? 0 }} Teile
          </span>
        </header>
        <ul class="space-y-3">
          <li
            v-for="part in partsByBike.get(bike.id) ?? []"
            :key="part.id"
            class="rounded-lg border border-slate-200 px-4 py-3 text-sm dark:border-slate-700"
          >
            <div class="flex items-center justify-between">
              <p class="font-medium text-slate-900 dark:text-slate-100">{{ part.name }}</p>
              <button class="text-xs text-red-500 hover:underline" @click="removePart(part.id)">
                Löschen
              </button>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Hersteller: {{ part.manufacturer || 'unbekannt' }}
            </p>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Einbau: {{ formatDate(part.installedAt) }}
            </p>
            <p v-if="part.notes" class="mt-2 text-xs text-slate-600 dark:text-slate-300">{{ part.notes }}</p>
          </li>
        </ul>
        <p v-if="!(partsByBike.get(bike.id)?.length)" class="text-xs text-slate-500 dark:text-slate-400">
          Keine Teile hinterlegt.
        </p>
      </article>
    </div>
    <p v-if="!partStore.parts.length" class="text-sm text-slate-500 dark:text-slate-400">
      Noch keine Ersatzteile oder Zubehör angelegt.
    </p>
  </section>
</template>

