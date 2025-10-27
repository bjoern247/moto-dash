<script setup>
import { reactive, ref } from 'vue'
import { useBikeStore } from '../store/bikes'
import { useTourStore } from '../store/tours'

const emits = defineEmits(['submit', 'cancel'])

const bikeStore = useBikeStore()
const tourStore = useTourStore()

const form = reactive({
  bikeId: '',
  name: '',
  start: '',
  end: '',
  distance: 0,
  notes: '',
})

const gpxFile = ref(null)
const isUploading = ref(false)

function reset() {
  form.bikeId = ''
  form.name = ''
  form.start = ''
  form.end = ''
  form.distance = 0
  form.notes = ''
  gpxFile.value = null
}

async function submit() {
  try {
    isUploading.value = true
    let gpx = null
    if (gpxFile.value) {
      gpx = await gpxFile.value.text()
    }

    tourStore.addTour({
      ...form,
      gpx,
    })

    emits('submit')
    reset()
  } finally {
    isUploading.value = false
  }
}

function cancel() {
  reset()
  emits('cancel')
}

function handleFileChange(event) {
  const [file] = event.target.files ?? []
  gpxFile.value = file ?? null
}
</script>

<template>
  <form class="card space-y-4" @submit.prevent="submit">
    <div class="flex items-center justify-between gap-3">
      <h3 class="text-lg font-semibold">Tour erfassen</h3>
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
        <span>Tourname</span>
        <input v-model="form.name" required class="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700" />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span>Start</span>
        <input v-model="form.start" class="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700" />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span>Ziel</span>
        <input v-model="form.end" class="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700" />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span>Distanz (km)</span>
        <input type="number" min="0" step="0.1" v-model.number="form.distance" class="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700" />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span>GPX-Datei (optional)</span>
        <input
          type="file"
          accept=".gpx,application/gpx+xml"
          class="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700"
          @change="handleFileChange"
        />
        <span v-if="gpxFile" class="text-xs text-slate-500 dark:text-slate-400">
          {{ gpxFile.name }}
        </span>
      </label>
    </div>
    <label class="flex flex-col gap-1 text-sm">
      <span>Notizen</span>
      <textarea v-model="form.notes" rows="3" class="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700" />
    </label>
    <div class="flex justify-end gap-2">
      <button type="button" class="rounded-lg border px-4 py-2" @click="reset">Reset</button>
      <button
        type="submit"
        class="rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-slate-900"
        :disabled="isUploading"
      >
        {{ isUploading ? 'Speichern…' : 'Speichern' }}
      </button>
    </div>
  </form>
</template>

