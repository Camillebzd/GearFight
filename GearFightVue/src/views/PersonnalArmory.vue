<template>
  <div class="home">
    <h1>Personnal Armory</h1>
    <div v-if="isConnected"> <!-- Change to print a loader during the retreave of nft -->
      <div v-if="requestAvailable > 0" class="flex-div-row">
        <div style="margin-right: 20px;">You have {{ requestAvailable }} free weapon request left! Go select it: </div>
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
        <div class="flex-div-row">
          <div style="margin-right: 10px;">Refresh the metadata of the armory: </div>
          <MDBBtn color="success" @click="refreshMyGearsMetadata">refresh</MDBBtn>
        </div>
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
import { ethers } from 'ethers';
import contractABI from "@/abi/GearFactory_v5.json"; // change to last version

const CONTRACT_ADDRESS = import.meta.env.VITE_NEW_CONTRACT_ADDRESS;

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
      requestAvailable: 0,
    }
  },
  computed: {
    ...mapState(useUserStore, ['walletAddress', 'isConnected']),
    ...mapState(useGearsStore, ['ownedGearsFormatted', 'fillMyGears']),
  },
  methods: {
    async getRequestAvailable() {
      if (!this.isConnected)
        return;
      const ethereum = window.ethereum;
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner(this.walletAddress);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer);
      const maxWeaponsRequest = await contract.maxWeaponsRequest();
      const weaponsRequested = await contract.weaponsRequested(this.walletAddress);
      this.requestAvailable = maxWeaponsRequest - weaponsRequested;
    },
    async refreshMyGearsMetadata() {
      await this.fillMyGears(true);
    }
  },
  async created() {
    await this.fillMyGears(false);
    await this.getRequestAvailable();
    console.log(this.ownedGearsFormatted);
  },
  watch: {
    walletAddress: function() {
      this.fillMyGears(true);
      this.getRequestAvailable();
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