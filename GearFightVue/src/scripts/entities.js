import { getRandomInt, randomIntFromInterval } from "./utils";
import {
  ATTACKER_SPEED_WEIGHT,
  DEFENDER_GUARD_WEIGHT,
  DAMAGE_STAT_WEIGHT,
  ATTACKER_LETHALITY_WEIGHT,
  CRIT_DAMAGE_MULTIPLIER,
  ATTACKER_HANDLING_WEIGHT,
  MIND_WEIGHT,
  MIN_FINAL_DAMAGE,
  STARTING_DAMAGE_RANDOM_RANGE,
  DAMAGE_RANDOM_RANGE_FACTOR,
  MAX_FLUXES,
  PERMANENT_MODIFIER_TIER_MULTIPLIER,
  MAX_PERMANENT_MODIFIER_TIER,
  MAX_DECAYING_MODIFIER_COUNTER,
} from "./systemValues";
import { Action } from "./actions";

export class Entity {
  id = 0;
  name = "";
  image = "";
  description = "";
  level = 0; // TODO see with Simon if monsters have lvl and stages
  stage = 0;
  stats = {
    health: 0,
    healthBase: 0,
    healthMax: 0,
    speed: 0,
    speedBase: 0,
    mind: 0,
    mindBase: 0,
    sharpDmg: 0,
    sharpDmgBase: 0,
    bluntDmg: 0,
    bluntDmgBase: 0,
    burnDmg: 0,
    burnDmgBase: 0,
    sharpRes: 0,
    sharpResBase: 0,
    bluntRes: 0,
    bluntResBase: 0,
    burnRes: 0,
    burnResBase: 0,
    pierce: 0,
    pierceBase: 0,
    handling: 0,
    handlingBase: 0,
    guard: 0,
    guardBase: 0,
    lethality: 0,
    lethalityBase: 0,
  };
  fluxes = 0;
  spells = [];
  buffs = [];
  debuffs = [];
  isNPC = true;
  played = false;
  action = {};
  side = false; // TODO manage group on front !
  info = undefined; // the logger

  // data should be an object created from store
  constructor (data) {
    this.id = data.id;
    this.name = data.name;
    this.image = data.image;
    this.description = data.description;
    this.level = data.level;
    this.stage = data.stage;
    this.stats.health = data.health;
    this.stats.healthBase = data.health;
    this.stats.healthMax = data.health;
    this.stats.speed = data.speed;
    this.stats.speedBase = data.speed;
    this.stats.mind = data.mind;
    this.stats.mindBase = data.mind;
    this.stats.sharpDmg = data.sharpDmg;
    this.stats.sharpDmgBase = data.sharpDmg;
    this.stats.bluntDmg = data.bluntDmg;
    this.stats.bluntDmgBase = data.bluntDmg;
    this.stats.burnDmg = data.burnDmg;
    this.stats.burnDmgBase = data.burnDmg;
    this.stats.sharpRes = data.sharpRes;
    this.stats.sharpResBase = data.sharpRes;
    this.stats.bluntRes = data.bluntRes;
    this.stats.bluntResBase = data.bluntRes;
    this.stats.burnRes = data.burnRes;
    this.stats.burnResBase = data.burnRes;
    this.stats.pierce = data.pierce;
    this.stats.pierceBase = data.pierce;
    this.stats.handling = data.handling;
    this.stats.handlingBase = data.handling;
    this.stats.guard = data.guard;
    this.stats.guardBase = data.guard;
    this.stats.lethality = data.lethality;
    this.stats.lethalityBase = data.lethality;
    this.setFluxesFromMind();
    this.spells = data.spells;
  }

  // Used to add log in log obj
  log(message) {
    if (!this.info)
      return;
    this.info.push(message);
  }

  // return a spell of the entity or undefined
  getSpell(spellId) {
    return this.spells.find((spell) => spell.id == spellId);
  }

