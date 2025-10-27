<script setup>
import { computed } from 'vue'
import { formatNumber } from '../utils/formatters'

const props = defineProps({
  bike: {
    type: Object,
    required: true,
  },
})

const placeholderImage = computed(
  () =>
    props.bike.image ||
    'https://cdn.jsdelivr.net/gh/edent/SuperTinyIcons/images/svg/motorcycle.svg'
)
</script>

<template>
  <article class="card flex flex-col gap-4">
    <div class="flex items-center gap-4">
      <img
        :src="placeholderImage"
        :alt="`Foto von ${bike.name}`"
        class="h-16 w-16 rounded-full border border-white/20 object-cover"
      />
      <div>
        <h4 class="text-lg font-semibold text-slate-900 dark:text-white">{{ bike.name }}</h4>
        <p class="text-sm text-slate-500 dark:text-slate-400">Baujahr {{ bike.year }}</p>
      </div>
    </div>
    <dl class="grid grid-cols-2 gap-4 text-sm">
      <div>
        <dt class="text-slate-500 dark:text-slate-400">Kilometerstand</dt>
        <dd class="font-medium text-slate-900 dark:text-slate-100">
          {{ formatNumber(bike.mileage, 0) }} km
        </dd>
      </div>
      <div>
        <dt class="text-slate-500 dark:text-slate-400">Notizen</dt>
        <dd class="font-medium text-slate-900 dark:text-slate-100">
          {{ bike.notes || 'Keine Notizen' }}
        </dd>
      </div>
    </dl>
  </article>
</template>

