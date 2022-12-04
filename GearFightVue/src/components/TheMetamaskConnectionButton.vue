<template>
  <div class="metamask-container">
    <MDBBtn outline="primary" v-if="(isConnected === false)" v-on:click="connectToMetamask">Connect Wallet</MDBBtn>
    <MDBBtn outline="primary" v-else v-on:click="">Connected: {{smallAccountAddress}} </MDBBtn>
  </div>
</template>

<script>
import { MDBBtn } from "mdb-vue-ui-kit";

export default {
  components: {
    MDBBtn
  },
  emits: ['updateAccountAddress'],
  data() {
    return {
      isConnected: false,
      accountAddress: "",
    }
  },
  computed: {
    smallAccountAddress() {
      return this.accountAddress.substring(0, 6) + "..." + this.accountAddress.substring(38)
    }
  },
  methods: {
    async connectToMetamask() {
      console.log('start connection');
      if (window.ethereum) {
        try {
          const addressArray = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          this.accountAddress = addressArray[0];
          this.isConnected = true;
          this.$notify({
            type: "success",
            title: "Connected",
            text: "MetaMask is connected! Here is your address: " + addressArray[0],
          });
          this.$emit('updateAccountAddress', addressArray[0]);
        } catch (err) {
          this.$notify({
            type: "error",
            title: "Connection failed",
            text: "😥 " + err.message,
          });
        }
      } else {
        this.$notify({
            type: "error",
            title: "Connection failed",
            text: "🦊 You must install Metamask, a virtual Ethereum wallet, in your browser.",
          });
      }
    },
  },
  async created() {
    const accounts = await ethereum.request({method: 'eth_accounts'});       
    if (accounts.length) {
      this.accountAddress = accounts[0];
      this.isConnected = true;
      this.$emit('updateAccountAddress', accounts[0]);
    }
  }
};
</script>

<style>
.metamask-container {
    /* background-color: red; */
    padding-left: 24px;
    padding-right: 12px;
}
</style>