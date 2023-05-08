<template>
  <div>
    <h1>Fight (local)</h1>
    <div v-if="ownTheGear && readyToFight">
      <div class="fighters-container">
        <div>
          <Entity 
            :image="myGear.image" 
            :entity="myGear"
            :isSelectable="targetType == 'ALLY'" 
            :modifiersOnRight="true"
            @mouseover="entityTargetedInfo = myGear" @mouseleave="entityTargetedInfo = {}"
          />
        </div>
        <div>
          <Entity 
            :image="'/img/monsters/' + monster.image"
            :entity="monster"
            :isSelectable="targetType == 'ENEMY'"
            :modifiersOnRight="false"
            @mouseover="entityTargetedInfo = monster" @mouseleave="entityTargetedInfo = {}"
          />
        </div>
      </div>
      <div class="info-chat-container">
        <Chat :lignes="info"/>
      </div>
      <div class="spells-container">
        <SpellCard v-for="mySpell in mySpells" :key="mySpell.id"
          @click="launchSpell(mySpell)" 
          :spell="mySpell"
          @mouseover="spellTargetedInfo = mySpell" @mouseleave="spellTargetedInfo = {}"
        />
      </div>
      <div class="info-entity-container">
        <InfoWindow :entityInfo="entityTargetedInfo" :spellInfo="spellTargetedInfo" />
      </div>
      <MDBModal
        id="showModal"
        tabindex="-1"
        labelledby="showModalTitle"
        v-model="showModal"
        scrollable
        staticBackdrop
      >
        <MDBModalHeader :close="false">
          <MDBModalTitle id="showModalTitle"> End of the fight </MDBModalTitle>
        </MDBModalHeader>
        <MDBModalBody>
          <MDBContainer>
            <p v-if="won">I won!</p>
            <p v-else>I lost...</p>
          </MDBContainer>
        </MDBModalBody>
        <MDBModalFooter>
          <MDBBtn color="secondary" @click="goBackToWorld"> Go back to world </MDBBtn>
          <MDBBtn color="primary" v-if="won" @click="gainXP"> gain xp! </MDBBtn>
        </MDBModalFooter>
      </MDBModal>
    </div>
    <div v-else>
      <p>You don't own this gear or you're not connected.</p>
    </div>
  </div>
</template>

<script>
import { 
  MDBBtn,
  MDBContainer,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBModalFooter,
  MDBModal 
} from "mdb-vue-ui-kit";
import { mapState } from 'pinia';
import { useGearsStore } from "@/stores/GearsStore";
import { useSpellsStore } from "@/stores/SpellsStore";
import { useMonstersStore } from '@/stores/MonstersStore';
import Entity from "@/components/Entity.vue";
import Chat from "@/components/Chat.vue";
import SpellCard from "@/components/SpellCard.vue";
import InfoWindow from "@/components/InfoWindow.vue";
import { 
  resolveSpell, 
  isAlive, applyBuffs, 
  applyDebuffs, 
  resetAllToBaseStat,
  cleanFinishedBuff,
  cleanFinishedDebuff,
  resolveTurn,
  END_OF_TURN
} from "@/scripts/fight.js";
import { ethers } from 'ethers';
import contractABI from "@/abi/GearFactory_v5.json"; // change to last version

const CONTRACT_ADDRESS = import.meta.env.VITE_NEW_CONTRACT_ADDRESS;

