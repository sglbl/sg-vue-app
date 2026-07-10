import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomePage.vue'),
    },
    {
      path: '/socks',
      name: 'socks',
      component: () => import('@/views/SocksPage.vue'),
    },
    {
      path: '/next-lesson',
      name: 'next-lesson',
      component: () => import('@/views/NextLessonPage.vue'),
    },
  ],
})
