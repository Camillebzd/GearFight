<template>
  <div>
    <h1>{{monster.name}}</h1>
    <div class="flex-div">
      <img :src="'/img/monsters/' + monster.image" alt="..." style="width: 64; height: 64;" class="img-fluid shadow-2-strong nft-img" />
      <div>
        <MDBBadge :badge="getBadgeColor" style="margin-bottom: 1rem;">{{ monster.Rarity }}</MDBBadge>
        <p>Level: {{monster.level}}</p>
        <p>Attack: {{monster.attack}}</p>
        <p>Defense: {{monster.defense}}</p>
        <p>Life: {{monster.life}}</p>
        <p>Speed: {{monster.speed}}</p>
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
          <MDBContainer v-if="ownedGears.length > 0">
            <MDBRow>
              <MDBCol auto v-for="gear in ownedGears" :key="gear.tokenId">
                  <GearCardHorizontal 
                    :gear="getGearInfo(gear.rawMetadata)" :gearId="gear.tokenId" @click="selectGear(gear.tokenId)" style="cursor: pointer" 
                    :class="{selectedGear: isSelected(gear.tokenId)}"
                  />
              </MDBCol>
            </MDBRow>
          </MDBContainer>
        </MDBModalBody>
        <MDBModalFooter>
          <MDBBtn color="secondary" @click="exampleModalScrollable = false"> Close </MDBBtn>
          <MDBBtn color="primary" :disabled="gearSelected < 0" @click="launchFight" > Use this weapon </MDBBtn>
        </MDBModalFooter>
      </MDBModal>
    </div>
    <div v-else>
      <p>Connect to your account to fight this monster.</p>
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
    ...mapState(useMonstersStore, ['monsters', 'fill', 'getFightFormMonster']),
    ...mapState(useUserStore, ['isConnected']),
    ...mapState(useGearsStore, ['ownedGears', 'fillMyGears', 'getFightFormGear']),
    monster() {
      return this.monsters[this.$route.params.id];
    },
    getBadgeColor() {
      if (this.monster.Rarity === "NORMAL")
        return "secondary";
      else if (this.monster.Rarity === "ELITE")
        return "warning";
      else
        return "danger";
    }
  },
  methods: {
    async launchFight() {
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
      // fightData.allies.push(this.ownedGears.find(gear => gear.tokenId == this.gearSelected));
      fightData.group1.push(this.getFightFormGear(this.gearSelected));
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
      if (this.ownedGears.length < 1)
        this.fillMyGears();
    },
    getGearInfo(gear) {
      return {
        name: gear.name,
        description: gear.description,
        image: gear.image,
        family: this.getGearAttributeInfo(gear.attributes, "Family"),
        type: this.getGearAttributeInfo(gear.attributes, "Type"),
        level: this.getGearAttributeInfo(gear.attributes, "Level"),
        hp: this.getGearAttributeInfo(gear.attributes, "Health Point"),
        dmg: this.getGearAttributeInfo(gear.attributes, "Damage Point"),
        dmgType: this.getGearAttributeInfo(gear.attributes, "Damage Type"),
        speed: this.getGearAttributeInfo(gear.attributes, "Speed"),
        capacities: this.getGearAttributeInfo(gear.attributes, "Capacities"), // handle this
      };
    },
    getGearAttributeInfo(attributes, trait_type) {
      for (let i = 0; i < attributes.length; i++) {
        if (attributes[i].trait_type === trait_type)
          return attributes[i].value;
      }
      return "";
    }
  },
  data() {
    return {
      exampleModalScrollable: false,
      gearSelected: -1,
      socket: {},
    }
  },
  async created() {
    console.log("created");
    this.fill();
    await this.fillMyGears();
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