<template>
  <MDBCard style="width: 14rem; margin-bottom: 1rem;">
    <RouterLink :to="{name: 'monster.show', params:{id: monsterId, slug: monster.Name}}">
      <MDBCardImg top :src="'/img/' + monster.image" alt="..." style="width: 64; height: 64;"/>
      <MDBCardBody>
        <MDBCardTitle>{{monster.Name}}</MDBCardTitle>
        <MDBCardText>
          {{monster.Description}} <br/>
          Level: {{ monster.Level }} <br/>
          Life: {{ monster.Life }} <br/>
          Strenght: {{ monster.Strenght }} <br/>
          Speed: {{ monster.Speed }}
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
  MDBCardLink,
  MDBCardImg,
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
    RouterLink
  },
  props: {
    monster: {type: Object, require: true},
    monsterId: {type: Number, require: true},
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