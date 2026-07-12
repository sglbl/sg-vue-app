<script setup lang="ts">
import { ref } from 'vue';
import ProductDisplay from '@/components/ProductDisplay.vue';

const cart = ref(0)
const premium = ref(true)

</script>

<template>
  <div class="nav-bar"></div>
  <div class="cart">Cart not working after separating with Product Display({{ cart }})</div>
  <ProductDisplay :premium="premium"></ProductDisplay>
</template>