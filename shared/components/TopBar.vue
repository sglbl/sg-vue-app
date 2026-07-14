<script setup lang="ts">
import { useRouter } from 'vue-router'

withDefaults(
  defineProps<{ showBack?: boolean }>(),
  { showBack: true }
)

const router = useRouter()

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
    <button v-if="showBack" class="nav-button" type="button" @click="goBack">
      ← Back
    </button>
    <slot />
  </div>
</template>
