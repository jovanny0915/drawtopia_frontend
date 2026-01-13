<script>
  import purple_check from "../../assets/purple-check.svg";
  import ArrowLeft from "../../assets/ArrowLeft.svg";
  import DevicePermissionModal from "../../components/DevicePermissionModal.svelte";
  import { goto } from "$app/navigation";

  import { browser } from "$app/environment";
  import MobileBackBtn from "../../components/MobileBackBtn.svelte";

  let isMobile = false;
  let showDevicePermissionModal = false;
  let selectedOption = 'record'; // 'record' or 'preview'

  // Reactive button text based on selection
  $: buttonText = selectedOption === 'record' ? 'Choose Record Video' : 'Preview a Story';

  function handleChooseRecordVideo() {
    if (selectedOption === 'preview') {
      // Navigate directly to preview page, no modal needed
      goto('/preview/default');
    } else {
      // Show modal for record option
      showDevicePermissionModal = true;
    }
  }

  function closeModal() {
    showDevicePermissionModal = false;
  }

  function handleGrantPermissions() {
    closeModal();
    // Navigate to record/reaction page after permissions granted
    goto('/record/reaction');
  }

  /**
   * @param {'record' | 'preview'} option
   */
  function selectOption(option) {
    selectedOption = option;
  }

  $: if (browser) {
    isMobile = window.innerWidth < 800;
  }
</script>

