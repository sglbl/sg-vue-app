<script setup lang="ts">
import { ref } from 'vue';
// Ref (reactive state): a special variable that lets Vue know when it changes
const product = ref("Socks")
</script>

<template>
  <div class="product-display">
    <div class="product-container">
      <div class="product-info">
        <!-- Mustache syntax: it allows us to write JS expression inside our template -->
        <h1>{{ product }}</h1>
      </div>
    </div>
  </div>
</template>
