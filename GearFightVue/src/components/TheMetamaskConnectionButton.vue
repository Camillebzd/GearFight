<template>
  <div class="metamask-container">
    <MDBBtn outline="primary" v-if="!isConnected" v-on:click="connectToMetamask">Connect Wallet</MDBBtn>
    <MDBBtn outline="primary" v-else v-on:click="connectToMetamask">Connected: {{smallAddress}} </MDBBtn>
  </div>
</template>

<script>
import { MDBBtn } from "mdb-vue-ui-kit";
import { mapState, mapWritableState } from 'pinia';
import { useUserStore } from "@/stores/UserStore.js";

export default {
  components: {
    MDBBtn
  },
  computed: {
    ...mapState(useUserStore, ['isConnected', 'smallAddress']),
    ...mapWritableState(useUserStore, ['walletAddress']),
  },
  methods: {
    async connectToMetamask() {
      console.log('start connection');
      if (window.ethereum) {
        try {
          const addressArray = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
        } catch (err) {
          this.$notify({
            type: "error",
            title: "Connection failed",
            text: "😥 " + err.message,
          });
        }
        try {
          await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x13881' }],
          });
          console.log("switch request done.");
        } catch (switchError) {
          // This error code indicates that the chain has not been added to MetaMask.
          if (switchError.code === 4902) {
            this.$notify({
              type: "error",
              title: "Missing the good network",
              text: "⚠️ You don't have the Mumbai network. Please add it and connect to it.",
            });
          }
          // handle other "switch" errors
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
      this.walletAddress = accounts[0];
    }
    window.ethereum.on("accountsChanged", accounts => {
      if (accounts.length > 0) {
        console.log(`Account connected: ${accounts[0]}`); 
        this.walletAddress = accounts[0];
        this.$notify({
          type: "success",
          title: "Connected",
          text: "MetaMask is connected! Here is your address: " + accounts[0],
        });
      }
      else {
        console.log("Account disconnected");
        this.walletAddress = "";
        this.$notify({
          type: "error",
          title: "Disconnected",
          text: "😥 Your wallet is disconnected.",
        });
      }
    });
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