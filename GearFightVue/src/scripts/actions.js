import effects from "../data/spells/effects.json";
import conditions from "../data/spells/conditions.json";
import targets from "../data/spells/targets.json"
import rules from "../data/spells/rules.json";
import modifiers from "../data/spells/modifiers.json";
import orders from "../data/spells/orders.json";
import { getRandomInt } from "./utils";
import { 
  TARGET_ABILITY,
  CONDITIONS
} from "./systemValues";

export const END_OF_TURN = {"NORMAL": 0, "TARGET_BLOCKED": 1, "PLAYER_COMBO": 2, "MONSTER_COMBO": 3, "PLAYER_DIED": 4, "MONSTER_DIED": 5};

export const RULE_ORDER = {
  "VERY_BEGINNING": 1,
  "BEFORE_SPECIAL_CHECK": 2,
  "BEFORE_PARRY_CHECK": 3,
  "BEFORE_DAMAGE_CALCULATION": 4,
  "BEFORE_CRIT_CALCULATION": 5,
  "BEFORE_DAMAGE_APPLICATION": 6,
  "BEFORE_MODIFIER_APPLICATION": 7,
  "BEFORE_DEATHS_CHECK": 8,
  "BEFORE_COMBO_CHECK": 9,
  "VERY_END": 10,
  "END_RESOLVE_ACTION": 11
};

export class Action {
  caster = undefined;
  target = undefined;
  spell = undefined; // TODO Rename ability
  isCombo = false;
  hasBeenDone = false;
  fluxesUsed = 0;
  info = undefined;
  abilityWasCrit = false;
  abilityWasBlocked = false;
  triggeredCombo = false;
  finalDamage = 0;
  damageInflicted = 0;
  modifiersCleansed = 0;
  modifiersPurged = 0;

  constructor(data) {
    this.caster = data.caster || undefined;
    this.target = data.target || undefined;
    this.spell = data.spell || undefined;
    this.isCombo = data.isCombo || false;
    this.hasBeenDone = data.hasBeenDone || false;
    this.fluxesUsed = data.fluxesUsed || 0;
    this.info = data.info || undefined;
  }

  // Used to add log in log obj
  log(message) {
    if (!this.info)
      return;
    this.info.push(message);
  }

  // Main fct that resolve the action
  resolve() {
    this.applyRule(RULE_ORDER.VERY_BEGINNING);
    this.log(`${this.caster.name} launch ${this.spell.name}.`);
    if (this.caster.isConfused()) {
      this.endOfResolve();
      return END_OF_TURN.NORMAL;
    }
    this.applyRule(RULE_ORDER.BEFORE_SPECIAL_CHECK);
    if (this.spell.type != "SPECIAL") {
      this.applyRule(RULE_ORDER.BEFORE_PARRY_CHECK);
      // 3. & 4. Parry
      if (this.target.isBlocking() && this.caster.allowTargetToBlock()) {
        this.abilityWasBlocked = true;
        this.endOfResolve();
        return END_OF_TURN.TARGET_BLOCKED;
      }
      this.applyRule(RULE_ORDER.BEFORE_DAMAGE_CALCULATION);
      // 5., 6., 7. & 8. Calc dmg + crit + modifiers
      this.finalDamage = this.caster.calculateFinalDamage(this.spell.id, this.target);
      this.applyRule(RULE_ORDER.BEFORE_CRIT_CALCULATION);
      if (this.caster.isAddingCrit()) {
        this.abilityWasCrit = true;
        this.finalDamage = this.caster.addCritOnDamage(this.finalDamage);
      }
      this.finalDamage = this.caster.addModifiersOnDamage(this.finalDamage);
      this.applyRule(RULE_ORDER.BEFORE_DAMAGE_APPLICATION);
      // 9. Apply dmg & buff / debuff
      this.damageInflicted = this.target.applyDamage(this.finalDamage);
    }
    this.applyRule(RULE_ORDER.BEFORE_MODIFIER_APPLICATION);
    this.addModifiers();
    this.applyRule(RULE_ORDER.BEFORE_DEATHS_CHECK);
    // check health
    if (this.target.isDead()) {
      this.endOfResolve();
      return this.target.isNPC == false ? END_OF_TURN.PLAYER_DIED : END_OF_TURN.MONSTER_DIED;
    }
    if (this.caster.isDead()) {
      this.endOfResolve();
      return this.caster.isNPC == false ? END_OF_TURN.MONSTER_DIED : END_OF_TURN.PLAYER_DIED;
    }
    this.applyRule(RULE_ORDER.BEFORE_COMBO_CHECK);
    // 10. Combo
    if (this.caster.isDoingCombo() && !this.isCombo) {
      this.triggeredCombo = true;
      this.endOfResolve();
      return this.caster.isNPC == false ? END_OF_TURN.PLAYER_COMBO : END_OF_TURN.MONSTER_COMBO;
    }
    this.applyRule(RULE_ORDER.VERY_END);
    this.endOfResolve();
    return END_OF_TURN.NORMAL;
  }

