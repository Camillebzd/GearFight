// TODO upgrade ethers in v6.0
import { ethers } from 'ethers';
import contractABI from "@/abi/GearFactory.json";

import { Ability } from './abilities';
import { WeaponType } from './entities';

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
export function createContract(walletAddress: string) {
  const ethereum: any  = window.ethereum;
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner(walletAddress);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer);
  return contract;
}

export async function getWeaponStatsForLevelUp(weaponType: string) {
  weaponType = weaponType.toLowerCase();
  let stats = (await import(`@/data/weapons/${weaponType}/stats.json`)).default["levelUp"];
  // round for the moment bc blockchain doesn't accept float...
  for (const key in stats)
    if (stats.hasOwnProperty(key))
      stats[key] = Math.round(stats[key]);
  let formatedStats = {
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

export function getIntFromGearType(weaponType: WeaponType) {
  const weaponTypeTab: WeaponType[] = ["None", "Sword", "Waraxe", "Spear", "Warhammer"];

  for (let i = 0; i < weaponTypeTab.length; i++)
    if (weaponType == weaponTypeTab[i])
      return i;
  return 0;
}