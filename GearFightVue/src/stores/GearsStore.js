import { defineStore } from 'pinia'
import { useUserStore } from './UserStore';
import { Network, Alchemy } from "alchemy-sdk"; // /!\ Module "buffer" has been externalized /!\


const API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY_MATIC;
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

export const useGearsStore  = defineStore('GearStore', {
  state: () => {
    return {
      gears: [],
      ownedGears: []
    }
  },
  getters: {
    smallAddress: (state) => {return state.walletAddress.substring(0, 6) + "..." + state.walletAddress.substring(38)},
    isConnected: (state) => {return state.walletAddress.length > 0},
  },
  actions: {
    async getGearsForContract() {
      if (this.gears.length > 0)
        this.ownedGears = [];
      const settings = {
        apiKey: API_KEY,
        network: Network.MATIC_MUMBAI,
      };
      const alchemy = new Alchemy(settings);
      const tokens = await alchemy.nft.getNftsForContract(CONTRACT_ADDRESS);
      console.log(tokens);
      for (let i = 0; i < tokens.nfts.length; i++)
        this.gears.push(tokens.nfts[i]);
    },
    async getMyGears() {
      let userStore = useUserStore();
      if (!userStore.isConnected) {
        console.log("You should be connected if you want to get your Gears!");
        this.ownedGears = [];
        return;
      }
      if (this.ownedGears.length > 0)
        this.ownedGears = [];
      const settings = {
        apiKey: API_KEY,
        network: Network.MATIC_MUMBAI,
      };
      const alchemy = new Alchemy(settings);
      const nfts = await alchemy.nft.getNftsForOwner(userStore.walletAddress);
      nfts.ownedNfts.map((nft) => {
        if (nft.contract.address == CONTRACT_ADDRESS)
          this.ownedGears.push(nft)
      });
    }
  },
})