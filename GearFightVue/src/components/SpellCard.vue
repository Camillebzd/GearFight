<template>
  <div v-if="Object.keys(spell).length > 0" class="container-spell">
    <div>{{ spell.data.displayName }}</div>
    <div>{{ spell.data.number }}</div>
  </div>
</template>

<script>

export default {
  props: {
    spell: {type: Object, required: true},
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
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 20%;
  cursor: pointer;
  border-style: solid;
  /* border-color: green; */
  border-width: 2px;
  border-radius: 5px;

}
.spell-img {
  max-width: 128px;
  max-height: 128px;
}
</style>