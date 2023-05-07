<template>
  <MDBCard style="width: 14rem; margin-bottom: 1rem;">
    <RouterLink :to="{name: 'gear.show', params:{storeType: storeType, id: gear.id, slug: gear.name}}">
      <!-- <MDBCardImg top :src="'/img/basic_mace_512.png'" alt="..."/> -->
      <MDBCardImg top :src="gear.image" alt="..."/>
      <MDBCardBody>
        <MDBCardTitle>{{gear.name}}</MDBCardTitle>
        <MDBCardText class="card-title">
          level: {{ gear.level }}
        </MDBCardText>
      </MDBCardBody>
    </RouterLink>
  </MDBCard>
</template>

<script>
import { 
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBCardText,
  MDBCardImg
} from "mdb-vue-ui-kit";
import { RouterLink } from "vue-router";

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
    storeType: {type: String, require: true}
  },
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
.card-title {
  font-size: medium;
}
</style>