<script setup lang="ts">
const stack = [
  { name: 'Nuxt', version: '4' },
  { name: 'Vue',  version: '3.5' },
  { name: 'Pinia', version: 'latest' },
]
</script>

<template>
  <section>
    <h1>About</h1>
    <p>This app runs on:</p>

    <table>
      <thead>
        <tr><th>Tool</th><th>Version</th></tr>
      </thead>
      <tbody>
        <tr v-for="row in stack" :key="row.name">
          <td>{{ row.name }}</td>
          <td>{{ row.version }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>