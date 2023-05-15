import { defineStore } from 'pinia'
import { useUserStore } from './UserStore';
import { useSpellsStore } from './SpellsStore';
import { Network, Alchemy } from "alchemy-sdk"; // /!\ Module "buffer" has been externalized /!\

import { ethers } from 'ethers';
import contractABI from "@/abi/GearFactory_v5.json"; // change to last version

import { Buffer } from 'buffer';

const API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY_MATIC;
const CONTRACT_ADDRESS = (import.meta.env.VITE_NEW_CONTRACT_ADDRESS).toLowerCase();

export const useGearsStore  = defineStore('GearStore', {
  state: () => {
    return {
      gears: [],
      ownedGears: [],
      ownedGearsFormatted: [],
      starterGears: [],
      // really needed here and in lib ?
      gearType: ["Empty", "Sword", "Waraxe", "Spear", "Warhammer"] // NEED AN ENUM SAME AS CONTRACT / LIB
    }
  },
  getters: {
  },
  actions: {
    // get all the gear of the contract address in .env
    async getGearsForContract() {
      if (this.gears.length > 0) {
        // this.ownedGears = [];
        this.gears = [];
      }
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
    // get all the gear of the connected user
    async fillMyGears(forceRefresh) {
      console.log("contract add env var: ", CONTRACT_ADDRESS);
      let userStore = useUserStore();
      if (!userStore.isConnected) {
        console.log("You should be connected if you want to get your Gears!");
        this.ownedGears = [];
        this.ownedGearsFormatted = [];
        return;
      }
      
      if (this.ownedGears.length > 0 && this.ownedGearsFormatted.length > 0 && !forceRefresh) {
        console.log("Not empty gears and refresh not forced so exit.");
        return;
      }
      this.ownedGears = [];
      this.ownedGearsFormatted = [];
      const settings = {
        apiKey: API_KEY,
        network: Network.MATIC_MUMBAI,
      };
      const alchemy = new Alchemy(settings);
      const nfts = await alchemy.nft.getNftsForOwner(userStore.walletAddress, {omitMetadata: true});
      const contract = this.createContract();
      await Promise.all(nfts.ownedNfts.map(async (nft) => {
        if (nft.contract.address.toLowerCase() == CONTRACT_ADDRESS) {
          let weaponURI = await contract.uri(nft.tokenId);
          let weaponObj = JSON.parse(Buffer.from(weaponURI.substring(29), 'base64').toString('ascii'));
          this.ownedGears.push(nft);
          this.ownedGearsFormatted.push((await this.getClassicFormGearManual(weaponObj, nft.tokenId)));
        }
      }));
    },
    // get all the starter gears
    async fillStarterGears() {
      if (this.starterGears.length > 0)
        return;
      const weaponsAvailables = ["sword", "waraxe", "spear", "warhammer"];
      for (let i = 0; i < weaponsAvailables.length; i++) {
        let starterWeapon = (await import(`@/data/weapons/${weaponsAvailables[i]}/stats.json`)).default["base"];
        starterWeapon["level"] = 1;
        starterWeapon["stage"] = 1;
        starterWeapon["name"] = "Basic " + weaponsAvailables[i].charAt(0).toUpperCase() + weaponsAvailables[i].slice(1);
        starterWeapon["description"] = "This is a starter weapon.";
        starterWeapon["image"] = (await import(`@/data/weapons/${weaponsAvailables[i]}/images.json`)).default["1"];
        let spellsStore = useSpellsStore();
        await spellsStore.fillWeaponsSpells();
        let spellsId = (await import(`@/data/weapons/${weaponsAvailables[i]}/spells.json`)).default["base"];
        let weaponSpells = [];
        spellsId.forEach((spellName) => {
          weaponSpells.push(spellsStore.getWeaponsSpellFromId(spellName));
        });
        starterWeapon["spells"] = weaponSpells;
        starterWeapon["xp"] = 0;
        starterWeapon["weaponType"] = this.gearType[i + 1]; // bof
        starterWeapon["id"] = i;
        this.starterGears.push(starterWeapon);
      }
      console.log("starter weapons pulled");
    },
    getGearTypeFromInt(num) {
      return this.gearType[num];
    },
    getIntFromGearType(gearTypeName) {
      for (let i = 0; i < this.gearType.length; i++)
        if (gearTypeName == this.gearType[i])
          return i;
      return 0;
    },
    // return a gear from all the gear
    getGear(tokenId) {
      return this.gears.find(gear => gear.tokenId === tokenId);
    },
    // return a gear from the user's gear
    getMyGear(tokenId) {
      return this.ownedGears.find(gear => gear.tokenId === tokenId);
    },
    getMyGearFormatted(tokenId) {
      return this.ownedGearsFormatted.find(gear => gear.id == tokenId);
    },
    // return a gear from the starter gear list
    getStarterGear(tokenId) {
      return this.starterGears.find(gear => gear.id == tokenId);
    },
    // format a user's gear in the good format for everything
    // ALCHEMY VERSION WITH RAWMETADA
    async getClassicFormGear(token) {
      if (token == null || token == undefined || token.rawMetadata == undefined) {
        console.log("WARNING: format performed on an empty token.");
        return {};
      }
      let tokenMetadata = token.rawMetadata;
      let spellsStore = useSpellsStore();
      await spellsStore.fillWeaponsSpells();
      let weaponSpells = [];
      this.getGearAttributeInfo(tokenMetadata.attributes, "Spells").forEach((spellName) => {
        weaponSpells.push(spellsStore.getWeaponsSpellFromName(spellName));
      });
      return {
        name: tokenMetadata.name,
        id: parseInt(token.tokenId),
        description: tokenMetadata.description,
        image: tokenMetadata.image,
        level: parseInt(this.getGearAttributeInfo(tokenMetadata.attributes, "Level")),
        stage: parseInt(this.getGearAttributeInfo(tokenMetadata.attributes, "Stage")),
        health: parseInt(this.getGearAttributeInfo(tokenMetadata.attributes, "Health")),
        speed: parseInt(this.getGearAttributeInfo(tokenMetadata.attributes, "Speed")),
        sharpDmg: parseInt(this.getGearAttributeInfo(tokenMetadata.attributes, "Sharp Damage")),
        bluntDmg: parseInt(this.getGearAttributeInfo(tokenMetadata.attributes, "Blunt Damage")),
        sharpRes: parseInt(this.getGearAttributeInfo(tokenMetadata.attributes, "Sharp Resistance")),
        bluntRes: parseInt(this.getGearAttributeInfo(tokenMetadata.attributes, "Blunt Resistance")),
        penRes: parseInt(this.getGearAttributeInfo(tokenMetadata.attributes, "Penetration Resistance")),
        handling: parseInt(this.getGearAttributeInfo(tokenMetadata.attributes, "Handling")),
        guard: parseInt(this.getGearAttributeInfo(tokenMetadata.attributes, "Guard")),
        lethality: parseInt(this.getGearAttributeInfo(tokenMetadata.attributes, "Lethality")),
        spells: weaponSpells,
        xp: parseInt(this.getGearAttributeInfo(tokenMetadata.attributes, "Experience")),
        weaponType: this.getGearAttributeInfo(tokenMetadata.attributes, "Weapon Type")
      };
    },
    // format a user's gear in the good format for everything
    // MANUAL VERSION WITH URI CALL DIRECTLY
    async getClassicFormGearManual(token, tokenId) {
      if (token == null || token == undefined) {
        console.log("WARNING: format performed on an empty token.");
        return {};
      }
      let spellsStore = useSpellsStore();
      await spellsStore.fillWeaponsSpells();
      let weaponSpells = [];
      this.getGearAttributeInfo(token.attributes, "Spells").forEach((spellName) => {
        weaponSpells.push(spellsStore.getWeaponsSpellFromName(spellName));
      });
      return {
        name: token.name,
        id: parseInt(tokenId),
        description: token.description,
        image: token.image,
        level: parseInt(this.getGearAttributeInfo(token.attributes, "Level")),
        stage: parseInt(this.getGearAttributeInfo(token.attributes, "Stage")),
        health: parseInt(this.getGearAttributeInfo(token.attributes, "Health")),
        speed: parseInt(this.getGearAttributeInfo(token.attributes, "Speed")),
        sharpDmg: parseInt(this.getGearAttributeInfo(token.attributes, "Sharp Damage")),
        bluntDmg: parseInt(this.getGearAttributeInfo(token.attributes, "Blunt Damage")),
        sharpRes: parseInt(this.getGearAttributeInfo(token.attributes, "Sharp Resistance")),
        bluntRes: parseInt(this.getGearAttributeInfo(token.attributes, "Blunt Resistance")),
        penRes: parseInt(this.getGearAttributeInfo(token.attributes, "Penetration Resistance")),
        handling: parseInt(this.getGearAttributeInfo(token.attributes, "Handling")),
        guard: parseInt(this.getGearAttributeInfo(token.attributes, "Guard")),
        lethality: parseInt(this.getGearAttributeInfo(token.attributes, "Lethality")),
        spells: weaponSpells,
        xp: parseInt(this.getGearAttributeInfo(token.attributes, "Experience")),
        weaponType: this.getGearAttributeInfo(token.attributes, "Weapon Type")
      };
    },
    // format a user's gear in the good format for fight /!\ should be classic formatted 
    getFightFormGear(token) {
      if (token == null || token == undefined) {
        console.log("WARNING: format performed on an empty token.");
        return {};
      }
      let tokenFightForm = JSON.parse(JSON.stringify(token));
      for (let i = 0; i < tokenFightForm.spells.length; i++)
        tokenFightForm.spells[i] = tokenFightForm.spells[i];
      tokenFightForm.healthBase = token.health;
      tokenFightForm.buffs = [];
      tokenFightForm.debuffs = [];
      tokenFightForm.isNPC = false;
      tokenFightForm.played = false;
      tokenFightForm.action = {};
      tokenFightForm.side = false; // manage group on front !
      return tokenFightForm;
    },
    getGearAttributeInfo(attributes, trait_type) {
      for (let i = 0; i < attributes.length; i++) {
        if (attributes[i].trait_type === trait_type)
          return attributes[i].value;
      }
      return "";
    },
    // care with the form of the obj
    isOwned(tokenId) {
      return this.ownedGears.findIndex(gear => gear.tokenId == tokenId) > -1;
    },
    async getWeaponStatsForLevelUp(weaponType) {
      weaponType = weaponType.toLowerCase();
      let stats = (await import(`@/data/weapons/${weaponType}/stats.json`)).default["levelUp"];
      // round for the moment bc blockchain doesn't accept float...
      for (const key in stats)
        if (stats.hasOwnProperty(key))
          stats[key] = Math.round(stats[key]);
      return stats;
    },
    async getWeaponImageForUpgrade(weaponType, stage) {
      weaponType = weaponType.toLowerCase();
      return (await import(`@/data/weapons/${weaponType}/images.json`)).default[stage]
    },
    // alchemy refresh
    async refreshTokenMetadata(tokenId) {
      const settings = {
        apiKey: API_KEY,
        network: Network.MATIC_MUMBAI,
      };
      const alchemy = new Alchemy(settings);
      const isRefreshed = await alchemy.nft.refreshNftMetadata(CONTRACT_ADDRESS, tokenId);
      console.log("tried to refresh metadata: ", isRefreshed);
    },
    // manual refresh
    async refreshTokenMetadataManual(tokenId) {
      const gearIndex = this.ownedGearsFormatted.findIndex((gear) => gear.id == tokenId);
      if (gearIndex < 0) {
        console.log("Error:can't refresh metadata on non existant gear");
        return;
      }
      const contract = this.createContract();
      let weaponURI = await contract.uri(tokenId);
      let weaponObj = JSON.parse(Buffer.from(weaponURI.substring(29), 'base64').toString('ascii'));
      this.ownedGearsFormatted[gearIndex] = await this.getClassicFormGearManual(weaponObj, tokenId);
      console.log(`token with id: ${tokenId} refreshed!`);
    },
    // function to create a contract ethers.js of gearFactory
    createContract() {
      const ethereum = window.ethereum;
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner(this.walletAddress);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer);
      return contract;
    }
  },
})