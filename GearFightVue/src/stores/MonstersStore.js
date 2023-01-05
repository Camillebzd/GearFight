import { defineStore } from 'pinia'


export const useMonstersStore  = defineStore('MonstersStore', {
  state: () => {
    return {
      monsters: []
    }
  },
  getters: {
  },
  actions: {
    // API on it to get data from back
    async fill() {
      this.monsters = (await import('@/data/monsters.json')).default;
    },
  },
})