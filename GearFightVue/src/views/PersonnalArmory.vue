<template>
  <div class="home">
    <h1>Personnal Armory</h1>
    <div v-if="gears.length"> <!-- Change to print a loader during the retreave of nft -->
      <GearCard :gear="getGearInfo(gears[0])"/>
    </div>
    <div v-else>
      <p>Connecte to your metamask account to see your gears.</p>
    </div>
  </div>
</template>

<script>
import { Network, Alchemy } from "alchemy-sdk"; // /!\ Module "buffer" has been externalized /!\
import GearCard from '@/components/GearCard.vue'

export default {
  components: {
    GearCard,
  },
  data() {
    return {
      accountAddress: "",
      gears: [],
    }
  },
  methods: {
    async getUserNFTs() {
      if (this.accountAddress == undefined || this.accountAddress.length < 1)
        return;
      const settings = {
        apiKey: "0FgSTfHIhycqhLzUnravE7m3Dt6rBfGF", // Dont let the key here in the code !!!!
        network: Network.ETH_GOERLI, // Replace the network needed.
      };
      const alchemy = new Alchemy(settings);
      const tokens = await alchemy.nft.getNftsForOwner(this.accountAddress);
      for (let i = 0; i < tokens.ownedNfts.length; i++) {
        if (tokens.ownedNfts[i].rawMetadata.attributes[0]?.trait_type == "Family") // change this by putting a key a the root of the NFT ?
          this.gears.push(tokens.ownedNfts[i].rawMetadata);
      }
    },
    getGearInfo(gear) {
      return {
        name: gear.name,
        description: gear.description,
        image: gear.image,
        family: this.getGearAttributeInfo(gear.attributes, "Family"),
        type: this.getGearAttributeInfo(gear.attributes, "Type"),
        level: this.getGearAttributeInfo(gear.attributes, "Level"),
        hp: this.getGearAttributeInfo(gear.attributes, "Health Point"),
        dmg: this.getGearAttributeInfo(gear.attributes, "Damage Point"),
        dmgType: this.getGearAttributeInfo(gear.attributes, "Damage Type"),
        speed: this.getGearAttributeInfo(gear.attributes, "Speed"),
        capacities: this.getGearAttributeInfo(gear.attributes, "Capacities"), // handle this
      };
    },
    getGearAttributeInfo(attributes, trait_type) {
      for (let i = 0; i < attributes.length; i++) {
        if (attributes[i].trait_type === trait_type)
          return attributes[i].value;
      }
      return "";
    }
  },
  async created() {
    this.accountAddress = this.$attrs.accountAddress;
    this.getUserNFTs();
  },
  async updated() {
    this.accountAddress = this.$attrs.accountAddress;
    this.getUserNFTs();
  }
}
</script>

<style>

</style>