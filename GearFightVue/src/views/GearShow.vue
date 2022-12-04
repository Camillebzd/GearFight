<template>
  <div>
    <h1>Gear description: {{$route.params.id}}</h1>
  </div>
  <!-- <div v-if="gear">
    <h1>{{gear.name}}</h1>
  </div> -->
</template>

<script>

export default {
  props: {
    id: {type: Number, required: true},
  },
  data() {
    return {
      gear: null,
    }
  },
  computed: {
    gearId() {
        return parseInt(this.$route.params.id);
    },
  },
  methods: {
    async initData() {
      // const response = await fetch(`https://${gearId}`);
      // this.gear = await response.json()
    },
  },
  async created() {
    this.initData();
  },
}
</script>