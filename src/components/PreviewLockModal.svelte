<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import LockKeyRed from "../assets/LockKey-red.svg";

  export let characterName = "Emma"; // Default character name
  export let storyId: string | null = null; // Story ID to pass for purchase

  const dispatch = createEventDispatcher();

  function handleUnlock() {
    dispatch("unlock", { storyId });
  }

  function handleClose() {
    dispatch("close");
  }
</script>

<div class="modal-overlay" role="dialog" aria-modal="true" on:click|self={handleClose}>
  <div class="modal-container" on:click|stopPropagation>
    <div class="frame-1410104067">
      <div class="frame-1410104068">
        <div class="lockkey">
          <img src={LockKeyRed} alt="Lock" class="lock-icon" />
        </div>
      </div>
      <div class="frame-1410104066">
        <div class="story-adventure-continues">
          <span class="storyadventurecontinues_span">Story adventure continues...</span>
        </div>
        <div class="unlock-more-pages-to-see-how-emmas-story-ends-unlock-to-read">
          <span class="unlockmorepagestoseehowemmasstoryendsunlocktoread_span">
            Unlock more pages to see how {characterName}'s story ends!<br />Unlock to Read
          </span>
        </div>
      </div>
      <div class="button" on:click={handleUnlock}>
        <div class="unclock-to-read">
          <span class="unclocktoread_span">Unlock To Read</span>
        </div>
        <div class="ellipse-1415"></div>
      </div>
    </div>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 20px;
    box-sizing: border-box;
  }

  .modal-container {
    width: 100%;
    max-width: 500px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .frame-1410104067 {
    width: 100%;
    padding: 24px;
    background: white;
    border-radius: 12px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 16px;
    display: inline-flex;
  }

  .frame-1410104068 {
    padding: 8px;
    background: #fff0f3;
    border-radius: 12px;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }

  .lockkey {
    width: 40px;
    height: 40px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .lock-icon {
    width: 30px;
    height: 33.75px;
  }

  .frame-1410104066 {
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 4px;
    display: flex;
    width: 100%;
  }

  .story-adventure-continues {
    align-self: stretch;
    text-align: center;
  }

  .storyadventurecontinues_span {
    color: black;
    font-size: 24px;
    font-family: Quicksand, sans-serif;
    font-weight: 700;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .unlock-more-pages-to-see-how-emmas-story-ends-unlock-to-read {
    align-self: stretch;
    text-align: center;
  }

  .unlockmorepagestoseehowemmasstoryendsunlocktoread_span {
    color: #727272;
    font-size: 14px;
    font-family: Quicksand, sans-serif;
    font-weight: 700;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .button {
    align-self: stretch;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    position: relative;
    background: #df1c41;
    overflow: hidden;
    border-radius: 20px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .button:hover {
    background: #c01836;
  }

  .unclock-to-read {
    text-align: center;
    position: relative;
    z-index: 1;
  }

  .unclocktoread_span {
    color: white;
    font-size: 18px;
    font-family: Quicksand, sans-serif;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .ellipse-1415 {
    width: 248px;
    height: 114px;
    left: 77px;
    top: 16px;
    position: absolute;
    background: radial-gradient(
      ellipse 42.11% 42.11% at 50% 52.94%,
      white 0%,
      rgba(255, 255, 255, 0) 100%
    );
    border-radius: 9999px;
    pointer-events: none;
  }

  @media (max-width: 768px) {
    .frame-1410104067 {
      padding: 20px;
    }

    .storyadventurecontinues_span {
      font-size: 20px;
      line-height: 28px;
    }

    .unlockmorepagestoseehowemmasstoryendsunlocktoread_span {
      font-size: 13px;
      line-height: 18px;
    }

    .unclocktoread_span {
      font-size: 16px;
      line-height: 22px;
    }

    .ellipse-1415 {
      width: 200px;
      height: 90px;
      left: 50%;
      transform: translateX(-50%);
    }
  }
</style>

