<script>
    import { goto } from "$app/navigation";
  import GreenCheck from "../assets/green_check.svg"
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  function close() {
    dispatch('close');

    goto("/dashboard");
  }
</script>
<div class="pop-up">
  <img src={GreenCheck} alt=""/>
  <div class="frame-1410103910">
      <div class="your-reaction-recording-ready"><span class="yourreactionrecordingready_span">Your Reaction Recording Ready!</span></div>
      <div class="ta-da-your-happy-face-is-ready-for-action"><span class="ta-dayourhappyfaceisreadyforaction_span">Ta-da! Your happy face is ready for action!</span></div>
  </div>
  <button class="button" on:click={close}>
      <div class="done"><span class="done_span">Done</span></div>
  </button>
</div>

<style>

.yourreactionrecordingready_span {
  color: black;
  font-size: 24px;
  font-family: Quicksand;
  font-weight: 600;
  line-height: 33.60px;
  word-wrap: break-word;
}

.your-reaction-recording-ready {
  width: 530px;
  text-align: center;
}

.ta-dayourhappyfaceisreadyforaction_span {
  color: #727272;
  font-size: 16px;
  font-family: Nunito;
  font-weight: 600;
  line-height: 22.40px;
  word-wrap: break-word;
}

.ta-da-your-happy-face-is-ready-for-action {
  width: 433px;
  text-align: center;
}

.done_span {
  color: black;
  font-size: 18px;
  font-family: Quicksand;
  font-weight: 600;
  line-height: 25.20px;
  word-wrap: break-word;
}

.done {
  text-align: center;
}

.frame-1410103910 {
  align-self: stretch;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  display: flex;
}

.button {
  width: 182px;
  padding-left: 24px;
  padding-right: 24px;
  padding-top: 16px;
  padding-bottom: 16px;
  border-radius: 20px;
  outline: 1px #DCDCDC solid;
  outline-offset: -1px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  display: inline-flex;
}

.pop-up {
  width: 100%;
  padding-top: 24px;
  padding-bottom: 32px;
  padding-left: 24px;
  padding-right: 24px;
  left: 0px;
  top: 0px;
  position: absolute;
  background: white;
  border-radius: 20px;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  gap: 32px;
  display: inline-flex;
}
</style>