<template>
  <div class="fight">
    <h1>World</h1>
    <h3>Monsters available</h3>
    <!-- <button v-on:click="clickAction">Add 1</button>
    <p>The button above has been clicked {{ counter }} times.</p> -->
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
import { useMonstersStore } from "@/stores/MonstersStore.js";
import { mapState } from 'pinia';
import { MDBRow, MDBCol, MDBContainer } from "mdb-vue-ui-kit";
// import io from "socket.io-client";

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
  data() {
    return {
      // counter: 0,
      // socket: {}
    }
  },
  methods: {
    // clickAction() {
    //   console.log("click front")
    //   this.socket.emit("click", this.counter);
    // }
  },
  created() {
    this.fill(); // monsters
    // this.socket = io("http://localhost:3222");
    // this.socket.on("counter", data => {
    //   this.counter = data;
    // });
  }
}
</script>