<script>
  import { onMount, onDestroy } from "svelte";
  import ArrowLeft from "../../../assets/ArrowLeft.svg";
  import arrowclockwise from "../../../assets/ArrowClockwise.svg";
  import floppydiskback from "../../../assets/FloppyDiskBack.svg";
  import VideoConsentModal from "../../../components/VideoConsentModal.svelte";
  import ReactionReady from "../../../components/ReactionReady.svelte";
  import MobileBackBtn from "../../../components/MobileBackBtn.svelte";

  import stopIcon from "../../../assets/Stop.svg";
  import playIcon from "../../../assets/Play.svg"
  import storyImg from "../../../assets/classic_storybook.png";
  import childImg from "../../../assets/child_example.png";

  let showVideoConsentModal = false;
  let showReactionReadyModal = false;
  
  // Progress bar state
  let progress = 0;
  let isPaused = false;
  let isStopButton = true; // true = "Stop Reaction", false = "Replay Reaction"
  /** @type {ReturnType<typeof setInterval> | null} */
  let progressInterval = null;
  const PROGRESS_DURATION = 30000; // 30 seconds
  const UPDATE_INTERVAL = 50; // Update every 50ms for smooth animation
  const PROGRESS_INCREMENT = (100 / PROGRESS_DURATION) * UPDATE_INTERVAL;

  function startProgress() {
    if (progressInterval) {
      clearInterval(progressInterval);
    }
    
    progressInterval = setInterval(() => {
      if (!isPaused) {
        progress = Math.min(100, progress + PROGRESS_INCREMENT);
        if (progress >= 100) {
          if (progressInterval) {
            clearInterval(progressInterval);
            progressInterval = null;
          }
        }
      }
    }, UPDATE_INTERVAL);
  }

  function stopProgress() {
    isPaused = true;
    isStopButton = false; // Change to "Replay Reaction"
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
  }

  function replayProgress() {
    isPaused = false;
    isStopButton = true; // Change to "Stop Reaction"
    startProgress();
  }

  function handleStopReplayClick() {
    if (isStopButton) {
      stopProgress();
    } else {
      replayProgress();
    }
  }

  function handleRetakeClick() {
    // Reset progress and restart
    progress = 0;
    isPaused = false;
    isStopButton = true;
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
    startProgress();
  }

  function openVideoConsentModal() {
    showVideoConsentModal = true;
  }

  function closeVideoConsentModal() {
    showVideoConsentModal = false;
  }

  function handleConsentSubmit() {
    showVideoConsentModal = false;
    showReactionReadyModal = true;
  }

  function closeReactionReady() {
    showReactionReadyModal = false;
  }

  // Computed: is retake button enabled?
  $: isRetakeEnabled = progress >= 100 || (isPaused && !isStopButton);

  onMount(() => {
    startProgress();
  });

  onDestroy(() => {
    if (progressInterval) {
      clearInterval(progressInterval);
    }
  });
</script>

<div class="review-reaction-progress">
  <div class="navbar">
    <div class="logo-text-full">
      <div class="logo-img"></div>
    </div>
  </div>
  <MobileBackBtn />
  <div class="frame-1410103818">
    <div class="heading">
      <div class="heading_01">
        <div class="frame-1410103862">
          <div class="recording-reaction">
            <span class="recordingreaction_span">Recording Reaction</span>
          </div>
          <div class="pick-a-fun-way-to-enjoy-your-adventure">
            <span class="pickafunwaytoenjoyyouradventure_span"
              >Pick a fun way to enjoy your adventure!</span
            >
          </div>
        </div>
      </div>
    </div>
    <div class="frame-1410104054">
      <div class="frame-1410104083">
        <div class="frame-1410104105">
          <div class="frame-1410104064">
            <div class="image">
              <img
                class="frame-1410104055"
                src={storyImg}
                alt="storyImg"
              />
            </div>
          </div>
        </div>
        <div class="frame-1410103854">
          <div class="frame-1410103855">
            <div class="bar"></div>
            <div class="bar_01" style="width: {progress}%"></div>
          </div>
          <div class="reviewing-your-reaction">
            <span class="reviewingyourreaction_span"
              >Reviewing your Reaction</span
            >
          </div>
        </div>
        <div class="frame-1410104189">
          <div 
            class="notification"
            role="button"
            tabindex="0"
            on:click={handleStopReplayClick}
            on:keydown={(e) => e.key === "Enter" && handleStopReplayClick()}
            style="cursor: pointer;"
          >
            <img src={isStopButton ? stopIcon : playIcon} alt="stop" class="margin:auto;">
            <div>
              <span class="stopreaction_span">
                {isStopButton ? "Stop Reaction" : "Replay Reaction"}
              </span>
            </div>
          </div>
        </div>
      </div>
      <img class="frame-1410104194" src={childImg} alt="" />
    </div>
    <div class="frame-1410103860">
      <div class="frame-1410103870">
        <div class="button">
          <img src={ArrowLeft} alt="arrow" />
          <div class="back"><span class="back_span">Back</span></div>
        </div>
      </div>
      <div class="frame-1410104195">
          <div 
            class="frame-2147227421 button_01"
            class:button_01--disabled={!isRetakeEnabled}
            role="button"
            tabindex={isRetakeEnabled ? 0 : -1}
            on:click={isRetakeEnabled ? handleRetakeClick : undefined}
            on:keydown={(e) => isRetakeEnabled && e.key === "Enter" && handleRetakeClick()}
            style="cursor: {isRetakeEnabled ? 'pointer' : 'not-allowed'}; opacity: {isRetakeEnabled ? 1 : 0.5};"
          >
            <div class="arrowclockwise" aria-hidden="true">
              <img src={arrowclockwise} alt="arrowclockwise">
            </div>
            <div class="retake-reaction">
              <span class="retakereaction_span">Retake Reaction</span>
            </div>
          </div>
        <div
          class="button_02"
          role="button"
          tabindex="0"
          on:click={openVideoConsentModal}
          on:keydown={(e) => e.key === "Enter" && openVideoConsentModal()}
        >
          <img src={floppydiskback} alt="floppydiskback" />
          <div class="save-reaction">
            <span class="savereaction_span">Save Reaction</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="frame-1410103821">
    <div class="contact-us-hellodrawtopiacom">
      <span class="contactushellodrawtopiacom_span"
        >Contact us: hello@drawtopia.com</span
      >
    </div>
    <div class="rectangle-34"></div>
    <div class="frame-1410103820">
      <div class="privacy-policy">
        <span class="privacypolicy_span">Privacy Policy</span>
      </div>
      <div class="terms-of-service">
        <span class="termsofservice_span">Terms of Service</span>
      </div>
    </div>
  </div>
