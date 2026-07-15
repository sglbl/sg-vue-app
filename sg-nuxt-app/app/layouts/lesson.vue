<script setup lang="ts">
// This second layout exists purely to show that Nuxt auto-imports ANY file
// under app/layouts/ — not just default.vue.
// A page opts into it with:  definePageMeta({ layout: 'lesson' })

</script>

<template>
  <div class="lesson-shell">
    <TopBar show-back>
      <h2 class="lesson-title">Lesson Mode</h2>
    </TopBar>

    <section class="lesson-body">
      <!-- slot is where the current page renders, the layout is just a vue component with slot -->
      <slot />
    </section>
  </div>
</template>

<style scoped>
.lesson-shell {
  padding: 2rem;
  font-family: sans-serif;
}
.lesson-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.lesson-header h2 {
  margin: 0;
  font-size: 24px;
}
.back-link {
  text-decoration: none;
  color: #16c0b0;
  font-weight: 500;
}
.lesson-body {
  border: 1px dashed #c9c9c9;
  padding: 1.5rem;
  border-radius: 8px;
  background: #fafafa;
}
.lesson-title {
  text-decoration: none;
  color: #ffffff;
  font-weight: 300;
}
</style>