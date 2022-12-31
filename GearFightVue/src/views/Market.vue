<template>
  <div>
    <h1>Market</h1>
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
      <p>Oops, seems like there is nothing on the market.</p>
      <p>This could be because the developper is working on a new collection or something went wrong...</p>
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
    async getContractNFTs() {
      const settings = {
        apiKey: PRIVATE_KEY,
        network: Network.ETH_GOERLI, // Replace the network needed.
      };
      const alchemy = new Alchemy(settings);
      const tokens = await alchemy.nft.getNftsForContract("0xfa3737f6bce5c27e88359c5a44dae7f844b1814d"); // externalised this value
      console.log(tokens);
      for (let i = 0; i < tokens.nfts.length; i++) {
        if (tokens.nfts[i].rawMetadata.attributes[0]?.trait_type == "Family") // change this by putting a key a the root of the NFT ?
          this.gears.push(tokens.nfts[i]);
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
    this.getContractNFTs();
  },
  watch: {
    '$attrs.accountAddress': function(newVal, oldVal) {
      this.accountAddress = newVal;
      this.getContractNFTs();
    },
  }
}
</script>