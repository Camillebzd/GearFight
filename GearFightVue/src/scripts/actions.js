import effects from "../data/spells/effects.json";
import conditions from "../data/spells/conditions.json";
import targets from "../data/spells/targets.json"
import rules from "../data/spells/rules.json";
import modifiers from "../data/spells/modifiers.json";
import { getRandomInt } from "./utils";
import { 
  TARGET_ABILITY,
  CONDITIONS,
  MAX_PERMANENT_MODIFIER_TIER,
  MAX_DECAYING_MODIFIER_COUNTER
} from "./systemValues";

export const END_OF_TURN = {"NORMAL": 0, "TARGET_BLOCKED": 1, "PLAYER_COMBO": 2, "MONSTER_COMBO": 3, "PLAYER_DIED": 4, "MONSTER_DIED": 5};

export class Action {
  caster = undefined;
  target = undefined;
  spell = undefined; // TODO spell is usefull as obj or take a spellId and get the spell on caster ?
  isCombo = false;
  hasBeenDone = false;
  fluxesUsed = 0;
  info = undefined;

  constructor(data) {
    this.caster = data.caster || undefined;
    this.target = data.target || undefined;
    this.spell = data.spell || undefined;
    this.isCombo = data.isCombo || false;
    this.hasBeenDone = data.hasBeenDone || false;
    this.fluxesUsed = data.fluxesUsed || 0;
    this.info = data.info || undefined;
  }

  // Main fct that resolve the action
  resolve() {
    if (this.info != undefined)
      this.info.push(`${this.caster.name} launch ${this.spell.name}.`);
    if (this.spell.type != "SPECIAL") {
      // 3. & 4. Parry
      if (this.target.isBlocking()) {
        this.hasBeenDone = true;
        return END_OF_TURN.TARGET_BLOCKED;
      }
      // 5., 6., 7. & 8. Calc dmg + crit
      let finalDamage = this.caster.calculateFinalDamage(this.spell.id, this.target);
      // 9. Apply dmg & buff / debuff
      this.target.applyDamage(finalDamage);
      // TODO addEffect not only modifier
      this.addModifiers();
      // check health
      if (this.target.isDead())
        return this.target.isNPC == false ? END_OF_TURN.PLAYER_DIED : END_OF_TURN.MONSTER_DIED;
      // TODO Simon, can a caster die during his action ?
    }
    // 10. Combo
    this.hasBeenDone = true;
    if (this.caster.isDoingCombo() && this.isCombo == false)
      return this.caster.isNPC == false ? END_OF_TURN.PLAYER_COMBO : END_OF_TURN.MONSTER_COMBO;
    return END_OF_TURN.NORMAL;
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
        console.log("Error: can't apply a modifier which is not type MODIFIER");
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
      let modifierStack = this.getAftermathStack(effect.id, this.spell.effectsStacks);
      if (modifierStack == -1) {
        console.log("Error: modifier stack is not set on effect");
        return;
      }
      if (modifier.direction == "BUFF")
        target.addBuff(modifier, modifierStack, this.caster);
      else
        target.addDebuff(modifier, modifierStack, this.caster);
    });
  }

  // return true or false if the effect condition is valid or not
  checkCondition(condition) {
    switch (condition.id) {
      // no condition
      case CONDITIONS.NO_CONDITION:
        return true;
      default:
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

  // Get the stack of the effect on effectStacks, -1 if empty
  getAftermathStack(effectId, effectsStacks) {
    let effectsStack = effectsStacks.find((effectsStack) => effectsStack.id === effectId);

    if (effectsStack == undefined) {
      console.log("Error: effectsStack not found");
      return -1;
    }
    return effectsStack.stack;
  }
}