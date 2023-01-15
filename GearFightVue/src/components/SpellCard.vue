<template>
  <div v-if="Object.keys(spell).length > 0" class="container-spell" :class="{selectedSpell: selected}">
    <img class="spell-img" :src="'/img/spells/' + spell?.data.image" alt="..." />
    <div class="bottom-right">{{ spell.data.number }}</div>
  </div>
</template>

<script>
import { mapState } from 'pinia';
import { useSpellsStore } from "@/stores/SpellsStore";

export default {
  props: {
    spellName: {type: String, require: true},
    selected: {type: Boolean, require: true}
  },
  data() {
    return {
      spell: {}
    }
  },
  computed: {
    ...mapState(useSpellsStore, ['fillSpells', 'getSpell']), // managed by component up ?
  },
  async created() {
    await this.fillSpells();
    this.spell = this.getSpell(this.spellName);
  }
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
  cursor: pointer;
  border-style: solid;
  border-color: transparent;
  border-width: 5px;
  border-radius: 5px;
  position: relative;
}
.spell-img {
  max-width: 128px;
  max-height: 128px;
}
.selectedSpell {
  border-color: rgba(231, 247, 14, 0.829);
  border-width: 5px;
  border-radius: 5px;
}
.bottom-right {
  text-align: center;
  position: absolute;
  bottom: 8px;
  right: 8px;
  min-width: 20px;
  min-height: 20px;
  background-color: rgb(255, 255, 255);
}
</style>