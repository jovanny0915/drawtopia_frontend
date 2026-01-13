<script lang="ts">
  import { goto } from "$app/navigation";

  export let backRoute: string | undefined = undefined;
</script>

<button class="button" on:click={() => backRoute && goto(backRoute)}>
  <div class="arrowleft"></div>
  <div class="back"><span class="back_span">Back</span></div>
</button>

<style>

.back_span {
  color: black;
  font-size: 18px;
  font-family: Quicksand;
  font-weight: 600;
  line-height: 25.20px;
  word-wrap: break-word;
}

.back {
  text-align: center;
}
.arrowleft {
  width: 24px;
  height: 24px;
  position: relative;
  overflow: hidden;
  background-image: url("../assets/ArrowLeft.svg");
}
.button {
  padding-left: 24px;
  padding-right: 24px;
  padding-top: 16px;
  padding-bottom: 16px;
  box-shadow: 0px 4px 4px rgba(98.89, 98.89, 98.89, 0.25);
  border-radius: 20px;
  outline: 1px #DCDCDC solid;
  outline-offset: -1px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  display: inline-flex;
  background-color: white;
}
</style>