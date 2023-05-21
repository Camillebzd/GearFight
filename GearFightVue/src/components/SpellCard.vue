<template>
  <div v-if="Object.keys(spell).length > 0" class="container-spell">
    <div>{{ spell.name }}</div>
    <div>DMG {{ spell.damage }} | INI {{ spell.initiative }}</div>
    <div v-if="spell.isMagical == true" class="fluxe-info-container"> 
      <div>{{ playerFluxes }}/1</div>
      <div class="fluxe-circle-full"></div>
    </div>
  </div>
</template>

<script>

export default {
  props: {
    spell: {type: Object, required: true},
    playerFluxes: {type: Number, required: true}
  },
};

</script>

<style>
a {
	text-decoration: none; /* remove underline */
	color: inherit; /* remove blue */
}
a:hover {
   color: inherit;
}
.container-spell {
  display: flex;
  flex-direction: column;
  /* justify-content: center; */
  align-items: center;
  height: 100%;
  width: 20%;
  cursor: pointer;
  border-style: solid;
  border-width: 2px;
  border-radius: 5px;
}
.fluxe-info-container {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.fluxe-circle-full {
  margin-left: 5px;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  margin-right: 2px;
  background-color: #d518db;
}
</style>