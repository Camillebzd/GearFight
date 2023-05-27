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
const MIND_WEIGHT = 8;
const MIN_FINAL_DAMAGE = 1;
const STARTING_DAMAGE_RANDOM_RANGE = 5;
const DAMAGE_RANDOM_RANGE_FACTOR = 0.2;
export const MAX_FLUXES = 6;
const PERMANENT_MODIFIER_TIER_MULTIPLIER = 10; // percentage
const MAX_PERMANENT_MODIFIER_TIER = 6;
const MAX_DECAYING_MODIFIER_COUNTER = 6;
import effects from "../data/spells/effects.json";
import conditions from "../data/spells/conditions.json";
import rules from "../data/spells/rules.json";
import modifiers from "../data/spells/modifiers.json";

// utils
// random num between 0 - max
export function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

// min and max included 
export function randomIntFromInterval(min, max) { 
  return Math.floor(Math.random() * (max - min + 1) + min)
}

// fight

// Add fluxes on entity at the beginning
export function addStartingFluxes(entity) {
  entity["fluxes"] = Math.floor(entity.mind / MIND_WEIGHT) > MAX_FLUXES ? MAX_FLUXES : Math.floor(entity.mind / MIND_WEIGHT);
}

// define for the type of end of resolveActions
export const END_OF_TURN = {"NORMAL": 0, "PLAYER_COMBO": 1, "MONSTER_COMBO": 2, "PLAYER_DIED": 3, "MONSTER_DIED": 4};
// define for the possibles target of an ability
export const TARGET_ABILITY = {"TARGET_OF_ABILITY": 1, "CASTER_OF_ABILITY": 2, "ABILITY_ITSELF": 6, "COMBO_ABILITY_TRIGGERED": 7}
// SPELL_TYPE: ["SHARP", "BLUNT", "BURN", "SPECIAL"]

