<template>
  <div class="home">
    <h1>Personnal Armory</h1>
    <div v-if="isConnected"> <!-- Change to print a loader during the retreave of nft -->
      <div v-if="ownedGears.length">
        <MDBContainer>
          <MDBRow>
            <MDBCol auto v-for="gear in ownedGears" :key="gear.tokenId">
              <GearCard  
                :gear="gear.rawMetadata" :gearId="gear.tokenId"
              />
            </MDBCol>
          </MDBRow>
        </MDBContainer>
      </div>
      <div v-else>
        <p>We couldn't find any weapon on your MetaMask account:</p>
        <ol>
          <li>Wait cause it may take some time.</li>
          <li>Reload the page.</li>
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
import GearCard from '@/components/GearCard.vue';
import { MDBRow, MDBCol, MDBContainer } from "mdb-vue-ui-kit";
import { mapState } from 'pinia';
import { useUserStore } from "@/stores/UserStore.js";
import { useGearsStore } from "@/stores/GearsStore";

export default {
  components: {
    GearCard,
    MDBRow,
    MDBCol,
    MDBContainer
  },
  computed: {
    ...mapState(useUserStore, ['walletAddress', 'isConnected']),
    ...mapState(useGearsStore, ['ownedGears', 'fillMyGears']),
  },
  methods: {
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
    await this.fillMyGears();
    console.log(this.ownedGears);
  },
  watch: {
    walletAddress: function(newVal, oldVal) {
      this.fillMyGears();
    }
  }
}
</script>

<style>
.flex-div {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
}
</style>