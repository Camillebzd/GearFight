<template>
  <div>
    <h1>Market</h1>
    <div class="top-modification-container">
      <MDBInput
        v-model="search1"
        inputGroup
        :formOutline="false"
        wrapperClass="mb-3"
        placeholder="Search"
        aria-label="Search"
        aria-describedby="button-addon2"
      >
        <MDBBtn color="primary">
          <MDBIcon icon="search" />
        </MDBBtn>
      </MDBInput>
      <MDBDropdown v-model="dropdown1">
        <MDBDropdownToggle class="dropdown-button" @click="dropdown1 = !dropdown1">
          {{ selectedSortType }}
        </MDBDropdownToggle>
        <MDBDropdownMenu aria-labelledby="dropdownMenuButton">
          <MDBDropdownItem tag="button" @click="selectedSortType = 'Recently listed'">Recently listed</MDBDropdownItem>
          <MDBDropdownItem tag="button" @click="selectedSortType = 'Price low to high'">Price low to high</MDBDropdownItem>
          <MDBDropdownItem tag="button" @click="selectedSortType = 'Price high to low'">Price high to low</MDBDropdownItem>
          <MDBDropdownItem tag="button" @click="selectedSortType = 'Most Rare'">Most Rare</MDBDropdownItem>
        </MDBDropdownMenu>
      </MDBDropdown>
    </div>
    <div v-if="gearsSorted.length">
      <MDBContainer>
        <MDBRow>
          <MDBCol auto v-for="gear in gearsSorted" :key="gear.tokenId">
            <GearCard
              :gear="gear.rawMetadata" :gearId="gear.tokenId"
            />
          </MDBCol>
        </MDBRow>
      </MDBContainer>
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
import {
  MDBRow,
  MDBCol,
  MDBContainer,
  MDBBtn,
  MDBInput,
  MDBIcon,
  MDBDropdown,
  MDBDropdownToggle,
  MDBDropdownMenu,
  MDBDropdownItem
} from "mdb-vue-ui-kit";
// const API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY_MATIC;
// const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
import { useGearsStore } from "@/stores/GearsStore";
import { mapState } from 'pinia';

export default {
  components: {
    GearCard,
    MDBRow,
    MDBCol,
    MDBContainer,
    MDBBtn,
    MDBInput,
    MDBIcon,
    MDBDropdown,
    MDBDropdownToggle,
    MDBDropdownMenu,
    MDBDropdownItem
  },
  computed: {
    ...mapState(useGearsStore, ['gears', 'getGearsForContract']),
  },
  data() {
    return {
      dropdown1: false,
      selectedSortType: "Recently listed",
      search1: "",
      accountAddress: "",
      gearsSorted: [],
    }
  },
  methods: {
    // async getContractNFTs() {
    //   const settings = {
    //       apiKey: API_KEY,
    //       network: Network.MATIC_MUMBAI,
    //   };
    //   const alchemy = new Alchemy(settings);
    //   const tokens = await alchemy.nft.getNftsForContract(CONTRACT_ADDRESS);
    //   console.log(tokens);
    //   for (let i = 0; i < tokens.nfts.length; i++) {
    //     this.gears.push(tokens.nfts[i]);
    //   }
    // },
    // getGearInfo(gear) {
    //   return {
    //     name: gear.name,
    //     description: gear.description,
    //     image: gear.image,
    //     family: this.getGearAttributeInfo(gear.attributes, "Family"),
    //     type: this.getGearAttributeInfo(gear.attributes, "Type"),
    //     level: this.getGearAttributeInfo(gear.attributes, "Level"),
    //     hp: this.getGearAttributeInfo(gear.attributes, "Health Point"),
    //     dmg: this.getGearAttributeInfo(gear.attributes, "Damage Point"),
    //     dmgType: this.getGearAttributeInfo(gear.attributes, "Damage Type"),
    //     speed: this.getGearAttributeInfo(gear.attributes, "Speed"),
    //     capacities: this.getGearAttributeInfo(gear.attributes, "Capacities"), // handle this
    //   };
    // },
    // getGearAttributeInfo(attributes, trait_type) {
    //   for (let i = 0; i < attributes.length; i++) {
    //     if (attributes[i].trait_type === trait_type)
    //       return attributes[i].value;
    //   }
    //   return "";
    // }
  },
  async created() {
    this.accountAddress = this.$attrs.accountAddress;
    // this.getContractNFTs();
    this.getGearsForContract();
    this.gearsSorted = this.gears;
  },
  watch: {
    '$attrs.accountAddress': function(newVal, oldVal) {
      this.accountAddress = newVal;
      // this.getContractNFTs();
      this.getGearsForContract();
      this.gearsSorted = this.gears;
    },
  }
}
</script>

<style>
.top-modification-container {
  flex: 1;
  display: grid;
  grid-template-columns: 50% 15% 25% 10%;
  column-gap: 1rem;
}
.dropdown-button {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>