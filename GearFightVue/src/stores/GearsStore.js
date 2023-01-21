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
    async fillMyGears() {
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
    },
    getGear(tokenId) {
      return this.gears.find(gear => gear.tokenId === tokenId);
    },
    getMyGear(tokenId) {
      return this.ownedGears.find(gear => gear.tokenId === tokenId);
    },
    getFightFormGear(tokenId) {
      let tokenMetadata = this.getMyGear(tokenId).rawMetadata;
      return {
        name: tokenMetadata.name,
        id: parseInt(tokenId),
        description: tokenMetadata.description,
        image: tokenMetadata.image,
        level: parseInt(this.getGearAttributeInfo(tokenMetadata.attributes, "Level")),
        life: parseInt(this.getGearAttributeInfo(tokenMetadata.attributes, "Life")),
        attack: parseInt(this.getGearAttributeInfo(tokenMetadata.attributes, "Strength")),
        speed: parseInt(this.getGearAttributeInfo(tokenMetadata.attributes, "Speed")),
        isNPC: false,
        played: false,
        action: {},
        side: 'group1' // manage group on front !
      };
    },
    getGearAttributeInfo(attributes, trait_type) {
      for (let i = 0; i < attributes.length; i++) {
        if (attributes[i].trait_type === trait_type)
          return attributes[i].value;
      }
      return "";
    },
    isOwned(tokenId) {
      return this.ownedGears.findIndex(gear => gear.tokenId == tokenId) > -1;
    }
  },
})