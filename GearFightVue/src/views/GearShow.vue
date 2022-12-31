<template>
  <div>
    <div v-if="gear == null">
      <h1>Loading...</h1>
      <p>We are loading the gear, if this take to much time it may be because a problem has happend.</p>
    </div>
    <div v-else>
      <h1>{{getGearInfo(gear.rawMetadata)?.name}}</h1>
      <div class="flex-div">
        <img :src="getGearInfo(gear.rawMetadata)?.image" class="img-fluid shadow-2-strong nft-img" />
        <div>
          <p>Description: {{getGearInfo(gear.rawMetadata)?.description}}</p>
          <p>Level: {{getGearInfo(gear.rawMetadata)?.level}}</p>
          <p>Family: {{getGearInfo(gear.rawMetadata)?.family}}</p>
          <p>Type: {{getGearInfo(gear.rawMetadata)?.type}}</p>
          <p>Damage Type: {{getGearInfo(gear.rawMetadata)?.dmgType}}</p>
          <p>Capacities: {{getGearInfo(gear.rawMetadata)?.capacities}}</p>
        </div>
      </div>
      <div class="row text-center stats">
        <div class="col-lg-3 col-md-6 mb-5 mb-md-5 mb-lg-0 position-relative">
          <i class="fas fa-crosshairs fa-3x text-primary mb-4"></i>
          <h5 class="text-primary fw-bold mb-3">{{getGearInfo(gear.rawMetadata)?.dmg}}</h5>
          <h6 class="fw-normal mb-0">Damage</h6>
          <div class="vr vr-blurry position-absolute my-0 h-100 d-none d-md-block top-0 end-0"></div>
        </div>
  
        <div class="col-lg-3 col-md-6 mb-5 mb-md-5 mb-lg-0 position-relative">
          <i class="fas fa-heart fa-3x text-primary mb-4"></i>
          <h5 class="text-primary fw-bold mb-3">{{getGearInfo(gear.rawMetadata)?.hp}}</h5>
          <h6 class="fw-normal mb-0">HP</h6>
          <div class="vr vr-blurry position-absolute my-0 h-100 d-none d-md-block top-0 end-0"></div>
        </div>
  
        <div class="col-lg-3 col-md-6 mb-5 mb-md-0 position-relative">
          <i class="fas fa-angle-double-right fa-3x text-primary mb-4"></i>
          <h5 class="text-primary fw-bold mb-3">{{getGearInfo(gear.rawMetadata)?.speed}}</h5>
          <h6 class="fw-normal mb-0">speed</h6>
        </div>
      </div>
      <div class="owner">
        <p>Owners: {{gearOwners.owners}}</p>
        <MDBBtn outline="primary" @click="transfereTest">Test transfere</MDBBtn>
      </div>
    </div>
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
  data() {
    return {
      gear: null,
      gearOwners: "Unknown", // maybe later there could be more than one owner
      accountAddress: "",
    }
  },
  methods: {
    async transfereTest() {
      if (this.accountAddress == undefined || this.accountAddress?.length < 1) {
        // notification
        return;
      }
      console.log("start transfere");
      const settings = {
        apiKey: PRIVATE_KEY,
        network: Network.ETH_GOERLI, // Replace the network needed.
      };
      const alchemy = new Alchemy(settings);
      const wallet = new Wallet(PRIVATE_KEY);
      
      const transaction = {
        to: "0x0863a707dbfdcec01ee55a92aa77c38d9f3645e5",
        value: Utils.parseEther("0.001"),
        gasLimit: "21000",
        maxPriorityFeePerGas: Utils.parseUnits("5", "gwei"),
        maxFeePerGas: Utils.parseUnits("20", "gwei"),
        nonce: await alchemy.core.getTransactionCount(wallet.getAddress()),
      };
      

      const rawTransaction = await wallet.signTransaction(transaction);
      // const response = await alchemy.transact.sendTransaction(rawTransaction);
      console.log(response);
    },
    async getNFTInfo() {
      const settings = {
        apiKey: PRIVATE_KEY,
        network: Network.ETH_GOERLI, // Replace the network needed.
      };
      const alchemy = new Alchemy(settings);
      this.gear = await alchemy.nft.getNftMetadata("0xfa3737f6bce5c27e88359c5a44dae7f844b1814d", this.$route.params.id); // externalised this value
      console.log(this.gear);
      this.gearOwners = await alchemy.nft.getOwnersForNft("0xfa3737f6bce5c27e88359c5a44dae7f844b1814d", this.$route.params.id);
      // console.log()
    },
    getGearInfo(gear) { // mettre dans un utils.js ?
      return {
        name: gear.name,
        description: gear.description,
        image: gear.image,
        family: this.getGearAttributeInfo(gear.attributes, "Family"),
        type: this.getGearAttributeInfo(gear.attributes, "Type"),
        level: this.getGearAttributeInfo(gear.attributes, "Level"),
        hp: this.getGearAttributeInfo(gear.attributes, "Health Point"),
        dmg: this.getGearAttributeInfo(gear.attributes, "Damage Point"),
        dmgType: this.getGearAttributeInfo(gear.attributes, "Damage Type"),
        speed: this.getGearAttributeInfo(gear.attributes, "Speed"),
        capacities: this.getGearAttributeInfo(gear.attributes, "Capacities"), // handle this
      };
    },
    getGearAttributeInfo(attributes, trait_type) {
      for (let i = 0; i < attributes.length; i++) {
        if (attributes[i].trait_type === trait_type)
          return attributes[i].value;
      }
      return "";
    }
  },
  async created() {
    this.accountAddress = this.$attrs.accountAddress;
    this.getNFTInfo();
  },
  watch: {
    '$attrs.accountAddress': function(newVal, oldVal) {
      this.accountAddress = newVal;
      this.getNFTInfo();
    },
  }
}
</script>

<style>

.stats {
  /* background-color: red; */
  justify-content: center;
}
.flex-div {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
}
.nft-img {
  height: 256px;
  width: 256px;
  margin-right: 20px;
  margin-bottom: 20px;
}
.owner {
  margin-top: 40px;
}
</style>