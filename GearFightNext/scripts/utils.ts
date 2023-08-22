import { ethers } from 'ethers';
import contractABI from "@/abi/GearFight.json";

import { Ability } from './abilities';
import { Identity, WeaponMintStats } from './entities';

const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS)!.toLowerCase();

// random num between 0 - max
export function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

// min and max included 
export function randomIntFromInterval(min: number, max: number) { 
  return Math.floor(Math.random() * (max - min + 1) + min)
}

// function to create a contract ethers.js of gearFactory
export async function createContract(walletAddress: string) {
  const ethereum: any  = window.ethereum;
  const provider = new ethers.BrowserProvider(ethereum);
  const signer = await provider.getSigner(walletAddress);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer);
  return contract;
}

export async function getWeaponStatsForLevelUp(identity: Identity) {
  let stats = JSON.parse(JSON.stringify((await import(`@/data/weapons/statsGrowth.json`)).default.find(weapon => weapon.name == identity)));
  if (!stats)
    console.log(`Error: no level up data for: ${identity}`);
  // round for the moment bc blockchain doesn't accept float...
  for (const key in stats)
    if (stats.hasOwnProperty(key))
      stats[key] = Math.floor(stats[key]);
  let formatedStats: WeaponMintStats = {
    health: stats.health as number,
    speed: stats.speed as number,
    mind: stats.mind as number,
    offensiveStats: {
      sharpDamage: stats.sharpDmg as number,
      bluntDamage: stats.bluntDmg as number,
      burnDamage: stats.burnDmg as number,
      pierce: stats.pierce as number,
      lethality: stats.lethality as number
    },
    defensiveStats: {
      sharpResistance: stats.sharpRes as number,
      bluntResistance: stats.bluntRes as number,
      burnResistance: stats.burnRes as number,
      guard: stats.guard as number,
    },
    handling: stats.handling as number,
  }
  return formatedStats;
}

export function multiplyStatsForLevelUp(stats: WeaponMintStats, coef: number) {
  stats.health *= coef;
  stats.speed *= coef;
  stats.mind *= coef;
  stats.offensiveStats.sharpDamage *= coef;
  stats.offensiveStats.bluntDamage *= coef;
  stats.offensiveStats.burnDamage *= coef;
  stats.offensiveStats.pierce *= coef;
  stats.offensiveStats.lethality *= coef;
  stats.defensiveStats.sharpResistance *= coef;
  stats.defensiveStats.bluntResistance *= coef;
  stats.defensiveStats.burnResistance *= coef;
  stats.defensiveStats.guard *= coef;
  stats.handling *= coef;
}

export async function getAllAbilitiesIdForWeapon(identity: Identity, levelToSet: number) {
  let allAbilities = (await import(`@/data/weapons/${identity.toLocaleLowerCase()}/abilities.json`));
  let wantedAbilities: number[] = [];
  for (const key in allAbilities) {
    if (key == "base" || parseInt(key) <= levelToSet)
      wantedAbilities = wantedAbilities.concat(allAbilities[key]);
  }
  return wantedAbilities;
}

// get the specify element from the arr1, remove it and add it in arr2, return true on success, false otherwise
export function getFromArrayToArray<Type>(arr1: Type[], arr2: Type[], element: Type) {
  const index = arr1.indexOf(element);

  if (index != -1) {
    arr2.push(element);
    arr1.splice(index, 1);
    return true;
  }
  console.log("Error: getFromArrayToArray on element that doesn't exist in array.");
  return false;
}