<template>
  <MDBNavbar light bg="light" expand="lg" container>
    <MDBNavbarBrand href="https://gearfighttest.netlify.app/"> <!-- Change in prod to reflect the site -->
      <!-- <img
        src="@/assets/sword_and_shield_icon.png"
        height="30"
        alt=""
        loading="lazy"
      /> -->
      GearFight
    </MDBNavbarBrand>
    <MDBNavbarToggler target="navbarNav"></MDBNavbarToggler>
    <MDBNavbarNav collapse="navbarNav">
      <MDBNavbarItem to="/" :active="checkActive('/')"> Home </MDBNavbarItem>
      <MDBNavbarItem to="/world" :active="checkActive('/world')"> World </MDBNavbarItem>
      <MDBNavbarItem to="/personnalarmory" :active="checkActive('/personnalarmory')"> Personnal Armory </MDBNavbarItem>
      <!-- <MDBNavbarItem to="/market" :active="checkActive('/market')"> Market </MDBNavbarItem> -->
      <MDBNavbarItem to="/about" :active="checkActive('/about')"> About </MDBNavbarItem>
    </MDBNavbarNav>
    <form class="d-flex input-group w-auto">
      <input
        type="search"
        class="form-control"
        placeholder="Type query"
        aria-label="Search"
      />
      <MDBBtn outline="primary" @click="researchPop"> Search </MDBBtn>
    </form>
    <TheMetamaskConnectionButton />
  </MDBNavbar>
</template>

<script>
import {
  MDBNavbar,
  MDBNavbarToggler,
  MDBNavbarBrand,
  MDBNavbarNav,
  MDBNavbarItem,
  MDBBtn,
} from 'mdb-vue-ui-kit';
import TheMetamaskConnectionButton from './TheMetamaskConnectionButton.vue'

export default {
  components: {
    MDBNavbar,
    MDBNavbarToggler,
    MDBNavbarBrand,
    MDBNavbarNav,
    MDBNavbarItem,
    MDBBtn,
    TheMetamaskConnectionButton,
  },
  methods: {
    checkActive(toCheck) {
      return toCheck === this.$router.currentRoute.value.path;
    },
    // Working on the search system
    researchPop() {
      this.$notify({
        type: "error",
        title: "Not working!",
        text: "Sorry but the search system ins't working for the moment.",
      });
    },
  }
};
</script>

<style>
#researchPop-active-classes{
  color:red
}
</style>