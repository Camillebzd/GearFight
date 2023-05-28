<template>
  <div>
    <div v-if="monster != undefined">
      <h1>{{monster.name}}</h1>
      <div class="flex-div">
        <img :src="'/img/monsters/' + monster.image" alt="..." style="width: 64; height: 64;" class="img-fluid shadow-2-strong nft-img" />
        <div>
          <MDBBadge :badge="getBadgeColor" style="margin-bottom: 1rem;">{{ getDifficultyName }}</MDBBadge>
          <div>Health: {{monster.health}}</div>
          <div>Speed: {{monster.speed}}</div>
          <div>Mind: {{monster.mind}}</div>
          <div>Sharp Damage: {{monster.sharpDmg}}</div>
          <div>Blunt Damage: {{monster.bluntDmg}}</div>
          <div>Burn Damage: {{monster.burnDmg}}</div>
          <div>Sharp Resistance: {{monster.sharpRes}}</div>
          <div>Blunt Resistance: {{monster.bluntRes}}</div>
        </div>
        <div style="margin-left: 15px;">
          <div>Burn Resistance: {{monster.burnRes}}</div>
          <div>Pierce: {{monster.pierce}}</div>
          <div>Handling: {{monster.handling}}</div>
          <div>Guard: {{monster.guard}}</div>
          <div>Lethality: {{monster.lethality}}</div>
          <div>Level: {{ monster.level }}</div>
          <div>Spells: {{ monster.spells[0]?.name }}, {{ monster.spells[1]?.name }}, {{ monster.spells[2]?.name }}, {{ monster.spells[3]?.name }}</div>
        </div>
      </div>
      <p>{{monster.description}}</p>
      <div v-if="isConnected">
        <MDBBtn
          color="info"
          aria-controls="exampleModalScrollableTitle"
          @click="openModal"
        >
          fight
        </MDBBtn>
        <MDBModal
          id="exampleModalScrollable"
          tabindex="-1"
          labelledby="exampleModalScrollableTitle"
          v-model="exampleModalScrollable"
          scrollable
        >
          <MDBModalHeader :close="false">
            <MDBModalTitle id="exampleModalScrollableTitle"> Choose your Gear for the figth </MDBModalTitle>
          </MDBModalHeader>
          <MDBModalBody>
            <MDBContainer v-if="ownedGearsFormatted.length > 0">
              <MDBRow>
                <MDBCol auto v-for="gear in ownedGearsFormatted" :key="gear.id">
                  <GearCardHorizontal 
                    :gear="gear" :gearId="gear.id" @click="selectGear(gear.id)" style="cursor: pointer"
                    :class="{selectedGear: isSelected(gear.id)}"
                  />
                </MDBCol>
              </MDBRow>
            </MDBContainer>
          </MDBModalBody>
          <MDBModalFooter>
            <MDBBtn color="secondary" @click="exampleModalScrollable = false"> Close </MDBBtn>
            <!-- <MDBBtn color="primary" :disabled="gearSelected < 0" @click="launchFight" > Use this weapon (serv) </MDBBtn> -->
            <MDBBtn color="primary" :disabled="gearSelected < 0" @click="launchLocalFight" > Fight </MDBBtn>
          </MDBModalFooter>
        </MDBModal>
      </div>
      <div v-else>
        <p>Connect to your account to fight this monster.</p>
      </div>
    </div>
    <div v-else>
      <h1>Impossible to find the monster</h1>
      <p>Impossible to find the monster. This may happen if the monster doesn't exist or if the connection is really slow.</p>
    </div>
  </div>
</template>

<script>
import { 
  MDBBtn,
  MDBBadge,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBModalFooter,
  MDBModal,
  MDBContainer,
  MDBRow,
  MDBCol
} from "mdb-vue-ui-kit";
import { useMonstersStore } from "@/stores/MonstersStore.js";
import { useUserStore } from "@/stores/UserStore";
import { mapState } from 'pinia';
import { useGearsStore } from "@/stores/GearsStore";
import GearCardHorizontal from '@/components/GearCardHorizontal.vue';
import { io } from "socket.io-client";
import socket from '@/socket.js';

