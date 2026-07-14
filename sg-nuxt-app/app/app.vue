<script setup lang="ts">
// Auto-imports: <NuxtPage />, <NuxtLink />

// main css is already imported in nuxt.config.ts
// import '@shared/assets/main.css'
const route = useRoute()

</script>


<template>
  <main class="home">
    <h1>Vue 3 - Nuxt 4 Tutorial</h1>
    
    <TopBar :show-back="route.path !== '/'">
      <NuxtLink to="/">Home</NuxtLink>
      <NuxtLink to="/lesson14">Lesson 14</NuxtLink>
    </TopBar>

    <!-- horizontal rule -->
    <hr />

    <NuxtPage />
  </main>
      
</template>
