<template>
  <div class="entity-container">
    <i v-if="isSelectable == true" class="arrow down moove-up-down"></i>
    <div class="image-container" >
      <img :src="image" alt="..." class="img-fluid shadow-2-strong image-entity" />
    </div>
    <div class="health-container">
      <div style="margin-right: 7px">HP: </div>
      <progress max="100" value="100" style="background-color:green"></progress>
    </div>
  </div>
</template>

<script>

export default {    
  components: {
  },
  props: {
    image: { type: String, required: true},
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
.image-container {
  padding-top: 30px;
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
.health-container {
  /* background-color: red; */
  /* align-items: center; */
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  align-items: center;
  margin-top: 10px;
}
.health-bar {
  
  color: green;
}
</style>