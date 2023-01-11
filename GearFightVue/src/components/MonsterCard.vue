<template>
  <MDBCard style="width: 14rem; margin-bottom: 1rem;">
    <RouterLink :to="{name: 'monster.show', params:{id: monsterId, slug: monster.name}}">
      <MDBCardImg top :src="'/img/' + monster.image" alt="..." style="width: 64; height: 64;"/>
      <MDBCardBody>
        <MDBCardTitle>{{monster.name}}</MDBCardTitle>
        <MDBCardText>
          {{monster.description}} <br/>
          Level: {{ monster.Level }}
          <MDBBadge :badge="getBadgeColor">{{ monster.Rarity }}</MDBBadge>
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
  MDBBadge 
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
    RouterLink,
    MDBBadge 
  },
  props: {
    monster: {type: Object, require: true},
    monsterId: {type: Number, require: true},
  },
  computed: {
    getBadgeColor() {
      if (this.monster.Rarity === "NORMAL")
        return "secondary";
      else if (this.monster.Rarity === "ELITE")
        return "warning";
      else
        return "danger";

    }
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