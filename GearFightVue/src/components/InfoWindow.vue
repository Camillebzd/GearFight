<template>
  <div class="info-container" >
    <!-- Entity -->
    <div class="main-entity-container" v-if="Object.keys(entityInfo).length !== 0">
      <div class="stats-entity-container">
        <div>
          <!-- <div>{{ entityInfo.name }}</div> -->
          <div >health: {{ entityInfo.stats.health }}/{{ entityInfo.stats.healthMax }}</div>
          <div>sharpDmg: {{ entityInfo.stats.sharpDmg }}</div>
          <div>bluntDmg: {{ entityInfo.stats.bluntDmg }}</div>
          <div>burnDmg: {{ entityInfo.stats.burnDmg }}</div>
          <div>handling: {{ entityInfo.stats.handling }}</div>
          <div>lethality: {{ entityInfo.stats.lethality }}</div>
          
        </div>
        <div>
          <div>speed: {{ entityInfo.stats.speed }}</div>
          <div>sharpRes: {{ entityInfo.stats.sharpRes }}</div>
          <div>bluntRes: {{ entityInfo.stats.bluntRes }}</div>
          <div>burnRes: {{ entityInfo.stats.burnRes }}</div>
          <div>Pierce: {{ entityInfo.stats.pierce }}</div>
          <div>guard: {{ entityInfo.stats.guard }}</div>
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