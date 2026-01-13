<script lang="ts">
  import arrow_left from "../../../assets/ArrowLeft.svg";
  import arrowsquareout from "../../../assets/ArrowSquareOut.svg";
  import sealcheck from "../../../assets/SealCheck_green.svg";
  import { giftCreation } from "../../../lib/stores/giftCreation";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { user, authLoading, isAuthenticated } from "../../../lib/stores/auth";
  import { browser } from "$app/environment";

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

  const handleBack = () => {
    // Navigate back to step 3
    goto("/gift/sendlink/7");
  };

  const handlePurchase = () => {
    // Navigate to purchase page
    goto("/gift/purchase");
  };

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
</script>

<div class="review-purchase">
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
      <div class="frame-1">
        <div class="heading">
          <div class="review-your-gift">
            <span class="reviewyourgift_span">Review Your Gift</span>
          </div>
          <div
            class="please-review-all-details-before-completing-your-purchase"
          >
            <span
              class="pleasereviewalldetailsbeforecompletingyourpurchase_span"
              >Please review all details before completing your purchase</span
            >
          </div>
        </div>
      </div>
    </div>
    <div class="frame-1410104130">
      <div class="detail-gift">
        <span class="detailgift_span">Detail Gift</span>
      </div>
      <div class="frame-10">
        <div class="gift-summary">
          <span class="giftsummary_span">Gift Summary</span>
        </div>
        <div class="frame-1410104126">
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
            <div><span class="occasion_span">Occasion:</span></div>
            <div><span class="birthday_span">{giftState.occasion || 'Not specified'}</span></div>
          </div>
          <div class="frame-1410104128">
            <div><span class="message_span">Message:</span></div>
            <div class="this-is-present-give-to-you-i-hope-you-like-it">
              <span class="thisispresentgivetoyouihopeyoulikeit_span">
                "{giftState.specialMsg || 'No special message'}"
              </span>
            </div>
          </div>
          <div class="frame-1410104126_01">
            <div><span class="delivery_span">Delivery:</span></div>
            <div class="frame-1410104127">
              <div class="july-31st-2025-to-drawtopiaexamplecom">
                <span class="july31st2025todrawtopiaexamplecom_span_01">
                  {formatDeliveryTime(giftState.deliveryOption, giftState.deliveryTime)}<br />
                </span>
                <span class="july31st2025todrawtopiaexamplecom_span_02">
                  to {giftState.deliveryEmail || 'No email specified'}
                </span>
              </div>
            </div>
          </div>
          <div class="rectangle-40"></div>
          <div class="frame-1410104127_01">
            <div><span class="total_span">Total:</span></div>
            <div class="frame-1410104127_02">
              <div class="text-999"><span class="f99_span">$9.99</span></div>
            </div>
          </div>
        </div>
        <div class="frame-1410104131">
          <div class="checkbox">
            <div class="square"></div>
          </div>
          <div class="frame-1410104132">
            <div class="include-gift-receipt">
              <span class="includegiftreceipt_span">Include gift receipt</span>
            </div>
            <div
              class="send-a-receipt-to-the-recipients-parentguardian-price-will-be-hidden"
            >
              <span
                class="sendareceipttotherecipientsparentguardianpricewillbehidden_span"
                >Send a receipt to the recipient's parent/guardian (price will
                be hidden)</span
              >
            </div>
          </div>
        </div>
      </div>
      <div class="frame-1410104138">
        <div class="frame-1410104132_01">
                   <div class="frame-1410104137">
             <div>
               <span class="paymentinformation_span">Payment Information</span>
             </div>
             <div class="button desktop-stripe-button">
               <img src={arrowsquareout} alt="arrowsquareout" />
               <div class="manage-on-stripe">
                 <span class="manageonstripe_span">Manage on Stripe</span>
               </div>
             </div>
           </div>
           <div class="mobile-stripe-button">
             <img src={arrowsquareout} alt="arrowsquareout" />
             <div class="manage-on-stripe">
               <span class="manageonstripe_span">Manage on Stripe</span>
             </div>
           </div>
          <div class="stroke"></div>
          <div class="form">
            <div class="card-number">
              <span class="cardnumber_span">Card Number</span>
            </div>
            <div class="input-placeholder" role="button" tabindex="0">
              <div><span class="f242_span">•••• •••• •••• 4242</span></div>
            </div>
          </div>
          <div class="frame-1410104133">
            <div class="form_01">
              <div class="expiry-date">
                <span class="expirydate_span">Expiry Date</span>
              </div>
              <div class="input-placeholder_01" role="button" tabindex="0">
                <div><span class="f228_span">12/28</span></div>
              </div>
            </div>
            <div class="form_02">
              <div class="cvc"><span class="cvc_span">CVC</span></div>
              <div class="input-placeholder_02" role="button" tabindex="0">
                <div><span class="fspan">•••</span></div>
              </div>
            </div>
          </div>
          <div class="form_03">
            <div class="billing-name">
              <span class="billingname_span">Billing Name</span>
            </div>
            <div class="input-placeholder_03" role="button" tabindex="0">
              <div><span class="johndoe_span">John Doe</span></div>
            </div>
          </div>
          <div class="frame-1410104035">
            <div class="sealcheck">
              <img src={sealcheck} alt="sealcheck" />
            </div>
            <div class="frame-1410104050">
              <div class="secured-by-stripe">
                <span class="securedbystripe_span">Secured by Stripe</span>
              </div>
            </div>
          </div>
        </div>
        <div class="frame-1410104135">
          <div class="checkbox_01">
            <div class="square_01"></div>
          </div>
          <div class="frame-1410104136">
            <div>
              <span class="iagreetothegiftpurchaseterms_span"
                >I agree to the Gift Purchase Terms</span
              >
            </div>
            <div
              class="text--gift-stories-are-non-refundable-once-the-creation-link-is-sent-recipients-have-30-days-to-create-their-story-after-receiving-the-invitation-if-unused-gift-can-be-transferred-to-another-child-with-same-age-group-you-will-be-notified-when-the-story-creation-begins-and-completes-both-you-and-the-recipient-will-receive-the-final-digital-storybook"
            >
              <span
                class="giftstoriesarenon-refundableoncethecreationlinkissentrecipientshave30daystocreatetheirstoryafterreceivingtheinvitationifunusedgiftcanbetransferredtoanotherchildwithsameagegroupyouwillbenotifiedwhenthestorycreationbeginsandcompletesbothyouandtherecipientwillreceivethefinaldigitalstorybook_span"
                >• Gift stories are non-refundable once the creation link is
                sent<br />• Recipients have 30 days to create their story after
                receiving the invitation<br />• If unused, gift can be
                transferred to another child with same age group<br />• You will
                be notified when the story creation begins and completes<br />•
                Both you and the recipient will receive the final digital
                storybook</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="frame-1410104113">
      <div class="frame-1410103991">
        <div 
          class="button_01"
          role="button"
          tabindex="0"
          on:click={handlePurchase}
          on:keydown={(e) => e.key === "Enter" && handlePurchase()}
        >
          <div class="purchase-gift-story">
            <span class="purchasegiftstory_span">Purchase Gift Story</span>
          </div>
        </div>
      </div>
      <div
        class="button_02"
        role="button"
        tabindex="0"
        on:click={handleBack}
        on:keydown={(e) => e.key === "Enter" && handleBack()}
      >
        <img src={arrow_left} alt="arrow left" class="arrowleft" />
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

  .reviewyourgift_span {
    color: #121212;
    font-size: 48px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 67.2px;
    word-wrap: break-word;
  }

  .review-your-gift {
    align-self: stretch;
    text-align: center;
  }

  .pleasereviewalldetailsbeforecompletingyourpurchase_span {
    color: #666d80;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 21.6px;
    word-wrap: break-word;
  }

  .please-review-all-details-before-completing-your-purchase {
    align-self: stretch;
    text-align: center;
  }

  .detailgift_span {
    color: black;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .detail-gift {
    align-self: stretch;
  }

  .giftsummary_span {
    color: black;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .gift-summary {
    align-self: stretch;
  }

  .recipient_span {
    color: #666d80;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
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

  .occasion_span {
    color: #666d80;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
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

  .message_span {
    color: #666d80;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .thisispresentgivetoyouihopeyoulikeit_span {
    color: #141414;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .this-is-present-give-to-you-i-hope-you-like-it {
    text-align: right;
  }

  .delivery_span {
    color: #666d80;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .july31st2025todrawtopiaexamplecom_span_01 {
    color: black;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .july31st2025todrawtopiaexamplecom_span_02 {
    color: #666d80;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .july-31st-2025-to-drawtopiaexamplecom {
    text-align: right;
  }

  .rectangle-40 {
    align-self: stretch;
    height: 1px;
    border: 1px #dfe1e7 solid;
  }

  .total_span {
    color: black;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .f99_span {
    color: black;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28px;
    word-wrap: break-word;
  }

  .text-999 {
    text-align: right;
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
  }

  .includegiftreceipt_span {
    color: black;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .include-gift-receipt {
    align-self: stretch;
  }

  .sendareceipttotherecipientsparentguardianpricewillbehidden_span {
    color: black;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .send-a-receipt-to-the-recipients-parentguardian-price-will-be-hidden {
    align-self: stretch;
  }

  .paymentinformation_span {
    color: black;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .manageonstripe_span {
    color: #438bff;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .manage-on-stripe {
    text-align: center;
  }

  .stroke {
    align-self: stretch;
    height: 1px;
    background: #d9d9d9;
  }

  .cardnumber_span {
    color: #141414;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .card-number {
    align-self: stretch;
  }

  .f242_span {
    color: #141414;
    font-size: 16px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .expirydate_span {
    color: #141414;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .expiry-date {
    align-self: stretch;
  }

  .f228_span {
    color: #141414;
    font-size: 16px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .cvc_span {
    color: #141414;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .cvc {
    align-self: stretch;
  }

  .fspan {
    color: #141414;
    font-size: 16px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .billingname_span {
    color: #141414;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .billing-name {
    align-self: stretch;
  }

  .johndoe_span {
    color: #141414;
    font-size: 16px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .securedbystripe_span {
    color: #40c4aa;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .secured-by-stripe {
    text-align: center;
  }

  .square_01 {
    width: 20px;
    height: 20px;
    left: 0px;
    top: 0px;
    position: absolute;
    background: white;
    border-radius: 6px;
    border: 1px #dfe1e7 solid;
  }

  .iagreetothegiftpurchaseterms_span {
    color: black;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .giftstoriesarenon-refundableoncethecreationlinkissentrecipientshave30daystocreatetheirstoryafterreceivingtheinvitationifunusedgiftcanbetransferredtoanotherchildwithsameagegroupyouwillbenotifiedwhenthestorycreationbeginsandcompletesbothyouandtherecipientwillreceivethefinaldigitalstorybook_span {
    color: black;
    font-size: 12px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 16.8px;
    word-wrap: break-word;
  }

  .text--gift-stories-are-non-refundable-once-the-creation-link-is-sent-recipients-have-30-days-to-create-their-story-after-receiving-the-invitation-if-unused-gift-can-be-transferred-to-another-child-with-same-age-group-you-will-be-notified-when-the-story-creation-begins-and-completes-both-you-and-the-recipient-will-receive-the-final-digital-storybook {
    align-self: stretch;
  }

  .purchasegiftstory_span {
    color: white;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .purchase-gift-story {
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
    height: 38px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .frame-1410104125 {
    align-self: stretch;
    height: 38px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .frame-1410104128 {
    align-self: stretch;
    height: 38px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .frame-1410104127 {
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 1px;
    display: inline-flex;
  }

  .frame-1410104127_02 {
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 1px;
    display: inline-flex;
  }

  .frame-1410104132 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: inline-flex;
  }

  .input-placeholder {
    align-self: stretch;
    height: 50px;
    padding-left: 10px;
    padding-right: 10px;
    padding-top: 4px;
    padding-bottom: 4px;
    background: white;
    overflow: hidden;
    border-radius: 12px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    display: inline-flex;
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .input-placeholder:hover {
    outline: 1px #438bff solid;
    box-shadow: 0 0 0 2px rgba(67, 139, 255, 0.1);
  }

  .input-placeholder:focus {
    outline: 2px solid #438bff;
    outline-offset: -2px;
    box-shadow: 0 0 0 3px rgba(67, 139, 255, 0.1);
    transform: translateY(-1px);
  }

  .input-placeholder_01 {
    align-self: stretch;
    height: 50px;
    padding-left: 10px;
    padding-right: 10px;
    padding-top: 4px;
    padding-bottom: 4px;
    background: white;
    overflow: hidden;
    border-radius: 12px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    display: inline-flex;
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .input-placeholder_01:hover {
    outline: 1px #438bff solid;
    box-shadow: 0 0 0 2px rgba(67, 139, 255, 0.1);
  }

  .input-placeholder_01:focus {
    outline: 2px solid #438bff;
    outline-offset: -2px;
    box-shadow: 0 0 0 3px rgba(67, 139, 255, 0.1);
    transform: translateY(-1px);
  }

  .input-placeholder_02 {
    align-self: stretch;
    height: 50px;
    padding-left: 10px;
    padding-right: 10px;
    padding-top: 4px;
    padding-bottom: 4px;
    background: white;
    overflow: hidden;
    border-radius: 12px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    display: inline-flex;
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .input-placeholder_02:hover {
    outline: 1px #438bff solid;
    box-shadow: 0 0 0 2px rgba(67, 139, 255, 0.1);
  }

  .input-placeholder_02:focus {
    outline: 2px solid #438bff;
    outline-offset: -2px;
    box-shadow: 0 0 0 3px rgba(67, 139, 255, 0.1);
    transform: translateY(-1px);
  }

  .input-placeholder_03 {
    align-self: stretch;
    height: 50px;
    padding-left: 10px;
    padding-right: 10px;
    padding-top: 4px;
    padding-bottom: 4px;
    background: white;
    overflow: hidden;
    border-radius: 12px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    display: inline-flex;
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .input-placeholder_03:hover {
    outline: 1px #438bff solid;
    box-shadow: 0 0 0 2px rgba(67, 139, 255, 0.1);
  }

  .input-placeholder_03:focus {
    outline: 2px solid #438bff;
    outline-offset: -2px;
    box-shadow: 0 0 0 3px rgba(67, 139, 255, 0.1);
    transform: translateY(-1px);
  }

  .frame-1410104050 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 2px;
    display: inline-flex;
  }

  .frame-1410104136 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: inline-flex;
  }

  .button_01 {
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

  .button_01:hover {
    background: #3a7ae4;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(67, 139, 255, 0.3);
  }

  .button_01:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(67, 139, 255, 0.2);
    background: #2e6bc7;
  }

  .button_01:focus {
    outline: 2px solid #438bff;
    outline-offset: 2px;
  }

  /* Ripple effect */
  /* .button_01::before {
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

  .button_01:active::before {
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

  .checkbox {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
  }

  .sealcheck {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
  }

  .checkbox_01 {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
  }

  .arrowleft {
    width: 20px;
    height: 20px;
  }

  /* Make back button clickable */
  .button_02 {
    cursor: pointer;
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
  }

  .button_02:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .button_02:focus {
    outline: 2px solid #438bff;
    outline-offset: 2px;
  }

  .frame-1 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 32px;
    display: flex;
  }

  .frame-1410104126_01 {
    align-self: stretch;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .frame-1410104127_01 {
    align-self: stretch;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .form {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .form_01 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: inline-flex;
  }

  .form_02 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: inline-flex;
  }

  .form_03 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
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

  .frame-1410104131 {
    align-self: stretch;
    padding: 12px;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .button {
    padding-left: 16px;
    padding-right: 16px;
    padding-top: 6px;
    padding-bottom: 6px;
    border-radius: 20px;
    outline: 1px #438bff solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    cursor: pointer;
    transition: all 0.2s ease;
    user-select: none;
    background: white;
  }

  .button:hover {
    background: #f0f7ff;
    outline-color: #3a7ae4;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(67, 139, 255, 0.2);
  }

  .button:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(67, 139, 255, 0.1);
    background: #e6f3ff;
  }

  .button:focus {
    outline: 2px solid #438bff;
    outline-offset: 2px;
  }

  .frame-1410104035 {
    align-self: stretch;
    padding: 8px;
    background: #effefa;
    border-radius: 10px;
    outline: 1px #40c4aa solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .frame-1410104135 {
    align-self: stretch;
    padding: 8px;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
  }

  .button_02 {
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

  .button_02:hover {
    background: #f8fafb;
    transform: translateY(-1px);
    box-shadow: 0px 6px 8px rgba(98.89, 98.89, 98.89, 0.3);
    outline-color: #bbb;
  }

  .button_02:active {
    transform: translateY(1px);
    box-shadow: 0px 2px 4px rgba(98.89, 98.89, 98.89, 0.2);
    background: #f0f0f0;
  }

  .button_02:focus {
    outline: 2px solid #438bff;
    outline-offset: 2px;
  }

  .frame-5 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 48px;
    display: flex;
  }

  .frame-1410104126 {
    align-self: stretch;
    padding: 16px;
    background: #f8fafb;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .frame-1410104133 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
  }

  .frame-1410104137 {
    align-self: stretch;
    justify-content: space-between;
    align-items: center;
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

  .frame-10 {
    align-self: stretch;
    padding-left: 12px;
    padding-right: 12px;
    padding-top: 16px;
    padding-bottom: 16px;
    background: white;
    border-radius: 20px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .frame-1410104132_01 {
    align-self: stretch;
    padding-left: 12px;
    padding-right: 12px;
    padding-top: 16px;
    padding-bottom: 16px;
    background: white;
    border-radius: 20px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .frame-1410104138 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
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

     .review-purchase {
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

   /* Stripe Button Styles */
   .mobile-stripe-button {
     display: none;
   }

   .desktop-stripe-button {
     display: flex;
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

     .review-purchase {
       padding-left: 16px;
       padding-right: 16px;
       padding-top: 16px;
       padding-bottom: 16px;
       gap: 24px;
     }

     .frame-1410103818 {
       width: 100%;
       max-width: 700px;
     }

     .frame-1410104130 {
       padding: 16px;
       gap: 16px;
     }

     .frame-10 {
       padding: 12px;
       gap: 12px;
     }

     .frame-1410104132_01 {
       padding: 12px;
       gap: 12px;
     }

     /* Gift Summary Column Layout */
     .frame-1410104126 {
       padding: 12px;
       gap: 8px;
     }

     .frame-1410104124,
     .frame-1410104125,
     .frame-1410104128,
     .frame-1410104126_01 {
       flex-direction: column;
       align-items: flex-start;
       gap: 4px;
       height: auto;
     }

     .frame-1410104127_01 {
      flex-direction: row;
       align-items: flex-start;
       gap: 4px;
       height: auto;
     }

     .this-is-present-give-to-you-i-hope-you-like-it,
     .july-31st-2025-to-drawtopiaexamplecom,
     .text-999 {
       text-align: left;
     }

     /* Stripe Button Mobile */
     .desktop-stripe-button {
       display: none;
     }

     .mobile-stripe-button {
       display: flex;
       width: 100%;
       padding: 5px 16px;
       border-radius: 50vh;
       outline: 1px #438bff solid;
       outline-offset: -1px;
       justify-content: center;
       align-items: center;
       gap: 10px;
       margin-bottom: 12px;
       cursor: pointer;
       transition: background-color 0.2s;
     }

     .mobile-stripe-button:hover {
       background-color: #f8fafb;
     }

     .frame-1410104137 {
       flex-direction: column;
       align-items: flex-start;
       gap: 12px;
     }

     /* Hide bottom back button on mobile */
     .button_02 {
       display: none;
     }

     .reviewyourgift_span {
       font-size: 32px;
       line-height: 44.8px;
     }

     .pleasereviewalldetailsbeforecompletingyourpurchase_span {
       font-size: 16px;
       line-height: 19.2px;
     }

     .detailgift_span {
       font-size: 20px;
       line-height: 28px;
     }

     .frame-1410104126 {
       padding: 12px;
       gap: 8px;
     }

     .frame-1410104133 {
       flex-direction: column;
       gap: 12px;
     }

     .form_01,
     .form_02 {
       width: 100%;
     }

     .input-placeholder,
     .input-placeholder_01,
     .input-placeholder_02,
     .input-placeholder_03 {
       height: 45px;
       padding: 8px;
     }

     .input-placeholder:focus,
     .input-placeholder_01:focus,
     .input-placeholder_02:focus,
     .input-placeholder_03:focus {
       transform: translateY(-2px);
       box-shadow: 0 0 0 2px rgba(67, 139, 255, 0.15);
     }

     .button_01,
     .button_02 {
       width: 100%;
       padding: 14px 20px;
     }

     .frame-1410104113 {
       gap: 16px;
     }

     .frame-1410104131,
     .frame-1410104135 {
       padding: 10px;
       gap: 10px;
     }

     .frame-1410104138 {
       gap: 16px;
     }

     /* Typography adjustments for mobile */
     .giftsummary_span,
     .paymentinformation_span {
       font-size: 18px;
       line-height: 25.2px;
     }

     .recipient_span,
     .occasion_span,
     .message_span,
     .delivery_span {
       font-size: 14px;
       line-height: 19.6px;
     }

     .emmaage5-7_span,
     .birthday_span,
     .thisispresentgivetoyouihopeyoulikeit_span {
       font-size: 13px;
       line-height: 18.2px;
     }

     .total_span {
       font-size: 16px;
       line-height: 22.4px;
     }

     .f99_span {
       font-size: 18px;
       line-height: 25.2px;
     }

     .cardnumber_span,
     .expirydate_span,
     .cvc_span,
     .billingname_span {
       font-size: 14px;
       line-height: 19.6px;
     }

     .f242_span,
     .f228_span,
     .fspan,
     .johndoe_span {
       font-size: 14px;
       line-height: 19.6px;
     }

     .includegiftreceipt_span {
       font-size: 14px;
       line-height: 19.6px;
     }

     .sendareceipttotherecipientsparentguardianpricewillbehidden_span {
       font-size: 12px;
       line-height: 16.8px;
     }

     .iagreetothegiftpurchaseterms_span {
       font-size: 13px;
       line-height: 18.2px;
     }

     .giftstoriesarenon-refundableoncethecreationlinkissentrecipientshave30daystocreatetheirstoryafterreceivingtheinvitationifunusedgiftcanbetransferredtoanotherchildwithsameagegroupyouwillbenotifiedwhenthestorycreationbeginsandcompletesbothyouandtherecipientwillreceivethefinaldigitalstorybook_span {
       font-size: 11px;
       line-height: 15.4px;
     }

     .purchasegiftstory_span,
     .back_span {
       font-size: 16px;
       line-height: 22.4px;
     }

     .manageonstripe_span {
       font-size: 12px;
       line-height: 16.8px;
     }

     .securedbystripe_span {
       font-size: 14px;
       line-height: 19.6px;
     }
   }
 </style>
