import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('@/views/HomePage.vue') },
    { path: '/lesson1', name: 'lesson1', component: () => import('@/views/Lesson1.vue') },
    { path: '/lesson2', name: 'lesson2', component: () => import('@/views/Lesson2.vue') },
    { path: '/lesson3', name: 'lesson3', component: () => import('@/views/Lesson3.vue') },
    { path: '/lesson4', name: 'lesson4', component: () => import('@/views/Lesson4.vue') },
    { path: '/lesson5', name: 'lesson5', component: () => import('@/views/Lesson5.vue') },
    { path: '/lesson6', name: 'lesson6', component: () => import('@/views/Lesson6.vue') },
    { path: '/lesson7', name: 'lesson7', component: () => import('@/views/Lesson7.vue') },
    { path: '/lesson8', name: 'lesson8', component: () => import('@/views/Lesson8.vue') },
    { path: '/lesson9', name: 'lesson9', component: () => import('@/views/Lesson9.vue') },
    { path: '/lesson10', name: 'lesson10', component: () => import('@/views/Lesson10.vue') },
    { path: '/lesson11', name: 'lesson11', component: () => import('@/views/Lesson11.vue') },
    { path: '/lesson12', name: 'lesson12', component: () => import('@/views/Lesson12.vue') },
    { path: '/next-lesson', name: 'next-lesson', component: () => import('@/views/NextLessonPage.vue') },
  ],

  // Always scroll to the top on forward navigation; restore saved position on back/forward.
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition ?? { top: 0 }
  },
})
