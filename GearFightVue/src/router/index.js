import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'

const routes = [
  {path: '/', name: 'Home', component: Home},
  {path: '/personnalarmory', name: 'PersonnalArmory', component: ()=>import('@/views/PersonnalArmory.vue')},
  {path: '/about', name: 'About', component: ()=>import('@/views/About.vue')},
  {
    path: '/gear/:id/:slug',
    name: 'gear.show', 
    component: ()=>import('@/views/GearShow.vue'),
    props: route=>({...route.params, id: parseInt(route.params.id)}),
    beforeEnter(to, from) {
      const maxTokenId = 3; //number of token minted to get dynamicaly
      if (parseInt(to.params.id) > maxTokenId)
        return {
          name: 'NotFound',
          params: {pathMatch: to.path.split('/').slice(1)},
          query: to.query,
          hash: to.hash
        }
    },
  },
  {path: '/:pathMatch(.*)*', name: 'NotFound', component: ()=>import('@/views/NotFound.vue')},
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || new Promise((resolve)=>{
      setTimeout(() => resolve({top: 0}), 300)
    })
  }
})

export default router;