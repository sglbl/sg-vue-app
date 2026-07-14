<script setup lang="ts">
import {ref, computed} from 'vue'

interface CartItem {
    id: number,
    name: string,
    price: number
}

const products: CartItem[] = [
    {id: 1, name: 'Coffee', price: 4},
    {id: 2, name: 'Bagel',  price: 3},
    {id: 3, name: 'Sandwich', price: 7},
]

const cart = ref<CartItem[]>([])

const addToCart = (product: CartItem) => {
    cart.value.push(product)
}

const total = computed(() => 
    cart.value.reduce((sum, item) => sum + item.price, 0))
</script>


<template>
  <section>
    <h1>Lesson 13 — Cart demo</h1>
    <p>Cart({{ cart.length }}) — Total: ${{ total }}</p>

    <ul>
      <li v-for="product in products" :key="product.id">
        {{ product.name }} — ${{ product.price }}
        <button @click="addToCart(product)">Add to cart</button>
      </li>
    </ul>

    <h2 v-if="cart.length">In cart</h2>
    <ul v-if="cart.length">
      <li v-for="(item, i) in cart" :key="i">
        {{ item.name }} — ${{ item.price }}
      </li>
    </ul>
  </section>
</template>

<style scoped>
button { margin-left: 0.5rem; }
</style>