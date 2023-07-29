import { AbilityData } from "@/scripts/abilities";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import abilitiesData from '@/data/abilities/abilities.json';

type AbilityState = {
  abilities: AbilityData[];
};

const initialState = {
    abilities: [],
} as AbilityState;

export const abilities = createSlice({
  name: "abilities",
  initialState,
  reducers: {
    reset: () => initialState,
    fillStoreAbilities: (state, action: PayloadAction<boolean>) => {
      if (state.abilities.length > 0 && !action.payload)
        return;
      state.abilities = JSON.parse(JSON.stringify(abilitiesData));
      console.log("abilities pulled");
    },
  },
});

export const {
  reset,
  fillStoreAbilities,
} = abilities.actions;
export default abilities.reducer;