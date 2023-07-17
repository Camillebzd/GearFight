// TODO upgrade ethers in v6.0
import { ethers } from 'ethers';
import contractABI from "@/abi/GearFactory.json";

import { Ability } from './abilities';
// import { store } from '@/redux/store';

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

// export const getAbilityFromName = (name: string): Ability | undefined  => {
//   let abilities = store.getState().abilityReducer?.abilities;
//   return abilities == undefined || name === "" ? undefined : abilities.find((abilitie) => abilitie.name === name);
// };
