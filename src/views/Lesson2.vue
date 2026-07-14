<script setup lang="ts">
import { ref } from 'vue';
import TopBar from '@shared/components/TopBar.vue';
import socksGreenImage from '@shared/assets/images/socks_green.jpeg'
const product = ref("Socks")
const image = ref(socksGreenImage)
const alt = ref('Message')
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
      </div>
    </div>
  </div>
</template>
