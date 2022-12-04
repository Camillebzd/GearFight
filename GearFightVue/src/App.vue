<template>
  <TheNavigation @updateAccountAddress="updateAccountAddress"/>
  <!-- Customize notification here, lib: https://github.com/kyvg/vue3-notification -->
  <notifications position="top center" :duration="5000"/> 
  <div class="container">    
    <router-view v-slot="{Component}" :accountAddress="accountAddress">
      <Transition name="fade" mode="out-in">
        <component :is="Component" :key="$route.path" ></component>
      </Transition>
    </router-view>
  </div>
</template>

<script>
import TheNavigation from '@/components/TheNavigation.vue'

export default{
  components: {
    TheNavigation
  },
  data() {
    return {
      accountAddress: "",
    }
  },
  methods: {
    updateAccountAddress(accountAddress) {
      this.accountAddress = accountAddress;
    }
  },
}
</script>

<style>
#app {
  font-family: Roboto, Helvetica, Arial, sans-serif;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>