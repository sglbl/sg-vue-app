import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Tables } from '@db/database.types.ts';

export const useCloudReviewsStore = defineStore('cloudReviews', () => {
  // state
  const reviews  = ref<Tables<'reviews'>[]>([])
  const loading  = ref(false)
  const error    = ref<string | null>(null)

  // actions
  async function fetchReviews() {
    loading.value = true

    // 👇 alias the destructured `error` to `err` so it doesn't shadow the ref
    const { data, error: err } = await supabase.from('reviews').select('*')
    if (err) error.value = err.message
    else reviews.value = (data as Tables<'reviews'>[]) ?? []

    loading.value = false
  }

  async function addReview(review: Tables<'reviews'>) {
    // 👇 same fix — Supabase's actual key is `error`, not `err`
    const { error: err } = await supabase.from('reviews').insert(review)
    if (err) error.value = err.message
    else await fetchReviews()
  }


  // expose to consumers
  return { reviews, loading, error, fetchReviews, addReview }
})  // no `persist: true` — Supabase IS the persistence
