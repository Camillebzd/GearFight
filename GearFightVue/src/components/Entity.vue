<template>
  <div class="entity-container">
    <!-- <i v-if="isSelectable == true" class="arrow down moove-up-down"></i> -->
    <div class="name-container">
      <div>{{ entity.name }}</div>
      <div>LVL.{{ entity.level }}</div>
    </div>
    <div class="health-container">
      <div style="margin-right: 7px">Life: </div>
      <progress :max="entity.life_base" :value="entity.life" style="background-color:green; margin-right: 5px;"></progress>
      <div style="width: 40px">{{ entity.life * 100 / entity.life_base }}%</div>
    </div>
    <!-- <div class="buff-container">
      <div v-for="buff in entity.buffs">
        {{ buff.name }}
      </div>
    </div>
    <div class="debuff-container">
      <div v-for="debuff in entity.debuffs">
        {{ debuff.name }}
      </div>
    </div> -->
    <div class="image-container" >
      <img :src="image" alt="..." class="img-fluid image-entity" />
    </div>
  </div>
</template>

<script>

export default {    
  components: {
  },
  props: {
    image: { type: String, required: true},
    entity: { type: Object, required: true},
    isSelectable: {type: Boolean}
  },
}
</script>

<style>
.entity-container {
  cursor: pointer;
  /* background-color: red; */
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  align-items: center;
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
.image-entity {  
  max-width: 256px;
  max-height: 256px;
}
.name-container {
  /* background-color: red; */
  /* align-items: center; */
  width: 100%;
  justify-content: space-between;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  align-items: center;
  /* margin-top: 10px; */
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
  margin-bottom: 10px;
}
.health-bar {
  color: green;
}
</style>