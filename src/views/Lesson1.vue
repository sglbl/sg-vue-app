<script setup lang="ts">
import { ref } from 'vue';
import TopBar from '@shared/components/TopBar.vue';
// Ref (reactive state): a special variable that lets Vue know when it changes
const product = ref("Socks")
</script>

<template>
  <TopBar />
  <div class="product-display">
    <div class="product-container">
      <div class="product-info">
        <!-- Mustache syntax: it allows us to write JS expression inside our template -->
        <h1>{{ product }}</h1>
      </div>
    </div>
  </div>
</template>
