import { defineStore } from 'pinia'
import type { Review } from '@/types/Review.ts'

export const useReviewsStore = defineStore('reviews', {
  state: () => ({
    reviews: [] as Review[]
  }),
  actions: {
    addReview(review: Review) {
      this.reviews.push(review)
    }
  },
  // what pinia-plugin-persistedstate looks for (to save to localStorage)
  persist: true  
})


/*
Local storage and Cookies are not the same.

🗄️ localStorage 
What it stores: Key-value pairs you choose (your reviews JSON)
Size: ~5–10 MB
Sent to server? ❌ Never. Stays in the browser only.
Lifetime: Until you or the user clears it (or you delete the specific key)
Used for: App data you want to keep between page refreshes (preferences, drafts, cart, reviews, theme)

🍪 Cookies
What it stores: Tiny key-value pairs (~4 KB each)
Size: Tiny — total per domain usually capped at ~50 cookies / 4 KB each
Sent to server? ✅ Yes, automatically, with every HTTP request to that domain. That's the whole point — the server can read them.
Lifetime: You set it (session cookies die when browser closes, or a fixed expiry date)
Used for: Authentication/sessions ("this user is logged in"), tracking, server-readable preferences
*/