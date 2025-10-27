<script setup>
import { reactive } from 'vue'
import { useBikeStore } from '../store/bikes'
import { useMaintenanceStore } from '../store/maintenance'

const emits = defineEmits(['submit', 'cancel'])

const bikeStore = useBikeStore()
const maintenanceStore = useMaintenanceStore()

const initialState = () => ({
  bikeId: '',
  date: new Date().toISOString().slice(0, 10),
  type: '',
  mileage: 0,
  cost: 0,
  notes: '',
})

const form = reactive(initialState())

function reset() {
  Object.assign(form, initialState())
}

function submit() {
  maintenanceStore.addEntry({ ...form })
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
    <h3 class="text-lg font-semibold">Wartungseintrag</h3>
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
        <span>Datum</span>
        <input type="date" v-model="form.date" required class="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700" />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span>Typ</span>
        <input v-model="form.type" required class="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700" />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span>Kilometerstand</span>
        <input type="number" v-model.number="form.mileage" min="0" class="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700" />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span>Kosten (€)</span>
        <input type="number" step="0.01" v-model.number="form.cost" min="0" class="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700" />
      </label>
    </div>
    <label class="flex flex-col gap-1 text-sm">
      <span>Notizen</span>
      <textarea v-model="form.notes" rows="3" class="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700" />
    </label>
    <div class="flex justify-end gap-2">
      <button type="button" class="rounded-lg border px-4 py-2" @click="cancel">Abbrechen</button>
      <button type="submit" class="rounded-lg bg-slate-900 px-4 py-2 text-white dark:bg-white dark:text-slate-900">Speichern</button>
    </div>
  </form>
</template>

