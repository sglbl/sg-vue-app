<script setup lang="ts">
import { ref, computed } from 'vue';
import greenSocksImage from '../assets/images/socks_green.jpeg'
import blueSocksImage from '../assets/images/socks_blue.jpeg'

const product = ref("Socks")
const brand = ref("Karbol")
const image = ref(greenSocksImage)
const alt = ref('Message')
const inventory = ref(10)
// inStock is derived from inventory so the button + image react when stock hits 0
const inStock = computed(() => inventory.value > 0)

const details = ref(['50% cotton', '30% wool', '20% polyester'])

const variants = ref([
  { id: 2234, color: 'green', image: greenSocksImage },
  { id: 2345, color: "blue", image: blueSocksImage }
])

const cart = ref(0)
// in template it's not necessary to use .value, but in the script part it is.
const addToCart = () => cart.value += 1

const updateImage = (variantImage: string) => {
  image.value = variantImage
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
        <h1>{{ brand + " " + product }}</h1>
        <!-- v-show is to toggle -->
        <p v-show="inStock">Only visible when inStock is true</p>
        <!-- if else case -->
        <p v-if="inventory > 10">In Stock</p>
        <p v-else-if="inventory <= 10 && inventory > 0">Almost sold out!</p>
        <p v-else>Out of Stock</p>

        <ul>
          <li v-for="detail in details">{{ detail }}</li>
        </ul>
        <ul>
          <li v-for="variant in variants" :key="variant.id" @mouseover="updateImage(variant.image)" class="color-circle" :class="{active: activeClassForButton}"
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