<script lang="ts">
  import Navbar from "../../components/Navbar.svelte";
  import AccountDropdown from "../../components/AccountDropdown.svelte";
  import OrderSuccessModal from "../../components/OrderSuccessModal.svelte";
  import MobileOrderSummary from "../../components/MobileOrderSummary.svelte";
  import shoppaylogo from "../../assets/shoppay.svg";
  import googlepaylogo from "../../assets/paypal.svg";
  import applepaylogo from "../../assets/gpay.svg";
  import PrimarySelect from "../../components/PrimarySelect.svelte";
  import pencilsimple from "../../assets/PencilSimple.svg";
  import trashsimple from "../../assets/TrashSimple.svg";
  import plus from "../../assets/X.svg";
  import tag from "../../assets/Tag.svg";
  import arrowleft from "../../assets/ArrowLeft.svg";
  import caret from "../../assets/CaretDown.svg";
  const options = [
    { value: "United States", label: "🇺🇸 United States" },
    { value: "United Kingdom", label: "🇬🇧 United Kingdom" },
    { value: "Canada", label: "🇨🇦 Canada" },
    { value: "Australia", label: "🇦🇺 Australia" },
    { value: "Germany", label: "🇩🇪 Germany" },
    { value: "France", label: "🇫🇷 France" },
    { value: "Japan", label: "🇯🇵 Japan" },
    { value: "India", label: "🇮🇳 India" },
    { value: "China", label: "🇨🇳 China" },
    { value: "Brazil", label: "🇧🇷 Brazil" },
    { value: "Mexico", label: "🇲🇽 Mexico" },
    { value: "Italy", label: "🇮🇹 Italy" },
    { value: "Spain", label: "🇪🇸 Spain" },
    { value: "Netherlands", label: "🇳🇱 Netherlands" },
    { value: "Sweden", label: "🇸🇪 Sweden" },
    { value: "Norway", label: "🇳🇴 Norway" },
    { value: "Denmark", label: "🇩🇰 Denmark" },
    { value: "Finland", label: "🇫🇮 Finland" },
    { value: "Switzerland", label: "🇨🇭 Switzerland" },
    { value: "Austria", label: "🇦🇹 Austria" },
    { value: "Belgium", label: "🇧🇪 Belgium" },
    { value: "Ireland", label: "🇮🇪 Ireland" },
    { value: "Portugal", label: "🇵🇹 Portugal" },
    { value: "Poland", label: "🇵🇱 Poland" },
    { value: "Singapore", label: "🇸🇬 Singapore" },
    { value: "New Zealand", label: "🇳🇿 New Zealand" },
    { value: "South Africa", label: "🇿🇦 South Africa" },
  ];
  let selectedOption = "";
  let showOrderSuccessModal = false;

  const onChange = (event: Event) => {
    console.log(event);
  };

  const handlePayNowClick = () => {
    showOrderSuccessModal = true;
  };

  const handleCloseModal = () => {
    showOrderSuccessModal = false;
  };

  const handleBack = () => {
    // Navigate back in browser history
    if (typeof window !== "undefined") {
      window.history.back();
    }
  };
</script>

