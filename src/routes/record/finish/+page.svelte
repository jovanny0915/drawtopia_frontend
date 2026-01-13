<script>
  import ArrowLeft from "../../../assets/ArrowLeft.svg";
  import arrowclockwise from "../../../assets/ArrowClockwise.svg";
  import floppydiskback from "../../../assets/FloppyDiskBack.svg";
  import playblack from "../../../assets/Play-black.svg";
  import VideoConsentModal from "../../../components/VideoConsentModal.svelte";
  import ReactionReady from "../../../components/ReactionReady.svelte";
  import MobileBackBtn from "../../../components/MobileBackBtn.svelte";

  let showVideoConsentModal = false;
  let showReactionReadyModal = false;

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
            <span class="recordingreaction_span">How Would You Like to Experience Your Story?</span>
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
                src="https://placehold.co/713x827"
                alt=""
              />
            </div>
          </div>
        </div>
        <div class="frame-1410104189">
          <div class="notification">
            <img src={playblack} alt="arrow" />
            <div><span class="stopreaction_span">Replay Reaction</span></div>
          </div>
        </div>
      </div>
      <img class="frame-1410104194" src="https://placehold.co/392x232" alt="" />
    </div>
    <div class="frame-1410103860">
      <div class="frame-1410103870">
        <div class="button">
          <img src={ArrowLeft} alt="arrow" />
          <div class="back"><span class="back_span">Back</span></div>
        </div>
      </div>
      <div class="frame-1410104195">
        <div class="button_01">
          <img src={arrowclockwise} alt="arrow" />
          <div class="retake-reaction">
            <span class="retakereaction_span">Retake Reaction</span>
          </div>
        </div>
        <div class="button_02" role="button" tabindex="0" on:click={openVideoConsentModal} on:keydown={(e) => e.key === 'Enter' && openVideoConsentModal()}>
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
  <div class="modal-overlay" role="dialog" aria-modal="true" tabindex="-1" on:click|self={closeVideoConsentModal} on:keydown={(e) => e.key === 'Escape' && closeVideoConsentModal()}>
    <div class="modal-content">
      <VideoConsentModal on:close={closeVideoConsentModal} on:submit={handleConsentSubmit} />
    </div>
  </div>
{/if}

{#if showReactionReadyModal}
  <div class="modal-overlay" role="dialog" aria-modal="true" tabindex="-1" on:click|self={closeReactionReady} on:keydown={(e) => e.key === 'Escape' && closeReactionReady()}>
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
  /* Full width and single-line ellipsis like /record */
  .recording-reaction {
    width: 100%;
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
  /* Ensure main image fills container width */
  .frame-1410104055 {
    width: 100%;
    height: auto;
    display: block;
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
    width: 100%;
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
    border-radius: 16px;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 10px;
    display: flex;
  }

  .heading_01 {
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 16px;
    display: flex;
    width: 100%;
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
    height: 450px;
    overflow: auto;
    border-radius: 12px;
    position: relative;
  }
  .modal-content--small {
    width: 530px;
    height: 300px;
  }
  .button_02 { cursor: pointer; }
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
    .modal-content {
      width: 100%;
      height: 72vh;
      border-radius: 0;
      box-sizing: border-box;
      padding-bottom: env(safe-area-inset-bottom);
    }
    .modal-content--small {
      width: 100%;
      max-width: 100%;
    }
    .notification {
      width: 100%;
    }
    .recordingreaction_span {
      font-size: 28px;
      line-height: 1.3;
    }
    .frame-1410104194 {
      height: 300px;
      width: 200px;
      bottom: 100px;
      top: auto;
    }
  }
</style>
