<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { addNotification } from '$lib/stores/notification';
  import xcom from "../assets/Xcom.svg";
  import facebook from "../assets/Facebook.svg";
  import instagram from "../assets/Instagram.svg";
  import pinterest from "../assets/PinterestLogo.svg";
  import tiktok from "../assets/TiktokLogo.svg";
  import linkedin from "../assets/LinkedIn.svg";
  import whatsapp from "../assets/WhatsappLogo.svg";
  import x from "../assets/X.svg";
  import link from "../assets/Link.svg";

  export let storyTitle: string = "";
  export let storyId: string = "";

  const dispatch = createEventDispatcher();

  function handleClose() {
    dispatch('close');
  }

  function handleOverlayClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  }

  async function handleCopyLink() {
    if (!storyId) {
      addNotification({
        type: 'error',
        message: 'Story ID is missing',
        duration: 3000
      });
      return;
    }

    console.log('++++++++++++++++++++++++++++++++++++++++++++++');

    try {
      // Generate share URL with current origin and story UID (without parameter name)
      const shareUrl = `${window.location.origin}/share?${storyId}`;
      
      // Copy the share URL to clipboard
      await navigator.clipboard.writeText(shareUrl);
      
      addNotification({
        type: 'success',
        message: 'Share link copied to clipboard!',
        duration: 3000
      });

    } catch (error) {
      console.error("Error copying share link:", error);
      addNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to copy link',
        duration: 3000
      });
    }
  }
</script>

