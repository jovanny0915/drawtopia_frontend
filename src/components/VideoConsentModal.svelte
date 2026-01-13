<script>
  import shieldwarning from "../assets/ShieldWarning.svg";
  import x from "../assets/X.svg";
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  let agreed = false;

  function handleClose() {
    dispatch('close');
  }

  function handleSubmit() {
    if (agreed) {
      dispatch('submit');
    }
  }

</script>
<div class="information-helper-text">
  <div class="frame-1410103845">
    <div class="frame-1410103839">
      <div class="logo-text-full">
        <div class="logo-img"></div>
      </div>
      <button class="x" aria-label="Close" on:click={handleClose}>
        <img src={x} alt="" />
      </button>
    </div>
    <div class="stroke"></div>
  </div>
  <div class="frame-1410103944">
    <img src={shieldwarning} alt="shieldwarning" class="shieldwarning" />
    <div class="frame-1410104192">
      <div>
        <span class="videoconsentagreement_span">Video Consent Agreement</span>
      </div>
      <div
        class="by-submitting-your-reaction-video-you-agree-that-your-video-may-be-used-publicly-within-the-drawtopia-app-and-may-appear-in-promotional-materials-highlight-reels-or-future-media-releases"
      >
        <span
          class="bysubmittingyourreactionvideoyouagreethatyourvideomaybeusedpubliclywithinthedrawtopiaappandmayappearinpromotionalmaterialshighlightreelsorfuturemediareleases_span"
          >By submitting your reaction video, you agree that your video may be
          used publicly within the Drawtopia app, and may appear in promotional
          materials, highlight reels, or future media releases.</span
        >
      </div>
    </div>
    <label class="checkbox-label">
      <input type="checkbox" bind:checked={agreed} class="checkbox-input" />
      <div class="checkbox">
        <div class="square" class:checked={agreed}>
          {#if agreed}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.6667 3.5L5.25 9.91667L2.33334 7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          {/if}
        </div>
      </div>
      <div>
        <span class="iagreetothetermsabove_span">
          I agree to the terms above</span
        >
      </div>
    </label>
  </div>
  <button class="button" on:click={handleSubmit} disabled={!agreed}>
    <div class="submit-reaction">
      <span class="submitreaction_span">Submit Reaction</span>
    </div>
  </button>
</div>

<style>
  .stroke {
    align-self: stretch;
    height: 1px;
    background: #dcdcdc;
  }

  .videoconsentagreement_span {
    color: black;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .bysubmittingyourreactionvideoyouagreethatyourvideomaybeusedpubliclywithinthedrawtopiaappandmayappearinpromotionalmaterialshighlightreelsorfuturemediareleases_span {
    color: #666d80;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .by-submitting-your-reaction-video-you-agree-that-your-video-may-be-used-publicly-within-the-drawtopia-app-and-may-appear-in-promotional-materials-highlight-reels-or-future-media-releases {
    align-self: stretch;
    text-align: left;
  }

  .square {
    width: 20px;
    height: 20px;
    left: 0px;
    top: 0px;
    position: absolute;
    background: white;
    border-radius: 6px;
    border: 1px #dfe1e7 solid;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .square.checked {
    background: #438bff;
    border-color: #438bff;
  }

  .iagreetothetermsabove_span {
    color: #666d80;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .submitreaction_span {
    color: white;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .submit-reaction {
    text-align: center;
  }

  .frame-1410104192 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    gap: 4px;
    display: flex;
  }

  .button {
    align-self: stretch;
    height: 57px;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    background: #438bff;
    border-radius: 20px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
    cursor: pointer;
    opacity: 1;
    transition: opacity 0.2s ease;
  }

  .button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .logo-text-full {
    width: 216px;
    height: 40.37px;
    position: relative;
  }

  .x {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
    background: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  
  .checkbox {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
  }

  .checkbox-input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
    margin: 0;
    padding: 0;
  }

  .frame-1410103839 {
    align-self: stretch;
    padding-left: 12px;
    padding-right: 12px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .checkbox-label {
    border-radius: 6px;
    align-items: center;
    gap: 8px;
    display: inline-flex;
    cursor: pointer;
    user-select: none;
  }

  .frame-1410103845 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
    display: flex;
  }

  .frame-1410103944 {
    align-self: stretch;
    flex-direction: column;
    justify-content: center;
    gap: 16px;
    text-align: left;
    display: flex;
  }

  .information-helper-text {
    width: 100%;
    padding: 16px;
    left: 0px;
    top: 0px;
    position: absolute;
    background: #fdfdfd;
    border-radius: 12px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
    display: inline-flex;
  }
  .logo-img {
    background-image: url("../assets/logo.png");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    width: 100%;
    height: 100%;
  }

  .shieldwarning {
    width: 64px;
    height: 64px;
  }
</style>
