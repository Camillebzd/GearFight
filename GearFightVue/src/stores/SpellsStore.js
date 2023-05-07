import { defineStore } from 'pinia'

export const useSpellsStore  = defineStore('SpellsStore', {
  state: () => {
    return {
      spells: [],
      buffs: [],
      debuffs: [],
      // new
      weaponsSpells: [],
      monstersSpells: []
    }
  },
  getters: {
  },
  actions: {
    // API on it to get data from back
    async fillSpells() {
      if (this.spells.length < 1) {
        this.spells = (await import('@/data/spells.json')).default;
        this.spells.map(spell => {
          this.addBuffs(spell);
          this.addDebuffs(spell);
        });
        console.log("spells pulled");
      }
    },
    async fillBuffs() {
      if (this.buffs.length < 1) {
        this.buffs = (await import('@/data/buffs.json')).default;
        console.log("buffs pulled");
      }
    },
    async fillDebuffs() {
      if (this.debuffs.length < 1) {
        this.debuffs = (await import('@/data/debuffs.json')).default;
        console.log("debuffs pulled");
      }
    },
    async fillAllSpellData() {
      await this.fillBuffs();
      await this.fillDebuffs();
      await this.fillSpells();
      console.log("done pulling all spells");
    },
    getSpell(spellName) {
      return JSON.parse(JSON.stringify(this.spells.find(spell => spell.name === spellName)));
    },
    getBuff(buffName) {
      return JSON.parse(JSON.stringify(this.buffs.find(buff => buff.name === buffName)));
    },
    getDebuff(debuffName) {
      return JSON.parse(JSON.stringify(this.debuffs.find(debuff => debuff.name === debuffName)));
    },
    addBuffs(spell) {
      for (let i = 0; i < spell.data.buffs.length; i++) {
        if ('turns' in spell.data.buffs[i])
          spell.data.buffs[i] = {...this.getBuff(spell.data.buffs[i].name), turns: spell.data.buffs[i].turns, target: spell.data.buffs[i].target};
        else
          spell.data.buffs[i] = {...this.getBuff(spell.data.buffs[i].name)};
      }
    },
    addDebuffs(spell) {
      for (let i = 0; i < spell.data.debuffs.length; i++) {
        if ('turns' in spell.data.debuffs[i])
          spell.data.debuffs[i] = {...this.getDebuff(spell.data.debuffs[i].name), turns: spell.data.debuffs[i].turns, target: spell.data.debuffs[i].target};
        else
          spell.data.debuffs[i] = {...this.getDebuff(spell.data.debuffs[i].name)};
      }
    },
    // new
    async fillWeaponsSpells() {
      this.weaponsSpells = (await import("@/data/spells/weapons.json")).default;
      console.log("weapons spells pulled");
    },
    async fillMonstersSpells() {
      this.monstersSpells = (await import("@/data/spells/monsters.json")).default;
      console.log("monsters spells pulled");
    },
    getWeaponsSpellFromId(id) {
      return JSON.parse(JSON.stringify(this.weaponsSpells.find(spell => spell.id === id)));
    },
    getWeaponsSpellFromName(name) {
      return JSON.parse(JSON.stringify(this.weaponsSpells.find(spell => spell.name === name)));
    },
    getMonstersSpellFromId(id) {
      return JSON.parse(JSON.stringify(this.monstersSpells.find(spell => spell.id === id)));
    },
    getMonstersSpellFromName(name) {
      return JSON.parse(JSON.stringify(this.monstersSpells.find(spell => spell.name === name)));
    }
  },
})