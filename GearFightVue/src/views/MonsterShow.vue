<template>
  <div>
    <h1>{{monster.name}}</h1>
    <div class="flex-div">
      <img :src="'/img/' + monster.image" alt="..." style="width: 64; height: 64;" class="img-fluid shadow-2-strong nft-img" />
      <div>
        <MDBBadge :badge="getBadgeColor" style="margin-bottom: 1rem;">{{ monster.Rarity }}</MDBBadge>
        <p>Level: {{monster.Level}}</p>
        <p>Attack: {{monster.Attack}}</p>
        <p>Defense: {{monster.Defense}}</p>
        <p>Life: {{monster.Life}}</p>
        <p>Speed: {{monster.Speed}}</p>
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
          <MDBBtn color="primary" :disabled="gearSelected < 0" > Use this weapon </MDBBtn>
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
    ...mapState(useMonstersStore, ['monsters', 'fill']),
    ...mapState(useUserStore, ['isConnected']),
    ...mapState(useGearsStore, ['ownedGears', 'getMyGears']),
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
        this.getMyGears();
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
    }
  },
  created() {
    this.fill();
    this.getMyGears();
  }
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