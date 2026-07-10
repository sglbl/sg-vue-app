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
      path: '/lesson1',
      name: 'socks',
      component: () => import('@/views/Lesson1.vue'),
    },
    {
      path: '/lesson2',
      name: 'image',
      component: () => import('@/views/Lesson2.vue'),
    },
    {
      path: '/lesson3',
      name: 'other1',
      component: () => import('@/views/Lesson3.vue'),
    },
    {
      path: '/lesson4',
      name: 'other2',
      component: () => import('@/views/Lesson4.vue'),
    },
    {
      path: '/next-lesson',
      name: 'next-lesson',
      component: () => import('@/views/NextLessonPage.vue'),
    },
  ],
})
