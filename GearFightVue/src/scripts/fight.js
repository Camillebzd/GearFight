function doDamage(target, amount) {
  target.life -= amount;
  if (target.life < 0)
    target.life = 0;
}

function doHeal(target, amount) {
  target.life += amount;
  if (target.life > target.life_base)
    target.life = target.life_base;
}

export function resolveSpell(user, spell, target) {
  spell.data.number -= 1;
  switch (spell.data.type) {
    case "DAMAGE":
      doDamage(target, user.attack * spell.data.ratio);
      break;
    case "HEAL":
      doHeal(target, user.attack * spell.data.ratio);
      break;
    default:
      break;
  }
  spell.data.buffs.map(buff => {
    switch (buff.target) {
      case "LAUNCHER":
        addBuff(user, buff);
        break;
      case "ALLIES":
        break;
      case "TARGET":
        addBuff(target, buff);
        break;
      case "ENEMIES":
          break;  
      default:
        break;
    }
  });
  spell.data.debuffs.map(debuff => {
    switch (debuff.target) {
      case "LAUNCHER":
        addDebuff(user, debuff);
        break;
      case "ALLIES":
        break;
      case "TARGET":
        addDebuff(target, debuff);
        break;
      case "ENEMIES":
          break;  
      default:
        break;
    }
  });
}

export function isAlive(entitie) {
  return entitie.life > 0;
}

export function resetAttackToBaseStat(target) {
  target.attack = target.attack_base;
}

export function resetDefenseToBaseStat(target) {
  target.defense = target.defense_base;
}

export function resetSpeedToBaseStat(target) {
  target.stats.speed = target.speed_base
}

export function resetAllToBaseStat(target) {
  resetAttackToBaseStat(target);
  resetDefenseToBaseStat(target);
  resetSpeedToBaseStat(target);
}

export function cleanFinishedBuff(target) {
  for (let i = 0; i < target.buffs.length; i++) {
    if (target.buffs[i].turns <= 0)
      removeBuff(target, target.buffs[i]);
  }
}

export function applyBuffs(target) {
  for (let i = 0; i < target.buffs.length; i++) {
    let buff = target.buffs[i];
    target[buff.data.stat] += target[buff.data.stat + "_base"] * buff.data.ratio;
    buff.turns -= 1;
  }
}

function removeBuff(target, buff) {
  target[buff.data.stat] -= target[buff.data.stat + "_base"] * buff.data.ratio;
  for (let i = 0; i < target.buffs.length; i++)
    if (target.buffs[i].name == buff.name && target.buffs[i].id == buff.id)
      target.buffs.splice(i, 1);
}

function addBuff(target, buff) {  
  for (let i = 0; i < target.buffs.length; i++)
    if (target.buffs[i].name == buff.name && target.buffs[i].id == buff.id) { // block the type of buff too ?
      removeBuff(target, target.buffs[i], i);
    }
  target.buffs.push({...buff});
  // add 1 turn of buff because the apply will remove 1
  target.buffs[target.buffs.length - 1].turns += 1;
  applyBuffs(target);
}

export function cleanFinishedDebuff(target) {
  for (let i = 0; i < target.debuffs.length; i++)
    if (target.debuffs[i].turns <= 0)
      removeDebuff(target, target.debuffs[i]);
}

export function applyDebuffs(target) {
  for (let i = 0; i < target.debuffs.length; i++) {
    let debuff = target.debuffs[i];
    if (debuff.data.type == "DAMAGE") {
      target.life -= target[debuff.data.base] * debuff.data.ratio;
    } else {
      target[debuff.data.stat] -= target[debuff.data.stat + "_base"] * debuff.data.ratio;
    }
    debuff.turns -= 1;
  }
}

function removeDebuff(target, debuff) {
  target[debuff.data.stat] -= target[debuff.data.stat + "_base"] * debuff.data.ratio;
  for (let i = 0; i < target.debuffs.length; i++)
    if (target.debuffs[i].name == debuff.name && target.debuffs[i].id == debuff.id)
      target.debuffs.splice(i, 1);
}

function addDebuff(target, debuff) {
  for (let i = 0; i < target.debuffs.length; i++)
    if (target.debuffs[i].name == debuff.name && target.debuffs[i].id == debuff.id) // stack system ???
      target.debuffs.splice(i, 1);
  target.debuffs.push({...debuff});
  // add 1 turn of debuff because the apply will remove 1
  if (debuff.data.type != "DAMAGE") {
    target.buffs[target.buffs.length - 1].turns += 1;
    applyDebuffs(target);
  }
}

function getEntitieFromRoom(room, entitieToFind) {
  return room[entitieToFind.side].find(entitie => entitie.id == entitieToFind.id && entitie.isNPC == entitieToFind.isNPC);
}

function resolveAction(room, action) {
  resolveSpell(getEntitieFromRoom(room, {id: action.user.id, isNPC: action.user.isNPC, side: action.user.side}), action.spell, getEntitieFromRoom(room, {id: action.target.id, isNPC: action.target.isNPC, side: action.target.side}));
}


// NEW FIGHT SYSTEM BY SIMON ------------------------------------------------------------------------------------------------------------------------------------------

import {
  ATTACKER_SPEED_WEIGHT
} from "./systemValues";
import { getRandomInt } from "./utils";
import { END_OF_TURN } from "./actions";

// fight

// Main loop for resolves actions
export function resolveActions(actions) {
  // TODO Apply some rules here ?
  // 2. Calculate the order
  sortActionOrder(actions);
  for (let i = 0; i < actions.length; i++) {
    let resultOfAction = actions[i].resolve();

    if (resultOfAction == END_OF_TURN.TARGET_BLOCKED || resultOfAction == END_OF_TURN.NORMAL)
      continue;
    // latter get the id here if there is a combo so handle easily multiple entities
    return resultOfAction;
  }
}

function sortActionOrder(actions) {
  actions.sort((a, b) => {
    let prioDif = (b.caster.getSpeedState() + b.getSpeedRule()) - (a.caster.getSpeedState() + a.getSpeedRule());
    if (prioDif == 0) {
      let speedDif = (b.spell.initiative * ((b.caster.stats.speed ** ATTACKER_SPEED_WEIGHT) / 1000)) - (a.spell.initiative * ((a.caster.stats.speed ** ATTACKER_SPEED_WEIGHT) / 1000));
      return speedDif == 0 ? (getRandomInt(1) == 0 ? -1 : 1) : speedDif;
    } else
      return prioDif;
  });
}