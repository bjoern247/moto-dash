<script setup>
import { reactive, watch, ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  submitLabel: {
    type: String,
    default: 'Speichern',
  },
})

const emit = defineEmits(['update:modelValue', 'submit', 'cancel'])

const form = reactive({
  manufacturer: '',
  model: '',
  year: new Date().getFullYear(),
  firstRegistration: '',
  mileage: 0,
  notes: '',
  image: '',
  purchasePrice: 0,
})

watch(
  () => props.modelValue,
  (value) => {
    Object.assign(form, {
      manufacturer: '',
      model: '',
      year: new Date().getFullYear(),
      firstRegistration: '',
      mileage: 0,
      notes: '',
      image: '',
      purchasePrice: 0,
      ...value,
    })
    form.image = value.image ?? ''
  },
  { immediate: true }
)

function handleInput(key, value) {
  form[key] = value
  emit('update:modelValue', { ...form })
}

function submit() {
  emit('submit', { ...form })
}

function cancel() {
  emit('cancel')
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="submit">
    <div class="grid gap-4 sm:grid-cols-2">
      <label class="flex flex-col gap-1 text-sm">
        <span>Hersteller</span>
        <input
          v-model="form.manufacturer"
          required
          class="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700"
          @input="handleInput('manufacturer', form.manufacturer)"
        />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span>Modell</span>
        <input
          v-model="form.model"
          required
          class="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700"
          @input="handleInput('model', form.model)"
        />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span>Baujahr</span>
        <input
          type="number"
          v-model.number="form.year"
          :min="1950"
          :max="new Date().getFullYear()"
          class="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700"
          @input="handleInput('year', form.year)"
        />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span>Erstzulassung</span>
        <input
          type="date"
          v-model="form.firstRegistration"
          class="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700"
          @input="handleInput('firstRegistration', form.firstRegistration)"
        />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span>Kilometerstand</span>
        <input
          type="number"
          min="0"
          v-model.number="form.mileage"
          class="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700"
          @input="handleInput('mileage', form.mileage)"
        />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span>Bild URL</span>
        <input
          v-model="form.image"
          class="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700"
          placeholder="https://..."
          @input="handleInput('image', form.image)"
        />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span>Kaufpreis (€)</span>
        <input
          type="number"
          min="0"
          step="0.01"
          v-model.number="form.purchasePrice"
          class="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700"
          @input="handleInput('purchasePrice', form.purchasePrice)"
        />
      </label>
    </div>
    <label class="flex flex-col gap-1 text-sm">
      <span>Notizen</span>
      <textarea
        v-model="form.notes"
        rows="3"
        class="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700"
        @input="handleInput('notes', form.notes)"
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


