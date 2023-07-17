import { Ability, AbilityData } from "@/scripts/abilities";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import abilitiesData from '@/data/abilities/weapons.json';

import { store } from '@/redux/store';

type AbilityState = {
  abilities: Ability[];
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
      let data: AbilityData[] = JSON.parse(JSON.stringify(abilitiesData));
      for (let i = 0; i < data.length; i++)
        state.abilities.push(new Ability(data[i]));
      console.log("abilities pulled");
    },
  },
});

// export const getAbilityFromName = (name: string): Ability | undefined  => {
//   let abilities = store.getState()?.abilityReducer?.abilities;
//   return abilities == undefined || name === "" ? undefined : abilities.find((abilitie) => abilitie.name === name);
// };

export const {
  reset,
  fillStoreAbilities,
} = abilities.actions;
export default abilities.reducer;