export default {
  components: {
    SpellCard,
    Entity,
    Chat,
    InfoWindow,
    MDBBtn,
    MDBContainer,
    MDBModalHeader,
    MDBModalTitle,
    MDBModalBody,
    MDBModalFooter,
    MDBModal 
  },
  props: {
    monsterId: String,
    gearId: String,
  },
  data() {
    return {
      ownTheGear: false,
      readyToFight: false,
      myGear: {},
      mySpells: [],
      monster: {},
      targetType: "",
      info: [],
      actualTurn: 1,
      actions: [],
      isMonterCombo: false,
      isPlayerCombo: false,
      showModal: false,
      won: false,
      entityTargetedInfo: {},
      spellTargetedInfo: {},
    }
  },
  computed: {
    ...mapState(useGearsStore, ['fillMyGears', 'isOwned', 'getFightFormGear', 'getMyGearFormatted', 'refreshTokenMetadata']),
    ...mapState(useMonstersStore, ['monsters', 'fillMonstersData', 'getFightFormMonster']),
  },
  methods: {
    goBackToWorld() {
      this.showModal = false;
      this.$router.push({name: 'World'});
    },
    async gainXP() {
      // call earn money / xp
      const ethereum = window.ethereum;
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner(this.walletAddress);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer);

      try {
        await contract.gainXP(this.myGear.id, this.monster.difficulty);
        this.$notify({
          type: "success",
          title: "XP earned!",
          text: `Your weapon gained ${this.monster.difficulty} xp, wait a minute and you will see it!`,
        });
      } catch {
        this.$notify({
          type: "error",
          title: "XP error",
          text: "An error happened during the the process of gaining experience.",
        });
      }
      this.goBackToWorld();
    },
    launchSpell(mySpell) {
      if (this.isPlayerCombo == false) {
        this.info.push(`------------------------------------- TURN ${this.actualTurn} -------------------------------------`);
        // random select spell for monster
        this.actions.push({attacker: this.monster, spell: this.monster.spells[0], target: this.myGear, hasBeenDone: false, isCombo: this.isMonterCombo});
      }
      this.actions.push({attacker: this.myGear, spell: mySpell, target: this.monster, hasBeenDone: false, isCombo: this.isPlayerCombo});
      this.turn();
    },
    turn() {
      // clean actions done ?
      this.actions = this.actions.filter((action) => {return action.hasBeenDone === false});
      let ret = resolveTurn(this.actions, this.info);
      switch (ret) {
        case END_OF_TURN.PLAYER_COMBO:
          this.isPlayerCombo = true;
          this.info.push("PLAYER COMBO!");
          break;
        case END_OF_TURN.MONSTER_COMBO:
          this.isMonterCombo = true;
          this.info.push("MONSTER COMBO!");
          this.actions.push({attacker: this.monster, spell: this.monster.spells[0], target: this.myGear, hasBeenDone: false, isCombo: this.isMonterCombo});
          turn();
          break;
        case END_OF_TURN.PLAYER_DIED:
          this.won = false;
          this.showModal = true;
          return;
        case END_OF_TURN.MONSTER_DIED:
          this.won = true;
          this.showModal = true;
          return;
        case END_OF_TURN.NORMAL:
        default:
          // end turn
          this.info.push("-------------------------------- END OF TURN --------------------------------");
          this.isMonterCombo = false;
          this.isPlayerCombo = false;
          this.actions = []; // this.actions = this.actions.filter((action) => {return action.hasBeenDone === false});
          this.actualTurn++;
          break;
      }
    },
  },
  async created() {
    await this.fillMyGears(false);
    if (!this.isOwned(this.gearId))
      return;
    this.ownTheGear = true;
    await this.fillMonstersData();
    // await this.fillAllSpellData();
    this.myGear = this.getFightFormGear(this.getMyGearFormatted(this.gearId));
    this.monster = this.getFightFormMonster(this.monsterId);
    console.log(this.monster)
    this.myGear.spells.forEach((spell) => {
      this.mySpells.push(JSON.parse(JSON.stringify(spell)));
    });
    console.log(this.myGear);
    this.readyToFight = true;
  }
}
</script>

<style>
.fighters-container {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  /* background-color: blue; */
  justify-content: space-between;
  align-items: center;
  height: 400px;
}
.info-chat-container {
  /* background-color: red; */
  position: fixed;
  left: 3%;
  bottom: 10px;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  height: 20%;
  width: 24%;
}
.spells-container {
  /* background-color: red; */
  position: fixed;
  left: 30%;
  bottom: 10px;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: space-between;
  align-content: center;
  width: 40%;
  height: 12%;
}
.info-entity-container{
  position: fixed;
  right: 3%;
  bottom: 10px;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  height: 20%;
  width: 24%;
}
.gear-img {
  max-width: 256px;
  max-height: 256px;
  /* border-radius: 5%; */
}
</style>