  // Call at the end of the resolve 
  endOfResolve() {
    this.applyRule(RULE_ORDER.END_RESOLVE_ACTION);
    this.hasBeenDone = true;
  }

  // Add all modifiers from the action
  addModifiers() {
    this.spell.effects.forEach((actionEffect) => {
      let effect = effects.find((effect) => effect.id == actionEffect);
      if (effect == undefined) {
        console.log("Error: this effect is not supported");
        return;
      }
      // Modifier
      if (effect.aftermathType != "MODIFIER") {
        return;
      }
      // Condition
      let condition = conditions.find((condition) => condition.id === effect.conditionId);
      if (condition == undefined) {
        console.log("Error: this condition is not supported");
        return;
      }
      if (!this.checkCondition(condition)) {
        console.log("Condition not met");
        return;
      }
      // ApplyChance
      if (getRandomInt(100) >= effect.applyChance) {
        console.log("failed to apply modifier");
        return;
      }
      // Target
      let targetObj = targets.find((target) => target.id === effect.targetId);
      if (targetObj == undefined) {
        console.log("Error: this target is not supported");
        return;
      }
      let target = this.getTarget(targetObj);
      if (target == undefined) {
        console.log("Error: this target is not supported");
        return;
      }
      let modifier = this.getAftermath(effect.aftermathId, "MODIFIER");
      if (modifier == undefined || !Object.keys(modifier).length) {
        console.log("Error: modifier empty or not supported");
        return;
      }
      // Modifier stack
      let modifierStack = this.getAftermathValue(effect.id, this.spell.effectsValue);
      if (modifierStack == -1) {
        console.log("Error: modifier stack is not set on effect");
        return;
      }
      // Flux quantity
      let fluxQuantity = this.spell.isMagical ? this.fluxesUsed : 1;
      for (let i = 0; i < fluxQuantity; i++) {
        target.addModifier(modifier, modifierStack, this.caster);
      }
    });
  }

  // Try to apply all the rules that respect the orderId call
  applyRule(orderId) {
    this.spell.effects.forEach((actionEffect) => {
      let effect = effects.find((effect) => effect.id == actionEffect);
      if (effect == undefined) {
        console.log("Error: this effect is not supported");
        return;
      }
      // Rule
      if (effect.aftermathType != "RULE") {
        // console.log("This is not a rule");
        return;
      }
      let rule = this.getAftermath(effect.aftermathId, "RULE");
      if (!rule) {
        console.log("Error: rule unknown.");
        return;
      }
      // Order
      let order = orders.find(order => order.id == rule.orderId);
      if (!order) {
        console.log("Error: order not supported.");
        return;
      }
      if (order.id != orderId)
        return;
      // Condition
      let condition = conditions.find((condition) => condition.id === effect.conditionId);
      if (condition == undefined) {
        console.log("Error: this condition is not supported");
        return;
      }
      if (!this.checkCondition(condition)) {
        console.log("Condition not met");
        return;
      }
      // ApplyChance
      if (getRandomInt(100) >= effect.applyChance) {
        console.log("failed to apply rule");
        return;
      }
      // Target
      let targetObj = targets.find((target) => target.id === effect.targetId);
      if (targetObj == undefined) {
        console.log("Error: this target is not supported");
        return;
      }
      let target = this.getTarget(targetObj);
      if (target == undefined) {
        console.log("Error: this target is not supported");
        return;
      }
      // Rule value
      let ruleValue = this.getAftermathValue(effect.id, this.spell.effectsValue);
      if (ruleValue == -1) {
        console.log("Error: rule value is not set on effect");
        return;
      }
      // Flux quantity
      let fluxQuantity = this.spell.isMagical ? this.fluxesUsed : 1;
      this.executeRule(rule, ruleValue, target, fluxQuantity);
    });
  }