  // Set entity's fluxes from mind stat
  setFluxesFromMind() {
    this.fluxes = Math.floor(this.stats.mind / MIND_WEIGHT) > MAX_FLUXES ? MAX_FLUXES : Math.floor(this.stats.mind / MIND_WEIGHT);
  }

  // Return true or false depending on the entity can launch a spell
  isEntityAbleToPlay() {
    for (let i = 0; i < this.spells.length; i++)
      if (this.spells[i].isMagical == false)
        return true;
    return this.fluxes > 0 ? true : false;
  }

  // Return true or false if the parry roll is a success
  isBlocking() {
    if (this.stats.guard * DEFENDER_GUARD_WEIGHT >= getRandomInt(101)) {
      this.log(`${this.name} blocked the attack!`);
      return true;
    }
    return false;
  }

  // Return true or false if the combo roll is a success
  isDoingCombo() {
    if (this.stats.handling * ATTACKER_HANDLING_WEIGHT >= getRandomInt(101)) {
      this.log(`${this.name} is doing a combo!`);
      return true;
    }
    return false;
  }

  // Calcul damage inflicted by a spell to a target and return the result
  calculateFinalDamage(spellId, target) {
    let spell = this.getSpell(spellId);
    let damage = 0;
    let resistance= 0;

    if (!spell) {
      console.log("Error: spell doesn't found");
      return MIN_FINAL_DAMAGE;
    }
    if (spell.type == "SHARP") {
      damage = this.stats.sharpDmg;
      resistance = target.stats.sharpRes;
    }
    else if (spell.type == "BLUNT") {
      damage = this.stats.bluntDmg;
      resistance = target.stats.bluntRes;
    }
    else if (spell.type == "BURN") {
      damage = this.stats.burnDmg;
      resistance = target.stats.burnRes;
    }
    else {
      console.log("Error: spell type not supported.")
    }
    let finalDamage = spell.damage * (1 + damage / DAMAGE_STAT_WEIGHT) / (1 + (resistance * (1 - this.stats.pierce / 100)) / DAMAGE_STAT_WEIGHT);
    finalDamage = Math.round(finalDamage);
    finalDamage = finalDamage < MIN_FINAL_DAMAGE ? MIN_FINAL_DAMAGE : finalDamage;
    finalDamage = finalDamage > STARTING_DAMAGE_RANDOM_RANGE ? this.calcRandomnessDamage(finalDamage) : finalDamage;
    finalDamage = Math.round(finalDamage);
    finalDamage = this.addCritOnDamage(finalDamage);
    let strengthBuff = this.buffs.find(buff => buff.id === 24);
    if (strengthBuff)
      finalDamage +=  Math.round(strengthBuff.value * finalDamage / 100);
    return finalDamage;
  }
  
  // Calculate the new final damage by applying a randomness range
  calcRandomnessDamage(finalDamage) {
    let randomRangeMin = finalDamage - (finalDamage * DAMAGE_RANDOM_RANGE_FACTOR);
    let randomRangeMax = finalDamage + (finalDamage * DAMAGE_RANDOM_RANGE_FACTOR);

    return randomIntFromInterval(randomRangeMin, randomRangeMax);
  }

  // Roll for crit then return finalDamage
  addCritOnDamage(finalDamage) {
    if (this.stats.lethality * ATTACKER_LETHALITY_WEIGHT >= getRandomInt(101)) {
      finalDamage = Math.round(finalDamage * CRIT_DAMAGE_MULTIPLIER);
      this.log(`${this.name} crits on the attack!`);
    }
    return finalDamage;
  }

  // Apply damage on entity
  applyDamage(finalDamage) {
    let fortitudeBuff = this.buffs.find(buff => buff.id === 23);
    if (fortitudeBuff)
      finalDamage -=  Math.round(fortitudeBuff.value * finalDamage / 100);
    this.log(`${this.name} takes ${finalDamage}`);
    this.stats.health -= finalDamage;
  }

