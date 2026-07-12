<script setup lang="ts">
import { ref } from 'vue';
import ProductDisplay from '@/components/ProductDisplay.vue';

const cart = ref<number[]>([])
const premium = ref(true)

const updateCart = (id: number) => {
  cart.value.push(id)
}

</script>

<template>
  <div class="nav-bar"></div>
  <div class="cart">Cart({{ cart.length }})</div>
  <ProductDisplay :premium="premium" @add-to-cart="updateCart"></ProductDisplay>
</template>