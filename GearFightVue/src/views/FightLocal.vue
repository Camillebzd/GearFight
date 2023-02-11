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
        <SpellCard v-for="mySpell in mySkills" :key="mySpell.id"
          @click="mySpell.data.number > 0 && launchSpell(mySpell)" 
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
          <MDBBtn color="primary" v-if="won" @click="getLevel"> Level up! </MDBBtn>
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
  cleanFinishedDebuff
} from "@/scripts/fight.js";

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
      mySkills: [], // later on myGear directly
      monster: {},
      targetType: "",
      info: [],
      actualTurn: 1,
      showModal: false,
      won: false,
      upHere: false,
      entityTargetedInfo: {},
      spellTargetedInfo: {},
    }
  },
  computed: {
    ...mapState(useGearsStore, ['ownedGears', 'fillMyGears', 'isOwned', 'getFightFormGear']),
    ...mapState(useMonstersStore, ['monsters', 'fill', 'getFightFormMonster']),
    ...mapState(useSpellsStore, ['fillAllSpellData', 'getSpell']),
  },
  methods: {
    goBackToWorld() {
      this.showModal = false;
      this.$router.push({name: 'World'});
    },
    getLevel() {
      // call levelUp in contract
      this.goBackToWorld();
    },
    launchSpell(mySpell) {
      this.info.push(`------------------------------------- TURN ${this.actualTurn} -------------------------------------`);
      let actions = [];
      actions.push({user: this.myGear, spell: mySpell, target: mySpell.data.target.type == "ENEMY" ? this.monster : this.myGear});
      actions.push({user: this.monster, spell: this.getSpell(this.monster.skills[0]), target: this.getSpell(this.monster.skills[0]).data.target.type == "ENEMY" ? this.myGear : this.monster});
      actions.sort((a, b) => {
        return b.user.speed - a.user.speed;
      });
      console.log(actions);
      for (let i = 0; i < actions.length; i++) {
        resetAllToBaseStat(actions[i].user);
        applyBuffs(actions[i].user);
        resolveSpell(actions[i].user, actions[i].spell, actions[i].target);
        applyDebuffs(actions[i].user);
        cleanFinishedBuff(actions[i].user);
        cleanFinishedDebuff(actions[i].user)
        this.info.push(`- ${actions[i].user.name} launched ${actions[i].spell.data.displayName} on ${actions[i].target.name}`);
        if (!isAlive(this.monster)) {
          this.won = true;
          this.showModal = true;
          return;
        }
        if (!isAlive(this.myGear)) {
          this.won = false;
          this.showModal = true;
          return;
        }
      }
      this.actualTurn++;
      this.spellSelectedName = "";
      this.targetType = "";
    },
  },
  async created() {
    await this.fillMyGears();
    if (!this.isOwned(this.gearId))
      return;
    this.ownTheGear = true;
    await this.fill();
    await this.fillAllSpellData();
    this.myGear = this.getFightFormGear(this.gearId);
    this.monster = this.getFightFormMonster(this.monsterId);
    // --- DEBUG ---
    // this.myGear.skills
    this.mySkills.push(this.getSpell("Fireball"));
    this.mySkills.push(this.getSpell("Basic_cut"));
    this.mySkills.push(this.getSpell("Basic_heal"));
    this.mySkills.push(this.getSpell("Basic_poison"));
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