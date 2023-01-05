<template>
  <div class="fight">
    <h1>World</h1>
    <h3>Monsters available</h3>
    <div v-if="monsters.length">
      <MDBContainer>
        <MDBRow>
          <MDBCol auto v-for="monster in monsters" :key="monster.id">
            <MonsterCard :monster="monster" :monsterId="monster.id" />
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </div>
    <div v-else>
      <p>No monsters available for the moments...</p>
    </div>
  </div>
</template>

<script>
import MonsterCard from "@/components/MonsterCard.vue";
// import Monsters from "@/data/monsters.json";
import { useMonstersStore } from "@/stores/MonstersStore.js";
import { mapState } from 'pinia';
import { MDBRow, MDBCol, MDBContainer } from "mdb-vue-ui-kit";

export default {
  components: {
    MonsterCard,
    MDBRow,
    MDBCol,
    MDBContainer
  },
  computed: {
    ...mapState(useMonstersStore, ['monsters', 'fill']),

  },
  async created() {
    this.fill();
  }
}
</script>