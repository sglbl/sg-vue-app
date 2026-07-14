<script setup lang="ts">
import type { Tables } from '../../supabase/database.types.ts';
const supabase = useSupabaseClient()

const { data: reviews } = await
useAsyncData('reviews-latest', async () => {
    const { data, error: err } = await
        supabase
            .from('reviews')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5)

    if (err) throw err
    return data ?? []
})
</script>

<template>
    <section>
        <h1>Home</h1>
        <p>Mirrors the Supabase setup from <code>sg-vue-app</code></p>

        <h2>Latest reviews</h2>
        <ul v-if="reviews && reviews.length">
            <li v-for="r in reviews" :key="r.id">
                <strong>{{ r.name }}</strong> - {{ 
                    r.rating }} / 5
                    <p>{{ r.content }}</p>
            </li>
        </ul>
        <p v-else>No reviews yet.</p>

    </section>

</template>