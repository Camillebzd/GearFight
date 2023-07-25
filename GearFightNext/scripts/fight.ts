import {
  ATTACKER_SPEED_WEIGHT
} from "./systemValues";
import { getRandomInt } from "./utils";
import { Action, END_OF_TURN } from "./actions";

// Main loop for resolves actions
export function resolveActions(actions: Action[]) {
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

function sortActionOrder(actions: Action[]) {
  actions.sort((a, b) => {
    let prioDif = (b.caster.getSpeedState() + b.getSpeedRule()) - (a.caster.getSpeedState() + a.getSpeedRule());
    if (prioDif == 0) {
      let speedDif = (b.ability.initiative * ((b.caster.stats.speed ** ATTACKER_SPEED_WEIGHT) / 1000)) - (a.ability.initiative * ((a.caster.stats.speed ** ATTACKER_SPEED_WEIGHT) / 1000));
      return speedDif == 0 ? (getRandomInt(1) == 0 ? -1 : 1) : speedDif;
    } else
      return prioDif;
  });
}