import { Monster } from "@/scripts/entities";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import monstersData from '@/data/monsters/base.json';

type MonsterState = {
  monstersData: Monster[];  // All the data for monsters
  monstersWorld: Monster[]; // Only the monsters for the world
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
    // fill the monsters data, if true as payload is given then force the refill
    fillMonsterData: (state, action: PayloadAction<boolean> = {payload: false, type: ""}) => {
      if (state.monstersData.length > 0 && !action.payload)
        return;
      state.monstersData = JSON.parse(JSON.stringify(monstersData));
    },
    // fill the monsters world data, if true as payload is given then force the refill
    fillMonsterWorld: (state, action: PayloadAction<boolean> = {payload: false, type: ""}) => {
      if (state.monstersWorld.length > 0 && !action.payload)
        return;
      state.monstersWorld = JSON.parse(JSON.stringify(monstersData));
    },
  },
});

export const {
  reset,
  fillStore,
  fillMonsterData,
  fillMonsterWorld
} = monsters.actions;
export default monsters.reducer;