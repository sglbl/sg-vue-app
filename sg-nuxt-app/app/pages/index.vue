<script setup lang="ts">
import type { Tables } from '@db/database.types.ts'

// useSupabaseClient() is auto-imported by @nuxtjs/supabase.

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
    <!-- No layout shell here — layouts/default.vue wraps this with <main>, <h1>, <TopBar/>, <hr/> -->
    <div class="cards">
      <NuxtLink to="/lesson14" class="card">
        <h2>Lesson 14</h2>
        <p>Supabase Store</p>
      </NuxtLink>
    </div>
</template>