<div class="record-pages-default-selected">
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
          <div class="how-would-you-like-to-experience-your-story">
            <span class="howwouldyouliketoexperienceyourstory_span"
              >How Would You Like to Experience Your Story?</span
            >
          </div>
          <div class="pick-a-fun-way-to-enjoy-your-adventure">
            <span class="pickafunwaytoenjoyyouradventure_span"
              >Pick a fun way to enjoy your adventure!</span
            >
          </div>
        </div>
      </div>
    </div>
    <div class="frame-1410104111">
      <div class="frame-1410104110">
        <div 
          class="card" 
          class:selected={selectedOption === 'record'}
          role="button" 
          tabindex="0"
          on:click={() => selectOption('record')}
          on:keydown={(e) => e.key === 'Enter' && selectOption('record')}
        >
          <div class="image">
            {#if selectedOption === 'record'}
              <img src={purple_check} alt="purple_check" class="purple_check" />
            {/if}
          </div>
          <div class="frame-10">
            <div class="heading_02">
              <div class="record-a-reaction-video">
                <span class="recordareactionvideo_span"
                  >Record a Reaction Video</span
                >
              </div>
              <div
                class="watch-your-childs-face-light-up-as-they-meet-talking-animals-and-travel-to-distant-worlds-and-record-the-moment-forever"
              >
                <span
                  class="watchyourchildsfacelightupastheymeettalkinganimalsandtraveltodistantworldsandrecordthemomentforever_span"
                >
                  Watch your child's face light up as they meet talking animals
                  and travel to distant worlds — and record the moment forever!</span
                >
              </div>
            </div>
          </div>
        </div>
        <div 
          class="card_01" 
          class:selected={selectedOption === 'preview'}
          role="button" 
          tabindex="0"
          on:click={() => selectOption('preview')}
          on:keydown={(e) => e.key === 'Enter' && selectOption('preview')}
        >
          <div class="image_01_wrapper">
            <img class="image_01" src="https://placehold.co/402x280" alt="" />
            {#if selectedOption === 'preview'}
              <img src={purple_check} alt="purple_check" class="purple_check" />
            {/if}
          </div>
          <div class="frame-10_01">
            <div class="heading_03">
              <div class="preview-a-story">
                <span class="previewastory_span">Preview a Story</span>
              </div>
              <div
                class="step-into-a-magical-world-filled-with-friendly-creatures-hidden-treasures-and-unforgettable-adventures"
              >
                <span
                  class="stepintoamagicalworldfilledwithfriendlycreatureshiddentreasuresandunforgettableadventures_span"
                  >Step into a magical world filled with friendly creatures,
                  hidden treasures, and unforgettable adventures.</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="frame-1410103860">
      <div class="frame-1410103870">
        <div class="button">
          <img src={ArrowLeft} alt="arrow" />
          <div class="back"><span class="back_span">Back</span></div>
        </div>
      </div>
      <div class="button_01" role="button" tabindex="0" on:click={handleChooseRecordVideo} on:keydown={(e) => e.key === 'Enter' && handleChooseRecordVideo()}>
        <div class="choose-record-video">
          <span class="chooserecordvideo_span">{buttonText}</span>
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

{#if showDevicePermissionModal}
  <div class="modal-overlay" role="dialog" aria-modal="true" tabindex="-1" on:click|self={closeModal} on:keydown={(e) => e.key === 'Escape' && closeModal()}>
    <div class="modal-content">
      <DevicePermissionModal on:close={closeModal} on:grant={handleGrantPermissions} />
    </div>
  </div>
{/if}

<style>
  .howwouldyouliketoexperienceyourstory_span {
    color: #121212;
    font-size: 48px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 67.2px;
    word-wrap: break-word;
  }

  .how-would-you-like-to-experience-your-story {
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

  .recordareactionvideo_span {
    color: #141414;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .record-a-reaction-video {
    align-self: stretch;
  }

  .watchyourchildsfacelightupastheymeettalkinganimalsandtraveltodistantworldsandrecordthemomentforever_span {
    color: #666d80;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .watch-your-childs-face-light-up-as-they-meet-talking-animals-and-travel-to-distant-worlds-and-record-the-moment-forever {
    align-self: stretch;
  }

  .image_01_wrapper {
    align-self: stretch;
    height: 280px;
    position: relative;
    overflow: hidden;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
  }

  .image_01 {
    align-self: stretch;
    height: 280px;
    width: 100%;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    border: 1px #d3d3d3 solid;
    transition: border-color 0.2s;
  }

  .card_01.selected .image_01 {
    border: 1px #6912c5 solid;
  }

  .previewastory_span {
    color: #141414;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .preview-a-story {
    align-self: stretch;
  }

  .stepintoamagicalworldfilledwithfriendlycreatureshiddentreasuresandunforgettableadventures_span {
    color: #666d80;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .step-into-a-magical-world-filled-with-friendly-creatures-hidden-treasures-and-unforgettable-adventures {
    align-self: stretch;
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

  .chooserecordvideo_span {
    color: white;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .choose-record-video {
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

  .heading_02 {
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

  .heading_03 {
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

  .button_01 {
    width: 235px;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    background: #438bff;
    border-radius: 20px;
    justify-content: center;
    align-items: center;
    gap: 10px;
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

  .heading_01 {
    width: 100%;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 16px;
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
  }

  .frame-10_01 {
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

  .image {
    align-self: stretch;
    height: 280px;
    position: relative;
    overflow: hidden;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    border-left: 1px #d3d3d3 solid;
    border-top: 1px #d3d3d3 solid;
    border-right: 1px #d3d3d3 solid;
    background-image: url(https://placehold.co/402x280);
    transition: border-color 0.2s;
  }

  .card.selected .image {
    border-left: 1px #6912c5 solid;
    border-top: 1px #6912c5 solid;
    border-right: 1px #6912c5 solid;
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

  .heading {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 16px;
    display: flex;
  }

  .card_01 {
    width: 402px;
    padding-bottom: 10px;
    background: white;
    border-radius: 20px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
    cursor: pointer;
    transition: outline 0.2s, box-shadow 0.2s;
  }

  .card_01.selected {
    box-shadow: 0px 1px 8px #871fff;
    outline: 2px #6912c5 solid;
    outline-offset: -2px;
  }

  .card {
    width: 402px;
    padding-bottom: 10px;
    background: white;
    border-radius: 20px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
    cursor: pointer;
    transition: outline 0.2s, box-shadow 0.2s;
  }

  .card.selected {
    box-shadow: 0px 1px 8px #871fff;
    outline: 2px #6912c5 solid;
    outline-offset: -2px;
  }

  .frame-1410103870 {
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .frame-1410104110 {
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
  }

  .frame-1410103860 {
    align-self: stretch;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .frame-1410104111 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    gap: 12px;
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

  .record-pages-default-selected {
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
    background-image: url("../../assets/logo.png");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    width: 100%;
    height: 100%;
  }
  .purple_check {
    position: absolute;
    top: 10px;
    right: 10px;
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

  .button_01 { cursor: pointer; }
  @media (max-width: 800px) {
    .modal-overlay {
      align-items: flex-end;
    }
    .modal-content {
      width: 100%;
      height: 72vh;
      /* max-height: 100dvh; */
      border-radius: 0;
      box-sizing: border-box;
      padding-bottom: env(safe-area-inset-bottom);
    }
    .frame-1410103818 {
      width: 100%;
    }
    .frame-1410104110 {
      width: 100%;
      flex-direction: column;
      align-items: stretch;
    }
    .card,
    .card_01 {
      width: 100%;
    }
    .image,
    .image_01_wrapper {
      width: 100%;
      height: auto;
      min-height: 200px;
    }
    .image_01 {
      width: 100%;
      height: auto;
      min-height: 200px;
    }
    .howwouldyouliketoexperienceyourstory_span {
      font-size: 28px;
      line-height: 1.3;
    }
    .pickafunwaytoenjoyyouradventure_span {
      font-size: 16px;
    }
    .frame-1410103860 {
      flex-direction: column;
      justify-content: center;
      gap: 12px;
    }
    .frame-1410103870 {
      width: 100%;
      justify-content: center;
    }
    /* Hide bottom Back button on mobile */
    .frame-1410103870 .button {
      display: none;
    }
    .button_01 {
      width: 100%;
    }
    /* Make title full-width on mobile */
    .how-would-you-like-to-experience-your-story {
      width: 100%;
    }
  }
</style>
