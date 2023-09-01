import { Action } from "./actions"
import { deepCopy } from "./utils";

export type Turn = {
  number: number,     // represent the turn number
  actions: Action[]   // represent the actions for this turn
};

export class HistoricSystem {
  constructor(public turns: Turn[]) {}

  // Make a deep copie of a new turn and add it.
  createTurn(newTurn: Turn) {
    this.turns.push(deepCopy(newTurn));
  }

  // Geet turn, can modifie the return turn
  getTurn(turnNumber: number) {
    const turnNeeded = this.turns.find(turn => turn.number === turnNumber);
    if (!turnNeeded)
      console.log(`Error: try to get turn ${turnNumber} from historic system but it doesn't exist.`);
    return turnNeeded;
  }
};