export default {
  components: {
    MDBBtn,
    MDBBadge,
    MDBModalHeader,
    MDBModalTitle,
    MDBModalBody,
    MDBModalFooter,
    MDBModal,
    MDBContainer,
    MDBRow,
    MDBCol,
    GearCardHorizontal
  },
  computed: {
    ...mapState(useMonstersStore, ['getMonster', 'fillMonstersData', 'getFightFormMonster']),
    ...mapState(useUserStore, ['isConnected']),
    ...mapState(useGearsStore, ['ownedGearsFormatted', 'fillMyGears', 'getMyGear']),
    // monster() {
    //   return this.monsters[this.$route.params.id];
    // },
    getBadgeColor() {
      if (this.monster.difficulty === 1)
        return "secondary";
      else if (this.monster.difficulty === 2)
        return "warning";
      else
        return "danger";
    },
    getDifficultyName() {
      if (this.monster.difficulty === 1)
        return "easy";
      else if (this.monster.difficulty === 2)
        return "normal";
      else
        return "hard";
    }
  },
  methods: {
    launchLocalFight() {
      this.exampleModalScrollable = false;
      this.$router.push({name: 'fight.local', params:{monsterId: this.$route.params.id, gearId: this.gearSelected}});
    },
    // fct for future connected fights
    async launchFight() {
      this.exampleModalScrollable = false;
      // loading to tell the client to wait the start of the fight ?
      // this.socket = io("http://localhost:3222", {auth: {userId: this.gearSelected}});
      socket.auth = {userId: this.gearSelected};
      socket.connect();
      socket.on("connect_error", (err) => {
        console.log(err.message);
      });
      socket.on("roomCreated", data => {
        console.log(this.gearSelected);
        if (data.lead == this.gearSelected) { // check leader is in my team
          this.$router.push({name: 'fight', params:{roomId: data.id, gearId: this.gearSelected}});
        }
      });
      let fightData = {group2: [], group1: []}; // all the data for the fight
      // let monster = this.monster;
      // monster.played = false; // function to create fight form JSON ?
      // monster.action = {};
      // monster.side = 'group2';
      // fightData.group2.push(monster);
      fightData.group2.push(this.getFightFormMonster(this.$route.params.id));
      // fightData.allies.push(this.ownedGearsFormatted.find(gear => gear.tokenId == this.gearSelected));
      // fightData.group1.push(this.getFightFormGear(this.getMyGear(this.gearSelected))); // getFightFormGear deprecated
      fightData.roomLeader = this.gearSelected;
      socket.emit("initFight", fightData);
    },
    isSelected(gearId) {
      return this.gearSelected == gearId;
    },
    selectGear(gearId) {
      if (this.gearSelected == gearId)
        this.gearSelected = -1;
      else
        this.gearSelected = gearId;
    },
    openModal() {
      this.gearSelected = -1;
      this.exampleModalScrollable = true
      if (this.ownedGearsFormatted.length < 1)
        this.fillMyGears(false);
    },
  },
  data() {
    return {
      monster: undefined,
      exampleModalScrollable: false,
      gearSelected: -1,
      socket: {},
    }
  },
  async created() {
    console.log("created");
    await this.fillMyGears(false);
    this.monster = await this.getMonster(this.$route.params.id);
  },
  unmounted() {
    socket.off("connect_error");
    socket.off("roomCreated");
    socket.disconnect();
  },
  destroyed() {
    if (socket.connected) {
      socket.off("connect_error");
      socket.off("roomCreated");
      socket.disconnect();
    }
  },
}
</script>

<style>
.flex-div {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
}
.nft-img {
  margin-right: 20px;
  margin-bottom: 20px;
}
.selectedGear {
  background-color: rgba(0, 0, 255, 0.425);
}
</style>