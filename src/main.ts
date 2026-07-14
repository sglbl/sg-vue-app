import '@shared/assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'

import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia() // store holder
pinia.use(piniaPluginPersistedstate)

createApp(App).use(router).use(pinia).mount('#app')
