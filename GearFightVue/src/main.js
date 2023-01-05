import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router'
import Notifications from '@kyvg/vue3-notification'
import { createPinia } from 'pinia'

// import './assets/main.css'
import 'mdb-vue-ui-kit/css/mdb.min.css';

const pinia = createPinia()

createApp(App)
.use(router)
.use(Notifications)
.use(pinia)
.mount('#app')
