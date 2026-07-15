<script setup lang="ts">
// app.vue is the top-level shell.
// Everything page-specific lives in a layout (app/layouts/*.vue),
// and layouts are auto-imported by Nuxt — no manual import needed.
//
// <NuxtLayout>  picks the layout that the active page requested via
//               `definePageMeta({ layout: 'name' })`, or falls back to
//               layouts/default.vue if no layout is set.
// <NuxtPage />  renders the route-matched page component (index.vue).
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>