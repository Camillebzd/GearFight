<template>
  <div>
    <h1>Monster</h1>
  </div>
</template>

<script>
import { Network, Alchemy, Wallet, Utils } from "alchemy-sdk"; // /!\ Module "buffer" has been externalized /!\
import { MDBBtn } from "mdb-vue-ui-kit";
const PRIVATE_KEY = import.meta.env.VITE_ALCHEMY_API_KEY;

export default {
  components: {
    MDBBtn,
  },
}
</script>

<style>

</style>