  // Execute the rule with the value given on the target
  executeRule(rule, ruleValue, target, fluxQuantity) {
    switch (rule.id) {
      // Gain X fluxes
      case 1:
        target.addFluxes(ruleValue * fluxQuantity);
        break;
      // Do nothing
      case 2:
        this.log("NOTHING HAPPEN");
        break;
      // Random spell launch
      case 3:
        console.log("TODO: the random spell launch...");
        break;
      // Heal the target from the damage of the ability
      case 4:
        target.applyHeal(Math.round(ruleValue * fluxQuantity * this.damageInflicted / 100));
        break;
      // Force a combo on the target
      case 5:
        target.forceComboOnAction = true;
        break;
      // Force a crit on the target
      case 6:
        target.forceCritOnAction = true;
        break;
      // Buff the target by doesn't letting the target of an action be able to block
      case 7:
        target.preventBlockingOnAction = true;
        break;
      // Add additional damage to final damage
      case 8:
        this.finalDamage += ruleValue * fluxQuantity;
        break;
      // Priority on action, handled in getSpeedRule
      case 9:
        break;
      case 10:
        break;
      // Multiply final damage
      case 11:
        this.finalDamage *= ruleValue * fluxQuantity;
        break;
      // Cleans the target
      case 12:
        this.modifiersCleansed = target.cleans();
        break;
      // Multiply final damage by the number of negative effect cleansed by this ability
      case 13:
        this.finalDamage *= this.modifiersCleansed * ruleValue * fluxQuantity;
        break;
      // Add some stack on all debuff on the target
      case 14:
        target.addDecayingModifierStacks("DEBUFF", ruleValue * fluxQuantity);
        break;
      // Purge the target (remove positive modifiers)
      case 15:
        target.purge();
        break;
      // Add additional damage for each flux on the target of action
      case 16:
        this.finalDamage += ruleValue * this.target.fluxes * fluxQuantity;
      // Add additional damage for each flux on the caster of action
      case 17:
        this.finalDamage += ruleValue * this.caster.fluxes * fluxQuantity;
      // Remove fluxes on the target and add them to the caster
      case 18:
        this.caster.fluxes += target.removeFluxes(ruleValue * fluxQuantity);
      // Heal % of missing hp
      case 19:
        target.applyHeal(Math.round(ruleValue * fluxQuantity * (target.stats.healthMax - target.stats.health) / 100));
        break;
      // Heal % of maximum hp
      case 20:
        target.applyHeal(Math.round(ruleValue * fluxQuantity * target.stats.healthMax / 100));
        break;
      default:
        console.log("Error: rule not supported for the moment.");
        return;
    }
  }

