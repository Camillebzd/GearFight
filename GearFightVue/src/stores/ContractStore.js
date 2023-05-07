import { defineStore } from 'pinia'
import { ethers } from "ethers";
import contractABI from "@/abi/GearFactory_v5.json"; // change to last version

const API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY_MATIC;
const CONTRACT_ADDRESS = import.meta.env.VITE_NEW_CONTRACT_ADDRESS;

export const useContractStore  = defineStore('ContractStore', {
    state: () => {
        return {
            contractStatic: null,
        }
    },
    getters: {
    },
    actions: {
        createStaticContract() {
            if (this.contractStatic != null)
                return;
            const provider = new ethers.providers.AlchemyProvider('maticmum', API_KEY);
            this.contractStatic = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, provider);
        }
    }
});