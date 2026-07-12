<script setup lang="ts">
import { ref, computed } from 'vue';
import greenSocksImage from '../assets/images/socks_green.jpeg'
import blueSocksImage from '../assets/images/socks_blue.jpeg'

const product = ref("Socks")
const brand = ref("Karbol")

const title = computed(() => {
  return brand.value + ' ' + product.value
})

const selectedVariant = ref(0)
const alt = ref('Alternative Message')

const details = ref(['50% cotton', '30% wool', '20% polyester'])

const variants = ref([
  { id: 2234, color: 'green', image: greenSocksImage, quantity: 50 },
  { id: 2345, color: "blue", image: blueSocksImage, quantity: 0 }
])

const cart = ref(0)
// in template it's not necessary to use .value, but in the script part it is.
const addToCart = () => cart.value += 1

const image = computed(() => {
  return variants.value[selectedVariant.value]?.image
})

const inStock = computed(() => {
  return variants.value[selectedVariant.value]?.quantity ?? 0 > 0
})

const updateVariant = (index: any) => {
  selectedVariant.value = index
}

const activeClassForButton = true

</script>

<template>
  <div class="nav-bar"></div>
  <div class="cart">Cart({{ cart }})</div>
  <div class="product-display">
    <div class="product-container">
      <div class="product-image">
        <!-- v bind: dynamically bind an attribute to an expression. shortcut of v-bind is just using a colon :src-->
        <img :class="{ 'out-of-stock-img': !inStock }" v-bind:src="image" :alt="alt">
      </div>
      <div class="product-info">
        <h1>{{ title }}</h1>
        <!-- if else case -->
        <p v-if="inStock">In Stock</p>
        <p v-else>Out of Stock</p>

        <ul>
          <li v-for="detail in details">{{ detail }}</li>
        </ul>
        <ul>
          <li v-for="(variant, index) in variants" :key="variant.id" @mouseover="updateVariant(index)" class="color-circle" :class="{active: activeClassForButton}"
            :style="{ backgroundColor: variant.color }">
          </li>
        </ul>

        <!-- To listen events on an element and trigger an event, we can use v-on -->
        <button class="button" :class="{ disabledButton: !inStock }" :disabled="!inStock" v-on:click="addToCart()">Add to Cart</button>
        <!-- You can also use @click -->
        <!-- <button class="button" @click="cart += 1">Add to Cart</button> -->

      </div>
    </div>
  </div>
</template>