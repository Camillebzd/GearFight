import { ethers } from 'ethers';
import contractABI from "@/abi/GearFight.json";

import { Ability } from './abilities';
import { Identity } from './entities';

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
  let directoryName = identity.toLowerCase();
  let stats = (await import(`@/data/weapons/${directoryName}/stats.json`)).default["levelUp"];
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
