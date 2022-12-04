import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router'
import Notifications from '@kyvg/vue3-notification'

// import './assets/main.css'
import 'mdb-vue-ui-kit/css/mdb.min.css';

createApp(App)
.use(router)
.use(Notifications)
.mount('#app')
