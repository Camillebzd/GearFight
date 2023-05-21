import { defineStore } from 'pinia'
import { useSpellsStore } from './SpellsStore';

export const useMonstersStore  = defineStore('MonstersStore', {
  state: () => {
    return {
      monsters: [],
    }
  },
  getters: {
  },
  actions: {
    // API on it to get data from back
    async fillMonstersData() {
      // this.monsters = (await import('@/data/monsters.json')).default;
      this.monsters = JSON.parse(JSON.stringify((await import('@/data/monsters/base.json')).default));
      let spellsStore = useSpellsStore();
      await spellsStore.fillMonstersSpells();
      for (let i = 0; i < this.monsters.length; i++) {
        let spellsId = this.monsters[i].spells;
        let monsterSpells = [];
        spellsId.forEach((spellId) => {
          monsterSpells.push(spellsStore.getMonstersSpellFromId(spellId));
        });
        this.monsters[i].spells = monsterSpells;
      }
      console.log("monsters pulled");
    },
    getMonster(idToFind) {
      return JSON.parse(JSON.stringify(this.monsters.find(monster => monster.id == idToFind)));
    },
    getFightFormMonster(id) {
      let monster = this.getMonster(id);

      return JSON.parse(JSON.stringify({
        ...monster,
        spells: JSON.parse(JSON.stringify(monster.spells)),
        healthBase: monster.health,
        speedBase: monster.speed,
        mindBase: monster.mind,
        sharpDmgBase: monster.sharpDmg,
        bluntDmgBase: monster.bluntDmg,
        burnDmgBase: monster.burnDmg,
        sharpResBase: monster.sharpRes,
        bluntResBase: monster.bluntRes,
        burnResBase: monster.burnRes,
        pierceBase: monster.pierce,
        handlingBase: monster.handling,
        guardBase: monster.guard,
        lethalityBase: monster.lethality,
        buffs: [],
        debuffs: [],
        isNPC: true,
        played: false,
        action: {},
        side: 'group2' // manage group on front !
      }));
    }
  },
})