<template>
  <div class="entity-container">
    <div v-if="!modifiersOnRight" class="modifiers-container" style="margin-right: 10px">
      <div v-for="buff in entity.buffs" class="modifier-container">
        <div style="margin-right;: 5px">{{ buff.turns }}</div>
        <MDBBadge badge="success"  style="height: fit-content;">
          <!-- {{ buff.data.displayName }} -->
          {{ buff.name }} {{ buff.stack }}
        </MDBBadge>
      </div>
      <div v-for="debuff in entity.debuffs" class="modifier-container">
        <div style="margin-right: 5px">{{ debuff.turns }}</div>
        <MDBBadge badge="danger"  style="height: fit-content;">
          <!-- {{ debuff.data.displayName }} -->
          {{ debuff.name }} {{ debuff.stack }}
        </MDBBadge>
      </div>
    </div>
    <!-- <MDBTooltip tag="div" v-model="tooltip1">
      <template #reference> -->
        <div class="main-info-container" >
          <!-- <i v-if="isSelectable == true" class="arrow down moove-up-down"></i> -->
          <div class="top-container">
            <div class="name-container">
              <div>{{ entity.name }}</div>
              <div>LVL.{{ entity.level }}</div>
            </div>
            <div class="health-container">
              <div style="margin-right: 7px">Health: </div>
              <progress :max="entity.healthBase" :value="entity.health" style="background-color:green; margin-right: 5px;"></progress>
              <div style="width: 40px">{{ Math.round(entity.health * 100 / entity.healthBase) }}%</div>
            </div>
            <div class="fluxes-container">
              <div style="margin-right: 7px">Fluxes: </div>
              <div class="fluxes-circles-container">
                <div class="fluxe-circle fluxe-full" v-for="n in entity.fluxes"></div>
                <div class="fluxe-circle fluxe-empty" v-for="n in 6 - entity.fluxes"></div>
              </div>
            </div>
          </div>
          <div class="image-container" >
            <img :src="image" alt="..." class="img-fluid image-entity" />
          </div>
        </div>
      <!-- </template> -->
      <!-- <template #tip>
        Hi! I'm tooltip
      </template> -->
    <!-- </MDBTooltip> -->
    <div v-if="modifiersOnRight" class="modifiers-container" style="margin-left: 10px">
      <div v-for="buff in entity.buffs" class="modifier-container">
        <MDBBadge badge="success"  style="height: fit-content;">
          {{ buff.name }}  {{ buff.stack }}
        </MDBBadge>
        <div style="margin-left: 5px">{{ buff.turns }}</div>
      </div>
      <div v-for="debuff in entity.debuffs" class="modifier-container">
        <MDBBadge badge="danger"  style="height: fit-content;">
          {{ debuff.name }}  {{ debuff.stack }}
        </MDBBadge>
        <div style="margin-left: 5px">{{ debuff.turns }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { MDBBadge, MDBTooltip } from "mdb-vue-ui-kit";

export default {
  components: {
    MDBBadge,
    MDBTooltip
  },
  props: {
    image: { type: String, required: true},
    entity: { type: Object, required: true},
    // isSelectable: {type: Boolean}
    modifiersOnRight: {type: Boolean}
  },
  data() {
    return {
      tooltip1: false,
    }
  }
}
</script>

<style>
.entity-container {
  cursor: pointer;
  /* background-color: red; */
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
}
.arrow {
  position: absolute;
  border: solid black;
  border-width: 0 3px 3px 0;
  display: inline-block;
  padding: 8px;
}
.down {
  transform: rotate(45deg);
  /* -webkit-transform: rotate(45deg); */
}
.moove-up-down {
  animation: MoveUpDown 1s linear infinite;
}
@keyframes MoveUpDown {
  0%, 100% {
    transform: translateY(0) rotate(45deg);
  }
  50% {
    transform: translateY(-10px) rotate(45deg);
  }
}
.modifiers-container {
  margin-top: 75px;
  height: fit-content;
  /* margin-left: 10px; */
  /* margin-right: 5px; */
  /* background-color: red; */
  display: flex;
  flex-direction: column;
}
.modifier-container {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.buff-container {
  min-height: 1.65em;
}
.main-info-container {
  display: flex;
  flex-direction: column;
}
.image-entity {  
  max-width: 256px;
  max-height: 256px;
}
.name-container {
  /* background-color: blue; */
  /* align-items: center; */
  width: 100%;
  justify-content: space-between;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  align-items: center;
  padding: 5px;
}
.main-container {
  display: flex;
  flex-direction: row;
}
.health-container {
  /* background-color: red; */
  width: 100%;
  /* align-items: center; */
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  align-items: center;
  justify-content: end;
  padding: 5px;
}
.health-bar {
  color: green;
}
.fluxes-container {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 5px;
}
.fluxes-circles-container {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  /* background-color: red; */
  justify-content: space-around;
  /* align-items: center; */

}
.fluxe-circle {
  border-radius: 50%;
  width: 20px;
  height: 20px;
  margin-right: 2px;
}
.fluxe-full {
  background-color: #d518db;
}
.fluxe-empty {
  background-color: #525252;
}
.top-container {
  border-style: solid;
  /* border-color: green; */
  border-width: 2px;
  border-radius: 5px;
  margin-bottom: 5px;
}
</style>