<div class="my-chart-improved">
  <Navbar>
    <AccountDropdown slot="profile" />
  </Navbar>
  <!-- Mobile Back Button -->
  <div class="mobile-back-button">
    <div
      class="mobile-back-btn"
      role="button"
      tabindex="0"
      on:click={handleBack}
      on:keydown={(e) => e.key === "Enter" && handleBack()}
    >
      <img class="arrow-left-icon" src={arrowleft} alt="back" />
    </div>
    <span class="back-text">Back</span>
  </div>

  <!-- Mobile Order Summary -->
  <div class="mobile-order-summary">
    <MobileOrderSummary />
  </div>

  <div class="frame-1410103971">
    <div class="frame-1410104181">
      <div class="frame-1410104180">
        <div class="express-checkout">
          <span class="expresscheckout_span">Express Checkout</span>
        </div>
        <div class="button">
          <div class="image_div_shoppay">
            <img src={shoppaylogo} alt="shop pay logo" />
          </div>
          <div class="image_div_googlepay">
            <img src={googlepaylogo} alt="google pay logo" />
          </div>
          <div class="image_div_applepay">
            <img src={applepaylogo} alt="apple pay logo" />
          </div>
        </div>
      </div>
      <div class="or"><span class="or_span">OR</span></div>
      <div class="frame-6">
        <div class="frame-1410104183">
          <div class="shipping-details">
            <span class="shippingdetails_span">Shipping Details</span>
          </div>
          <div class="form">
            <div class="input-placeholder">
              <div class="form_01">
                <div class="first-name">
                  <span class="firstname_span">First Name</span>
                </div>
                <div class="input-placeholder_01">
                  <div>
                    <span class="inputyourfirstname_span"
                      >input your first name</span
                    >
                  </div>
                </div>
              </div>
              <div class="form_02">
                <div class="last-name">
                  <span class="lastname_span">Last Name</span>
                </div>
                <div class="input-placeholder_02">
                  <div class="input-your-last-name">
                    <span class="inputyourlastname_span"
                      >input your last name</span
                    >
                  </div>
                </div>
              </div>
            </div>
            <div class="input-placeholder_03">
              <div class="form_03">
                <div class="street-adress">
                  <span class="streetadress_span">Street Adress</span>
                </div>
                <div class="input-placeholder_04">
                  <div>
                    <span class="inputstreetadress_span"
                      >input Street adress</span
                    >
                  </div>
                </div>
              </div>
              <div class="form_04">
                <div class="apt-building-etc-leave-blank-if-none">
                  <span class="aptbuildingetcleaveblankifnone_span"
                    >Apt #, Building, etc. (leave blank if none)</span
                  >
                </div>
                <div class="input-placeholder_05">
                  <div class="input-apt">
                    <span class="inputapt_span">input Apt</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="frame-1410103978">
              <div class="form_05">
                <div class="towncity">
                  <span class="towncity_span">Town/City</span>
                </div>
                <div class="input-placeholder_06">
                  <div>
                    <span class="inputtowncity_span">input town / city</span>
                  </div>
                </div>
              </div>
              <div class="form_06">
                <div class="country">
                  <span class="country_span">Country</span>
                </div>
                <PrimarySelect
                  {options}
                  {selectedOption}
                  {onChange}
                  placeholder="Select your country"
                />
              </div>
            </div>
            <div class="form_07">
              <div class="zippostcode">
                <span class="zippostcode_span">Zip/Postcode</span>
              </div>
              <div class="input-placeholder_08">
                <div>
                  <span class="inputyourpostcode_span"
                    >input your post code</span
                  >
                </div>
              </div>
            </div>
            <div class="form_08">
              <div class="email-address">
                <span class="emailaddress_span">Email address</span>
              </div>
              <div class="input-placeholder_09">
                <div>
                  <span class="selectyourcountry_01_span"
                    >Select your country</span
                  >
                </div>
                <div class="caretdown_02">
                  <img src={caret} alt="caret" />
                </div>
              </div>
            </div>
            <div class="form_09">
              <div class="phone-number">
                <span class="phonenumber_span">Phone Number</span>
              </div>
              <div class="input-placeholder_10">
                <div>
                  <span class="inputyourphonenumber_span"
                    >input your Phone Number</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="frame-1410104182">
          <div class="delivery">
            <span class="delivery_span">Delivery</span>
          </div>
          <div class="frame-1410103981">
            <div class="radio-button">
              <div class="ellipse-15"></div>
            </div>
            <div class="frame-1410103980">
              <div class="heading_01">
                <div><span class="standard_span">Standard</span></div>
                <div>
                  <span class="estimatedeliveryjune22025_span"
                    >Estimate Delivery: June 2, 2025</span
                  >
                </div>
              </div>
              <div
                class="youll-get-it-done-within-two-weeks-right-on-time-with-the-schedule-youve-set"
              >
                <span
                  class="youllgetitdonewithintwoweeksrightontimewiththescheduleyouveset_span"
                  >You'll get it done within two weeks, right on time with the
                  schedule you've set.</span
                >
              </div>
            </div>
            <div><span class="f800_span">$28.00</span></div>
          </div>
          <div class="frame-1410103982">
            <div class="radio-button_01"></div>
            <div class="frame-1410103980_01">
              <div class="heading_02">
                <div><span class="speedy_span">Speedy</span></div>
                <div>
                  <span class="estimatedeliveryjune12025_span"
                    >Estimate Delivery: June 1,2025</span
                  >
                </div>
              </div>
              <div
                class="super-quick-youll-aim-to-finish-it-well-before-the-deadline-focused-and-ahead-of-schedule"
              >
                <span
                  class="superquickyoullaimtofinishitwellbeforethedeadlinefocusedandaheadofschedule_span"
                  >Super quick — you'll aim to finish it well before the
                  deadline. Focused and ahead of schedule.</span
                >
              </div>
            </div>
            <div><span class="f500_span">$35.00</span></div>
          </div>
        </div>
        <div class="frame-1410103859">
          <div
            class="button_04"
            role="button"
            tabindex="0"
            on:click={handlePayNowClick}
            on:keydown={(e) => e.key === "Enter" && handlePayNowClick()}
          >
            <div class="pay-now"><span class="paynow_span">Pay Now</span></div>
          </div>
        </div>
        <div
          class="by-clicking-continue-you-agree-to-our-terms-conditions-and-privacy-policy"
        >
          <span
            class="byclickingcontinueyouagreetoourtermsconditionsandprivacypolicy_span_01"
            >By clicking Continue, you agree to our
          </span><span
            class="byclickingcontinueyouagreetoourtermsconditionsandprivacypolicy_span_02"
            >terms & conditions</span
          ><span
            class="byclickingcontinueyouagreetoourtermsconditionsandprivacypolicy_span_03"
          >
          </span><span
            class="byclickingcontinueyouagreetoourtermsconditionsandprivacypolicy_span_04"
            >and</span
          ><span
            class="byclickingcontinueyouagreetoourtermsconditionsandprivacypolicy_span_05"
          >
          </span><span
            class="byclickingcontinueyouagreetoourtermsconditionsandprivacypolicy_span_06"
            >privacy policy.</span
          >
        </div>
      </div>
    </div>
    <div class="frame-1410103911">
      <div class="frame-1410103910">
        <div class="frame-1410103972">
          <div class="your-chart-2">
            <span class="yourchart2_span">Your Chart (2)</span>
          </div>
          <div class="frame-1410103977">
            <div>
              <span class="continueshopping_span">Continue Shopping</span>
            </div>
            <img
              src={arrowleft}
              alt="arrow left"
              style="transform: rotate(180deg);"
            />
          </div>
        </div>
        <div class="frame-1410103961">
          <div class="select">
            <img
              class="frame-1410103837"
              src="https://placehold.co/126x106"
              alt="digital book"
            />
            <div class="frame-1410103960">
              <div class="frame-1410103908">
                <div class="digital-book">
                  <span class="digitalbook_span">Digital Book</span>
                </div>
                <div class="instant-access-on-any-device">
                  <span class="instantaccessonanydevice_span"
                    >Instant access on any device</span
                  >
                </div>
              </div>
              <div class="frame-1410103907">
                <div class="text-900"><span class="f00_span">$9.00</span></div>
              </div>
            </div>
            <img src={pencilsimple} alt="pencil simple" />
            <img src={trashsimple} alt="trash simple" />
          </div>
        </div>
        <div class="frame-1410103962">
          <div class="select_01">
            <img
              class="frame-1410103837_01"
              src="https://placehold.co/126x106"
              alt="sticker packs"
            />
            <div class="frame-1410103960_01">
              <div class="frame-1410103908_01">
                <div class="sticker-packs">
                  <span class="stickerpacks_span">Sticker Packs</span>
                </div>
                <div class="instant-access-on-any-device_01">
                  <span class="instantaccessonanydevice_01_span"
                    >Instant access on any device</span
                  >
                </div>
              </div>
              <div class="frame-1410103907_01">
                <div class="text-900_01">
                  <span class="f00_01_span">$9.00</span>
                </div>
              </div>
            </div>
            <img src={pencilsimple} alt="pencil simple" />
            <img src={trashsimple} alt="trash simple" />
          </div>
        </div>
        <div class="frame-1410103908_02">
          <div class="buy-2-more-books-and-get-discount-10-combo10">
            <span class="buy2morebooksandgetdiscount10combo10_span_01"
              >Buy 2 More Books and get discount 10%
            </span><span class="buy2morebooksandgetdiscount10combo10_span_02"
              >COMBO10</span
            >
          </div>
          <div class="button_05">
            <div class="plus">
              <img src={plus} alt="plus" />
            </div>
            <div class="add-more-books">
              <span class="addmorebooks_span">Add More Books</span>
            </div>
          </div>
        </div>
        <div class="frame-1410103973">
          <div class="promo">
            <div class="promo_01">
              <img src={tag} alt="tag" />
              <div>
                <span class="enteryourpromocode_span"
                  >Enter your Promo Code</span
                >
              </div>
            </div>
            <div><span class="apply_span">Apply</span></div>
          </div>
        </div>
        <div class="frame-1410103967">
          <div><span class="subtotal2items_span">Subtotal (2 Items)</span></div>
          <div><span class="f800_span_01">$18.00</span></div>
        </div>
        <div class="frame-1410103974">
          <div><span class="shipping_span">Shipping</span></div>
          <div><span class="f000_span">$10.00</span></div>
        </div>
        <div class="stroke"></div>
        <div class="frame-1410103968">
          <div><span class="ordertotal_span">Order Total</span></div>
          <div><span class="f800_01_span">$28.00</span></div>
        </div>
      </div>
    </div>
  </div>
  <div class="frame-1410103899">
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

  {#if showOrderSuccessModal}
    <div
      class="modal-overlay"
      role="dialog"
      aria-modal="true"
      tabindex="-1"
      on:click={handleCloseModal}
      on:keydown={(e) => e.key === "Escape" && handleCloseModal()}
    >
      <div
        class="modal-content"
        role="document"
        on:click|stopPropagation
        on:keydown|stopPropagation
      >
        <OrderSuccessModal />
        <button class="close-button" on:click={handleCloseModal}>×</button>
      </div>
    </div>
  {/if}
</div>

<style>
  .expresscheckout_span {
    color: #666d80;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 28px;
    word-wrap: break-word;
  }

  .express-checkout {
    align-self: stretch;
    text-align: center;
  }

  .or_span {
    color: #666d80;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 28px;
    word-wrap: break-word;
  }

  .or {
    align-self: stretch;
    text-align: center;
  }

  .shippingdetails_span {
    color: black;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .shipping-details {
    align-self: stretch;
  }

  .firstname_span {
    color: #121212;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .first-name {
    align-self: stretch;
  }

  .inputyourfirstname_span {
    color: #727272;
    font-size: 16px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .lastname_span {
    color: #121212;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .last-name {
    align-self: stretch;
  }

  .inputyourlastname_span {
    color: #727272;
    font-size: 16px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .input-your-last-name {
    flex: 1 1 0;
  }

  .streetadress_span {
    color: #121212;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .street-adress {
    align-self: stretch;
  }

  .inputstreetadress_span {
    color: #727272;
    font-size: 16px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .aptbuildingetcleaveblankifnone_span {
    color: #121212;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .apt-building-etc-leave-blank-if-none {
    align-self: stretch;
  }

  .inputapt_span {
    color: #727272;
    font-size: 16px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .input-apt {
    flex: 1 1 0;
  }

  .towncity_span {
    color: #121212;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .towncity {
    align-self: stretch;
  }

  .inputtowncity_span {
    color: #727272;
    font-size: 16px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .country_span {
    color: #121212;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .country {
    align-self: stretch;
  }

  .zippostcode_span {
    color: #121212;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .zippostcode {
    align-self: stretch;
  }

  .inputyourpostcode_span {
    color: #727272;
    font-size: 16px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .emailaddress_span {
    color: #121212;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .email-address {
    align-self: stretch;
  }

  .selectyourcountry_01_span {
    color: #727272;
    font-size: 16px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .phonenumber_span {
    color: #121212;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .phone-number {
    align-self: stretch;
  }

  .inputyourphonenumber_span {
    color: #727272;
    font-size: 16px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .delivery_span {
    color: black;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .delivery {
    align-self: stretch;
  }

  .ellipse-15 {
    width: 14px;
    height: 14px;
    background: #438bff;
    border-radius: 9999px;
  }

  .standard_span {
    color: black;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .estimatedeliveryjune22025_span {
    color: black;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .youllgetitdonewithintwoweeksrightontimewiththescheduleyouveset_span {
    color: #727272;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .youll-get-it-done-within-two-weeks-right-on-time-with-the-schedule-youve-set {
    align-self: stretch;
  }

  .f800_span {
    color: black;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .radio-button_01 {
    width: 24px;
    height: 24px;
    padding: 4px;
    background: white;
    border-radius: 16px;
    border: 1px #dcdcdc solid;
  }

  .speedy_span {
    color: black;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .estimatedeliveryjune12025_span {
    color: black;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .superquickyoullaimtofinishitwellbeforethedeadlinefocusedandaheadofschedule_span {
    color: #727272;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .super-quick-youll-aim-to-finish-it-well-before-the-deadline-focused-and-ahead-of-schedule {
    align-self: stretch;
  }

  .f500_span {
    color: black;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .paynow_span {
    color: white;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .pay-now {
    text-align: center;
  }

  .byclickingcontinueyouagreetoourtermsconditionsandprivacypolicy_span_01 {
    color: black;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .byclickingcontinueyouagreetoourtermsconditionsandprivacypolicy_span_02 {
    color: black;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 700;
    text-decoration: underline;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .byclickingcontinueyouagreetoourtermsconditionsandprivacypolicy_span_03 {
    color: black;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .byclickingcontinueyouagreetoourtermsconditionsandprivacypolicy_span_04 {
    color: black;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .byclickingcontinueyouagreetoourtermsconditionsandprivacypolicy_span_05 {
    color: black;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .byclickingcontinueyouagreetoourtermsconditionsandprivacypolicy_span_06 {
    color: black;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 700;
    text-decoration: underline;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .by-clicking-continue-you-agree-to-our-terms-conditions-and-privacy-policy {
    align-self: stretch;
    text-align: center;
  }

  .yourchart2_span {
    color: black;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .your-chart-2 {
    width: 350px;
  }

  .continueshopping_span {
    color: black;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }
  .frame-1410103837 {
    width: 126px;
    height: 106px;
    padding: 12px;
    background: #e9e9e9;
    border-radius: 16px;
  }

  .digitalbook_span {
    color: #121212;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28px;
    word-wrap: break-word;
  }

  .digital-book {
    align-self: stretch;
  }

  .instantaccessonanydevice_span {
    color: #727272;
    font-size: 16px;
    font-family: Nunito;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .instant-access-on-any-device {
    align-self: stretch;
  }

  .f00_span {
    color: black;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .text-900 {
    align-self: stretch;
  }

  .frame-1410103837_01 {
    width: 126px;
    height: 106px;
    padding: 12px;
    background: #e9e9e9;
    border-radius: 16px;
  }

  .stickerpacks_span {
    color: #121212;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28px;
    word-wrap: break-word;
  }

  .sticker-packs {
    align-self: stretch;
  }

  .instantaccessonanydevice_01_span {
    color: #727272;
    font-size: 16px;
    font-family: Nunito;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .instant-access-on-any-device_01 {
    align-self: stretch;
  }

  .f00_01_span {
    color: black;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .text-900_01 {
    align-self: stretch;
  }

  .buy2morebooksandgetdiscount10combo10_span_01 {
    color: #121212;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .buy2morebooksandgetdiscount10combo10_span_02 {
    color: #121212;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .buy-2-more-books-and-get-discount-10-combo10 {
    text-align: center;
  }

  .addmorebooks_span {
    color: #010101;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .add-more-books {
    text-align: center;
  }

  .enteryourpromocode_span {
    color: #6d6d6d;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 19.2px;
    word-wrap: break-word;
  }

  .apply_span {
    color: black;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.2px;
    word-wrap: break-word;
  }

  .subtotal2items_span {
    color: #121212;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .f800_span_01 {
    color: black;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .shipping_span {
    color: #121212;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .f000_span {
    color: black;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .stroke {
    align-self: stretch;
    height: 1px;
    background: #dcdcdc;
  }

  .ordertotal_span {
    color: #121212;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .f800_01_span {
    color: black;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.6px;
    word-wrap: break-word;
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
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .input-placeholder_04 {
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
  }

  .input-placeholder_05 {
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
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .input-placeholder_06 {
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
  }

  .input-placeholder_08 {
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
  }

  .input-placeholder_10 {
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
  }

  .heading_01 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .heading_02 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .button_04 {
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
  }

  .frame-1410103908 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: flex;
  }

  .frame-1410103907 {
    width: 121px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-end;
    gap: 4px;
    display: flex;
  }

  .frame-1410103908_01 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: flex;
  }

  .frame-1410103907_01 {
    width: 121px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-end;
    gap: 4px;
    display: flex;
  }

  .frame-1410103967 {
    align-self: stretch;
    justify-content: space-between;
    align-items: flex-start;
    display: inline-flex;
  }

  .frame-1410103974 {
    align-self: stretch;
    justify-content: space-between;
    align-items: flex-start;
    display: inline-flex;
  }

  .frame-1410103968 {
    align-self: stretch;
    justify-content: space-between;
    align-items: flex-start;
    display: inline-flex;
  }

  .frame-1410103820 {
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
  }

  .caretdown_02 {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .radio-button {
    width: 24px;
    height: 24px;
    padding: 4px;
    background: white;
    border-radius: 16px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .plus {
    width: 22px;
    height: 22px;
    position: relative;
    overflow: hidden;
    transform: rotate(45deg);
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

  .form_04 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .form_05 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: inline-flex;
  }

  .form_07 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .form_09 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .frame-1410103980 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 2px;
    display: inline-flex;
  }

  .frame-1410103980_01 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 2px;
    display: inline-flex;
  }

  .frame-1410103859 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .frame-1410103960 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 8px;
    display: inline-flex;
  }

  .frame-1410103960_01 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 8px;
    display: inline-flex;
  }

  .frame-1410103899 {
    align-self: stretch;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .input-placeholder_09 {
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
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .frame-1410103977 {
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .button_05 {
    align-self: stretch;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 12px;
    padding-bottom: 12px;
    box-shadow: 0px 4px 4px rgba(98.89, 98.89, 98.89, 0.25);
    border-radius: 20px;
    outline: 1px #e5e5e5 solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }

  .promo_01 {
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: flex;
  }

  .input-placeholder {
    align-self: stretch;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
  }

  .input-placeholder_03 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .frame-1410103981 {
    align-self: stretch;
    padding: 12px;
    background: #eef6ff;
    border-radius: 12px;
    outline: 1px #438bff solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: inline-flex;
  }

  .frame-1410103982 {
    align-self: stretch;
    padding: 12px;
    border-radius: 12px;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: inline-flex;
  }

  .select {
    align-self: stretch;
    padding: 12px;
    border-radius: 16px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .select_01 {
    align-self: stretch;
    padding: 12px;
    border-radius: 16px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .button {
    justify-content: flex-start;
    align-items: center;
    gap: 14.2px;
    display: inline-flex;
  }

  .form_06 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: inline-flex;
  }

  .form_08 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .frame-1410103972 {
    align-self: stretch;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .frame-1410103908_02 {
    align-self: stretch;
    padding-left: 12px;
    padding-right: 12px;
    padding-top: 16px;
    padding-bottom: 16px;
    border-radius: 12px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .promo {
    align-self: stretch;
    padding-left: 12px;
    padding-right: 12px;
    padding-top: 16px;
    padding-bottom: 16px;
    overflow: hidden;
    border-radius: 12px;
    outline: 1px #e7e7e7 solid;
    outline-offset: -1px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .frame-1410104182 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
    display: flex;
  }

  .frame-1410103961 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: flex;
  }

  .frame-1410103962 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: flex;
  }

  .frame-1410104180 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .frame-1410103978 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
  }

  .frame-1410103973 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .form {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .frame-1410103910 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .frame-1410104183 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
    display: flex;
  }

  .frame-1410103911 {
    width: 40%;
    height: 754px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 24px;
    display: inline-flex;
  }

  .frame-6 {
    width: 100%;
    padding: 16px;
    background: white;
    border-radius: 20px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: flex;
  }

  .frame-1410104181 {
    width: 60%;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 32px;
    display: inline-flex;
  }

  .frame-1410103971 {
    align-self: stretch;
    height: 1315px;
    justify-content: flex-start;
    align-items: flex-start;
    display: inline-flex;
    gap: 32px;
  }

  .my-chart-improved {
    width: 100%;
    height: 100%;
    padding-left: 100px;
    padding-right: 100px;
    padding-top: 24px;
    padding-bottom: 24px;
    background: white;
    overflow: hidden;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 53px;
    display: inline-flex;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    position: relative;
    width: 600px;
    height: 350px;
    background: white;
    border-radius: 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }

  .close-button {
    position: absolute;
    top: 16px;
    right: 16px;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
  }

  .close-button:hover {
    background-color: #f0f0f0;
  }

  /* Mobile Back Button Styles */
  .mobile-back-button {
    display: none;
  }

  /* Mobile Order Summary Styles */
  .mobile-order-summary {
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

    .mobile-order-summary {
      display: block;
      width: 100%;
      margin-bottom: 16px;
    }

    .my-chart-improved {
      padding-left: 16px;
      padding-right: 16px;
      padding-top: 16px;
      padding-bottom: 16px;
      gap: 24px;
    }

    .frame-1410103971 {
      flex-direction: column;
      gap: 24px;
      height: auto;
    }

    .frame-1410104181 {
      width: 100%;
    }

    .frame-1410103911 {
      display: none;
      /* width: 100%;
      height: auto; */
    }

    .frame-6 {
      padding: 12px;
      gap: 16px;
    }

    .expresscheckout_span {
      font-size: 20px;
      line-height: 28px;
    }

    .button {
      flex-direction: column;
      gap: 12px;
      padding: 12px;
      width: 100%;
    }

    .button img {
      width: 100% !important;
      max-width: 200px;
      height: auto !important;
    }

    .or_span {
      font-size: 16px;
      line-height: 22.4px;
    }

    .shippingdetails_span {
      font-size: 20px;
      line-height: 28px;
    }

    .input-placeholder,
    .input-placeholder_03 {
      flex-direction: column;
      gap: 12px;
    }

    .form_01,
    .form_02,
    .form_03,
    .form_04,
    .form_05,
    .form_06,
    .form_07,
    .form_08,
    .form_09 {
      width: 100%;
    }

    .frame-1410103978 {
      flex-direction: column;
      gap: 12px;
    }

    .input-placeholder_01,
    .input-placeholder_02,
    .input-placeholder_04,
    .input-placeholder_05,
    .input-placeholder_06,
    .input-placeholder_08,
    .input-placeholder_09,
    .input-placeholder_10 {
      width: 100%;
    }

    .firstname_span,
    .lastname_span,
    .streetadress_span,
    .towncity_span,
    .country_span,
    .zippostcode_span,
    .emailaddress_span,
    .phonenumber_span {
      font-size: 16px;
      line-height: 22.4px;
    }

    .inputyourfirstname_span,
    .inputyourlastname_span,
    .inputstreetadress_span,
    .inputapt_span,
    .inputtowncity_span,
    .inputyourpostcode_span,
    .selectyourcountry_01_span,
    .inputyourphonenumber_span {
      font-size: 14px;
      line-height: 19.6px;
    }

    .delivery_span {
      font-size: 20px;
      line-height: 28px;
    }

    /* General mobile typography optimizations */
    span[class$="_span"] {
      font-size: 16px;
      line-height: 22.4px;
    }

    span[class*="input"] {
      font-size: 14px;
      line-height: 19.6px;
    }

    .paynow_span {
      font-size: 18px;
      line-height: 25.2px;
    }

    [class*="frame-"] {
      /* padding: 12px; */
      gap: 12px;
    }

    .modal-content {
      width: 90vw;
      max-width: 400px;
      height: auto;
      min-height: 300px;
      margin: 16px;
    }
    .frame-1410103981 {
      flex-direction: column;
    }
    .frame-1410103982 {
      flex-direction: column;
    }
    .image_div_shoppay {
      background: #592ff4;
      width: 100%;
      justify-content: center;
      align-items: center;
      display: flex;
      border-radius: 12px;
    }
    .image_div_googlepay {
      background: #ffc439;
      width: 100%;
      justify-content: center;
      align-items: center;
      border-radius: 12px;
      display: flex;
    }
    .image_div_applepay {
      background: black;
      width: 100% !important;
      justify-content: center;
      align-items: center;
      border-radius: 12px;
      display: flex;
    }
  }
</style>
