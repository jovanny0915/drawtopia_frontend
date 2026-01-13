<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import archive from "../assets/Archive.svg";
  import arrowsClockwise from "../assets/ArrowsClockwise.svg";
  import blueEye from "../assets/BlueEye.svg";
  import heart from "../assets/Heart.svg";
  import checkmark from "../assets/Check.svg";
  const dispatch = createEventDispatcher();

  export let gift: any;
  
  // Helper functions to safely get gift data with fallbacks
  $: sendTo = gift?.send_to || "Unknown";
  $: sentDate = gift?.created_at ? new Date(gift.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Unknown";
  $: deliveryDate = gift?.expectedDelivery || "Unknown";
  $: age = gift?.age || (gift?.ageGroup ? (() => {
    const match = gift.ageGroup.match(/(\d+)-(\d+)/);
    if (match) {
      const min = parseInt(match[1]);
      const max = parseInt(match[2]);
      return Math.floor((min + max) / 2);
    }
    return parseInt(gift.ageGroup.split("-")[0]) || 7;
  })() : 7);

  // Handle button clicks
  function handleResendLink() {
    dispatch('resendLink', { giftId: gift.id });
  }

  function handleViewGift() {
    dispatch('viewGift', { giftId: gift.id });
  }

  function handleViewBook() {
    dispatch('viewBook', { giftId: gift.id });
  }

  function handleSendThankYou() {
    dispatch('sendThankYou', { giftId: gift.id });
  }
</script>

<div class="card">
  <div class="frame-2147227628">
    <div class="frame-2147227626">
      <div class="frame-1410104153">
        <div class="frame-1410104161">
          <div class="frame-1410104152">
            <div class="gift-for-emma-age-7">
              <span class="giftforemmaage7_span">
                Gift for: {gift.childName || "Unknown"} (age {age})
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="rectangle-41"></div>
      
      <div class="frame-1410104158">
        <div class="frame-1410104124">
          <div>
            <span class="sendtoparentemailcom_span_01">Send To : </span>
            <span class="sendtoparentemailcom_span_02">{sendTo}</span>
          </div>
        </div>
        <div class="frame-1410104126">
          <div>
            <span class="occasionbirthday_span_01">Occasion: </span>
            <span class="occasionbirthday_span_02">{gift.occasion}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="frame-1410103869" class:completed={gift.notification_sent === true}>
      <div class="sub-menu">
        <div class="frame-2147227625">
          {#if gift.notification_sent === false}
            <div class="archive">
              <img src={archive} alt="Archive" />
            </div>
            <div class="link-sent-waiting-for-storybook-creation">
              <span class="linksentwaitingforstorybookcreation_span">
                Link sent, waiting for storybook creation
              </span>
            </div>
          {:else}
            <div class="check">
                <img src={checkmark} alt="Checkmark" />
            </div>
            <div class="book-created-delivered-oct-20">
              <span class="bookcreateddeliveredoct20_span">
                Book created! Delivered {deliveryDate}
              </span>
            </div>
          {/if}
        </div>
        <div class="sent-oct-15-2024">
          <span class="sentoct152024_span">Sent: {sentDate}</span>
        </div>
      </div>
    </div>
  </div>

  <div class="frame-1410104159">
    <div class="frame-1410104157">
      {#if gift.notification_sent === false}
        <div 
          class="button"
          on:click={handleResendLink}
          on:keydown={(e) => (e.key === "Enter" || e.key === " ") && handleResendLink()}
          role="button"
          tabindex="0"
        >
          <div class="ellipse-1415_01"></div>
          <div class="arrowsclockwise">
            <img src={arrowsClockwise} alt="Resend" />
          </div>
          <div class="resend-link">
            <span class="resendlink_span">Resend Link</span>
          </div>
        </div>
        
        <div 
          class="button_01"
          on:click={handleViewGift}
          on:keydown={(e) => (e.key === "Enter" || e.key === " ") && handleViewGift()}
          role="button"
          tabindex="0"
        >
          <div class="eye">
            <img src={blueEye} alt="View" class="blue-eye" />
          </div>
          <div class="view-gift">
            <span class="viewgift_span">View Gift</span>
          </div>
        </div>
      {:else}
        <div 
          class="button_02"
          on:click={handleViewBook}
          on:keydown={(e) => (e.key === "Enter" || e.key === " ") && handleViewBook()}
          role="button"
          tabindex="0"
        >
          <div class="eye_01">
              <img src={heart} alt="View Book" />
          </div>
          <div class="view-book">
            <span class="viewbook_span">View Book</span>
          </div>
        </div>
        
        <div 
          class="button_03"
          on:click={handleSendThankYou}
          on:keydown={(e) => (e.key === "Enter" || e.key === " ") && handleSendThankYou()}
          role="button"
          tabindex="0"
        >
          <div class="heart">
              <img src={heart} alt="Send Thank You" />
          </div>
          <div class="send-thank-you">
            <span class="sendthankyou_span">Send Thank You</span>
          </div>
          <div class="ellipse-1415_02"></div>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .giftforemmaage7_span {
    color: black;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 24px;
    word-wrap: break-word;
  }

  .gift-for-emma-age-7 {
    width: 295px;
  }

  .rectangle-41 {
    align-self: stretch;
    height: 1px;
    background: #EDEDED;
  }

  .sendtoparentemailcom_span_01 {
    color: #727272;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .sendtoparentemailcom_span_02 {
    color: #141414;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .occasionbirthday_span_01 {
    color: #727272;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .occasionbirthday_span_02 {
    color: #141414;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .vector_03 {
    width: 14.50px;
    height: 10.50px;
    left: 0.75px;
    top: 2.75px;
    position: absolute;
    background: #966422;
  }

  .linksentwaitingforstorybookcreation_span {
    color: #966422;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 19.60px;
    word-wrap: break-word;
  }

  .link-sent-waiting-for-storybook-creation {
    text-align: center;
  }

  .sentoct152024_span {
    color: #966422;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 19.60px;
    word-wrap: break-word;
  }

  .sent-oct-15-2024 {
    text-align: center;
  }

  .ellipse-1415_01 {
    width: 248px;
    height: 114px;
    left: -42px;
    top: 10px;
    position: absolute;
    background: radial-gradient(ellipse 42.11% 42.11% at 50.00% 52.94%, white 0%, rgba(255, 255, 255, 0) 100%);
    border-radius: 9999px;
  }

  .vector_04 {
    width: 12px;
    height: 11.76px;
    left: 2px;
    top: 2.12px;
    position: absolute;
    background: white;
  }

  .resendlink_span {
    color: white;
    font-size: 14px;
    font-family: DM Sans;
    font-weight: 600;
    line-height: 19.60px;
    word-wrap: break-word;
  }

  .resend-link {
    text-align: center;
  }

  .blue-eye {
    width: 100%;
  }

  .viewgift_span {
    color: #438BFF;
    font-size: 14px;
    font-family: DM Sans;
    font-weight: 600;
    line-height: 19.60px;
    word-wrap: break-word;
  }

  .view-gift {
    text-align: center;
  }

  .vector_06 {
    width: 12.50px;
    height: 9px;
    left: 2px;
    top: 4px;
    position: absolute;
    background: black;
  }

  .bookcreateddeliveredoct20_span {
    color: #28806F;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 19.60px;
    word-wrap: break-word;
  }

  .book-created-delivered-oct-20 {
    text-align: center;
  }

  .vector_07 {
    width: 15px;
    height: 10px;
    left: 0.50px;
    top: 3px;
    position: absolute;
    background: #438BFF;
  }

  .viewbook_span {
    color: #438BFF;
    font-size: 14px;
    font-family: DM Sans;
    font-weight: 600;
    line-height: 19.60px;
    word-wrap: break-word;
  }

  .view-book {
    text-align: center;
  }

  .vector_08 {
    width: 14px;
    height: 12px;
    left: 1px;
    top: 2.50px;
    position: absolute;
    background: white;
  }

  .sendthankyou_span {
    color: white;
    font-size: 14px;
    font-family: DM Sans;
    font-weight: 600;
    line-height: 19.60px;
    word-wrap: break-word;
  }

  .send-thank-you {
    text-align: center;
  }

  .ellipse-1415_02 {
    width: 248px;
    height: 114px;
    left: -42px;
    top: 12px;
    position: absolute;
    background: radial-gradient(ellipse 42.11% 42.11% at 50.00% 52.94%, white 0%, rgba(255, 255, 255, 0) 100%);
    border-radius: 9999px;
  }

  .frame-1410104152 {
    width: 84px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 2px;
    display: inline-flex;
  }

  .frame-1410104124 {
    align-self: stretch;
    height: 38px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .frame-1410104126 {
    height: 38px;
    justify-content: flex-start;
    align-items: center;
    gap: 188px;
    display: inline-flex;
  }

  .archive {
    width: 16px;
    height: 16px;
    position: relative;
    overflow: hidden;
  }

  .arrowsclockwise {
    width: 16px;
    height: 16px;
    position: relative;
    overflow: hidden;
    filter: brightness(255) saturate(100%);
  }

  .eye {
    width: 16px;
    height: 16px;
    position: relative;
    overflow: hidden;
  }

  .check {
    width: 16px;
    height: 16px;
    position: relative;
    overflow: hidden;
  }

  .frame-1410103869.completed .check img {
    filter: brightness(0) saturate(100%) invert(40%) sepia(26%) saturate(1547%) hue-rotate(124deg) brightness(91%) contrast(88%);
  }

  .eye_01 {
    width: 16px;
    height: 16px;
    position: relative;
    overflow: hidden;
    filter: brightness(0) saturate(100%) invert(40%) sepia(26%) saturate(1547%) hue-rotate(124deg) brightness(91%) contrast(88%);
  }

  .heart {
    width: 16px;
    height: 16px;
    position: relative;
    overflow: hidden;
  }

  .frame-1410104161 {
    width: 208.17px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .frame-1410104158 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    display: flex;
  }

  .frame-2147227625 {
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: inline-flex;
  }

  .button {
    flex: 1 1 0;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 12px;
    padding-bottom: 12px;
    position: relative;
    background: #438BFF;
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .button:hover {
    background: #3a7ae4;
  }

  .button:active {
    background: #1e3bc7;
  }

  .button_01 {
    flex: 1 1 0;
    height: 41px;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 12px;
    padding-bottom: 12px;
    background: #E7FEFF;
    box-shadow: 0px 4px 0px #438BFF;
    border-radius: 12px;
    outline: 2px rgba(231, 254, 255, 0.20) solid;
    outline-offset: -2px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .button_01:active {
    background: #d1f7f8;
    transform: translateY(1px);
    box-shadow: 0px 3px 0px #438BFF;
  }

  .button_02 {
    flex: 1 1 0;
    height: 41px;
    padding-left: 12px;
    padding-right: 12px;
    padding-top: 12px;
    padding-bottom: 12px;
    background: #E7FEFF;
    box-shadow: 0px 4px 0px #438BFF;
    border-radius: 12px;
    outline: 2px rgba(231, 254, 255, 0.20) solid;
    outline-offset: -2px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .button_02:active {
    background: #d1f7f8;
    transform: translateY(1px);
    box-shadow: 0px 3px 0px #438BFF;
  }

  .button_03 {
    flex: 1 1 0;
    padding-left: 12px;
    padding-right: 12px;
    padding-top: 12px;
    padding-bottom: 12px;
    position: relative;
    background: #438BFF;
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    gap: 4px;
    display: flex;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .button_03:hover {
    background: #3a7ae4;
  }

  .button_03:active {
    background: #1e3bc7;
  }

  .frame-1410104153 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 9px;
    display: inline-flex;
  }

  .sub-menu {
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 2px;
    display: inline-flex;
  }

  .frame-1410104157 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 10px;
    display: inline-flex;
  }

  .frame-2147227626 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .frame-1410103869 {
    align-self: stretch;
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 12px;
    padding-right: 12px;
    background: #FFF6E0;
    border-radius: 12px;
    outline: 1px #FFBE4C solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 4px;
    display: inline-flex;
  }

  .frame-1410103869.completed {
    background: #EFFEFA;
    outline: 1px #40C4AA solid;
  }

  .frame-1410103869.completed .bookcreateddeliveredoct20_span,
  .frame-1410103869.completed .sentoct152024_span {
    color: #28806F;
  }

  .frame-1410104159 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 10px;
    display: flex;
  }

  .frame-2147227628 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: flex;
  }

  .card {
    align-self: stretch;
    padding: 12px;
    background: white;
    border-radius: 16px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 32px;
    display: flex;
  }
</style>
