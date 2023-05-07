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
  target.speed = target.speed_base
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


// NEW FIGHT SYSTEM BY SIMON

const ATTACKER_SPEED_WEIGHT = 2;
const DEFENDER_GUARD_WEIGHT = 0.57;
const DAMAGE_STAT_WEIGHT = 25;
const ATTACKER_LETHALITY_WEIGHT = 0.77;
const CRIT_DAMAGE_MULTIPLIER = 1.5;
const ATTACKER_HANDLING_WEIGHT = 0.37;

export function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

export const END_OF_TURN = {"NORMAL": 0, "PLAYER_COMBO": 1, "MONSTER_COMBO": 2, "PLAYER_DIED": 3, "MONSTER_DIED": 4};

export function resolveTurn(actions, info) {
  // 1. Calculate the order
  actions.sort((a, b) => {
    // add random when equal speed
    return (b.spell.initiative * ((b.attacker.speed ** ATTACKER_SPEED_WEIGHT) / 1000)) - (a.spell.initiative * ((a.attacker.speed ** ATTACKER_SPEED_WEIGHT) / 1000));
  });
  for (let i = 0; i < actions.length; i++) {
    let currentAction = actions[i];
    info.push(`${currentAction.attacker.name} launch ${currentAction.spell.name}.`);
    // 2. & 3. Parry
    if (currentAction.target.guard * DEFENDER_GUARD_WEIGHT >= getRandomInt(101)) {
      info.push(`${currentAction.target.name} blocked the attack!`);
      // actions.splice(i, 1);
      currentAction.hasBeenDone = true;
      continue;
    }
    // 4. Calc dmg
    let finalDamage = 0;
    if (currentAction.spell.type == "SHARP")
      finalDamage = currentAction.spell.damage * (1 + currentAction.attacker.sharpDmg / DAMAGE_STAT_WEIGHT) / (1 + (currentAction.target.sharpRes * (1 - currentAction.attacker.penRes / 100)) / DAMAGE_STAT_WEIGHT);
    else if (currentAction.spell.type == "BLUNT")
      finalDamage = currentAction.spell.damage * (1 + currentAction.attacker.bluntDmg / DAMAGE_STAT_WEIGHT) / (1 + (currentAction.target.bluntRes * (1 - currentAction.attacker.penRes / 100)) / DAMAGE_STAT_WEIGHT);
    finalDamage = Math.round(finalDamage);
    // 5., 6. & 7. Crit
    if (currentAction.attacker.lethality * ATTACKER_LETHALITY_WEIGHT >= getRandomInt(101)) {
      finalDamage = Math.round(finalDamage * CRIT_DAMAGE_MULTIPLIER);
      info.push(`${currentAction.attacker.name} crits on the attack!`);
    }
    // 8. Apply dmg
    info.push(`${currentAction.target.name} takes ${finalDamage}`);
    currentAction.target.health -= finalDamage;
    // check health
    if (currentAction.target.health <= 0)
      return currentAction.target.isNPC == false ? END_OF_TURN.PLAYER_DIED : END_OF_TURN.MONSTER_DIED;
    // 9. Combo
    if ((currentAction.attacker.handling * ATTACKER_HANDLING_WEIGHT >= getRandomInt(101)) && currentAction.isCombo == false) {
      // actions.splice(i, 1);
      currentAction.hasBeenDone = true;
      return currentAction.attacker.isNPC == false ? END_OF_TURN.PLAYER_COMBO : END_OF_TURN.MONSTER_COMBO;
    }
    // actions.splice(i, 1);
    currentAction.hasBeenDone = true;
  }
  return END_OF_TURN.NORMAL;
}