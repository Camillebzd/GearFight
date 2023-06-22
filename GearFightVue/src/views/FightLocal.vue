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
          :playerFluxes="myGear.fluxes"
          @mouseover="spellTargetedInfo = mySpell" @mouseleave="spellTargetedInfo = {}"
        />
      </div>
      <div class="info-entity-container">
        <InfoWindow :entityInfo="entityTargetedInfo" :spellInfo="spellTargetedInfo" />
      </div>
      <!-- Fluxes selection modal -->
      <MDBModal
        id="showFluxesModal"
        tabindex="-1"
        labelledby="showModalTitleFluxes"
        v-model="showFluxesModal"
        scrollable
        staticBackdrop
      >
        <MDBModalHeader :close="false">
          <MDBModalTitle id="showModalTitleFluxes">Choose how many fluxes consume for the ability:</MDBModalTitle>
        </MDBModalHeader>
        <MDBModalBody>
          <MDBContainer class="fluxe-modal-container">
            <p>{{ selectedSpell.name }}</p>
            <div class="fluxe-selector-container">
              <MDBBtn color="secondary" @click="fluxesSelected > 1 && modifyFluxesSelected(-1)" > - </MDBBtn>
              <div style="margin-left: 5px; margin-right: 5px;">{{ fluxesSelected }}</div>
              <MDBBtn color="secondary" @click="fluxesSelected < myGear.fluxes && modifyFluxesSelected(1)"> + </MDBBtn>
            </div>
            <div class="fluxe-buttons-container">
              <MDBBtn color="secondary" @click="cancelSelectFluxes()"> Cancel </MDBBtn>
              <MDBBtn color="primary" @click="selectFluxes()"> Select </MDBBtn>
            </div>
          </MDBContainer>
        </MDBModalBody>
      </MDBModal>
      <!-- End of fight modal -->
      <MDBModal
        id="showEndModal"
        tabindex="-1"
        labelledby="showModalTitle"
        v-model="showEndModal"
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
  resolveActions
} from "@/scripts/fight.js";
import { getRandomInt } from "@/scripts/utils.js";
import { Action, END_OF_TURN } from "@/scripts/actions";
import { ethers } from 'ethers';
import contractABI from "@/abi/GearFactory.json";

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
      showEndModal: false,
      won: false,
      showFluxesModal: false,
      fluxesSelected: 1,
      entityTargetedInfo: {},
      spellTargetedInfo: {},
      playerSpellPromise: null,
      playerComboPromise: null,
      playerFluxesPromise: null,
      selectedSpell: null
    }
  },
  computed: {
    ...mapState(useGearsStore, ['isOwned', 'getMyGearFormatted']),
    ...mapState(useMonstersStore, ['getMonster']),
  },
  methods: {
    // https://stackoverflow.com/questions/75466751/how-to-await-a-value-being-set-asynchronously
    deferred() {
      let resolve, reject
      const promise = new Promise((res,rej) => {
        resolve = res
        reject = rej
      })
      return { promise, resolve, reject }
    },
    goBackToWorld() {
      this.showEndModal = false;
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
    async launchSpell(mySpell) {
      if (this.isTurnRunning == true && this.isPlayerCombo != true) {
        console.log("Error: this is not your turn to play.");
        return;
      }
      this.selectedSpell = mySpell;
      let fluxesUsed = 0;
      // manage fluxes
      if (mySpell.isMagical) {
        if (this.myGear.fluxes == 0) {
          console.log("Error: can't use this spell with no fluxes.");
          this.selectedSpell = null;
          return;
        }
        if(await this.handleFluxesSelection() == false) {
          console.log("Player canceled");
          this.selectedSpell = null;
          return;
        } else {
          this.myGear.useFluxes(this.fluxesSelected);
          fluxesUsed = this.fluxesSelected;
          this.fluxesSelected = 1;
        }
      }
      this.actions.push(new Action({caster: this.myGear, spell: mySpell, target: this.monster, hasBeenDone: false, isCombo: this.isPlayerCombo, fluxesUsed: fluxesUsed, info: this.info}));
      this.selectedSpell = null; // if needed after keep it...
      if (this.isPlayerCombo == false) {
        this.playerSpellPromise.resolve();
      } else {
        this.playerComboPromise.resolve();
      }
    },
    async resolveTurn() {
      this.isTurnRunning = true;
      this.info.push(`------------------------------------- TURN ${this.actualTurn} -------------------------------------`);
      while (this.actions.length > 0) {
        let ret = resolveActions(this.actions);
        switch (ret) {
          case END_OF_TURN.PLAYER_COMBO:
            this.isPlayerCombo = true;
            this.playerComboPromise = this.deferred();
            await this.playerComboPromise.promise;
            break;
          case END_OF_TURN.MONSTER_COMBO:
            this.isMonterCombo = true;
            this.actions.push(this.monster.launchRandomSpell(this.myGear, this.isMonterCombo));
            break;
          case END_OF_TURN.PLAYER_DIED:
            this.won = false;
            this.showEndModal = true;
            return;
          case END_OF_TURN.MONSTER_DIED:
            this.won = true;
            this.showEndModal = true;
            return;
          case END_OF_TURN.NORMAL:
          default:
            this.isMonterCombo = false;
            this.isPlayerCombo = false;
            break;
        }
        this.actions = this.actions.filter((action) => {return action.hasBeenDone === false});
      }
      if (!this.myGear.applyDecayingModifier()) {
        // die of dots
        this.won = false;
        this.showEndModal = true;
      }
      if (!this.monster.applyDecayingModifier()) {
        // die of dots
        this.won = true;
        this.showEndModal = true;
      }
      this.myGear.resetRulesOnAction();
      this.monster.resetRulesOnAction();
      this.actualTurn++;
      this.isTurnRunning = false;
      this.info.push("-------------------------------- END OF TURN --------------------------------");
    },
    // in test
    async gameLoop() {
      while (1) {
        // check if monster can play & select a spell
        if (this.monster.isEntityAbleToPlay()) {
          this.actions.push(this.monster.launchRandomSpell(this.myGear, this.isMonterCombo));
        }
        // check if player can play & select a spell
        if (this.myGear.isEntityAbleToPlay()) {
          this.playerSpellPromise = this.deferred();
          await this.playerSpellPromise.promise;
        }
        await this.resolveTurn();
      }
    },
    async handleFluxesSelection() {
      this.showFluxesModal = true;
      this.playerFluxesPromise = this.deferred();
      let result = await this.playerFluxesPromise.promise;
      this.showFluxesModal = false;
      return result;
    },
    selectFluxes() {
      if (!this.fluxesSelected > 0) {
        this.playerFluxesPromise.resolve(false);
      }
      this.playerFluxesPromise.resolve(true);
    },
    cancelSelectFluxes() {
      this.playerFluxesPromise.resolve(false);
    },
    modifyFluxesSelected(num) {
      this.fluxesSelected += num;
    }
  },
  async created() {
    if (!await this.isOwned(this.gearId))
      return;
    this.ownTheGear = true;
    this.myGear = await this.getMyGearFormatted(this.gearId);
    this.monster = await this.getMonster(this.monsterId);
    this.myGear.spells.forEach((spell) => {
      this.mySpells.push(JSON.parse(JSON.stringify(spell)));
    });
    this.myGear.info = this.info;
    this.monster.info = this.info;
    console.log(this.monster);
    console.log(this.myGear);
    this.gameLoop();
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
.fluxe-modal-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.fluxe-selector-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
}
.fluxe-buttons-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
</style>