// Main loop for resolves actions
export function resolveActions(actions, info) {
  // 2. Calculate the order
  actions.sort((a, b) => {
    let speedDif = (b.spell.initiative * ((b.attacker.speed ** ATTACKER_SPEED_WEIGHT) / 1000)) - (a.spell.initiative * ((a.attacker.speed ** ATTACKER_SPEED_WEIGHT) / 1000));
    return speedDif == 0 ? (getRandomInt(1) == 0 ? -1 : 1) : speedDif;
  });
  for (let i = 0; i < actions.length; i++) {
    let currentAction = actions[i];
    info.push(`${currentAction.attacker.name} launch ${currentAction.spell.name}.`);
    if (currentAction.spell.type != "SPECIAL") {
      // 3. & 4. Parry
      if (currentAction.target.guard * DEFENDER_GUARD_WEIGHT >= getRandomInt(101)) {
        info.push(`${currentAction.target.name} blocked the attack!`);
        currentAction.hasBeenDone = true;
        continue;
      }
      // 5. Calc dmg
      let finalDamage = calcFinalDamage(currentAction);
      // 6., 7. & 8. Crit
      if (currentAction.attacker.lethality * ATTACKER_LETHALITY_WEIGHT >= getRandomInt(101)) {
        finalDamage = Math.round(finalDamage * CRIT_DAMAGE_MULTIPLIER);
        info.push(`${currentAction.attacker.name} crits on the attack!`);
      }
      // 9. Apply dmg & buff / debuff
      info.push(`${currentAction.target.name} takes ${finalDamage}`);
      currentAction.target.health -= finalDamage;
      // TODO addEffect not only modifier
      addModifiers(currentAction);
      // check health
      if (currentAction.target.health <= 0)
        return currentAction.target.isNPC == false ? END_OF_TURN.PLAYER_DIED : END_OF_TURN.MONSTER_DIED;
    }
    // 10. Combo
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

// Calculate the final damage of the current action
function calcFinalDamage(currentAction) {
  let damage = 0;
  let resistance= 0;
  if (currentAction.spell.type == "SHARP") {
    damage = currentAction.attacker.sharpDmg;
    resistance = currentAction.target.sharpRes;
  }
  else if (currentAction.spell.type == "BLUNT") {
    damage = currentAction.attacker.bluntDmg;
    resistance = currentAction.target.bluntRes;
  }
  else if (currentAction.spell.type == "BURN") {
    damage = currentAction.attacker.burnDmg;
    resistance = currentAction.target.burnRes;
  }
  else {
    console.log("Error: spell type not supported.")
  }
  let finalDamage = currentAction.spell.damage * (1 + damage / DAMAGE_STAT_WEIGHT) / (1 + (resistance * (1 - currentAction.attacker.pierce / 100)) / DAMAGE_STAT_WEIGHT);
  finalDamage = Math.round(finalDamage);
  finalDamage = finalDamage < MIN_FINAL_DAMAGE ? MIN_FINAL_DAMAGE : finalDamage;
  finalDamage = finalDamage > STARTING_DAMAGE_RANDOM_RANGE ? calcRandomnessDamage(finalDamage) : finalDamage;
  finalDamage = Math.round(finalDamage);
  return finalDamage;
}

// Calculate the new final damage by applying a randomness range
function calcRandomnessDamage(finalDamage) {
  let randomRangeMin = finalDamage - (finalDamage * DAMAGE_RANDOM_RANGE_FACTOR);
  let randomRangeMax = finalDamage + (finalDamage * DAMAGE_RANDOM_RANGE_FACTOR);

  return randomIntFromInterval(randomRangeMin, randomRangeMax);
}

// Add all modifiers from an action
function addModifiers(action) {
  action.spell.effects.forEach((actionEffect) => {
    let effectIndex = effects.findIndex((effect) => effect.id == actionEffect);

    if (effectIndex == -1) {
      console.log("Error: this effect is not supported");
      return;
    }
    let effect = effects[effectIndex];
    // Modifier
    if (effect.aftermathType != "MODIFIER") {
      console.log("Error: can't apply a modifier which is not type MODIFIER");
      return;
    }
    // Condition
    let condition = conditions.find((condition) => condition.id === effect.conditionId);
    if (condition == -1) {
      console.log("Error: this condition is not supported");
      return;
    }
    if (!checkCondition(condition)) {
      console.log("Condition not met");
      return;
    }
    // ApplyChance
    if (getRandomInt(100) >= effect.applyChance) {
      console.log("failed to apply modifier");
      return;
    }
    // Target
    let target = getTarget(effect.targetId, action);
    if (target == undefined) {
      console.log("Error: this target is not supported");
      return;
    }
    let modifier = getAftermath(effect.aftermathId, "MODIFIER");
    if (modifier == undefined || !Object.keys(modifier).length) {
      console.log("Error: modifier empty");
      return;
    }
    // Modifier stack
    let modifierStack = getAftermathStack(effect.id, action.spell.effectsStacks);
    if (modifierStack == -1) {
      console.log("Error: modifier stack is not set on effect");
      return;
    }
    if (modifier.direction == "BUFF") {
      let targetBuff = target.buffs.find((buff) => buff.id == modifier.id);
      if (targetBuff == undefined) {
        target.buffs.push(JSON.parse(JSON.stringify(modifier)));
        targetBuff = target.buffs.find((buff) => buff.id == modifier.id);
      }
      targetBuff.stack += modifierStack;
      if (targetBuff.type == "PERMANENT" && targetBuff.stack > MAX_PERMANENT_MODIFIER_TIER)
        targetBuff.stack = MAX_PERMANENT_MODIFIER_TIER;
      else if (targetBuff.type == "DECAYING" && targetBuff.stack > MAX_DECAYING_MODIFIER_COUNTER)
        targetBuff.stack = MAX_DECAYING_MODIFIER_COUNTER;
    }
    else {
      let targetDebuff = target.debuffs.find((debuff) => debuff.id == modifier.id);
      if (targetDebuff == undefined) {
        target.debuffs.push(JSON.parse(JSON.stringify(modifier)));
        targetDebuff = target.debuffs.find((debuff) => debuff.id == modifier.id);
      }
      targetDebuff.stack += modifierStack;
      if (targetDebuff.type == "PERMANENT" && targetDebuff.stack > MAX_PERMANENT_MODIFIER_TIER)
        targetDebuff.stack = MAX_PERMANENT_MODIFIER_TIER;
      else if (targetDebuff.type == "DECAYING" && targetDebuff.stack > MAX_DECAYING_MODIFIER_COUNTER)
        targetDebuff.stack = MAX_DECAYING_MODIFIER_COUNTER  ;
    }
  });
  applyPermanentModifiers(action.attacker);
  applyPermanentModifiers(action.target);
}

// return true or false if the effect condition is valid or not
function checkCondition(condition, currentAction) {
  switch (condition.id) {
    case 1:
      return true;
    default:
      return false;
  }
}

// Get a target from an action
function getTarget(targetId, action) {
  switch(targetId) {
    case TARGET_ABILITY.TARGET_OF_ABILITY:
      return action.target;
    case TARGET_ABILITY.CASTER_OF_ABILITY:
      return action.attacker;
    default:
      return undefined;
  }
}

// Get the aftermath obj from id and type, empty if no aftermath found
function getAftermath(aftermathId, aftermathType) {
  if (aftermathType == "RULE")
    return rules.find(rule => rule.id === aftermathId);
  else if (aftermathType == "MODIFIER")
    return modifiers.find(modifier => modifier.id === aftermathId);
  console.log("Error: aftermath type not supported yet");
  return undefined;
}

// Get the stack of the effect on effectStacks, -1 if empty
function getAftermathStack(effectId, effectsStacks) {
  let effectsStack = effectsStacks.find((effectsStack) => effectsStack.id === effectId);

  if (effectsStack == undefined) {
    console.log("Error: effectsStack not found");
    return -1;
  }
  return effectsStack.stack;
}

// Set all the stats to base stat
export function resetStats(entity) {
  // TODO handle maxHealth here
  // entity.health = entity.healthBase;
  entity.speed = entity.speedBase;
  entity.mind = entity.mindBase;
  entity.sharpDmg = entity.sharpDmgBase;
  entity.bluntDmg = entity.bluntDmgBase;
  entity.burnDmg = entity.burnDmgBase;
  entity.sharpRes = entity.sharpResBase;
  entity.bluntRes = entity.bluntResBase;
  entity.burnRes = entity.burnResBase;
  entity.pierce = entity.pierceBase;
  entity.handling = entity.handlingBase;
  entity.guard = entity.guardBase;
  entity.lethality = entity.lethalityBase;
}

// Apply the permanents modifiers on an entity
export function applyPermanentModifiers(entity) {
  resetStats(entity);
  entity.buffs.forEach((buff) => {
    if (buff.type == "PERMANENT")
      entity[buff.targetedStat] += Math.round((PERMANENT_MODIFIER_TIER_MULTIPLIER * buff.stack) * entity[buff.targetedStat + "Base"] / 100);
  });
  entity.debuffs.forEach((debuff) => {
    if (debuff.type == "PERMANENT")
      entity[debuff.targetedStat] -= Math.round((PERMANENT_MODIFIER_TIER_MULTIPLIER * debuff.stack) * entity[debuff.targetedStat + "Base"] / 100);
  });
}