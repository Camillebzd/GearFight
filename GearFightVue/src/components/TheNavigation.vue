<template>
  <MDBNavbar light bg="light" expand="lg" container>
    <MDBNavbarBrand>
      <img
        src="@/assets/sword_and_shield_icon.png"
        height="30"
        alt=""
        loading="lazy"
      />
    </MDBNavbarBrand>
    <MDBNavbarToggler target="navbarNav"></MDBNavbarToggler>
    <MDBNavbarNav collapse="navbarNav">
      <MDBNavbarItem to="/" :active="checkActive('/')"> Home </MDBNavbarItem>
      <MDBNavbarItem to="/personnalarmory" :active="checkActive('/personnalarmory')"> Personnal Armory </MDBNavbarItem>
      <MDBNavbarItem to="/about" :active="checkActive('/about')"> About </MDBNavbarItem>
    </MDBNavbarNav>
    <form class="d-flex input-group w-auto">
      <input
        type="search"
        class="form-control"
        placeholder="Type query"
        aria-label="Search"
      />
      <MDBBtn outline="primary" @click="test"> Search </MDBBtn>
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
    test() {
      this.$notify({
        type: "error",
        title: "Connection failed",
        text: "🦊 You must install Metamask, a virtual Ethereum wallet, in your browser.",
      });
    }
  }
};
</script>

<style>
#test-active-classes{
  color:red
}
</style>