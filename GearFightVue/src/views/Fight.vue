<template>
  <div v-if="isAllowHere">
    <h1>Fight</h1>
    <div v-if="!fightStarted">
      <p>Seems like the server didn't give any info.</p>
      <p>id of the room: {{ roomId }}</p>
      <p>your gear id: {{ gearId }}</p>
    </div>
    <div v-else>
      <div class="fighters-container">
        <div>
          <Entity 
            @click="targetType == 'ALLY' && launchSpell(myGear)"
            :image="myGear?.image" 
            :entity="myGear"
            :isSelectable="targetType == 'ALLY'"
          />
        </div>
        <div>
          <Entity 
            @click="targetType == 'ENEMY' && launchSpell(enemies[0])"
            :image="'/img/monsters/' + enemies[0].image"
            :entity="enemies[0]"
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
    <h1>Error</h1>
    <p>You are not allow to be in this fight zone.</p>
  </div>
</template>

<script>
import { 
  MDBBtn,
  MDBRow,
  MDBCol,
  MDBContainer,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBModalFooter,
  MDBModal 
} from "mdb-vue-ui-kit";
import SpellCard from "@/components/SpellCard.vue";
import socket from '@/socket.js';
import { mapState } from 'pinia';
import { useGearsStore } from "@/stores/GearsStore";
import { useSpellsStore } from "@/stores/SpellsStore";
import Entity from "@/components/Entity.vue";
import Chat from "@/components/Chat.vue";

export default {
  components: {
    MDBBtn,
    MDBRow,
    MDBCol,
    MDBContainer,
    MDBModalHeader,
    MDBModalTitle,
    MDBModalBody,
    MDBModalFooter,
    MDBModal,
    SpellCard,
    Entity,
    Chat
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
      mySkills: [], // later on myGear directly
      allies: [],
      enemies: [],
      spellSelectedName: "",
      targetType: "",
      isAllowHere: false,
      fightStarted: false,
      info: [],
      actualTurn: 0,
      showModal: false,
      won: false,
    }
  },
  methods: {
    goBackToWorld() {
      this.$router.push({name: 'World'});
    },
    getLevel() {
      // call levelUp in contract
      goBackToWorld();
    },
    getEntitieFromRoom(room, entitieToFind) {
      return room[entitieToFind.side].find(entitie => entitie.id == entitieToFind.id && entitie.isNPC == entitieToFind.isNPC);
    },
    launchSpell(target) {
      if (this.spellSelectedName == "")
        return;
      let spellUsed = this.getSpell(this.spellSelectedName);
      let data = {user: this.myGear, spell: spellUsed, target: target, roomId: this.roomId};
      // console.log(data);
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
    await this.fillMyGears(false);
    if (this.isOwned(this.gearId) === -1)
      return;
    await this.fillSpells();
    this.isAllowHere = true;
    socket.auth = {userId: this.gearId};
    socket.connect();
    console.log("socket id:", socket.auth.userId);
    socket.on("connect_error", (err) => {
      console.log(err.message);
    });
    socket.on("roomData", async roomData => {
      let room = JSON.parse(roomData);
      if (room == null || !room.hasOwnProperty('group2'))
        return;
      this.enemies = room.group2;
      let pos = room.group1.findIndex(gear => gear.id == this.gearId);
      this.myGear = await room.group1.splice(pos, pos + 1)[0];
      // --- DEBUG ---
      // this.myGear.Spells.map(spell => {this.mySkills.push(this.getSpell(spell))});
      this.mySkills.push(this.getSpell("Fireball"));
      this.mySkills.push(this.getSpell("Basic_cut"));
      this.mySkills.push(this.getSpell("Basic_heal"));
      this.mySkills.push(this.getSpell("Basic_poisson"));
      // --- ---
      this.allies = room.group1;
      this.fightStarted = true;
    });
    socket.on("resolveAction", async data => {
      // console.log(data);
      let user = this.getEntitieFromRoom(data.room, {...data.action.user}).name;
      let target = this.getEntitieFromRoom(data.room, {...data.action.target}).name;
      if (this.actualTurn < data.room.fightSystem.turn) {
        this.actualTurn = data.room.fightSystem.turn;
        this.info.push(`------------------------------------- TURN ${this.actualTurn} -------------------------------------`);
      }
      this.info.push(`- ${user} launch ${data.action.spell.name} on ${target}`);
      // update the web with room data
      this.myGear = this.getEntitieFromRoom(data.room, {id: this.myGear.id, isNPC: this.myGear.isNPC, side: this.myGear.side});
      for (let i = 0; i < this.enemies.length; i++)
        this.enemies[i] = this.getEntitieFromRoom(data.room, {id: this.enemies[i].id, isNPC: this.enemies[i].isNPC, side: this.enemies[i].side});
    });
    socket.on("somebodyIsDead", data => {
      if (data.id == this.myGear.id && data.isNPC == this.myGear.isNPC && data.side == this.myGear.side) {
        this.won = false;
      } else {
        this.won = true;
      }
      this.showModal = true;
    });
    console.log("before emit: ", this.roomId);
    socket.emit("getRoomData", this.roomId);
  },
  unmounted() {
    socket.off("connect_error");
    socket.off("roomData");
    socket.off("resolveAction");
    socket.off("somebodyIsDead");
    socket.disconnect();
  },
  destroyed() {
    if (socket.connected) {
      socket.off("connect_error");
      socket.off("roomData");
      socket.off("resolveAction");
      socket.off("somebodyIsDead");
      socket.disconnect();
    }
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