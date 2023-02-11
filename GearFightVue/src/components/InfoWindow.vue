<template>
  <div class="info-container" >
    <div class="main-entity-container" v-if="Object.keys(entityInfo).length !== 0">
      <div class="top-entity-container">
        <div v-if="entityInfo?.name">{{ entityInfo.name }}</div>
        <div v-if="entityInfo?.level">level: {{ entityInfo.level }}</div>
      </div>
      <div class="stats-entity-container">
        <div v-if="entityInfo?.life">
          <div >life: {{ entityInfo.life }}/{{ entityInfo.life_base }}</div>
        </div>
        <div v-if="entityInfo?.attack">attack: {{ entityInfo.attack }}</div>
        <div v-if="entityInfo?.defense">defense: {{ entityInfo.defense }}</div>
        <div v-if="entityInfo?.speed">speed: {{ entityInfo.speed }}</div>
      </div>
    </div>
    <div class="main-entity-container" v-if="Object.keys(spellInfo).length !== 0">
      <div class="top-spell-container">
        <div v-if="spellInfo?.data?.displayName">{{ spellInfo.data.displayName }}</div>
        <div v-if="spellInfo?.data?.number">Uses left: {{ spellInfo.data.number }}</div>
      </div>
      <div v-if="spellInfo?.data?.displayName">Type: {{ spellInfo.data.type }}</div>
      <div class="top-spell-container">
        <div v-if="spellInfo?.data?.ratioStat">Stat: {{ spellInfo.data.ratioStat }}</div>
        <div>Ratio: {{ spellInfo.data.ratio }}</div>
      </div>
      <div v-if="spellInfo.data.buffs.length" class="buffs-container">
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
      </div>
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