import { Monster } from "@/scripts/entities";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { Ability } from "@/scripts/abilities";

import monstersData from '@/data/monsters/base.json';
import { fillStoreAbilitiesPromised } from "./abilitySlice";

type MonsterState = {
  monstersData: Monster[];  // All the data for monsters
  monstersWorld: Monster[]; // Only the monsters for the world
};

type MonsterData = {
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

const initialState = {
  monstersData: [],
  monstersWorld: [],
} as MonsterState;

export const fillMonsterWorld = createAsyncThunk<Monster[], boolean, {state: RootState} >(
  'monsters/fillMonsterWorld',
  async (forceReaload: boolean, thunkAPI) => {
    if (thunkAPI.getState().monsterReducer.monstersWorld.length > 0 && !forceReaload)
      return thunkAPI.getState().monsterReducer.monstersWorld;
    await fillStoreAbilitiesPromised(forceReaload, thunkAPI.dispatch);
    let monstersWorld: Monster[] = [];
    let monstersWorldData: MonsterData[] = JSON.parse(JSON.stringify(monstersData)); // type this 
    let abilities = thunkAPI.getState().abilityReducer.abilities;
    monstersWorldData.forEach(monsterWorldData => {
      let monsterAbilities: Ability[] = [];
      monsterWorldData.abilities.forEach(abilityId => {
        let realAbility = abilities.find(ability => ability.id === abilityId);
        if (realAbility)
          monsterAbilities.push(realAbility);
        else
          console.log("Error: a monster data id doesn't have a supported ability.");
      });
      monstersWorld.push(new Monster({
        id: monsterWorldData.id,
        name: monsterWorldData.name,
        image: monsterWorldData.image,
        description: monsterWorldData.description,
        difficulty: monsterWorldData.difficulty,
        level: monsterWorldData.level,
        health: monsterWorldData.health,
        speed: monsterWorldData.speed,
        mind: monsterWorldData.mind,
        sharpDmg: monsterWorldData.sharpDmg,
        bluntDmg: monsterWorldData.bluntDmg,
        burnDmg: monsterWorldData.burnDmg,
        sharpRes: monsterWorldData.sharpRes,
        bluntRes: monsterWorldData.bluntRes,
        burnRes: monsterWorldData.burnRes,
        handling: monsterWorldData.handling,
        pierce: monsterWorldData.pierce,
        guard: monsterWorldData.guard,
        lethality: monsterWorldData.lethality,
        stage: 1,
        abilities: monsterAbilities
      }));
    });
    return monstersWorld;
  }
);

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
    fillMonsterData: (state, action: PayloadAction<boolean>) => {
      if (state.monstersData.length > 0 && !action.payload)
        return;
      state.monstersData = JSON.parse(JSON.stringify(monstersData)); // TODO Remove the class and add directly the JS object 
    },
  },
  extraReducers(builder) {
    builder.addCase(fillMonsterWorld.fulfilled, (state, action) => {
      state.monstersWorld = action.payload;
    })
  },
});

export const {
  reset,
  fillStore,
  fillMonsterData,
} = monsters.actions;
export default monsters.reducer;