  applyHeal(finalHeal) {
    this.log(`${this.name} recover ${finalHeal}`);
    this.stats.health += finalHeal;
  }

  // Reset the stats of the entity to base
  resetStats() {
    this.stats.healthMax = this.stats.healthBase;
    this.stats.speed = this.stats.speedBase;
    this.stats.mind = this.stats.mindBase;
    this.stats.sharpDmg = this.stats.sharpDmgBase;
    this.stats.bluntDmg = this.stats.bluntDmgBase;
    this.stats.burnDmg = this.stats.burnDmgBase;
    this.stats.sharpRes = this.stats.sharpResBase;
    this.stats.bluntRes = this.stats.bluntResBase;
    this.stats.burnRes = this.stats.burnResBase;
    this.stats.pierce = this.stats.pierceBase;
    this.stats.handling = this.stats.handlingBase;
    this.stats.guard = this.stats.guardBase;
    this.stats.lethality = this.stats.lethalityBase;
  }

  // Apply the permanents modifiers on the entity
  applyPermanentModifiers() {
    this.resetStats();
    this.buffs.forEach((buff) => {
      if (buff.type == "PERMANENT")
        this.stats[buff.targetedStat] += Math.round((PERMANENT_MODIFIER_TIER_MULTIPLIER * buff.stack) * this.stats[buff.targetedStat + 'Base'] / 100);
    });
    this.debuffs.forEach((debuff) => {
      if (debuff.type == "PERMANENT")
        this.stats[debuff.targetedStat] -= Math.round((PERMANENT_MODIFIER_TIER_MULTIPLIER * debuff.stack) * this.stats[debuff.targetedStat + 'Base'] / 100);
    });
  }

  // Return if the entity should be considered as dead
  isDead() {
    return this.stats.health <= 0 ? true : false;
  }

  // Add a buff on the entity and apply it
  addBuff(newBuff, stackNumber, caster) {
    let targetBuff = this.buffs.find((buff) => buff.id == newBuff.id);
    if (!targetBuff) {
      this.buffs.push(JSON.parse(JSON.stringify(newBuff)));
      targetBuff = this.buffs.find((buff) => buff.id == newBuff.id);
    }
    targetBuff.stack += stackNumber;
    if (targetBuff.type == "PERMANENT" && targetBuff.stack > MAX_PERMANENT_MODIFIER_TIER)
      targetBuff.stack = MAX_PERMANENT_MODIFIER_TIER;
    else if (targetBuff.type == "DECAYING" && targetBuff.stack > MAX_DECAYING_MODIFIER_COUNTER)
      targetBuff.stack = MAX_DECAYING_MODIFIER_COUNTER;
    if (newBuff.type == "PERMANENT")
      this.applyPermanentModifiers();
  }
  
  // Add a buff on the entity and apply it
  addDebuff(newDebuff, stackNumber, caster) {
    let targetDebuff = this.debuffs.find((debuff) => debuff.id == newDebuff.id);
    if (!targetDebuff) {
      this.debuffs.push(JSON.parse(JSON.stringify(newDebuff)));
      targetDebuff = this.debuffs.find((debuff) => debuff.id == newDebuff.id);
    }
    targetDebuff.stack += stackNumber;
    if (targetDebuff.type == "PERMANENT" && targetDebuff.stack > MAX_PERMANENT_MODIFIER_TIER)
    targetDebuff.stack = MAX_PERMANENT_MODIFIER_TIER;
    else if (targetDebuff.type == "DECAYING" && targetDebuff.stack > MAX_DECAYING_MODIFIER_COUNTER)
      targetDebuff.stack = MAX_DECAYING_MODIFIER_COUNTER;
    if (newDebuff.type == "PERMANENT")
      this.applyPermanentModifiers();
  }

