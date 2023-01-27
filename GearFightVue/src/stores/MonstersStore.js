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
      console.log("monsters pulled");
    },
    getMonster(idToFind) {
      return this.monsters.find(monster => monster.id == idToFind);
    },
    getFightFormMonster(id) {
      let monster = this.getMonster(id);

      return {
        name: monster.name,
        id: parseInt(id),
        description: monster.description,
        image: monster.image,
        level: parseInt(monster.level),
        life: parseInt(monster.life),
        life_base: parseInt(monster.life),
        attack: parseInt(monster.attack),
        attack_base: parseInt(monster.attack),
        speed: parseInt(monster.speed),
        speed_base: parseInt(monster.speed),
        skills: monster.skills,
        buffs: [],
        debuffs: [],
        type: monster.type,
        rarity: monster.rarity,
        isNPC: true,
        played: false,
        action: {},
        side: 'group2' // manage group on front !
      };
    }
  },
})