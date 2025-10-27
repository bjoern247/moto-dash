<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const menuItems = [
  { to: { name: 'dashboard' }, label: 'Dashboard', icon: '🏠' },
  { to: { name: 'bikes' }, label: 'Bikes', icon: '🏍️' },
  { to: { name: 'maintenance' }, label: 'Wartung', icon: '🛠️' },
  { to: { name: 'fuel' }, label: 'Tanken', icon: '⛽' },
  { to: { name: 'tours' }, label: 'Touren', icon: '🗺️' },
  { to: { name: 'parts' }, label: 'Ersatzteile und Zubehör', icon: '⚙️' },
  { to: { name: 'settings' }, label: 'Einstellungen', icon: '⚡' },
]

const route = useRoute()
const isDark = ref(false)

const STORAGE_KEY = 'moto-dash-theme'

function applyTheme(value) {
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false
  const next = value ?? (prefersDark ? 'dark' : 'light')
  isDark.value = next === 'dark'
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem(STORAGE_KEY, next)
}

function toggleTheme() {
  applyTheme(isDark.value ? 'light' : 'dark')
}

onMounted(() => {
  const stored = localStorage.getItem(STORAGE_KEY)
  applyTheme(stored)
})

watch(
  () => route.fullPath,
  () => {
    // Scroll to top on route change (fallback in addition to router scrollBehavior)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
)
</script>

<template>
  <div class="min-h-screen bg-gray-100 text-slate-900 dark:bg-surface dark:text-slate-100">
    <header class="bg-white/80 shadow-sm backdrop-blur dark:bg-surface/80">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <div class="flex items-center gap-3">
          <span class="text-2xl">🏍</span>
          <div>
            <h1 class="text-xl font-semibold">MotoDash</h1>
            <p class="text-sm text-slate-500 dark:text-slate-400">Self-Hosted Motorrad-Dashboard</p>
          </div>
        </div>
        <button
          type="button"
          class="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow hover:bg-slate-800 dark:bg-white dark:text-slate-900"
          @click="toggleTheme"
        >
          <span aria-hidden="true">{{ isDark ? '🌙' : '☀️' }}</span>
          <span>{{ isDark ? 'Dark' : 'Light' }}</span>
        </button>
      </div>
      <nav class="border-t border-slate-200 bg-white/70 dark:border-slate-700 dark:bg-surface/70">
        <div class="mx-auto flex max-w-6xl flex-wrap gap-2 px-4 py-3">
          <RouterLink
            v-for="item in menuItems"
            :key="item.label"
            :to="item.to"
            class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
            :class="{
              'bg-accent/10 text-accent border border-accent/60 shadow-sm': route.name === item.to.name,
            }"
          >
            <span aria-hidden="true">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </RouterLink>
        </div>
      </nav>
    </header>
    <main class="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <RouterView />
    </main>
  </div>
</template>

