<script setup lang="ts">
import { ref } from 'vue';
import TopBar from '@shared/components/TopBar.vue';
import ProductDisplay from '@/components/ProductDisplay.vue';

const cart = ref<number[]>([])
const premium = ref(true)

const updateCart = (id: number) => {
  cart.value.push(id)
}

</script>

<template>
  <TopBar />
  <div class="cart">Cart({{ cart.length }})</div>
  <ProductDisplay :premium="premium" :show-reviews="true" @add-to-cart="updateCart"></ProductDisplay>
</template>