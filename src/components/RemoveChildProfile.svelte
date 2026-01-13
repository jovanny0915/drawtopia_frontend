<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import x from "../assets/X.svg";
  import trash from "../assets/Trash.svg";
  import drawtopia from "../assets/logo.png"

  const dispatch = createEventDispatcher();

  function handleClose() {
    dispatch('close');
  }

  function handleCancel() {
    dispatch('cancel');
  }

  function handleRemove() {
    dispatch('remove');
  }
</script>

<div class="modal-overlay" role="dialog" aria-modal="true" on:click={handleClose}>
  <div class="modal-box" on:click|stopPropagation>
    <div class="pop-up">
      <div class="frame-1410103845">
        <div class="frame-1410103839">
          <div class="logo-text-full">
            <img src={drawtopia} alt="drawtopia logo" class="drawtopia-logo" />
          </div>
          <button class="x" aria-label="Close" on:click={handleClose}>
            <img src={x} alt="Close" />
          </button>
        </div>
        <div class="stroke"></div>
      </div>
      <div class="frame-1410103904">
        <div class="notification">
          <div class="trash">
            <img src={trash} alt="trash" />
          </div>
        </div>
        <div class="heading">
          <div class="are-you-sure-you-want-to-remove-this-child">
            <span class="areyousureyouwanttoremovethischild_span"
              >Are you sure you want to remove this child?</span
            >
          </div>
          <div
            class="this-will-permanently-delete-the-childs-profile-and-any-personalized-story-progress-you-can-always-add-them-again-later"
          >
            <span
              class="thiswillpermanentlydeletethechildsprofileandanypersonalizedstoryprogressyoucanalwaysaddthemagainlater_span"
              >This will permanently delete the child's profile and any
              personalized story progress. You can always add them again
              later.</span
            >
          </div>
        </div>
      </div>
      <div class="frame-1410103905">
        <div class="frame-2147227421">
          <button class="cancel" on:click={handleCancel}>
            <span class="cancel_span">Cancel</span>
          </button>
        </div>
        <div class="frame-1410104246">
          <button class="yes-remove" on:click={handleRemove}>
            <span class="yesremove_span">Yes, Remove</span>
          </button>
          <div class="ellipse-1415"></div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 16px;
  }

  .modal-box {
    position: relative;
    width: 100%;
    max-width: 500px;
  }

  .drawtopia-logo {
    width: 100%;
  }

  .subtract {
    width: 30.16px;
    height: 30.16px;
    left: 129.13px;
    top: 1.94px;
    position: absolute;
    transform: rotate(4deg);
    transform-origin: top left;
    background: radial-gradient(
      ellipse 50.00% 50.00% at 50.00% 50.00%,
      #0fe3ef 44%,
      #438bff 100%
    );
    box-shadow: 0px 0.6032479405403137px 1.8097436428070068px #871fff inset;
  }


  .stroke {
    align-self: stretch;
    height: 1px;
    background: #dcdcdc;
  }

  .trash img {
    width: 27px;
    height: 29.25px;
    filter: brightness(0) saturate(100%) invert(29%) sepia(92%) saturate(4845%) hue-rotate(333deg) brightness(96%) contrast(93%);
  }

  .areyousureyouwanttoremovethischild_span {
    color: black;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28.80px;
    word-wrap: break-word;
  }

  .are-you-sure-you-want-to-remove-this-child {
    width: 393px;
    text-align: center;
  }

  .thiswillpermanentlydeletethechildsprofileandanypersonalizedstoryprogressyoucanalwaysaddthemagainlater_span {
    color: #727272;
    font-size: 18px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 25.20px;
    word-wrap: break-word;
  }

  .this-will-permanently-delete-the-childs-profile-and-any-personalized-story-progress-you-can-always-add-them-again-later {
    align-self: stretch;
    text-align: center;
  }

  .cancel_span {
    color: #141414;
    font-size: 18px;
    font-family: DM Sans;
    font-weight: 600;
    line-height: 25.20px;
    word-wrap: break-word;
  }

  .cancel {
    text-align: center;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .yesremove_span {
    color: white;
    font-size: 18px;
    font-family: DM Sans;
    font-weight: 600;
    line-height: 25.20px;
    word-wrap: break-word;
  }

  .yes-remove {
    text-align: center;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    position: relative;
    z-index: 1;
  }

  .ellipse-1415 {
    width: 248px;
    height: 114px;
    left: -11px;
    top: 25px;
    position: absolute;
    background: radial-gradient(
      ellipse 42.11% 42.11% at 50.00% 52.94%,
      white 0%,
      rgba(255, 255, 255, 0) 100%
    );
    border-radius: 9999px;
  }

  .heading {
    align-self: stretch;
    padding-left: 4px;
    padding-right: 4px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 4px;
    display: flex;
  }

  .frame-2147227421 {
    flex: 1 1 0;
    height: 54px;
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 12px;
    padding-bottom: 12px;
    background: #f8fafb;
    overflow: hidden;
    border-radius: 12px;
    outline: 1px rgba(255, 250, 238, 0.20) solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    display: flex;
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
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .x:hover {
    opacity: 0.7;
  }

  .x img {
    width: 24px;
    height: 24px;
  }

  .trash {
    width: 36px;
    height: 36px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .frame-1410104246 {
    flex: 1 1 0;
    height: 54px;
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 16px;
    padding-bottom: 16px;
    position: relative;
    background: #df1c41;
    overflow: hidden;
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    display: flex;
  }

  .frame-1410104246:hover {
    background: #c01838;
  }

  .frame-1410103839 {
    align-self: stretch;
    padding-left: 12px;
    padding-right: 12px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .notification {
    width: 64px;
    height: 64px;
    padding: 12px;
    background: #fff0f3;
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }

  .frame-1410103905 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
  }

  .frame-1410103845 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
    display: flex;
  }

  .frame-1410103904 {
    align-self: stretch;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 16px;
    display: flex;
  }

  .pop-up {
    width: 100%;
    height: 100%;
    padding-top: 24px;
    padding-bottom: 16px;
    padding-left: 16px;
    padding-right: 16px;
    left: 0px;
    top: 0px;
    position: relative;
    background: white;
    border-radius: 20px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 32px;
    display: inline-flex;
  }

  @media (max-width: 640px) {
    .are-you-sure-you-want-to-remove-this-child {
      width: 100%;
      max-width: 393px;
    }

    .frame-1410103905 {
      flex-direction: column;
    }

    .frame-2147227421,
    .frame-1410104246 {
      width: 100%;
    }
  }
</style>

