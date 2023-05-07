<template>
  <div class="info-container" >
    <!-- Entity -->
    <div class="main-entity-container" v-if="Object.keys(entityInfo).length !== 0">
      <div class="stats-entity-container">
        <div>
          <div>{{ entityInfo.name }}</div>
          <div >health: {{ entityInfo.health }}/{{ entityInfo.healthBase }}</div>
          <div>sharpDmg: {{ entityInfo.sharpDmg }}</div>
          <div>bluntDmg: {{ entityInfo.bluntDmg }}</div>
          <div>handling: {{ entityInfo.handling }}</div>
          <div>lethality: {{ entityInfo.lethality }}</div>
          
        </div>
        <div>
          <div>level: {{ entityInfo.level }}</div>
          <div>speed: {{ entityInfo.speed }}</div>
          <div>sharpRes: {{ entityInfo.sharpRes }}</div>
          <div>bluntRes: {{ entityInfo.bluntRes }}</div>
          <div>guard: {{ entityInfo.guard }}</div>
          <div>penRes: {{ entityInfo.penRes }}</div>
        </div>
      </div>
    </div>
    <!-- Spell -->
    <div class="main-entity-container" v-if="Object.keys(spellInfo).length !== 0">
      <div class="top-spell-container">
        <div v-if="spellInfo?.name">{{ spellInfo.name }}</div>
        <!-- <div v-if="spellInfo?.data?.number">Uses left: {{ spellInfo.data.number }}</div> -->
      </div>
      <div v-if="spellInfo?.type">Type: {{ spellInfo.type }}</div>
      <div class="top-spell-container">
        <div v-if="spellInfo?.damage">Damage: {{ spellInfo.damage }}</div>
        <div v-if="spellInfo?.initiative">Initiative: {{ spellInfo.initiative }}</div>        
      </div>
      <!-- BUFF / DEBUFF on spells -->
      <!-- <div v-if="spellInfo.data.buffs.length" class="buffs-container">
        <div>Buffs: </div>
        <div class="badges-container">
          <MDBBadge badge="success" v-for="buff in spellInfo.data.buffs">
            {{ buff.data.displayName }}
          </MDBBadge>
        </div>
      </div>
      <div v-if="spellInfo.data.debuffs.length" class="buffs-container">
        <div>Debuffs: </div>
        <div class="badges-container">
          <MDBBadge badge="danger" v-for="debuff in spellInfo.data.debuffs">
            {{ debuff.data.displayName }}
          </MDBBadge>
        </div>
      </div> -->
    </div>
  </div>
</template>

<script>
import { MDBBadge } from "mdb-vue-ui-kit";

export default {
  components: {
    MDBBadge
  },
  props: {
    entityInfo: {type: Object},
    spellInfo: {type: Object}
  }
}
</script>

<style>
.info-container {
  flex: 1;
  border-style: solid;
  border-width: 2px;
  max-height: 100%;
  padding: 3px;
}
.top-entity-container {
  width: 75%;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  /* background-color: blue; */
  justify-content: space-between;
}
.top-spell-container {
  width: 75%;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  /* background-color: blue; */
  justify-content: space-between;
}
.stats-entity-container {
  width: 90%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.buffs-container {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  align-items: center;
  /* background-color: blue; */
  align-items: center;
}
.badges-container {
  display: flex;
  align-items: center;
}
</style>