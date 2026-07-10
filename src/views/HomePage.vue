<script setup lang="ts">
</script>

<template>
  <main class="home">
    <h1>Vue 3 Tutorial</h1>
    <p>Pick a page to work on:</p>

    <div class="cards">
      <router-link to="/lesson1" class="card">
        <h2>Lesson 1</h2>
        <p>Ref + mustache binding.</p>
      </router-link>

      <router-link to="/lesson2" class="card">
        <h2>Lesson 2</h2>
        <p>Image + v-bind</p>
      </router-link>

      <router-link to="/lesson3" class="card">
        <h2>Lesson 3</h2>
        <p>Image + v-bind</p>
      </router-link>

      <router-link to="/lesson4" class="card">
        <h2>Lesson 4</h2>
        <p>Image + v-bind</p>
      </router-link>

      <router-link to="/next-lesson" class="card">
        <h2>Next lesson</h2>
        <p>Trial</p>
      </router-link>
    </div>
  </main>
</template>

<style scoped>
.home { padding: 2rem; font-family: sans-serif; }
.cards { display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 1rem; }
.card {
  display: block;
  padding: 1.5rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  width: 220px;
  transition: transform .1s, box-shadow .1s;
}
.card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,.08); }
.card h2 { margin: 0 0 .5rem; }
.card p  { margin: 0; color: #555; }
</style>
