<template>
  <MDBCard class="mb-3" style="max-width: 540px">
    <MDBRow class="g-0">
      <MDBCol md="4">
        <MDBCardImg top :src="gear.image" alt="..."/>
      </MDBCol>
      <MDBCol md="8">
        <MDBCardBody>
          <MDBCardTitle>{{gear.name}}</MDBCardTitle>
          <MDBCardText>
            {{ gear.description }}
          </MDBCardText>
        </MDBCardBody>
      </MDBCol>
    </MDBRow>
  </MDBCard>
</template>

<script>
import { 
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBCardText,
  MDBCardImg,
  MDBRow,
  MDBCol
} from "mdb-vue-ui-kit";

export default {
  components: {
    MDBCard,
    MDBCardBody,
    MDBCardTitle,
    MDBCardText,
    MDBCardImg,
    MDBRow,
    MDBCol
  },
  props: {
    gear: {type: Object, require: true},
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
</style>