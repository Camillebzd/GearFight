import { defineStore } from 'pinia'
import { useSpellsStore } from './SpellsStore';
import { Monster } from '@/scripts/entities';

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
    async fillMonstersData(forceReaload = false) {
      if (this.monsters.length > 0 && !forceReaload)
        return;
      let monstersData = JSON.parse(JSON.stringify((await import('@/data/monsters/base.json')).default));
      let spellsStore = useSpellsStore();
      await spellsStore.fillMonstersSpells();
      for (let i = 0; i < monstersData.length; i++) {
        let spellsId = monstersData[i].spells;
        let monsterSpells = [];
        spellsId.forEach((spellId) => {
          monsterSpells.push(spellsStore.getMonstersSpellFromId(spellId));
        });
        monstersData[i].spells = monsterSpells;
        this.monsters.push(new Monster(monstersData[i]));
      }
      console.log("monsters pulled");
    },
    async getMonster(idToFind) {
      let monster = this.monsters.find(monster => monster.id == idToFind);
      if (!monster) {
        await this.fillMonstersData(true);
        monster = this.monsters.find(monster => monster.id == idToFind);
        if (!monster) {
          console.log("Error: can't get a valid monster");
          return {};
        }
      }
      return monster.clone();
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