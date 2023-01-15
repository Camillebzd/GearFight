import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'

const routes = [
  {path: '/', name: 'Home', component: Home},
  {path: '/world', name: 'World', component: ()=>import('@/views/World.vue')},
  {path: '/personnalarmory', name: 'PersonnalArmory', component: ()=>import('@/views/PersonnalArmory.vue')},
  {path: '/market', name: 'Market', component: ()=>import('@/views/Market.vue')},
  {path: '/about', name: 'About', component: ()=>import('@/views/About.vue')},
  {
    path: '/gear/:id/:slug',
    name: 'gear.show', 
    component: ()=>import('@/views/GearShow.vue'),
    // props: route=>({...route.params, id: parseInt(route.params.id)}),
    beforeEnter(to, from) {
      const maxTokenId = 30; //number of token minted to get dynamicaly
      if (parseInt(to.params.id) > maxTokenId)
        return {
          name: 'NotFound',
          params: {pathMatch: to.path.split('/').slice(1)},
          query: to.query,
          hash: to.hash
        }
    },
  },
  {
    path: '/monster/:id/:slug',
    name: 'monster.show', 
    component: ()=>import('@/views/MonsterShow.vue'),
    // props: route=>({...route.params, id: parseInt(route.params.id)}),
    beforeEnter(to, from) {
      const maxMonsterId = 39; // monster number possible
      if (parseInt(to.params.id) > maxMonsterId)
        return {
          name: 'NotFound',
          params: {pathMatch: to.path.split('/').slice(1)},
          query: to.query,
          hash: to.hash
        }
    },
  },
  {path: '/fight/:roomId/:gearId', name: 'fight', props: true, component: ()=>import('@/views/Fight.vue')},
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