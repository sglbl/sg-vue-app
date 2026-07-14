<script setup lang="ts">
import type { Tables } from '@db/database.types.ts';
// import '@shared/assets/main.css'

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
    <main class="home">

    <div class="cards">
      <router-link to="/lesson14" class="card">
       <h2>Lesson 14</h2>
            <p>Supabase Store</p>
      </router-link>

      </div>
      </main>  

</template>