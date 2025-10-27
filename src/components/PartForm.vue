<script setup>
import { reactive, watch, onMounted } from 'vue'
import { useBikeStore } from '../store/bikes'
import { usePartStore } from '../store/parts'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  title: {
    type: String,
    default: 'Neues Ersatzteil',
  },
  submitLabel: {
    type: String,
    default: 'Speichern',
  },
})

const emit = defineEmits(['update:modelValue', 'submit', 'cancel'])

const bikeStore = useBikeStore()
const partStore = usePartStore()

const form = reactive({
  bikeId: '',
  name: '',
  manufacturer: '',
  installedAt: new Date().toISOString().slice(0, 10),
  notes: '',
  price: 0,
})

watch(
  () => props.modelValue,
  (value) => {
    const defaults = {
      bikeId: '',
      name: '',
      manufacturer: '',
      installedAt: new Date().toISOString().slice(0, 10),
      notes: '',
      price: 0,
    }
    Object.assign(form, { ...defaults, ...(value || {}) })
  },
  { immediate: true }
)

function updateField(key, value) {
  form[key] = value
  emit('update:modelValue', { ...form })
}

onMounted(async () => {
  if (!bikeStore.bikes.length) {
    await bikeStore.fetchBikes()
  }
  if (!partStore.parts.length) {
    await partStore.fetchParts()
  }
})

function submit() {
  emit('submit', { ...form })
}

function cancel() {
  emit('cancel')
}
</script>

<template>
  <form class="card space-y-4" @submit.prevent="submit">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold">{{ title }}</h3>
      <button type="button" class="text-sm text-slate-500 hover:underline" @click="cancel">
        Abbrechen
      </button>
    </div>
    <div class="grid gap-4 sm:grid-cols-2">
      <label class="flex flex-col gap-1 text-sm">
        <span>Bike</span>
        <select
          v-model="form.bikeId"
          required
          class="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700"
          @change="updateField('bikeId', form.bikeId)"
        >
          <option value="" disabled>Bike auswählen</option>
          <option v-for="bike in bikeStore.bikes" :key="bike.id" :value="bike.id">
            {{ bike.name }}
          </option>
        </select>
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span>Name</span>
        <input
          v-model="form.name"
          required
          class="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700"
          @input="updateField('name', form.name)"
        />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span>Hersteller</span>
        <input
          v-model="form.manufacturer"
          class="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700"
          @input="updateField('manufacturer', form.manufacturer)"
        />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span>Einbaudatum</span>
        <input
          type="date"
          v-model="form.installedAt"
          class="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700"
          @input="updateField('installedAt', form.installedAt)"
        />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span>Preis (€)</span>
        <input
          type="number"
          min="0"
          step="0.01"
          v-model.number="form.price"
          class="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700"
          @input="updateField('price', form.price)"
        />
      </label>
    </div>
    <label class="flex flex-col gap-1 text-sm">
      <span>Notizen</span>
      <textarea
        v-model="form.notes"
        rows="3"
        class="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700"
        @input="updateField('notes', form.notes)"
      />
    </label>
    <div class="flex justify-end gap-2">
      <button type="button" class="rounded-lg border px-4 py-2" @click="cancel">Abbrechen</button>
      <button type="submit" class="rounded-lg bg-slate-900 px-4 py-2 text-white dark:bg-white dark:text-slate-900">
        {{ submitLabel }}
      </button>
    </div>
  </form>
</template>

