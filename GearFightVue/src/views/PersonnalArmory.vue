<template>
  <div class="home">
    <h1>Personnal Armory</h1>
    <div v-if="isConnected"> <!-- Change to print a loader during the retreave of nft -->
      <div v-if="requestAvailable" class="flex-div-row">
        <div style="margin-right: 20px;">You have {{ 1 }} free weapon request left! Go select it: </div>
        <MDBBtn color="success" rounded @click="this.$router.push({name: 'Starter'});">Choose</MDBBtn>
      </div>
      <div v-if="ownedGearsFormatted.length">
        <MDBContainer>
          <MDBRow class="justify-content-around">
            <MDBCol auto v-for="gear in ownedGearsFormatted" :key="gear.id">
              <GearCard  
                :gear="gear" :storeType="'ownedGearsFormatted'"
              />
            </MDBCol>
          </MDBRow>
        </MDBContainer>
      </div>
      <div v-else>
        <p>We couldn't find any weapon on your MetaMask account:</p>
        <ol>
          <li>If you're new, click on the button above to request a weapon! Note: the weapon could take several minutes to appear.</li>
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
import { MDBRow, MDBCol, MDBContainer, MDBBtn } from "mdb-vue-ui-kit";
import { mapState } from 'pinia';
import { useUserStore } from "@/stores/UserStore.js";
import { useGearsStore } from "@/stores/GearsStore";

export default {
  components: {
    GearCard,
    MDBRow,
    MDBCol,
    MDBContainer,
    MDBBtn
  },
  data() {
    return {
      requestAvailable: true, // get this from the contract...
    }
  },
  computed: {
    ...mapState(useUserStore, ['walletAddress', 'isConnected']),
    ...mapState(useGearsStore, ['ownedGearsFormatted', 'fillMyGears']),
  },
  methods: {
  },
  async created() {
    await this.fillMyGears();
    console.log(this.ownedGearsFormatted);
  },
  watch: {
    walletAddress: function() {
      this.fillMyGears();
    }
  }
}
</script>

<style>
.flex-div-row {
  display: flex;
  /* flex-wrap: wrap; */
  flex-direction: row;
  align-items: center;
  margin-top: 20px;
  margin-bottom: 20px;
}

</style>