<script lang="ts">
  import green_check from "../../../assets/green_check.svg";
  import copy from "../../../assets/Copy.svg";
  import clock from "../../../assets/ClockCountdown.svg";
  import envelope from "../../../assets/Envelope.svg";
  import arrow_left from "../../../assets/ArrowLeft.svg";
  import { giftCreation } from "../../../lib/stores/giftCreation";
  import { createGift } from "../../../lib/database/gifts";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { user, authLoading, isAuthenticated } from "../../../lib/stores/auth";
  import { browser } from "$app/environment";

  let isLoading = false;
  let giftState: any = {};

  // Reactive statements for auth state
  $: currentUser = $user;
  $: loading = $authLoading;
  $: authenticated = $isAuthenticated;
  $: userId = currentUser?.id;
  
  // Additional safety check for SSR
  $: safeToRedirect = browser && !loading && currentUser !== undefined;

  // Subscribe to gift creation state
  onMount(() => {
    // Only run on client side
    if (browser) {
      // Add a small delay to ensure auth state is fully loaded
      setTimeout(() => {
        if (safeToRedirect && !authenticated) {
          goto('/login');
          return;
        }
      }, 100);
    }

    const unsubscribe = giftCreation.subscribe(state => {
      giftState = state;
    });
    
    return unsubscribe;
  });

  // Reactive redirect when auth state changes (client-side only)
  $: if (safeToRedirect && !authenticated) {
    // Only redirect if we're sure about the auth state
    goto('/login');
  }

  // Format delivery time for display
  const formatDeliveryTime = (deliveryOption: string, deliveryTime: string) => {
    if (deliveryOption === 'surprise') {
      return 'Surprise delivery (immediate)';
    } else if (deliveryOption === 'scheduled' && deliveryTime) {
      const date = new Date(deliveryTime);
      const dateStr = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const timeStr = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      return `${dateStr} at ${timeStr}`;
    }
    return deliveryTime || 'Not specified';
  };

  const handleBack = () => {
    // Navigate back to review page
    goto("/gift/review");
  };

  const handleFinish = async () => {
    if (isLoading) return;
    
    try {
      isLoading = true;
      
      // Convert gift state to gift object
      const giftData = giftCreation.toGiftObject(giftState);
      
      // Save gift to database
      const result = await createGift(giftData);
      
      if (result.success) {
        // Store the gift ID
        giftCreation.setGiftId(result.data.id);
        
        console.log('Gift saved successfully:', result.data);
        
        // Navigate to dashboard or success page
        goto('/dashboard');
      } else {
        console.error('Failed to save gift:', result.error);
        alert('Failed to save gift. Please try again.');
      }
    } catch (error) {
      console.error('Error saving gift:', error);
      alert('An error occurred while saving the gift. Please try again.');
    } finally {
      isLoading = false;
    }
  };
</script>

