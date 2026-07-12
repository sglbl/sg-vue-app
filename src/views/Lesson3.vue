<script setup lang="ts">
import { ref } from 'vue';
import TopBar from '@/components/TopBar.vue';
import socksGreenImage from '../assets/images/socks_green.jpeg'
const product = ref("Socks")
const image = ref(socksGreenImage)
const alt = ref('Message')
const inStock = ref(true)
const inventory = ref(10)
</script>

<template>
  <TopBar />
  <div class="product-display">
    <div class="product-container">
      <div class="product-image">
        <!-- v bind: dynamically bind an attribute to an expression. shortcut of v-bind is just using a colon :src-->
        <img v-bind:src=image :alt="alt">
      </div>
      <div class="product-info">
        <h1>{{ product  }}</h1>
        <!-- v-show is to toggle -->
        <p v-show="inStock">Only visible when inStock is true</p>
        <!-- if else case -->
        <p v-if="inventory > 10">In Stock</p>
        <p v-else-if="inventory <= 10 && inventory > 0">Almost sold out!</p>
        <p v-else>Out of Stock</p>
      </div>
    </div>
  </div>
</template>
 