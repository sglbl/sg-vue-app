<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

// Browser-style back; fall back to Home when there's no history (deep link / hard refresh).
const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>

<template>
  <div class="nav-bar">
    <button class="back-button" type="button" @click="goBack">← Back</button>
  </div>
</template>

<style scoped>
.nav-bar {
  display: flex;
  align-items: center;
  padding: 0 1.25rem;
}

.back-button {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.5);
  color: white;
  font: inherit;
  font-size: 16px;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.35);
}
</style>
