<template>
  <div class="home">
    <h1>Starter Weapons</h1>
    <!-- Protect if the user access the page without free request -->
    <div v-if="this.isConnected == true && this.requestAvailable > 0">
      <p>Choose one of the following weapons:</p>
      <div v-if="starterGears.length">
        <MDBContainer>
          <MDBRow class="justify-content-around">
            <MDBCol auto v-for="starterGear in starterGears" :key="starterGear.id" class="col">
              <GearCard
                :gear="starterGear" :gearId="starterGear.id.toString()" :storeType="'starterGears'"
              />
              <MDBBtn color="success" rounded @click="chooseStarter(starterGear)"> Choose </MDBBtn>
            </MDBCol>
          </MDBRow>
        </MDBContainer>
      </div>
    </div>
    <div v-else>
      <p>You should be connected to your wallet if you want to request a weapon and you should have request available.</p>
    </div>
  </div>
</template>

<script>
import { mapState } from 'pinia';
import { useGearsStore } from "@/stores/GearsStore";
import { useSpellsStore } from "@/stores/SpellsStore";
import { useUserStore } from "@/stores/UserStore.js";
import { useContractStore } from "@/stores/ContractStore.js"; // to remove
import GearCard from '@/components/GearCard.vue';
import { MDBRow, MDBCol, MDBContainer, MDBBtn } from "mdb-vue-ui-kit";
import { ethers } from 'ethers';
import contractABI from "@/abi/GearFactory.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_NEW_CONTRACT_ADDRESS;

export default {
  components: {
    GearCard,
    MDBRow,
    MDBCol,
    MDBContainer,
    MDBBtn
},
  computed: {
    ...mapState(useGearsStore, ['starterGears', 'fillStarterGears', 'getIntFromGearType']),
    ...mapState(useSpellsStore, ['fillWeaponsSpells', 'getWeaponsSpellFromId']),
    ...mapState(useUserStore, ['walletAddress', 'isConnected']),
    ...mapState(useContractStore, ['contractStatic', 'createStaticContract'])
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
    async chooseStarter(starterGear) {
      console.log(starterGear);
      let weapon = {
          name: starterGear.name,
          description: starterGear.description,
          image: starterGear.image,
          level: starterGear.level,
          stage: starterGear.stage,
          weaponStats: {
            health: starterGear.health,
            speed: starterGear.speed,
            mind: starterGear.mind,
            offensiveStats: {
                sharpDamage: starterGear.sharpDmg,
                bluntDamage: starterGear.bluntDmg,
                burnDamage: starterGear.burnDmg,
                pierce: starterGear.pierce,
                lethality: starterGear.lethality
            },
            defensiveStats: {
                sharpResistance: starterGear.sharpRes,
                bluntResistance: starterGear.bluntRes,
                burnResistance: starterGear.burnRes,
                guard: starterGear.guard,
            },
            handling: starterGear.handling,
          },
          xp: starterGear.xp,
      };
      // type
      weapon.weaponType = this.getIntFromGearType(starterGear.weaponType);
      // spells
      await this.fillWeaponsSpells();
      weapon.spells = [];
      // for (let i = 0; i < starterGear.spells.length; i++) {
      //   weapon.spells.push(this.getWeaponsSpellFromId(starterGear.spells[i]).name);
      // }
      starterGear.spells.forEach((spell) => {weapon.spells.push(spell.name)});
      console.log(weapon);
      // send mint to contract
      const ethereum = window.ethereum;
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner(this.walletAddress);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer);
      // console.log((await contract.maxWeaponsRequest()).toString());
      try {
        await contract.requestWeapon(weapon);
        this.$notify({
          type: "success",
          title: "Weapon requested!",
          text: "Your weapon was created, wait a minute and you will see it appear!",
        });
        this.$router.push({name: 'PersonnalArmory'});
      } catch {
        this.$notify({
          type: "error",
          title: "Weapon request failed",
          text: "An error occuquered during the request weapon process.",
        });
      }
    }
  },
  data() {
    return {
      requestAvailable: 0,
    }
  },
  async created() {
    await this.fillStarterGears();
    await this.getRequestAvailable();
  }
}
</script>

<style>
.col {
  /* background-color: red; */
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
</style>