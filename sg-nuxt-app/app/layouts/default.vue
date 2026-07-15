<script setup lang="ts">
// Auto-imports in this file:
//   - <TopBar />   (from @shared/components, pathPrefix: false in nuxt.config)
//   - <NuxtLink /> (Nuxt built-in)
//   - useRoute()   (Nuxt built-in)

const route = useRoute()
</script>

<template>
  <main class="home">

    <TopBar :show-back="route.path !== '/'">
      
      <NuxtLink to="/">Home</NuxtLink>
      <NuxtLink to="/lesson14">Lesson 14</NuxtLink>
    </TopBar>
    <h3>Vue 3 - Nuxt 4 Tutorial</h3>

    <hr />

    <!-- The page renders here. Every page that uses `definePageMeta({ layout: 'default' })`
         — or no layout at all (default is the fallback) — gets this shell. -->
    <slot />
  </main>
</template>
