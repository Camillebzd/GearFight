import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import monstersData from '@/data/monsters/base.json';

export type MonsterDataSerilizable = {
  id: number;
  name: string;
  description: string;
  image: string;
  difficulty: number;
  level: number;
  health: number;
  speed: number;
  mind: number;
  sharpDmg: number;
  bluntDmg: number;
  burnDmg: number;
  sharpRes: number;
  bluntRes: number;
  burnRes: number;
  pierce: number;
  lethality: number;
  guard: number;
  handling: number;
  abilities: number[];
}

type MonsterState = {
  monstersData: MonsterDataSerilizable[];  // All the data for monsters
  monstersWorld: MonsterDataSerilizable[]; // Only the monsters for the world
};

const initialState = {
  monstersData: [],
  monstersWorld: [],
} as MonsterState;

export const monsters = createSlice({
  name: "monsters",
  initialState,
  reducers: {
    reset: () => initialState,
    fillStore: (state) => {
      state.monstersData = JSON.parse(JSON.stringify(monstersData));
      state.monstersWorld = JSON.parse(JSON.stringify(monstersData));
    },
    fillMonstersWorldData: (state, action: PayloadAction<boolean>) => {
      if (state.monstersWorld.length > 0 && !action.payload)
        return;
      state.monstersWorld = JSON.parse(JSON.stringify(monstersData));
      console.log("monsters pulled");
    },
  },
});

export const {
  reset,
  fillStore,
  fillMonstersWorldData,
} = monsters.actions;
export default monsters.reducer;