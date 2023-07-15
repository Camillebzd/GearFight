import { Monster } from "@/scripts/entities";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type MonstersState = {
  monstersData: Monster[];  // All the data for monsters
  monstersWorld: Monster[]; // Only the monsters for the world
};

const initialState = {
  monstersData: [],
  monstersWorld: [],
} as MonstersState;

export const monsters = createSlice({
  name: "monsters",
  initialState,
  reducers: {
    reset: () => initialState,
    increment: (state) => {
      // state.value += 1;
    },
    decrement: (state) => {
      // state.value -= 1;
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      // state.value += action.payload;
    },
    decrementByAmount: (state, action: PayloadAction<number>) => {
      // state.value -= action.payload;
    },
  },
});

export const {
  increment,
  incrementByAmount,
  decrement,
  decrementByAmount,
  reset,
} = monsters.actions;
export default monsters.reducer;