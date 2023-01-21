<template>
  <div class="chat-container">
    <div v-for="ligne in lignes" class="log" ref="items">
      {{ ligne }}
    </div>
  </div>
</template>

<script>

export default {
  components: {
  },
  props: {
    lignes: Array,
  },
  data() {
    return {
      
    }
  },
  methods: {
    scrollToElement() {
      if (this.$refs.items === undefined)
        return;
      const el = this.$refs.items[this.$refs.items.length - 1];

      if (el) {
        // Use el.scrollIntoView({behavior: 'smooth'}) to smoothly scroll to the element
        el.scrollIntoView();
      }
    }
  },
  mounted() {
    this.scrollToElement();
  },
  updated() {
    this.scrollToElement();
  }
}
</script>

<style>
.chat-container{
  flex: 1;
  overflow-y: scroll;
  overscroll-behavior-y: contain;
  scroll-snap-type: y proximity;
  border-style: solid;
  border-width: 2px;
  max-height: 100%;
}
/* .chat-container > div:last-child {
  scroll-snap-align: end;
} */

/* width */
::-webkit-scrollbar {
  width: 10px;
}

/* Track */
::-webkit-scrollbar-track {
  background: #f1f1f1;
  z-index: 2;

}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #888;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #555;
}
.log{
  font-size: 14px;
}
</style>