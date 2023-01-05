<template>
  <MDBCard style="width: 14rem; margin-bottom: 1rem;">
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
  MDBCardImg
} from "mdb-vue-ui-kit";
import { RouterLink } from "vue-router";
const API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY_MATIC;
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

export default {
  components: {
    MDBCard,
    MDBCardBody,
    MDBCardTitle,
    MDBCardText,
    MDBCardImg,
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
          apiKey: API_KEY,
          network: Network.MATIC_MUMBAI,
      };
      const alchemy = new Alchemy(settings);
      const owner = await alchemy.nft.getOwnersForNft(CONTRACT_ADDRESS, this.gearId); // externalised this value
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
a:hover {
   color: inherit;
}
</style>