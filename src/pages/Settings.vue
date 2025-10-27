<script setup>
import { ref } from 'vue'

const exportData = ref(null)
const importError = ref('')
const isExporting = ref(false)

async function handleExport() {
  isExporting.value = true
  try {
    const stores = ['bikes', 'maintenance', 'fuel', 'tours', 'parts']
    const payload = {}
    for (const key of stores) {
      const value = localStorage.getItem(`persist:${key}`)
      payload[key] = value ? JSON.parse(value) : null
    }
    exportData.value = JSON.stringify(payload, null, 2)
  } finally {
    isExporting.value = false
  }
}

function downloadExport() {
  if (!exportData.value) return
  const blob = new Blob([exportData.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `moto-dash-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function resetExport() {
  exportData.value = null
}

async function handleImport(event) {
  importError.value = ''
  const [file] = event.target.files ?? []
  if (!file) return

  try {
    const text = await file.text()
    const data = JSON.parse(text)
    Object.entries(data).forEach(([key, value]) => {
      if (value) {
        localStorage.setItem(`persist:${key}`, JSON.stringify(value))
      }
    })
    window.location.reload()
  } catch (error) {
    importError.value = 'Import fehlgeschlagen. Bitte gültige JSON-Datei verwenden.'
    console.error(error)
  }
}

async function clearData() {
  if (!confirm('Alle gespeicherten Daten löschen?')) return
  const stores = ['bikes', 'maintenance', 'fuel', 'tours', 'parts']
  stores.forEach((key) => localStorage.removeItem(`persist:${key}`))
  window.location.reload()
}
</script>

<template>
  <section class="space-y-6">
    <header>
      <h2 class="text-2xl font-semibold">Einstellungen</h2>
      <p class="text-sm text-slate-500 dark:text-slate-400">
        Verwalte Datenexport/-import, Synchronisation und Darstellung.
      </p>
    </header>

    <article class="card space-y-4">
      <header>
        <h3 class="text-lg font-semibold">Datenexport</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Exportiere deine Daten als JSON-Datei für Backups oder Transfer.
        </p>
      </header>
      <div class="flex flex-wrap gap-3">
        <button
          class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-slate-900"
          :disabled="isExporting"
          @click="handleExport"
        >
          {{ isExporting ? 'Exportiere…' : 'Daten exportieren' }}
        </button>
        <button
          v-if="exportData"
          class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium dark:border-slate-600"
          @click="downloadExport"
        >
          Download
        </button>
        <button
          v-if="exportData"
          class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium dark:border-slate-600"
          @click="resetExport"
        >
          Zurücksetzen
        </button>
      </div>
      <textarea
        v-if="exportData"
        :value="exportData"
        readonly
        rows="8"
        class="w-full rounded-lg border border-slate-200 bg-slate-950/80 p-3 font-mono text-xs text-slate-200 dark:border-slate-700"
      />
    </article>

    <article class="card space-y-4">
      <header>
        <h3 class="text-lg font-semibold">Daten importieren</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Lade eine zuvor exportierte JSON-Datei, um deine Daten wiederherzustellen.
        </p>
      </header>
      <input
        type="file"
        accept="application/json"
        class="w-full rounded-lg border border-dashed border-slate-300 px-3 py-10 text-center text-sm text-slate-500 dark:border-slate-700"
        @change="handleImport"
      />
      <p v-if="importError" class="text-sm text-red-500">{{ importError }}</p>
    </article>

    <article class="card space-y-4">
      <header>
        <h3 class="text-lg font-semibold text-red-500">Daten löschen</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Entferne alle gespeicherten Daten aus dem Browser-Storage.
        </p>
      </header>
      <button
        class="rounded-lg border border-red-500 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10"
        @click="clearData"
      >
        Alles löschen
      </button>
    </article>
  </section>
</template>

