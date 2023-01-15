import { defineStore } from 'pinia'

export const useSpellsStore  = defineStore('SpellsStore', {
  state: () => {
    return {
      spells: []
    }
  },
  getters: {
  },
  actions: {
    // API on it to get data from back
    async fillSpells() {
      if (this.spells.length < 1) {
        this.spells = (await import('@/data/spells.json')).default;
        console.log("spells pulled");
      }
    },
    getSpell(spellName) {
      return this.spells.find(spell => spell.name === spellName);
    }
  },
})