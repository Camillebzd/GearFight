import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'

const routes = [
    {path: '/', name: 'Home', component: Home},
    {path: '/personnalarmory', name: 'Personnal Armory', component: ()=>import('@/views/PersonnalArmory.vue')},
    {path: '/about', name: 'About', component: ()=>import('@/views/About.vue')},
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    linkActiveClass: 'test-active-classes',
})

export default router;