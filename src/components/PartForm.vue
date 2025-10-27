<script setup>
import { reactive, onMounted } from 'vue'
import { useBikeStore } from '../store/bikes'
import { usePartStore } from '../store/parts'

const emits = defineEmits(['submit', 'cancel'])

const bikeStore = useBikeStore()
const partStore = usePartStore()

const initialState = () => ({
  bikeId: '',
  name: '',
  manufacturer: '',
  installedAt: new Date().toISOString().slice(0, 10),
  notes: '',
})

const form = reactive(initialState())

onMounted(async () => {
  if (!bikeStore.bikes.length) {
    await bikeStore.fetchBikes()
  }
  if (!partStore.parts.length) {
    await partStore.fetchParts()
  }
})

function reset() {
  Object.assign(form, initialState())
}

function submit() {
  partStore.addPart({ ...form })
  emits('submit')
  reset()
}

function cancel() {
  reset()
  emits('cancel')
}
</script>

<template>
  <form class="card space-y-4" @submit.prevent="submit">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold">Neues Ersatzteil</h3>
      <button type="button" class="text-sm text-slate-500 hover:underline" @click="cancel">
        Abbrechen
      </button>
    </div>
    <div class="grid gap-4 sm:grid-cols-2">
      <label class="flex flex-col gap-1 text-sm">
        <span>Bike</span>
        <select v-model="form.bikeId" required class="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">
          <option value="" disabled>Bike auswählen</option>
          <option v-for="bike in bikeStore.bikes" :key="bike.id" :value="bike.id">
            {{ bike.name }}
          </option>
        </select>
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span>Name</span>
        <input v-model="form.name" required class="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700" />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span>Hersteller</span>
        <input v-model="form.manufacturer" class="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700" />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span>Einbaudatum</span>
        <input type="date" v-model="form.installedAt" class="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700" />
      </label>
    </div>
    <label class="flex flex-col gap-1 text-sm">
      <span>Notizen</span>
      <textarea v-model="form.notes" rows="3" class="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700" />
    </label>
    <div class="flex justify-end gap-2">
      <button type="button" class="rounded-lg border px-4 py-2" @click="reset">Reset</button>
      <button type="submit" class="rounded-lg bg-slate-900 px-4 py-2 text-white dark:bg-white dark:text-slate-900">
        Speichern
      </button>
    </div>
  </form>
</template>

