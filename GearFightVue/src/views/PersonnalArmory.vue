<template>
  <div class="home">
    <h1>Personnal Armory</h1>
    <div v-if="accountAddress.length"> <!-- Change to print a loader during the retreave of nft -->
      <div v-if="gears.length">
        <MDBRow>
          <MDBCol sm="3" v-for="gear in gears" :key="gear.tokenId">
            <!-- <GearCard :gear="getGearInfo(gears[1].rawMetadata)" :gearId="gears[1].tokenId"/> -->
            <GearCard  
              :gear="getGearInfo(gear.rawMetadata)" :gearId="gear.tokenId"
            />
          </MDBCol>
        </MDBRow>
      </div>
      <div v-else>
        <p>We couldn't find any weapon on your MetaMask account:</p>
        <ol>
          <li>Wait cause it may take some time.</li>
          <li>Check you have NFTs on your MetaMask account.</li>
          <li>Check your first MetaMask account is the one with the nft. (We will handle multiple accounts soon)</li>
        </ol>
      </div>
    </div>
    <div v-else>
      <p>Connecte to your metamask account to see your gears.</p>
    </div>
  </div>
</template>

<script>
import { Network, Alchemy } from "alchemy-sdk"; // /!\ Module "buffer" has been externalized /!\
import GearCard from '@/components/GearCard.vue';
import { MDBRow, MDBCol } from "mdb-vue-ui-kit";
const PRIVATE_KEY = import.meta.env.VITE_ALCHEMY_API_KEY;

export default {
  components: {
    GearCard,
    MDBRow,
    MDBCol
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
        apiKey: PRIVATE_KEY,
        network: Network.ETH_GOERLI, // Replace the network needed.
      };
      const alchemy = new Alchemy(settings);
      const tokens = await alchemy.nft.getNftsForOwner(this.accountAddress);
      
      for (let i = 0; i < tokens.ownedNfts.length; i++) {
        if (tokens.ownedNfts[i].rawMetadata.attributes[0]?.trait_type == "Family") // change this by putting a key a the root of the NFT ?
          this.gears.push(tokens.ownedNfts[i]);
      }
      console.log(this.gears);
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
  watch: {
    '$attrs.accountAddress': function(newVal, oldVal) {
      this.accountAddress = newVal;
      this.getUserNFTs();
    },
  }
}
</script>

<style>

</style>