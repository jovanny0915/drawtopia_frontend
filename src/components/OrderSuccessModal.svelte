<script>
  import green_check from "../assets/green_check.svg";
</script>

<div class="pop-up">
  <img src={green_check} alt="green check" />

  <div class="frame-1410103910">
    <div class="your-order-was-successful">
      <span class="yourorderwassuccessful_span">Your Order Was Successful!</span
      >
    </div>
    <div
      class="thank-you-for-your-purchase-a-confirmation-has-been-sent-to-your-email"
    >
      <span
        class="thankyouforyourpurchaseaconfirmationhasbeensenttoyouremail_span"
        >Thank you for your purchase. A confirmation has been sent to your
        email.</span
      >
    </div>
  </div>
  <div class="button">
    <div class="back-to-menu">
      <span class="backtomenu_span">Back to Menu</span>
    </div>
  </div>
</div>

<style>
  .yourorderwassuccessful_span {
    color: black;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .your-order-was-successful {
    width: 530px;
    text-align: center;
  }

  .thankyouforyourpurchaseaconfirmationhasbeensenttoyouremail_span {
    color: #727272;
    font-size: 16px;
    font-family: Nunito;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .thank-you-for-your-purchase-a-confirmation-has-been-sent-to-your-email {
    width: 433px;
    text-align: center;
  }

  .backtomenu_span {
    color: black;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .back-to-menu {
    text-align: center;
  }

  .frame-1410103910 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .button {
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    border-radius: 20px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }
  
  .pop-up {
    width: 100%;
    height: 100%;
    padding-top: 24px;
    padding-bottom: 32px;
    padding-left: 24px;
    padding-right: 24px;
    left: 0px;
    top: 0px;
    position: absolute;
    background: white;
    border-radius: 20px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 32px;
    display: inline-flex;
  }
</style>
