export type EffectValue = {
  id: number;
  value: number;
};

export type AbilityType = "SHARP" | "BLUNT" | "BURN" | "SPECIAL";

export type Tier = 1 | 2 | 3;

export type AbilityData = {
  id: number;
  name: string;
  damage: number;
  initiative: number;
  type: AbilityType;
  isMagical: boolean;
  effects: number[];
  effectsValue: EffectValue[];
  tier: Tier;
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
  tier: Tier = 3;

  constructor(data: AbilityData) {
    this.id = data.id;
    this.name = data.name;
    this.damage = data.damage;
    this.initiative = data.initiative;
    this.type = data.type;
    this.isMagical = data.isMagical;
    this.effects = data.effects;
    this.effectsValue = data.effectsValue;
    this.tier = data.tier || 3;
  }
};

export type AftermathType = "MODIFIER" | "RULE";

export type Effect = {
  id: number;
  conditionId: number;
  targetId: number;
  applyChance: number;
  aftermathType: AftermathType;
  aftermathId: number;
};

export type ModifierType = "PERMANENT" | "DECAYING";

export type ModifierDirection = "BUFF" | "DEBUFF";

export type ModifierTimeframe = "NONE" | "CONTINUOUS" | "PERIODIC";

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

export type Condition = {
  id: number;
};

export type Rule = {
  id: number;
  orderId: number;
};

export type Target = {
  id: number;
}

export type Order = {
  
};