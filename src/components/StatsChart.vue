<script setup>
import { Bar } from 'vue-chartjs'
import { computed } from 'vue'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  Filler,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, Filler)

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  options: {
    type: Object,
    default: () => ({}),
  },
  axisOrientation: {
    type: String,
    default: 'vertical',
  },
})

const computedOptions = computed(() => ({
  indexAxis: props.axisOrientation === 'horizontal' ? 'y' : 'x',
  ...props.options,
}))
</script>

<template>
  <Bar :data="data" :options="computedOptions" />
</template>

