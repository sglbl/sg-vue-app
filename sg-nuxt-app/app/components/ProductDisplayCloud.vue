<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import greenSocksImage from '@shared/assets/images/socks_green.jpeg'
import blueSocksImage  from '@shared/assets/images/socks_blue.jpeg'
import ReviewList from '@shared/components/ReviewList.vue'
import ReviewForm from '@shared/components/ReviewForm.vue'
import type { Tables } from '@db/database.types'

const props = defineProps({
  premium: {
    type: Boolean,
    required: true,
  },
  showReviews: {
    type: Boolean,
    default: false,
  },
})

// Nuxt-native: client from @nuxtjs/supabase module, no shared import, no Pinia
const supabase = useSupabaseClient()
type Review = Tables<'reviews'>

const reviews = ref<Review[]>([])
const loading = ref(false)

async function fetchReviews() {
  loading.value = true
  const { data, error: err } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false })
  if (!err) reviews.value = (data ?? []) as Review[]
  loading.value = false
}

async function addReview(review: { name: string; content: string; rating: number }) {
  const { error: err } = await supabase.from('reviews').insert(review)
  if (!err) await fetchReviews()
}

onMounted(fetchReviews)

const emit = defineEmits(['add-to-cart'])

const addToCart = () => {
  emit('add-to-cart', variants.value[selectedVariant.value]?.id)
}

const product = ref('Socks')
const brand   = ref('Karbol')

const title = computed(() => brand.value + ' ' + product.value)

const selectedVariant = ref(0)
const alt             = ref('Alternative Message')
const details         = ref(['50% cotton', '30% wool', '20% polyester'])

const variants = ref([
  { id: 2234, color: 'green', image: greenSocksImage, quantity: 50 },
  { id: 2345, color: 'blue',  image: blueSocksImage,  quantity: 0 },
])

const image    = computed(() => variants.value[selectedVariant.value]?.image)
const inStock  = computed(() => (variants.value[selectedVariant.value]?.quantity ?? 0) > 0)
const shipping = computed(() => (props.premium ? 'Free' : 2.99))

const updateVariant = (index: number) => {
  selectedVariant.value = index
}

const activeClassForButton = true
</script>

<template>
  <div class="product-display">
    <div class="product-container">
      <div class="product-image">
        <img
          :class="{ 'out-of-stock-img': !inStock }"
          :src="image"
          :alt="alt"
        >
      </div>

      <div class="product-info">
        <h1>{{ title }}</h1>
        <p v-if="inStock">In Stock</p>
        <p v-else>Out of Stock</p>
        <p>Shipping: {{ shipping }}</p>

        <ul>
          <li v-for="detail in details">{{ detail }}</li>
        </ul>

        <ul>
          <li
            v-for="(variant, index) in variants"
            :key="variant.id"
            class="color-circle"
            :class="{ active: activeClassForButton }"
            :style="{ backgroundColor: variant.color }"
            @mouseover="updateVariant(index)"
          />
        </ul>

        <button
          class="button"
          :class="{ disabledButton: !inStock }"
          :disabled="!inStock"
          @click="addToCart()"
        >
          Add to Cart
        </button>
      </div>
    </div>

    <template v-if="props.showReviews">
      <ReviewList v-if="reviews.length > 0" :reviews="reviews" />
      <ReviewForm @review-submitted="addReview" />
    </template>
  </div>
</template>
