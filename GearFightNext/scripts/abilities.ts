export type EffectValue = {
  id: number;
  value: number;
};

export type ModifierType = "PERMANENT" | "DECAYING";

export type ModifierDirection = "BUFF" | "DEBUFF";

export type ModifierTimeframe = "CONTINUOUS" | "PERIODIC";

export type Modifier = {
  id: number;
  name: string;
  type: ModifierType;
  direction: ModifierDirection;
  timeframe: ModifierTimeframe;
  value: number;
  stack: number;
  targetedStat: string;
  description: string;
};

export type AbilityType = "SHARP" | "BLUNT" | "BURN";

export type AbilityData = {
  id: number;
  name: string;
  damage: number;
  initiative: number;
  type: AbilityType;
  isMagical: boolean;
  effects: number[];
  effectsValue: EffectValue[];
};

export class Ability {
  id: number = 0;
  name: string = "Unknown";
  damage: number = 0;
  initiative: number = 0;
  type: AbilityType = "SHARP";
  isMagical: boolean = false;
  effects: number[] = [];
  effectsValue: EffectValue[] = [];

  constructor(data: AbilityData) {
    this.id = data.id;
    this.name = data.name;
    this.damage = data.damage;
    this.initiative = data.initiative;
    this.type = data.type;
    this.isMagical = data.isMagical;
    this.effects = data.effects;
    this.effectsValue = data.effectsValue;
  }
};

export type Effect = {
  
};

export type Order = {
  
};

export type Rule = {
  
};