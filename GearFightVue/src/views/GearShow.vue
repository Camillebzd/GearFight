<template>
  <div>
    <div v-if="gear == null">
      <h1>Loading...</h1>
      <p>We are loading the gear, if this take to much time it may be because a problem has happened.</p>
    </div>
    <div v-else>
      <h1>{{ gear.name }}</h1>
      <div class="flex-div">
        <img :src="gear?.image" class="img-fluid shadow-2-strong nft-img" />
        <div>
          <div>Health: {{gear.health}}</div>
          <div>Speed: {{gear.speed}}</div>
          <div>Sharp Damage: {{gear.sharpDmg}}</div>
          <div>Blunt Damage: {{gear.bluntDmg}}</div>
          <div>Sharp Resistance: {{gear.sharpRes}}</div>
          <div>Blunt Resistance: {{gear.bluntRes}}</div>
          <div>Penetration Resistance: {{gear.penRes}}</div>
          <div>Handling: {{gear.handling}}</div>
          <div>Guard: {{gear.guard}}</div>
          <div>Lethality: {{gear.lethality}}</div>
        </div>
        <div>
          <div>XP: {{ gear.xp }}</div>
          <div>Level: {{ gear.level }}</div>
          <div>Stage: {{ gear.stage }}</div>
          <div>Type: {{ gear.weaponType }}</div>
          <div>Spells: {{ gear.spells[0].name }}, {{ gear.spells[1].name }}, {{ gear.spells[2].name }}, {{ gear.spells[3].name }}</div>
        </div>
      </div>
      <p>{{ gear.description }}</p>
      <!-- level up system here -->
      <div v-if="gear.xp > 0" class="flex-div flex-center">
        <div style="margin-right: 10px;">You have {{ gear.xp }} xp, you can spend 1 xp to gain 1 level!</div>
        <MDBBtn color="success" @click="levelUp">LEVEL UP</MDBBtn>
      </div>
      <!-- upgrade system here -->
      <div v-if="gear.stage < gear.level * 1 && gear.stage < 3" class="flex-div flex-center">
        <div style="margin-right: 10px;">You have enough level, you can upgrade your weapon!</div>
        <MDBBtn color="success" @click="upgrade">UPGRADE</MDBBtn>
      </div>
      <!-- manual refresh -->
      <div class="flex-div flex-center">
        <div style="margin-right: 10px;">If data take too much time to be updated, click here: </div>
        <MDBBtn color="success" @click="manualRefresh">refresh</MDBBtn>
      </div>
    </div>
  </div>
</template>

<script>
import { MDBBtn } from "mdb-vue-ui-kit";
import { mapState } from 'pinia';
import { useGearsStore } from "@/stores/GearsStore";
import { useUserStore } from "@/stores/UserStore.js";

import { ethers } from 'ethers';
import contractABI from "@/abi/GearFactory_v5.json"; // change to last version

const CONTRACT_ADDRESS = import.meta.env.VITE_NEW_CONTRACT_ADDRESS;

export default {
  components: {
    MDBBtn,
  },
  computed: {
    ...mapState(useUserStore, ['walletAddress', 'isConnected']),
    ...mapState(useGearsStore, ['gears', 'ownedGearsFormatted', 'starterGears', 
      'getGearsForContract', 'fillMyGears', 'fillStarterGears',
      'getGear', 'getMyGearFormatted', 'getStarterGear', 'getFightFormGear',
      'getWeaponStatsForLevelUp', 'getWeaponImageForUpgrade', 'refreshTokenMetadataManual'
    ]),
  },
  data() {
    return {
      gear: null,
      gearOwners: "Unknown", // maybe later there could be more than one owner
      accountAddress: "",
    }
  },
  methods: {
    createContract() {
      const ethereum = window.ethereum;
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner(this.walletAddress);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer);
      return contract;
    },
    async manualRefresh() {
      try {
        this.refreshTokenMetadataManual(this.gear.id);
        this.$notify({
          type: "success",
          title: "Metadata refreshed",
          text: "The metadata of this gear has been refreshed, wait a minute and reload the page",
        });
        await this.loadWeapon();
      } catch {
        this.$notify({
          type: "success",
          title: "Metadata not refreshed",
          text: "The metadata of this gear can't be refreshed due to an error...",
        });
      }
    },
    async levelUp() {
      const contract = this.createContract();
      let weaponStats = await this.getWeaponStatsForLevelUp(this.gear.weaponType);
      console.log(weaponStats);
      try {
        await contract.levelUp(this.gear.id, weaponStats);
        this.$notify({
          type: "success",
          title: "Level up!",
          text: "Your weapon gained a level, wait a minute and click on refresh to see it!",
        });
      } catch {
        this.$notify({
          type: "error",
          title: "Level up failed",
          text: "An error happened during the level up process...",
        });
      }
    },
    async upgrade() {
      const contract = this.createContract();
      let image = await this.getWeaponImageForUpgrade(this.gear.weaponType, this.gear.stage + 1);
      console.log(image);
      try {
        await contract.upgradeWeapon(this.gear.id, image);
        this.$notify({
          type: "success",
          title: "Upgrade done!",
          text: "Your weapon upgraded, wait a minute click on refresh to see it!",
        });
      } catch {
        this.$notify({
          type: "error",
          title: "Upgrade failed",
          text: "An error happened during the upgrade process...",
        });
      }
    },
    async loadWeapon() {
      switch (this.$route.params.storeType) {
        case "gears":
          await this.getGearsForContract();
          this.gear = await this.getFightFormGear(this.getGear(this.$route.params.id));
          break;
        case "ownedGearsFormatted":
          await this.fillMyGears(false);
          this.gear = await this.getMyGearFormatted(this.$route.params.id);
          break;
        case "starterGears":
          await this.fillStarterGears();
          this.gear = await this.getStarterGear(this.$route.params.id);
          break;
        default:
          console.log("ERROR: the store is not supported!");
          break;
      }
    },
  },
  async created() {
    await this.loadWeapon();
  },
  watch: {
    '$attrs.accountAddress': function(newVal, oldVal) {
      // this.accountAddress = newVal;
      // this.getNFTInfo();
    },
  }
}
</script>

<style>

.stats {
  /* background-color: red; */
  justify-content: center;
}
.flex-div {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
}
.flex-center {
  align-items: center;
  margin-bottom: 20px;
}
.nft-img {
  height: 256px;
  width: 256px;
  margin-right: 20px;
  margin-bottom: 20px;
}
.owner {
  margin-top: 40px;
}
</style>