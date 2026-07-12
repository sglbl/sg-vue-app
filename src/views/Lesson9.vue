<script setup lang="ts">
import { ref } from 'vue';
import TopBar from '@/components/TopBar.vue';
import ProductDisplay from '@/components/ProductDisplay.vue';

const cart = ref(0)
const premium = ref(true)

</script>

<template>
  <TopBar />
  <div class="cart">Cart not working after separating with Product Display({{ cart }})</div>
  <ProductDisplay :premium="premium"></ProductDisplay>
</template>