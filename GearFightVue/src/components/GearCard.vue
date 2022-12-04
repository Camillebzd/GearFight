<template>
  <MDBCard style="width: 14rem">
    <MDBCardImg top :src="gear.image" alt="..."/>
    <MDBCardBody>
      <MDBCardTitle>{{gear.name}}</MDBCardTitle>
      <MDBCardText>
        {{gear.description}}
      </MDBCardText>
      <MDBCardText>
        family: {{gear.family}}<br/>
        type: {{gear.type}}<br/>
        level: {{gear.level}}<br/>
        hp: {{gear.hp}}<br/>
        dmg: {{gear.dmg}}<br/>
        dmgType: {{gear.dmgType}}<br/>
        speed: {{gear.speed}}<br/>
        capacities: {{gear.capacities}}<br/>
      </MDBCardText>
    </MDBCardBody>
    <!-- <MDBListGroup flush>
      <MDBListGroupItem>hp: {{gear.hp}}</MDBListGroupItem>
      <MDBListGroupItem>dmg: {{gear.dmg}}</MDBListGroupItem>
      <MDBListGroupItem>dmgType: {{gear.dmgType}}</MDBListGroupItem>
      <MDBListGroupItem>speed: {{gear.speed}}</MDBListGroupItem>
      <MDBListGroupItem>capacities: {{gear.capacities}}</MDBListGroupItem>
    </MDBListGroup> -->
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
  MDBListGroup,
  MDBListGroupItem
} from "mdb-vue-ui-kit";

export default {
  components: {
    MDBCard,
    MDBCardBody,
    MDBCardTitle,
    MDBCardText,
    MDBCardLink,
    MDBCardImg,
    MDBListGroup,
    MDBListGroupItem
  },
  props: {
    gear: {type: Object, require: true},
  }
};

</script>

<style>

</style>