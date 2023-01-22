<template>
  <div>
    <h1>Fight (local)</h1>
    <div v-if="ownTheGear && readyToFight">
      <div class="fighters-container">
        <div>
          <Entity 
            @click="targetType == 'ALLY' && launchSpell(myGear)"
            :image="myGear.image" 
            :entity="myGear"
            :isSelectable="targetType == 'ALLY'"
          />
        </div>
        <div>
          <Entity 
            @click="targetType == 'ENEMY' && launchSpell(monster)"
            :image="'/img/monsters/' + monster.image"
            :entity="monster"
            :isSelectable="targetType == 'ENEMY'"
          />
        </div>
      </div>
      <div class="info-chat-container">
        <Chat :lignes="info"/>
      </div>
      <div class="spells-container">
        <SpellCard v-for="mySpell in mySkills" :key="mySpell.id"
          @click="selecteSpell(mySpell.name)" 
          :spellName="mySpell.name" 
          :selected="spellSelectedName == mySpell.name ? true : false"
        />
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
          <MDBBtn color="primary" v-if="won" @click="getLevel"> Level up! </MDBBtn>
        </MDBModalFooter>
      </MDBModal>
    </div>
    <div v-else>
      <p>You don't own this gear.</p>
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
import { LaunchSpell } from "@/scripts/fight.js";

export default {
  components: {
    SpellCard,
    Entity,
    Chat,
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
      mySkills: [], // later on myGear directly
      monster: {},
      spellSelectedName: "",
      targetType: "",
      info: [],
      actualTurn: 1,
      showModal: false,
      won: false,
    }
  },
  computed: {
    ...mapState(useGearsStore, ['ownedGears', 'fillMyGears', 'isOwned', 'getFightFormGear']),
    ...mapState(useMonstersStore, ['monsters', 'fill', 'getFightFormMonster']),
    ...mapState(useSpellsStore, ['fillSpells', 'getSpell']),
  },
  methods: {
    goBackToWorld() {
      this.showModal = false;
      this.$router.push({name: 'World'});
    },
    getLevel() {
      // call levelUp in contract
      goBackToWorld();
    },
    selecteSpell(spellSelected) {
      this.spellSelectedName = spellSelected;
      this.targetType = this.getSpell(spellSelected).data.target.type;
    },
    launchSpell(target) {
      if (this.spellSelectedName == "")
        return;
      this.info.push(`------------------------------------- TURN ${this.actualTurn} -------------------------------------`);
      // MANAGE SPEED -> action system
      // user
      let spellUsedMe = this.getSpell(this.spellSelectedName);
      this.info.push(`- ${this.myGear.name} launch ${spellUsedMe.name} on ${target.name}`);
      LaunchSpell(this.myGear, spellUsedMe, target);
      if (!this.isAlive(this.monster)) {
        this.won = true;
        this.showModal = true;
      }
      // monster
      let spellUsedMonster = this.getSpell(this.monster.skills[0]);
      this.info.push(`- ${this.monster.name} launch ${spellUsedMonster.name} on ${this.myGear.name}`);
      LaunchSpell(this.monster, spellUsedMonster, this.myGear);
      if (!this.isAlive(this.myGear)) {
        this.won = false;
        this.showModal = true;
      }
      this.actualTurn++;
      this.spellSelectedName = "";
      this.targetType = "";
    },
    isAlive(entitie) {
      return entitie.life > 0;
    }
  },
  async created() {
    await this.fillMyGears();
    if (!this.isOwned(this.gearId))
      return;
    this.ownTheGear = true;
    await this.fill();
    await this.fillSpells();
    this.myGear = this.getFightFormGear(this.gearId);
    this.monster = this.getFightFormMonster(this.monsterId);
    // --- DEBUG ---
    this.mySkills.push(this.getSpell("Fireball"));
    this.mySkills.push(this.getSpell("Basic_cut"));
    this.mySkills.push(this.getSpell("Basic_heal"));
    this.mySkills.push(this.getSpell("Basic_poisson"));
    // --- ---
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
}
.gear-img {
  max-width: 256px;
  max-height: 256px;
  /* border-radius: 5%; */
}
</style>