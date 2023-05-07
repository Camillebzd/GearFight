<template>
  <div class="home">
    <h1>Starter Weapons</h1>
    <!-- Protect if the user access the page without free request -->
    <div v-if="isConnected">
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
      <p>You should be connected to your wallet if you want to request a weapon.</p>
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
  computed: {
    ...mapState(useGearsStore, ['starterGears', 'fillStarterGears', 'getIntFromGearType']),
    ...mapState(useSpellsStore, ['fillWeaponsSpells', 'getWeaponsSpellFromId']),
    ...mapState(useUserStore, ['walletAddress', 'isConnected']),
    ...mapState(useContractStore, ['contractStatic', 'createStaticContract'])
  },
  methods: {
    async chooseStarter(starterGear) {
      console.log(starterGear);
      let weapon = {
          name: starterGear.name,
          description: starterGear.description,
          imageURI: starterGear.image,
          level: starterGear.level,
          stage: starterGear.stage,
          weaponStats: {
              health: starterGear.health,
              speed: starterGear.speed,
              sharpDmg: starterGear.sharpDmg,
              bluntDmg: starterGear.bluntDmg,
              sharpRes: starterGear.sharpRes,
              bluntRes: starterGear.bluntRes,
              penRes: starterGear.penRes,
              handling: starterGear.handling,
              guard: starterGear.guard,
              lethality: starterGear.lethality
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
      // pop up
      await contract.requestWeapon(weapon);
    }
  },
  data() {
    return {
    }
  },
  async created() {
    await this.fillStarterGears();
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