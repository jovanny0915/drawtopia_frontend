<script lang="ts">
  import popular_tag from "../assets/popular_tag.svg";
  import purple_check from "../assets/purple-check.svg";
  
  export let image: string = "https://placehold.co/402x280";
  export let ageRange: string = "Ages 3-8";
  export let title: string = "First Day of School";
  export let description: string = "A confidence-building adventure about making friends and being brave";
  export let isSelected: boolean = false;
  export let showPopularTag: boolean = false;
</script>

<div class={isSelected ? "card selected" : "card"}>
  <img class="image" src={image} alt={title}/>
  <div class="frame-10">
    <div class="heading">
      <div class="button">
        <div class="ages-3-8"><span class="ages3-8_span">{ageRange}</span></div>
      </div>
      <div class="first-day-of-school"><span class="firstdayofschool_span">{title}</span></div>
      <div class="a-confidence-building-adventure-about-making-friends-and-being-brave"><span class="aconfidence-buildingadventureaboutmakingfriendsandbeingbrave_span">{description}</span></div>
    </div>
  </div>
  {#if showPopularTag}
    <div class="popular-tag">
      <img src={popular_tag} alt="popular tag"/>
    </div>
  {/if}
  {#if isSelected}
    <img src={purple_check} alt="selected" class="purple_check" />
  {/if}
</div>

<style>
.image {
  /* align-self: stretch; */
  width:  100%;
  height: 280px;
  /* position: relative; */
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  border: 1px #D3D3D3 solid;
  /* z-index: 2; */
  aspect-ratio: 1 / 1;
  object-fit: cover;
}

.ages3-8_span {
  color: black;
  font-size: 18px;
  font-family: Quicksand;
  font-weight: 600;
  line-height: 25.20px;
  word-wrap: break-word;
}

.ages-3-8 {
  text-align: center;
}

.firstdayofschool_span {
  color: #141414;
  font-size: 24px;
  font-family: Quicksand;
  font-weight: 600;
  line-height: 33.60px;
  word-wrap: break-word;
}

.first-day-of-school {
  align-self: stretch;
}

.aconfidence-buildingadventureaboutmakingfriendsandbeingbrave_span {
  color: #666D80;
  font-size: 18px;
  font-family: Nunito;
  font-weight: 400;
  line-height: 25.20px;
  word-wrap: break-word;
}

.a-confidence-building-adventure-about-making-friends-and-being-brave {
  align-self: stretch;
}

.button {
  padding-left: 24px;
  padding-right: 24px;
  padding-top: 8px;
  padding-bottom: 8px;
  border-radius: 20px;
  outline: 1px #DCDCDC solid;
  outline-offset: -1px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  display: inline-flex;
}

.heading {
  align-self: stretch;
  padding-top: 8px;
  padding-left: 8px;
  padding-right: 8px;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 8px;
  display: flex;
}

.frame-10 {
  align-self: stretch;
  padding-top: 8px;
  padding-bottom: 12px;
  padding-left: 12px;
  padding-right: 12px;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 12px;
  display: flex;
  position: relative;
  z-index: 2;
}


.card {
  width: 100%;
  height: 100%;
  padding-bottom: 10px;
  background: white;
  border-radius: 20px;
  outline: 1px #EDEDED solid;
  outline-offset: -1px;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 12px;
  display: inline-flex;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  overflow: hidden;
}

.card:hover {
  outline: 1px #438bff solid;
  box-shadow: 0px 2px 8px rgba(67, 139, 255, 0.1);
  transform: translateY(-2px);
}

.card:active {
  transform: translateY(0);
  box-shadow: 0px 1px 4px rgba(67, 139, 255, 0.15);
}



/* Ripple effect for card clicks */
.card::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(67, 139, 255, 0.1);
  transition: width 0.4s, height 0.4s;
  transform: translate(-50%, -50%);
  z-index: 1;
}

.card:active::before {
  width: 200px;
  height: 200px;
}

.purple_check {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
}
.popular-tag {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 2;
}

/* Mobile responsive styles */
@media (max-width: 800px) {
  .card {
    touch-action: manipulation;
  }
  
  .card:hover {
    /* Reduce hover effects on mobile for better touch experience */
    transform: translateY(-1px);
    box-shadow: 0px 1px 4px rgba(67, 139, 255, 0.1);
  }
  
  .card.selected:hover {
    transform: translateY(-1px);
    box-shadow: 0px 1px 6px #871fff;
  }
  
  /* Adjust ripple effect for mobile */
  .card:active::before {
    width: 150px;
    height: 150px;
  }
  
  .purple_check {
    width: 20px;
    height: 20px;
  }
}
</style>