  // return true or false if the effect condition is valid or not
  checkCondition(condition) {
    switch (condition.id) {
      // no condition
      case CONDITIONS.NO_CONDITION:
        return true;
      case CONDITIONS.ABILITY_IS_CRIT:
        return this.abilityWasCrit;
      case CONDITIONS.ABILITY_TRIGGERS_COMBO:
        return this.triggeredCombo;
      case CONDITIONS.ABILITY_BLOCKED_BY_TARGET:
        return this.abilityWasBlocked;
      case CONDITIONS.TARGET_ALREADY_ACTED:
        return false; // TODO with historic system
      case CONDITIONS.TARGET_NOT_ALREADY_ACTED:
        return false; // TODO with historic system
      case CONDITIONS.TARGET_HAS_LESS_HP_THAN_CASTER:
        return this.target.stats.health < this.caster.stats.health;
      case CONDITIONS.TARGET_HAS_MORE_HP_THAN_CASTER:
        return this.target.stats.health > this.caster.stats.health;
      case CONDITIONS.TARGET_BEARS_POSITIVE_MODIFIER:
        return this.target.hasPositiveModifier();
      case CONDITIONS.TARGET_BEARS_NEGATIVE_MODIFIER:
        return this.target.hasNegativeModifier();
      case CONDITIONS.TARGET_DOESNT_BEARS_ANY_MODIFIER:
        return this.target.modifiers.length == 0;
      case CONDITIONS.CASTER_ALREADY_USED_THIS_ABILITY_LAST_TURN:
        return false; // TODO with historic system
      case CONDITIONS.CASTER_BEARS_POSITIVE_MODIFIER:
        return this.caster.hasPositiveModifier();
      case CONDITIONS.CASTER_BEARS_NEGATIVE_MODIFIER:
        return this.caster.hasNegativeModifier();
      case CONDITIONS.CASTER_DOESNT_BEARS_ANY_MODIFIER:
        return this.caster.modifiers.length == 0;
      case CONDITIONS.CASTER_TOOK_DAMAGE_THIS_TURN_OR_LAST_ONE:
        return false; // TODO with historic system
      default:
        console.log("Error: condition not supported");
        return false;
    }
  }

  // return the entity obj targeted by the target input obj
  getTarget(target) {
    switch(target.id) {
      case TARGET_ABILITY.TARGET_OF_ABILITY:
        return this.target;
      case TARGET_ABILITY.CASTER_OF_ABILITY:
        return this.caster;
      default:
        console.log("WARNING: maybe the target is not supported yet");
        return undefined;
    }
  }

  // Get the aftermath obj from id and type, empty if no aftermath found
  getAftermath(aftermathId, aftermathType) {
    if (aftermathType == "RULE")
      return rules.find(rule => rule.id === aftermathId);
    else if (aftermathType == "MODIFIER")
      return modifiers.find(modifier => modifier.id === aftermathId);
    console.log("Error: aftermath type not supported yet");
    return undefined;
  }

  // Get the value for the effect on effectsValue on ability, -1 if empty
  getAftermathValue(effectId, effectsValue) {
    let effectValue = effectsValue.find((effectValue) => effectValue.id === effectId);

    if (effectValue == undefined) {
      console.log("Error: effectValue not found");
      return -1;
    }
    return effectValue.value;
  }

  // return the list of effect on the spell
  getEffectsOnSpell() {
    let effectOnSpell = [];

    for (let effect of this.spell.effects)
      effectOnSpell.push(effects.find(elem => elem.id == effect));
    return effectOnSpell;
  }

  // Check if the spell of action contain a specific rule
  isRulePresent(ruleId) {
    let effectOnSpell = this.getEffectsOnSpell();

    if (effectOnSpell.length == 0)
      return false;
    return effectOnSpell.findIndex(effect => effect.aftermathType === "RULE" && effect.aftermathId === ruleId) != -1;
  }

  // Check if the spell of action contain a specific modifier
  isModifierPresent(modifierId) {
    let effectOnSpell = this.getEffectsOnSpell();

    if (effectOnSpell.length == 0)
      return false;
    return effectOnSpell.findIndex(effect => effect.aftermathType === "MODIFIER" && effect.aftermathId === modifierId) != -1;
  }

  // Return a 0 if ability is normal, 1 if ability should play first
  getSpeedRule() {
    if (this.isRulePresent(9))
      return 1;
    return 0;
  }
}