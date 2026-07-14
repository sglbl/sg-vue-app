<script setup lang="ts">

// Reactive allows us to group related dtaa into a single variable
import {reactive} from 'vue'

const emit = defineEmits(['review-submitted'])

const review = reactive<{ name: string; content: string; rating: number | null }>({
  name: '',
  content: '',
  rating: null
})


const onSubmit = () => {
  if (review.name === '' || review.content === '' || review.rating === null){
    alert('Review is incomplete, please make sure you filled all the fields.')
    return 
  }
  const productReview = {
    name: review.name,
    content: review.content,
    rating: review.rating
  } 
  // add review form
  emit('review-submitted', productReview)

  // clear out and reset
  review.name = ''
  review.content = ''
  review.rating = null
}
</script>

<template>
  <!-- .prevent is a modifier that prevents browser refresh -->
  <form class="review-form" @submit.prevent="onSubmit">
    <h3>Leave a review</h3>
    <label for="name">Name: </label>
    <!-- v-model can create 2 way binding -->
    <input id="name" v-model="review.name">

    <label for="review">Review:</label>
    <textarea id="review" v-model="review.content"></textarea>

    <label for="rating">Rating:</label>
    <!-- .number is a modifier to typecast the value as a number. -->
    <select id="rating" v-model.number="review.rating">
      <option>5</option>
      <option>4</option>
      <option>3</option>
      <option>2</option>
      <option>1</option>

    </select>

    <input class="button" type="submit" value="Submit">

  </form>

</template>