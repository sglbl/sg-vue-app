<script setup lang="ts">
// Auto-imports: <NuxtPage />, <NuxtLink />
</script>

<template>
  <main>
    <nav>
      <NuxtLink to="/">Home</NuxtLink>
      |
      <NuxtLink to="/lesson13">Lesson 13</NuxtLink>
      |
      <NuxtLink to="/about">About</NuxtLink>
    </nav>

    <hr />

    <NuxtPage />
  </main>
</template>

<style>
:root { font-family: system-ui, sans-serif; }
nav a { margin-right: 0.5rem; }
nav a.router-link-active { font-weight: bold; }
</style>