<script setup lang="ts">
import type { Review } from '@/types/Review.ts';

// a different method that reviewform file's reactive type declaration.
defineProps<{
  reviews: Review[]
}>()
</script>

<template>
    <div class="review-container">
        <h3>Reviews:</h3>
        <ul>
            <li v-for="(review, index) in reviews" :key="index">
                <span>{{  review.name }} gave this {{ review.rating }} stars</span>
            </li>
        </ul>

    </div>
</template>