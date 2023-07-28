import { Weapon, WeaponData, WeaponType } from "@/scripts/entities";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { fillStoreAbilities, fillStoreAbilitiesPromised } from "./abilitySlice";
import { Network, Alchemy } from "alchemy-sdk"; // /!\ Module "buffer" has been externalized /!\
import { createContract } from "@/scripts/utils";
import { Ability } from "@/scripts/abilities";
import { RootState } from "../store";

const API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY_MATIC;
const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS)!.toLowerCase();

export type AttributeOnNFT = {
  trait_type: string; 
  value: string | string[];
};

export type WeaponNFT = {
  name: string;
  description: string;
  image: string;
  attributes: AttributeOnNFT[];
};

function getGearAttributeInfo(attributes: AttributeOnNFT[], trait_type: string): string | string[] | WeaponType {
  for (let i = 0; i < attributes.length; i++) {
    if (attributes[i].trait_type === trait_type)
      return attributes[i].value;
  }
  return "";
}

const getClassicFormGearManual = (token: WeaponNFT, tokenId: string, abilities: Ability[]): undefined | Weapon => {
  if (token == null || token == undefined) {
    console.log("WARNING: format performed on an empty token.");
    return undefined;
  }
  let weaponAbilities: (Ability | undefined)[] = [];
  let weaponAbilitiesNames = getGearAttributeInfo(token.attributes, "Spells");
  if (Array.isArray(weaponAbilitiesNames))
    weaponAbilitiesNames.forEach((abilityName) => {
      weaponAbilities.push(abilities.find((abilitie) => abilitie.name === abilityName));
    });
  let data: WeaponData = {
    name: token.name,
    id: parseInt(tokenId),
    description: token.description,
    image: token.image,
    level: parseInt(getGearAttributeInfo(token.attributes, "Level") as string),
    stage: parseInt(getGearAttributeInfo(token.attributes, "Stage") as string),
    health: parseInt(getGearAttributeInfo(token.attributes, "Health") as string),
    speed: parseInt(getGearAttributeInfo(token.attributes, "Speed") as string),
    mind: parseInt(getGearAttributeInfo(token.attributes, "Mind") as string),
    sharpDmg: parseInt(getGearAttributeInfo(token.attributes, "Sharp Damage") as string),
    bluntDmg: parseInt(getGearAttributeInfo(token.attributes, "Blunt Damage") as string),
    burnDmg: parseInt(getGearAttributeInfo(token.attributes, "Burn Damage") as string),
    sharpRes: parseInt(getGearAttributeInfo(token.attributes, "Sharp Resistance") as string),
    bluntRes: parseInt(getGearAttributeInfo(token.attributes, "Blunt Resistance") as string),
    burnRes: parseInt(getGearAttributeInfo(token.attributes, "Burn Resistance") as string),
    pierce: parseInt(getGearAttributeInfo(token.attributes, "Pierce") as string),
    handling: parseInt(getGearAttributeInfo(token.attributes, "Handling") as string),
    guard: parseInt(getGearAttributeInfo(token.attributes, "Guard") as string),
    lethality: parseInt(getGearAttributeInfo(token.attributes, "Lethality") as string),
    abilities: weaponAbilities as Ability[],
    xp: parseInt(getGearAttributeInfo(token.attributes, "Experience") as string),
    weaponType: getGearAttributeInfo(token.attributes, "Weapon Type") as WeaponType,
  };
  return new Weapon(data); // Error: No reducer provided for key "weaponReducer"
};

export const fillUserWeapons = createAsyncThunk<Weapon[], boolean, {state: RootState} >(
  'weapons/fillUserWeapons',
  async (forceReaload: boolean, thunkAPI) => {
    if (thunkAPI.getState().weaponReducer.userWeapons.length > 0 && !forceReaload)
      return thunkAPI.getState().weaponReducer.userWeapons;
    console.log("starting of fillUserWeapons");
    const isConnected = thunkAPI.getState().authReducer.isConnected;
    const address = thunkAPI.getState().authReducer.address;
    if (!isConnected) {
      console.log("You should be connected if you want to get your Gears!");
      return [];
    }
    let userWeapons: Weapon[] = [];
    const settings = {
      apiKey: API_KEY,
      network: Network.MATIC_MUMBAI,
    };
    const alchemy = new Alchemy(settings);
    const nfts = await alchemy.nft.getNftsForOwner(address, {omitMetadata: true});
    const contract = createContract(address);
    await fillStoreAbilitiesPromised(forceReaload, thunkAPI.dispatch);
    await Promise.all(nfts.ownedNfts.map(async (nft) => {
      if (nft.contract.address.toLowerCase() == CONTRACT_ADDRESS) {
        let weaponURI = await contract.uri(nft.tokenId);
        let weaponObj: WeaponNFT = JSON.parse(Buffer.from(weaponURI.substring(29), 'base64').toString('ascii'));
        let userWeapon = getClassicFormGearManual(weaponObj, nft.tokenId, thunkAPI.getState().abilityReducer.abilities);
        if (userWeapon)
          userWeapons.push(userWeapon);
      }
    }));
    console.log(userWeapons);
    return userWeapons;
  }
);

export const refreshOwnedTokenMetadata = createAsyncThunk<{weaponIndex: number, newWeaponData: Weapon | undefined}, number, {state: RootState} >(
  'weapons/refreshTokenMetadataManual',
  async (tokenId, thunkAPI) => {
    const weaponIndex = thunkAPI.getState().weaponReducer.userWeapons.findIndex((weapon) => weapon.id == tokenId);
    if (weaponIndex < 0) {
      console.log("Error:can't refresh metadata on non existant or non possessed weapon.");
      return {weaponIndex, newWeaponData: undefined};
    }
    const contract = createContract(thunkAPI.getState().authReducer.address);
    let weaponURI = await contract.uri(tokenId);
    let weaponObj = JSON.parse(Buffer.from(weaponURI.substring(29), 'base64').toString('ascii'));
    let userWeapon = getClassicFormGearManual(weaponObj, tokenId.toString(), thunkAPI.getState().abilityReducer.abilities);
    console.log(`token with id: ${tokenId} refreshed!`);
    return {weaponIndex, newWeaponData: userWeapon};
  }
);

type WeaponState = {
  weaponsData: Weapon[];  // All the weapons data
  userWeapons: Weapon[];  // User weapons
};

const initialState = {
  weaponsData: [],
  userWeapons: []
} as WeaponState;

export const weapons = createSlice({
  name: "weapons",
  initialState,
  reducers: {
    reset: () => initialState,
    // fillStore: (state) => {

    // },
  },
  extraReducers: (builder) => {
    builder.addCase(fillUserWeapons.pending, (state, action) => {
    }),
    builder.addCase(fillUserWeapons.fulfilled, (state, action) => {
      state.userWeapons = action.payload; // TODO Remove the class and add directly the JS object 
    }),
    builder.addCase(refreshOwnedTokenMetadata.fulfilled, (state, action) => {
      if (action.payload.newWeaponData)
        state.userWeapons[action.payload.weaponIndex] = action.payload.newWeaponData; // TODO Remove the class and add directly the JS object 
    })
  }
});

export const {
  reset,
  // fillStore,
} = weapons.actions;
export default weapons.reducer;