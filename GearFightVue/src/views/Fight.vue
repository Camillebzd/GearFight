<template>
  <div v-if="isAllowHere">
    <h1>Fight</h1>
    <div v-if="!fightStarted">
      <p>The fight hasn't start wait pls.</p>
      <p>id of the room: {{ roomId }}</p>
      <p>your gear id: {{ gearId }}</p>
    </div>
    <div v-else>
      <div class="fighters-container">
        <div>
          <Entity 
            @click="targetType == 'ALLY' && launchSpell(myGear)"
            :image="myGear?.image" 
            :isSelectable="targetType == 'ALLY'"
          />
        </div>
        <div>
          <Entity 
            @click="targetType == 'ENEMY' && launchSpell(enemies[0])"
            :image="'/img/monsters/' + enemies[0].image"
            :isSelectable="targetType == 'ENEMY'"
          />
        </div>
      </div>
      <div class="spells-container">
        <SpellCard v-for="mySpell in mySpells" :key="mySpell.id"
          @click="selecteSpell(mySpell.name)" 
          :spellName="mySpell.name" 
          :selected="spellSelectedName == mySpell.name ? true : false"
        />
      </div>
    </div>
  </div>
  <div v-else>
    <h1>Error</h1>
    <p>You are not allow to be in this fight zone.</p>
  </div>
</template>

<script>
import { MDBRow, MDBCol, MDBContainer } from "mdb-vue-ui-kit";
import SpellCard from "@/components/SpellCard.vue"
import { io } from "socket.io-client";
import socket from '@/socket.js';
import { mapState } from 'pinia';
import { useGearsStore } from "@/stores/GearsStore";
import { useSpellsStore } from "@/stores/SpellsStore";
import Entity from "@/components/Entity.vue";

export default {
  components: {
    MDBRow,
    MDBCol,
    MDBContainer,
    SpellCard,
    Entity
  },
  props: {
    gearId: String,
    roomId: String
  },
  computed: {
    ...mapState(useGearsStore, ['ownedGears', 'fillMyGears', 'isOwned']),
    ...mapState(useSpellsStore, ['fillSpells', 'getSpell']),
  },
  data() {
    return {
      socket: {},
      myGear: {},
      mySpells: [],
      allies: [],
      enemies: [],
      spellSelectedName: "",
      targetType: "",
      isAllowHere: false,
      fightStarted: false,
    }
  },
  methods: {
    launchSpell(target) {
      if (this.spellSelectedName == "")
        return;
      let spellUsed = this.getSpell(this.spellSelectedName);
      let data = {user: this.myGear, spell: spellUsed, target: target};
      socket.emit("launchSpell", data);
      this.spellSelectedName = "";
      this.targetType = "";
    },
    selecteSpell(spellSelected) {
      this.spellSelectedName = spellSelected;
      this.targetType = this.getSpell(spellSelected).data.target.type;
    },
  },
  async created() {
    await this.fillMyGears();
    if (this.isOwned(this.gearId) === -1)
      return;
    await this.fillSpells();
    this.isAllowHere = true;
    // this.socket = io("http://localhost:3222", {auth: {userId: this.gearId}});
    socket.on("connect_error", (err) => {
      console.log(err.message);
    });
    socket.on("roomData", async roomData => {
      this.enemies = roomData.enemies;
      let pos = roomData.allies.findIndex(gear => gear.id == this.gearId);
      console.log(roomData.allies);
      this.myGear = await roomData.allies.splice(pos, pos + 1)[0];
      // --- DEBUG ---
      // this.myGear.Spells.map(spell => {this.mySpells.push(this.getSpell(spell))});
      this.mySpells.push(this.getSpell("Fireball"));
      this.mySpells.push(this.getSpell("Basic_cut"));
      this.mySpells.push(this.getSpell("Basic_heal"));
      this.mySpells.push(this.getSpell("Basic_poisson"));
      // --- ---
      this.allies = roomData.allies;
      this.fightStarted = true;
    });
    console.log("before emit");
    socket.emit("getRoomData", this.roomId);
  },
  destroyed() {
    socket.off("connect_error");
    socket.off("roomData");
  },
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
.spells-container {
  /* background-color: red; */
  position: fixed;
  left: 25%;
  bottom: 10px;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: space-between;
  align-content: center;
  min-width: 50%;
}
.gear-img {
  max-width: 256px;
  max-height: 256px;
  /* border-radius: 5%; */
}
</style>