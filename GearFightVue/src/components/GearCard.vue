<template>
  <MDBCard style="width: 14rem">
    <RouterLink :to="{name: 'gear.show', params:{id: gearId, slug: gear.name}}">
      <MDBCardImg top :src="gear.image" alt="..."/>
      <MDBCardBody>
        <MDBCardTitle>{{gear.name}}</MDBCardTitle>
        <MDBCardText>
          {{gear.description}}
        </MDBCardText>
        <MDBCardText>
          Owner: {{owner}}
        </MDBCardText>
        <!-- <MDBCardText>
          family: {{gear.family}}<br/>
          type: {{gear.type}}<br/>
          level: {{gear.level}}<br/>
          hp: {{gear.hp}}<br/>
          dmg: {{gear.dmg}}<br/>
          dmgType: {{gear.dmgType}}<br/>
          speed: {{gear.speed}}<br/>
          capacities: {{gear.capacities}}<br/>
        </MDBCardText> -->
      </MDBCardBody>
    </RouterLink>
  </MDBCard>
</template>

<script>
import { Network, Alchemy } from "alchemy-sdk"; // /!\ Module "buffer" has been externalized /!\
import { 
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBCardText,
  MDBCardLink,
  MDBCardImg,
  MDBListGroup,
  MDBListGroupItem
} from "mdb-vue-ui-kit";
import { RouterLink } from "vue-router";

export default {
  components: {
    MDBCard,
    MDBCardBody,
    MDBCardTitle,
    MDBCardText,
    MDBCardLink,
    MDBCardImg,
    MDBListGroup,
    MDBListGroupItem,
    RouterLink
  },
  props: {
    gear: {type: Object, require: true},
    gearId: {type: String, require: true},
  },
  data() {
    return {
      owner: ""
    }
  },
  methods: {
    async getNFTOwner() {
      const settings = {
        apiKey: "0FgSTfHIhycqhLzUnravE7m3Dt6rBfGF", // Dont let the key here in the code !!!!
        network: Network.ETH_GOERLI, // Replace the network needed.
      };
      const alchemy = new Alchemy(settings);
      const owner = await alchemy.nft.getOwnersForNft("0xfa3737f6bce5c27e88359c5a44dae7f844b1814d", this.gearId); // externalised this value
      this.owner = owner?.owners[0];
    }
  },
  async created() {
    this.getNFTOwner();
  }
};

</script>

<style>
a {
	text-decoration: none; /* remove underline */
	color: inherit; /* remove blue */
}
</style>