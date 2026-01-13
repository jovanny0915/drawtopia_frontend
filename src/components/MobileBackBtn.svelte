<script>
  import { goto } from "$app/navigation";
  import arrowLeft from "../assets/ArrowLeft.svg";

  export let backRoute = "/";
  export let backText = "Back To Step";
</script>

<div class="mobile-back-btn">
  <button class="button_mobile" on:click={() => goto(backRoute)}>
    <div class="arrowleft">
      <img src={arrowLeft} alt="arrowLeft" />
    </div>
    <div class="back-to-step">
      <span class="backtostep_span">{backText}</span>
    </div>
  </button>
</div>

<style>
  .mobile-back-btn {
    display: none;
  }
  .button_mobile {
    margin-right: 15px;
    padding: 12px 24px;
    box-shadow: 0px 4px 4px rgba(98.89, 98.89, 98.89, 0.25);
    border-radius: 999px;
    outline: 1px #dcdcdc solid;
    background-color: white;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }
  .backtostep_span {
    color: black;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }
  @media (max-width: 800px) {
    .mobile-back-btn {
      display: flex;
      width: 100%;
      align-items: center;
    }
  }
</style>
