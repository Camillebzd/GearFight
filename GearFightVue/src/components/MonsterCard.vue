<template>
  <MDBCard style="width: 14rem; margin-bottom: 1rem;">
    <RouterLink :to="{name: 'monster.show', params:{id: monsterId, slug: monster.name}}">
      <MDBCardImg top :src="'/img/monsters/' + monster.image" alt="..." style="width: 64; height: 64;"/>
      <MDBCardBody>
        <MDBCardTitle>{{monster.name}}</MDBCardTitle>
        <MDBCardText>
          Difficulty: <MDBBadge :badge="getBadgeColor">{{ getDifficultyName }}</MDBBadge>
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
      if (this.monster.difficulty === 1)
        return "secondary";
      else if (this.monster.difficulty === 2)
        return "warning";
      else
        return "danger";
    },
    getDifficultyName() {
      if (this.monster.difficulty === 1)
        return "easy";
      else if (this.monster.difficulty === 2)
        return "normal";
      else
        return "hard";
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