<div class="modal-overlay" role="dialog" aria-modal="true" on:click={handleOverlayClick}>
  <div class="modal-box">
    <div class="pop-up">
      <div class="frame-1410103845">
        <div class="frame-1410103839">
          <div class="logo-text-full">
            <div class="logo-img"></div>
          </div>
          <img 
            class="x" 
            src={x} 
            alt="x" 
            on:click={handleClose}
            on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClose()}
            role="button"
            tabindex="0"
          />
        </div>
        <div class="stroke"></div>
      </div>
      <div class="frame-1410103904">
        <div class="heading">
          <div>
            <span class="sharetitlestorytoeveryone_span"
              >Share "{storyTitle}" to Everyone</span
            >
          </div>
          <div>
            <span class="leteveryoneseethewonderfulstoryyoucreated_span"
              >Let everyone see the wonderful story you created!</span
            >
          </div>
        </div>
        <div class="frame-1410103962">
          <div class="notification">
            <img src={facebook} alt="facebook" />
          </div>
          <div class="notification_01">
            <img src={instagram} alt="instagram" />
          </div>
          <div class="notification_02">
            <img src={xcom} alt="xcom" />
          </div>
          <div class="notification_03">
            <img src={pinterest} alt="pinterest" />
          </div>
          <div class="notification_04">
            <img src={tiktok} alt="tiktok" />
          </div>
          <div class="notification_05">
            <img src={linkedin} alt="linkedin" />
          </div>
          <div class="notification_06">
            <img src={whatsapp} alt="whatsapp" />
          </div>
        </div>
      </div>
      <div class="frame-1410103905">
        <div class="frame-1410103841">
          <div 
            class="button"
            on:click={handleClose}
            on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClose()}
            role="button"
            tabindex="0"
          >
            <div class="cancel"><span class="cancel_span">Cancel</span></div>
          </div>
          <div 
            class="button_01"
            on:click={handleCopyLink}
            on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && handleCopyLink()}
            role="button"
            tabindex="0"
          >
            <img src={link} alt="link" />
            <div class="copy-link">
              <span class="copylink_span">Copy Link</span>
            </div>
          </div>
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
    max-width: 640px;
  }
  .logo-img {
    background-image: url("../assets/logo.png");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    width: 100%;
    height: 100%;
  }

  .stroke {
    align-self: stretch;
    height: 1px;
    background: #dcdcdc;
  }

  .sharetitlestorytoeveryone_span {
    color: black;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.6px;
    word-wrap: break-word;
    text-wrap-mode: nowrap;
  }

  .leteveryoneseethewonderfulstoryyoucreated_span {
    color: #666d80;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .cancel_span {
    color: black;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .cancel {
    text-align: center;
  }

  .copylink_span {
    color: white;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .copy-link {
    text-align: center;
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

  .button {
    flex: 1 1 0;
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
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .button:hover {
    background: #f5f5f5;
    transform: translateY(-1px);
    box-shadow: 0px 6px 8px rgba(98.89, 98.89, 98.89, 0.3);
  }

  .button:active {
    transform: translateY(0);
    box-shadow: 0px 2px 4px rgba(98.89, 98.89, 98.89, 0.2);
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
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .x:hover {
    transform: scale(1.1);
    opacity: 0.7;
  }

  .x:active {
    transform: scale(0.95);
    opacity: 0.5;
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
    flex: 1 1 0;
    padding: 12px;
    background: #eef6ff;
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .notification:hover {
    background: #d6ebff;
    transform: scale(1.05);
  }

  .notification:active {
    transform: scale(0.98);
    background: #c2e0ff;
  }

  .notification_01 {
    flex: 1 1 0;
    padding: 12px;
    background: #eef6ff;
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .notification_01:hover {
    background: #d6ebff;
    transform: scale(1.05);
  }

  .notification_01:active {
    transform: scale(0.98);
    background: #c2e0ff;
  }

  .notification_02 {
    flex: 1 1 0;
    padding: 12px;
    background: #eef6ff;
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .notification_02:hover {
    background: #d6ebff;
    transform: scale(1.05);
  }

  .notification_02:active {
    transform: scale(0.98);
    background: #c2e0ff;
  }

  .notification_03 {
    flex: 1 1 0;
    padding: 12px;
    background: #eef6ff;
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .notification_03:hover {
    background: #d6ebff;
    transform: scale(1.05);
  }

  .notification_03:active {
    transform: scale(0.98);
    background: #c2e0ff;
  }

  .notification_04 {
    flex: 1 1 0;
    padding: 12px;
    background: #eef6ff;
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .notification_04:hover {
    background: #d6ebff;
    transform: scale(1.05);
  }

  .notification_04:active {
    transform: scale(0.98);
    background: #c2e0ff;
  }

  .notification_05 {
    flex: 1 1 0;
    padding: 12px;
    background: #eef6ff;
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .notification_05:hover {
    background: #d6ebff;
    transform: scale(1.05);
  }

  .notification_05:active {
    transform: scale(0.98);
    background: #c2e0ff;
  }

  .notification_06 {
    flex: 1 1 0;
    padding: 12px;
    background: #eef6ff;
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .notification_06:hover {
    background: #d6ebff;
    transform: scale(1.05);
  }

  .notification_06:active {
    transform: scale(0.98);
    background: #c2e0ff;
  }

  .button_01 {
    flex: 1 1 0;
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
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .button_01:hover {
    background: #3a7ae4;
    transform: translateY(-1px);
    box-shadow: 0px 4px 8px rgba(67, 139, 255, 0.4);
  }

  .button_01:active {
    background: #2e6bc7;
    transform: translateY(0);
    box-shadow: 0px 2px 4px rgba(67, 139, 255, 0.3);
  }

  .frame-1410103845 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
    display: flex;
  }

  .frame-1410103962 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
    display: inline-flex;
  }

  .frame-1410103841 {
    flex: 1 1 0;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .frame-1410103904 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
    display: flex;
  }

  .frame-1410103905 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
  }

  .pop-up {
    width: 100%;
    padding-top: 24px;
    padding-bottom: 16px;
    padding-left: 16px;
    padding-right: 16px;
    position: relative;
    background: white;
    border-radius: 20px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 32px;
    max-height: 90vh;
    overflow: auto;
    display: inline-flex;
  }
</style>