</div>
{#if showVideoConsentModal}
  <div
    class="modal-overlay"
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    on:click|self={closeVideoConsentModal}
    on:keydown={(e) => e.key === "Escape" && closeVideoConsentModal()}
  >
    <div class="modal-content">
      <VideoConsentModal
        on:close={closeVideoConsentModal}
        on:submit={handleConsentSubmit}
      />
    </div>
  </div>
{/if}

{#if showReactionReadyModal}
  <div
    class="modal-overlay"
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    on:click|self={closeReactionReady}
    on:keydown={(e) => e.key === "Escape" && closeReactionReady()}
  >
    <div class="modal-content modal-content--small">
      <ReactionReady on:close={closeReactionReady} />
    </div>
  </div>
{/if}

<style>
  .recordingreaction_span {
    color: #121212;
    font-size: 48px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 67.2px;
    word-wrap: break-word;
  }

  .recording-reaction {
    width: 687px;
    text-align: center;
  }

  .pickafunwaytoenjoyyouradventure_span {
    color: #666d80;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    word-wrap: break-word;
  }

  .pick-a-fun-way-to-enjoy-your-adventure {
    width: 1040px;
    text-align: center;
  }

  .frame-1410104055 {
    flex: 1 1 0;
    align-self: stretch;
    padding: 24px;
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0.25) 100%
    );
    border-radius: 8px;
  }

  .bar {
    align-self: stretch;
    height: 8px;
    position: relative;
    background: #eef6ff;
    border-radius: 12px;
  }

  .bar_01 {
    width: 125px;
    height: 8px;
    left: 0px;
    top: 0px;
    position: absolute;
    background: #438bff;
    border-radius: 12px;
  }

  .reviewingyourreaction_span {
    color: #141414;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 600;
    line-height: 21.6px;
    word-wrap: break-word;
  }

  .reviewing-your-reaction {
    align-self: stretch;
    text-align: center;
  }

  .stopreaction_span {
    color: #141414;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28px;
    word-wrap: break-word;
  }

  .frame-1410104194 {
    width: 392px;
    height: 232px;
    left: 0px;
    top: 639px;
    position: absolute;
    background: white;
    border-radius: 12px;
    border: 6px #ededed solid;
  }

  .back_span {
    color: black;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .back {
    text-align: center;
  }

  .retakereaction_span {
    color: #438bff;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .retake-reaction {
    text-align: center;
  }

  .savereaction_span {
    color: white;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .save-reaction {
    text-align: center;
  }

  .contactushellodrawtopiacom_span {
    color: #141414;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .contact-us-hellodrawtopiacom {
    text-align: center;
  }

  .rectangle-34 {
    align-self: stretch;
    height: 1px;
    background: #ededed;
  }

  .privacypolicy_span {
    color: #141414;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .privacy-policy {
    text-align: center;
  }

  .termsofservice_span {
    color: #141414;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .terms-of-service {
    text-align: center;
  }

  .frame-1410103862 {
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 16px;
    display: flex;
  }

  .frame-1410103820 {
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
  }

  .logo-text-full {
    width: 203.32px;
    height: 38px;
    position: relative;
  }

  .image {
    flex: 1 1 0;
    align-self: stretch;
    padding: 16px;
    background: white;
    overflow: hidden;
    border-radius: 16px;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 10px;
    display: flex;
  }

  .frame-1410103855 {
    align-self: stretch;
    position: relative;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: flex;
  }
  
  .heading_01 {
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 16px;
    display: flex;
  }

  .frame-1410103821 {
    align-self: stretch;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .navbar {
    align-self: stretch;
    height: 79px;
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 24px;
    padding-right: 12px;
    border-radius: 20px;
    justify-content: center;
    align-items: center;
    display: inline-flex;
  }

  .frame-1410104064 {
    flex: 1 1 0;
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .frame-1410103854 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: flex;
  }

  .notification {
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 16px;
    padding-right: 20px;
    background: #f8fafb;
    box-shadow: 0px 1px 4px rgba(141.8, 141.8, 141.8, 0.25) inset;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 18px;
    display: flex;
    justify-content: center;
  }

  .button {
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    box-shadow: 0px 4px 4px rgba(98.89, 98.89, 98.89, 0.25);
    border-radius: 20px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .button_01 {
    padding-top: 16px;
    padding-bottom: 16px;
    padding-left: 24px;
    padding-right: 20px;
    border-radius: 20px;
    outline: 1px #438bff solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .button_02 {
    padding-top: 16px;
    padding-bottom: 16px;
    padding-left: 24px;
    padding-right: 20px;
    background: #438bff;
    border-radius: 20px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .heading {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 16px;
    display: flex;
  }

  .frame-1410104105 {
    align-self: stretch;
    height: 859px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .frame-1410104189 {
    align-self: stretch;
    justify-content: center;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .frame-1410103870 {
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .frame-1410104195 {
    justify-content: flex-end;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .frame-1410104083 {
    width: 745px;
    flex-direction: column;
    justify-content: flex-end;
    align-items: flex-end;
    gap: 12px;
    display: flex;
  }

  .frame-1410103860 {
    align-self: stretch;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .frame-1410104054 {
    align-self: stretch;
    padding: 12px;
    position: relative;
    background: #f8fafb;
    border-radius: 12px;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    gap: 24px;
    display: flex;
  }

  .frame-1410103818 {
    width: 1240px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 24px;
    display: flex;
  }

  .review-reaction-progress {
    width: 100%;
    height: 100%;
    padding-top: 24px;
    padding-bottom: 80px;
    padding-left: 20px;
    padding-right: 20px;
    background: white;
    overflow: hidden;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 48px;
    display: inline-flex;
  }
  .logo-img {
    background-image: url("../../../assets/logo.png");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    width: 100%;
    height: 100%;
  }
  .modal-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    width: 536px;
    height: 620px;
    overflow: auto;
    border-radius: 12px;
    position: relative;
  }
  .modal-content--small {
    width: 530px;
  }
  .button_02 {
    cursor: pointer;
  }
  /* Title: single line, ellipsis if overflow */
  .recording-reaction {
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  /* Make main photo full width */
  .frame-1410104055 {
    width: 100%;
    height: auto;
    display: block;
  }
  @media (max-width: 800px) {
    /* Containers full width */
    .frame-1410103818 {
      width: 100%;
    }
    .frame-1410104083 {
      width: 100%;
    }
    /* Title full width */
    .recording-reaction {
      width: 100%;
    }
    .heading_01 {
      width: 100%;
    }
    /* Hide bottom Back button */
    .frame-1410103870 .button {
      display: none;
    }
    /* Bottom actions stack and fill */
    .frame-1410103860 {
      flex-direction: column;
      justify-content: center;
      gap: 12px;
    }
    .frame-1410104195 {
      width: 100%;
      flex-direction: column;
    }
    .button_01,
    .button_02 {
      width: 100%;
    }
    /* Modal as bottom sheet */
    .modal-overlay {
      align-items: flex-end;
    }
    .modal-content,
    .modal-content--small {
      width: 100%;
      height: 72vh;
      border-radius: 0;
      box-sizing: border-box;
      padding-bottom: env(safe-area-inset-bottom);
    }
    .notification {
      width: 100%;
    }
    .recordingreaction_span {
      font-size: 28px;
    }
    .frame-1410104194 {
      height: 300px;
      width: 200px;
      bottom: 150px;
      top: auto;
    }
  }

  /* Retake button upgraded styles (overrides) */
  .vector {
    width: 19.50px;
    height: 18px;
    left: 3px;
    top: 3px;
    position: absolute;
    background: #438BFF;
  }

  .retakereaction_span {
    color: #438BFF;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.20px;
    word-wrap: break-word;
  }

  .retake-reaction {
    text-align: center;
  }

  .arrowclockwise {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .frame-2147227421 {
    height: 100%;
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 12px;
    padding-bottom: 12px;
    background: #E7FEFF;
    box-shadow: 0px 4px 0px #438BFF;
    overflow: hidden;
    border-radius: 12px;
    outline: 1px rgba(255, 250, 238, 0.20) solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    display: inline-flex;
  }
</style>
