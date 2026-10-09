---
name: review-feature
description: This skill should be used when the user asks about reviews, the review form, ReviewList/ReviewForm components, the reviews store, or persisting reviews (localStorage or Supabase). Triggers on "review", "reviews", "ReviewForm", "ReviewList", "review persistence".
---

# Review feature context

Two backends coexist in this tutorial:
- **Lessons 11–12**: Pinia store `useReviewsStore` + `persist: true` → localStorage
- **Lesson 13**: Pinia store `useCloudReviewsStore` → Supabase `reviews` table

Components:
- `src/components/ReviewForm.vue` — emits `review-submitted`
- `src/components/ReviewList.vue` — takes `reviews` prop
- `src/components/ProductDisplay.vue` — localStorage variant (lessons 11–12)
- `src/components/ProductDisplayCloud.vue` — Supabase variant (lesson 13)

Type: `src/types/Review.ts`