  // Decrement decaying modifiers and apply their effect for periodic ones
  applyDecayingModifier() {
    // TODO Simon apply buff or debuff first ?
    this.buffs.map((buff) => {
      if (buff.type == "PERMANENT")
        return;
      if (buff.timeframe == "PERIODIC")
        this.applyPeriodicModifier(buff);
      else
        buff.stack--;
    });
    this.debuffs.map((debuff) => {
      if (debuff.timeframe == "PERIODIC")
        this.applyPeriodicModifier(debuff);
      else
        debuff.stack--;
    });
  }

  // Decrement periodic modifiers and apply their effect
  applyPeriodicModifier(modifier) {
    switch(modifier.id) {
      // Recovery
      case 25:
        this.applyHeal(Math.round(modifier.value * this.stats.healthMax / 100));
        break;
      default:
        console.log("Error: periodic modifier can't be apply bc not supported");
        return;
    }
    modifier.stack--;
  }

  // Remove modifiers if their stack is 0
  cleanModifiers() {
    // TODO after refont of all modifiers in one array insteed of buff & debuff
  }
}

export class Weapon extends Entity {
  weaponType = "None";
  xp = 0;

  constructor(data) {
    super(data);
    this.weaponType = data.weaponType;
    this.isNPC = false; // TODO handle when pvp again offline friends
    this.xp = data.xp;
  }

  clone() {
    return new Weapon({
      id: this.id,
      name: this.name,
      image: this.image,
      description: this.description,
      level: this.level,
      stage: this.stage,
      xp: this.xp,
      health: this.stats.health,
      speed: this.stats.speed,
      mind: this.stats.mind,
      sharpDmg: this.stats.sharpDmg,
      bluntDmg: this.stats.bluntDmg,
      burnDmg: this.stats.burnDmg,
      sharpRes: this.stats.sharpRes,
      bluntRes: this.stats.bluntRes,
      burnRes: this.stats.burnRes,
      pierce: this.stats.pierce,
      handling: this.stats.handling,
      guard: this.stats.guard,
      lethality: this.stats.lethality,
      spells: this.spells,
      weaponType: this.weaponType
    });
  }
}

export class Monster extends Entity {
  difficulty = 0;

  constructor(data) {
    super(data);
    this.isNPC = true;
    this.difficulty = data.difficulty;
  }

  clone() {
    return new Monster({
      id: this.id,
      name: this.name,
      image: this.image,
      description: this.description,
      level: this.level,
      stage: this.stage,
      health: this.stats.health,
      speed: this.stats.speed,
      mind: this.stats.mind,
      sharpDmg: this.stats.sharpDmg,
      bluntDmg: this.stats.bluntDmg,
      burnDmg: this.stats.burnDmg,
      sharpRes: this.stats.sharpRes,
      bluntRes: this.stats.bluntRes,
      burnRes: this.stats.burnRes,
      pierce: this.stats.pierce,
      handling: this.stats.handling,
      guard: this.stats.guard,
      lethality: this.stats.lethality,
      spells: this.spells,
      difficulty: this.difficulty
    });
  }

  launchRandomSpell(target, isCombo) {
    let monsterSpell = null;
    let fluxesUsed = 0;

    while (1) {
      monsterSpell = this.spells[getRandomInt(this.spells.length)];
      if (!monsterSpell.isMagical)
        break;
      else {
        if (this.fluxes > 0) {
          fluxesUsed = getRandomInt(this.fluxes) + 1;
          break;
        }
        // check if monster is blocked -> only fluxes spell with 0 fluxes
        if (!this.isEntityAbleToPlay()) {
          console.log("monster can't play, action skipped");
          return;
        }
      }
    }
    this.fluxes -= fluxesUsed;
    return new Action({caster: this, spell: monsterSpell, target: target, hasBeenDone: false, isCombo: isCombo, fluxesSelected: fluxesUsed, info: this.info});
  }
}