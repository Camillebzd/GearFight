<template>
  <TheNavigation />
  <!-- Customize notification here, lib: https://github.com/kyvg/vue3-notification -->
  <notifications position="top center" :duration="5000"/> 
  <div class="container">
    <router-view></router-view>
  </div>
</template>

<script>
import TheNavigation from '@/components/TheNavigation.vue'

export default{
  components: {
    TheNavigation
  }
}
</script>

<style>
#app {
  font-family: Roboto, Helvetica, Arial, sans-serif;
}
</style>