<script setup lang="ts">
// definePageMeta is a Nuxt compiler macro (auto-imported).
// Setting `layout: 'lesson'` tells <NuxtLayout> to use app/layouts/lesson.vue
// instead of default.vue for THIS page only.
//
// Auto-imports in use below:
//   - ref                (Vue)
//   - <ProductDisplayCloud />  (from app/components/, auto by Nuxt)
//   - <TopBar />         (from @shared/components via nuxt.config components[])
//
// Note: no `import TopBar from '@shared/components/TopBar.vue'` needed,
// and no `import ProductDisplayCloud from '@/components/ProductDisplayCloud.vue'`
// needed — both are auto-imported by Nuxt.

definePageMeta({
  layout: 'lesson',
})

const cart = ref<number[]>([])
const premium = ref(true)

const updateCart = (id: number) => {
  cart.value.push(id)
}
</script>

<template>
  <div class="cart">Cart({{ cart.length }})</div>
  <ProductDisplayCloud :premium="premium" :show-reviews="true" @add-to-cart="updateCart" />
</template>