<div class="gift-confirmation">
  <div class="navbar">
    <div class="logo-text-full">
      <div class="logo-img"></div>
    </div>
  </div>

  <!-- Mobile Back Button -->
  <div class="mobile-back-button">
    <div
      class="mobile-back-btn"
      role="button"
      tabindex="0"
      on:click={handleBack}
      on:keydown={(e) => e.key === "Enter" && handleBack()}
    >
      <img class="arrow-left-icon" src={arrow_left} alt="back" />
    </div>
    <span class="back-text">Back</span>
  </div>

  <div class="frame-1410103818">
    <div class="frame-5">
      <img src={green_check} alt="green_check" />
      <div class="frame-1">
        <div class="heading">
          <div class="gift-purchased-successfully">
            <span class="giftpurchasedsuccessfully_span"
              >Gift Purchased Successfully!</span
            >
          </div>
          <div class="your-special-gift-is-on-its-way-to-emma">
            <span class="yourspecialgiftisonitswaytoemma_span">
              Your special gift is on its way to {giftState.childName || 'the child'}
            </span>
          </div>
        </div>
      </div>
    </div>
    <div class="frame-1410104130">
      <div class="gift-confirmation_01">
        <span class="giftconfirmation_01_span">Gift Confirmation</span>
      </div>
      <div class="frame-10">
        <div class="information-transaction">
          <span class="informationtransaction_span"
            >Information Transaction</span
          >
        </div>
        <div class="frame-1410104126">
          <div class="frame-1410104141">
            <div class="frame-1410104139">
              <div class="frame-1410104124">
                <div><span class="recipient_span">Recipient:</span></div>
                <div><span class="emmaage5-7_span">
                  {giftState.childName || 'Not specified'} 
                  {#if giftState.ageGroup}
                    (Age {giftState.ageGroup})
                  {/if}
                </span></div>
              </div>
              <div class="frame-1410104125">
                <div><span class="sentto_span">Sent To</span></div>
                <div class="frame-1410104142">
                  <div>
                    <span class="examplegrowtopiacom_span">
                      {giftState.deliveryEmail || 'No email specified'}
                    </span>
                  </div>
                  <div 
                    class="copy"
                    role="button"
                    tabindex="0"
                    on:click={() => navigator.clipboard.writeText(giftState.deliveryEmail || '')}
                    on:keydown={(e) => e.key === "Enter" && navigator.clipboard.writeText(giftState.deliveryEmail || '')}
                  >
                    <img src={copy} alt="copy" />
                  </div>
                </div>
              </div>
            </div>
            <div class="frame-1410104140">
              <div class="frame-1410104125_01">
                <div><span class="occasion_span">Occasion:</span></div>
                <div><span class="birthday_span">{giftState.occasion || 'Not specified'}</span></div>
              </div>
              <div class="frame-1410104124_01">
                <div>
                  <span class="deliveryoption_span">Delivery Option</span>
                </div>
                <div><span class="march152024_span">
                  {formatDeliveryTime(giftState.deliveryOption, giftState.deliveryTime)}
                </span></div>
              </div>
            </div>
          </div>
          <div class="frame-1410104145">
            <div class="frame-1410104143">
              <div class="your-special-message">
                <span class="yourspecialmessage_span">Your special message</span
                >
              </div>
              <div>
                <span class="happybirthdayemmalovegrandma_span">
                  "{giftState.specialMsg || 'No special message'}"
                </span>
              </div>
            </div>
            <div class="frame-1410104124_02">
              <div><span class="amountpaid_span">Amount Paid</span></div>
              <div><span class="f99_span">$9.99</span></div>
            </div>
          </div>
        </div>
      </div>
      <div class="frame-1410104037">
        <div class="frame-1410104122">
          <img src={clock} alt="clock" />
          <div class="frame-1410104123">
            <div class="waiting-for-emma-to-create-her-story">
              <span class="waitingforemmatocreateherstory_span">
                Waiting for {giftState.childName || 'the child'} to create their story
              </span>
            </div>
            <div class="an-invitation-email-has-been-sent-to-emmamomemailcom">
              <span class="aninvitationemailhasbeensenttoemmamomemailcom_span">
                An invitation email has been sent to {giftState.deliveryEmail || 'the specified email'}
              </span>
            </div>
          </div>
        </div>
        <div class="tag">
          <div><span class="pending_span">Pending</span></div>
        </div>
      </div>
      <div class="frame-1410104038">
        <div class="track-your-gift">
          <span class="trackyourgift_span">Track Your Gift</span>
        </div>
        <div class="frame-1410104126_01">
          <div class="frame-1410104143_01">
            <div class="share-this-link-to-track-the-story-creation-progress">
              <span class="sharethislinktotrackthestorycreationprogress_span"
                >Share this link to track the story creation progress</span
              >
            </div>
            <div class="frame-1410104148">
              <div class="frame-1410104146">
                <div>
                  <span class="httpsdrawtopiacomgift_24125_span"
                    >https:drawtopia.com/gift_24125</span
                  >
                </div>
              </div>
              <div class="frame-1410104147">
                <div class="copy_01">
                  <img src={copy} alt="copy" />
                </div>
              </div>
            </div>
          </div>
          <div class="notification">
            <div class="envelope">
              <img src={envelope} alt="envelope" />
            </div>
            <div>
              <span class="emailtrackinglink_span">Email Tracking Link</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="frame-1410104113">
      <div class="frame-1410103991">
        <div 
          class="button" 
          class:loading={isLoading}
          role="button"
          tabindex="0"
          on:click={handleFinish}
          on:keydown={(e) => e.key === "Enter" && handleFinish()}
        >
          <div class="finish">
            <span class="finish_span">
              {#if isLoading}
                Saving Gift...
              {:else}
                Finish
              {/if}
            </span>
          </div>
        </div>
      </div>
      <div 
        class="button_01"
        role="button"
        tabindex="0"
        on:click={handleBack}
        on:keydown={(e) => e.key === "Enter" && handleBack()}
      >
        <div class="arrowleft">
          <img src={arrow_left} alt="arrow_left" />
        </div>
        <div class="back"><span class="back_span">Back</span></div>
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

<style>
  .logo-img {
    background-image: url("../../../assets/logo.png");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    width: 100%;
    height: 100%;
  }
  .giftpurchasedsuccessfully_span {
    color: #121212;
    font-size: 48px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 67.2px;
    word-wrap: break-word;
  }

  .gift-purchased-successfully {
    align-self: stretch;
    text-align: center;
  }

  .yourspecialgiftisonitswaytoemma_span {
    color: #666d80;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 21.6px;
    word-wrap: break-word;
  }

  .your-special-gift-is-on-its-way-to-emma {
    align-self: stretch;
    text-align: center;
  }

  .giftconfirmation_01_span {
    color: black;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .gift-confirmation_01 {
    align-self: stretch;
  }

  .informationtransaction_span {
    color: black;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .information-transaction {
    align-self: stretch;
  }

  .recipient_span {
    color: #666d80;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .emmaage5-7_span {
    color: black;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .sentto_span {
    color: #666d80;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .examplegrowtopiacom_span {
    color: black;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .occasion_span {
    color: #666d80;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .birthday_span {
    color: black;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .deliveryoption_span {
    color: #666d80;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .march152024_span {
    color: #141414;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .yourspecialmessage_span {
    color: #666d80;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .your-special-message {
    align-self: stretch;
  }

  .happybirthdayemmalovegrandma_span {
    color: #141414;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .amountpaid_span {
    color: #666d80;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .f99_span {
    color: #141414;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .waitingforemmatocreateherstory_span {
    color: black;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .waiting-for-emma-to-create-her-story {
    align-self: stretch;
  }

  .aninvitationemailhasbeensenttoemmamomemailcom_span {
    color: #666d80;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .an-invitation-email-has-been-sent-to-emmamomemailcom {
    align-self: stretch;
  }

  .pending_span {
    color: #ffbe4c;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .trackyourgift_span {
    color: black;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .track-your-gift {
    align-self: stretch;
  }

  .sharethislinktotrackthestorycreationprogress_span {
    color: #666d80;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .share-this-link-to-track-the-story-creation-progress {
    align-self: stretch;
  }

  .httpsdrawtopiacomgift_24125_span {
    color: #141414;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .emailtrackinglink_span {
    color: #141414;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .finish_span {
    color: white;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .finish {
    text-align: center;
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

  .heading {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 16px;
    display: flex;
  }

  .frame-1410104124 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .frame-1410104125_01 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .frame-1410104124_01 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .frame-1410104143 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: inline-flex;
  }

  .frame-1410104124_02 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: inline-flex;
  }

  .frame-1410104123 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: inline-flex;
  }

  .tag {
    padding-left: 12px;
    padding-right: 12px;
    padding-top: 8px;
    padding-bottom: 8px;
    background: #fff6e0;
    border-radius: 12px;
    outline: 1px #ffbe4c solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .frame-1410104146 {
    flex: 1 1 0;
    padding: 8px;
    background: #f8fafb;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .button {
    align-self: stretch;
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
    transition: all 0.2s ease;
    user-select: none;
    position: relative;
    overflow: hidden;
  }

  .button:hover:not(.loading) {
    background: #3a7ae4;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(67, 139, 255, 0.3);
  }

  .button:active:not(.loading) {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(67, 139, 255, 0.2);
    background: #2e6bc7;
  }

  .button:focus {
    outline: 2px solid #438bff;
    outline-offset: 2px;
  }

  .button.loading {
    opacity: 0.8;
    cursor: not-allowed;
    background: #6ba3ff;
  }

  .button.loading:hover {
    transform: none;
    box-shadow: none;
  }

  /* Ripple effect */
  /* .button::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transition: width 0.3s, height 0.3s;
    transform: translate(-50%, -50%);
  } */

  .button:active:not(.loading)::before {
    width: 300px;
    height: 300px;
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

  .copy {
    width: 16px;
    height: 16px;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s ease;
  }

  .copy:hover {
    background-color: #f0f7ff;
    transform: scale(1.1);
  }

  .copy:focus {
    outline: 2px solid #438bff;
    outline-offset: 2px;
    box-shadow: 0 0 0 3px rgba(67, 139, 255, 0.1);
  }

  .copy:active {
    transform: scale(0.95);
    background-color: #e6f3ff;
  }

  .copy_01 {
    width: 18px;
    height: 18px;
    position: relative;
    overflow: hidden;
  }

  .envelope {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
  }

  .arrowleft {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .frame-1 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 32px;
    display: flex;
  }

  .frame-1410104140 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
  }

  .frame-1410104145 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
  }

  .frame-1410103991 {
    align-self: stretch;
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

  .frame-1410104142 {
    justify-content: center;
    align-items: center;
    gap: 4px;
    display: inline-flex;
  }

  .frame-1410104122 {
    flex: 1 1 0;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .frame-1410104147 {
    padding: 8px;
    background: #f8fafb;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .notification {
    align-self: stretch;
    padding-left: 12px;
    padding-right: 12px;
    padding-top: 8px;
    padding-bottom: 8px;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .button_01 {
    align-self: stretch;
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
    display: inline-flex;
    cursor: pointer;
    transition: all 0.2s ease;
    user-select: none;
    background: white;
  }

  .button_01:hover {
    background: #f8fafb;
    transform: translateY(-1px);
    box-shadow: 0px 6px 8px rgba(98.89, 98.89, 98.89, 0.3);
    outline-color: #bbb;
  }

  .button_01:active {
    transform: translateY(1px);
    box-shadow: 0px 2px 4px rgba(98.89, 98.89, 98.89, 0.2);
    background: #f0f0f0;
  }

  .button_01:focus {
    outline: 2px solid #438bff;
    outline-offset: 2px;
  }

  .frame-5 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 24px;
    display: flex;
  }

  .frame-1410104125 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .frame-1410104037 {
    align-self: stretch;
    padding: 12px;
    border-radius: 10px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }

  .frame-1410104148 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 4px;
    display: inline-flex;
  }

  .frame-1410104113 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .frame-1410104139 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
  }

  .frame-1410104143_01 {
    width: 620px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .frame-1410104141 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
  }

  .frame-1410104126_01 {
    align-self: stretch;
    padding: 16px;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .frame-1410104126 {
    align-self: stretch;
    padding: 16px;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .frame-1410104038 {
    align-self: stretch;
    padding-left: 12px;
    padding-right: 12px;
    padding-top: 16px;
    padding-bottom: 16px;
    background: white;
    border-radius: 20px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .frame-10 {
    align-self: stretch;
    padding-left: 12px;
    padding-right: 12px;
    padding-top: 16px;
    padding-bottom: 16px;
    background: white;
    border-radius: 20px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .frame-1410104130 {
    align-self: stretch;
    padding-top: 24px;
    padding-bottom: 16px;
    padding-left: 12px;
    padding-right: 12px;
    background: white;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: flex;
  }

  .frame-1410103818 {
    width: 700px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 24px;
    display: flex;
  }

  .gift-confirmation {
    width: 100%;
    height: 100%;
    padding-top: 24px;
    padding-bottom: 80px;
    padding-left: 100px;
    padding-right: 100px;
    background: white;
    overflow: hidden;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 48px;
    display: inline-flex;
  }

  /* Mobile Back Button Styles */
  .mobile-back-button {
    display: none;
  }

  .mobile-back-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 8px;
    background: white;
    border-radius: 8px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    cursor: pointer;
    transition: background-color 0.2s;
    width: fit-content;
  }

  .mobile-back-btn:hover {
    background-color: #f8fafb;
  }

  .arrow-left-icon {
    width: 20px;
    height: 20px;
  }

  .back-text {
    color: #121212;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.4px;
  }

  /* Mobile responsive styles */
  @media (max-width: 800px) {
    .mobile-back-button {
      display: flex;
      width: 100%;
      margin-bottom: 16px;
      align-items: center;
      gap: 10px;
    }

    .gift-confirmation {
      padding-left: 16px;
      padding-right: 16px;
      padding-top: 16px;
      padding-bottom: 16px;
      gap: 24px;
      overflow: visible;
    }

    .frame-1410103818 {
      width: 100%;
      max-width: 700px;
      gap: 20px;
    }

    /* Main content sections mobile */
    .frame-1410104130 {
      padding: 16px;
      gap: 16px;
    }

    .frame-10 {
      padding: 16px;
      gap: 16px;
    }

    .frame-1410104037,
    .frame-1410104038 {
      padding: 16px;
      gap: 16px;
      display: block;
    }

    /* Information transaction mobile layout */
    .frame-1410104141 {
      flex-direction: column;
      gap: 16px;
    }

    .frame-1410104139,
    .frame-1410104140 {
      width: 100%;
      flex-direction: column;
      gap: 12px;
    }

    .frame-1410104124,
    .frame-1410104125,
    .frame-1410104125_01,
    .frame-1410104124_01,
    .frame-1410104124_02 {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
      height: auto;
    }

    .frame-1410104145 {
      flex-direction: column;
      gap: 16px;
    }

    .frame-1410104143,
    .frame-1410104143_01 {
      width: 100%;
    }

    /* Track your gift section mobile */
    .frame-1410104126_01 {
      flex-direction: column;
      gap: 16px;
    }

    .frame-1410104148 {
      /* flex-direction: column; */
      gap: 8px;
    }

    .frame-1410104146 {
      width: 100%;
      padding: 12px;
    }

    .frame-1410104147 {
      justify-content: center;
      align-self: stretch;
    }

    .notification {
      width: 100%;
      justify-content: center;
      padding: 12px 16px;
    }

    /* Status section mobile */
    .frame-1410104122 {
      width: 100%;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 12px;
    }

    .tag {
      width: 100%;
      justify-content: center;
      align-self: stretch;
    }

    /* Continue section mobile */
    .frame-1410104113 {
      width: 100%;
      gap: 16px;
    }

    .button {
      width: 100%;
      padding: 14px 20px;
    }

    .button_01 {
      display: none;
    }

    /* Typography adjustments for mobile */
    .giftpurchasedsuccessfully_span {
      font-size: 32px;
      line-height: 44.8px;
    }

    .yourspecialgiftisonitswaytoemma_span {
      font-size: 16px;
      line-height: 19.2px;
    }

    .giftconfirmation_01_span {
      font-size: 20px;
      line-height: 28px;
    }

    .informationtransaction_span,
    .trackyourgift_span {
      font-size: 16px;
      line-height: 22.4px;
    }

    .recipient_span,
    .sentto_span,
    .occasion_span,
    .deliveryoption_span,
    .yourspecialmessage_span,
    .amountpaid_span {
      font-size: 14px;
      line-height: 19.6px;
    }

    .emmaage5-7_span,
    .birthday_span,
    .march152024_span,
    .f99_span {
      font-size: 13px;
      line-height: 18.2px;
    }

    .examplegrowtopiacom_span,
    .happybirthdayemmalovegrandma_span {
      font-size: 12px;
      line-height: 16.8px;
    }

    .waitingforemmatocreateherstory_span {
      font-size: 16px;
      line-height: 22.4px;
    }

    .aninvitationemailhasbeensenttoemmamomemailcom_span {
      font-size: 12px;
      line-height: 16.8px;
    }

    .sharethislinktotrackthestorycreationprogress_span {
      font-size: 14px;
      line-height: 19.6px;
    }

    .httpsdrawtopiacomgift_24125_span {
      font-size: 12px;
      line-height: 16.8px;
    }

    .emailtrackinglink_span {
      font-size: 14px;
      line-height: 19.6px;
    }

    .pending_span {
      font-size: 12px;
      line-height: 16.8px;
    }

    .finish_span {
      font-size: 16px;
      line-height: 22.4px;
    }

    .contactushellodrawtopiacom_span,
    .privacypolicy_span,
    .termsofservice_span {
      font-size: 14px;
      line-height: 19.6px;
    }

    /* Layout adjustments */
    .frame-5 {
      gap: 20px;
      text-align: center;
    }

    .heading {
      gap: 12px;
    }

    .frame-1410103821 {
      gap: 8px;
      margin-top: 24px;
    }

    .frame-1410103820 {
      gap: 16px;
    }

    /* Green check icon mobile */
    .frame-5 img {
      width: 48px;
      height: 48px;
    }
    .frame-1410104123 {
      text-align: left;
    }
  }
</style>
