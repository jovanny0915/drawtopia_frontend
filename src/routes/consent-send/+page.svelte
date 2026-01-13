<script>
  import PrimaryBtn from "../../components/PrimaryBtn.svelte";
  import PrimaryInput from "../../components/PrimaryInput.svelte";
  import ConsentSent from "../../components/ConsentSent.svelte";
  let email = "";
  let errors = {};
  let isLoading = false;
  let isVisible = false;
  let showConsentSent = false;

  const handleSendConsent = () => {
    showConsentSent = true;
  };
</script>

{#if showConsentSent}
  <ConsentSent />
{:else}
  <div class="parental-consent-required">
    <div class="frame-1410104014">
      <div class="frame-1410104015">
        <div class="button">
          <div class="arrowleft"></div>
          <div><span class="backtohome_span">Back To Home</span></div>
        </div>
        <div class="pop-up">
          <div class="logo-text-full">
            <div class="logo-img"></div>
          </div>
          <div class="stroke"></div>
          <div class="heading">
            <div class="parental-consent-required_01">
              <span class="parentalconsentrequired_01_span"
                >Parental Consent Required</span
              >
            </div>
            <div
              class="we-need-your-parents-permission-to-create-your-drawtopia-account"
            >
              <span
                class="weneedyourparentspermissiontocreateyourdrawtopiaaccount_span"
                >We need your parent's permission to create your Drawtopia account</span
              >
            </div>
          </div>
          <div class="notification">
            <div class="info">
              <div class="vector_01"></div>
            </div>
            <div
              class="your-safety-matters-drawtopia-is-committed-to-protecting-children-online-we-follow-strict-privacy-guidelines-and-never-share-personal-information"
            >
              <span
                class="yoursafetymattersdrawtopiaiscommittedtoprotectingchildrenonlinewefollowstrictprivacyguidelinesandneversharepersonalinformation_span"
                >Your Safety Matters: Drawtopia is committed to protecting
                children online. We follow strict privacy guidelines and never
                share personal information.</span
              >
            </div>
          </div>
          <div class="frame-1410103993">
            <div class="how-we-keep-you-safe">
              <span class="howwekeepyousafe_span">How We Keep You Safe</span>
            </div>
            <div class="information">
              <div class="information_01">
                <div class="secure-private">
                  <span class="secureprivate_span">Secure & Private</span>
                </div>
                <div
                  class="all-your-stories-and-drawings-are-kept-private-and-secure"
                >
                  <span
                    class="allyourstoriesanddrawingsarekeptprivateandsecure_span"
                    >All your stories and drawings are kept private and secure</span
                  >
                </div>
              </div>
              <div class="information_02">
                <div class="parent-control">
                  <span class="parentcontrol_span">Parent Control</span>
                </div>
                <div
                  class="parents-can-see-all-activities-and-control-account-settings"
                >
                  <span
                    class="parentscanseeallactivitiesandcontrolaccountsettings_span"
                    >Parents can see all activities and control account settings</span
                  >
                </div>
              </div>
              <div class="information_03">
                <div class="age-appropriate">
                  <span class="age-appropriate_span">Age-Appropriate</span>
                </div>
                <div
                  class="content-is-always-suitable-for-your-age-and-development"
                >
                  <span
                    class="contentisalwayssuitableforyourageanddevelopment_span"
                    >Content is always suitable for your age and development</span
                  >
                </div>
              </div>
            </div>
          </div>
          <div class="form">
            <div class="parents-email-address">
              <span class="parentsemailaddress_span">Parent's Email Address</span>
            </div>
            <PrimaryInput
              type="email"
              value={email}
              placeholder="Enter your Email Here"
              {errors}
              disabled={isLoading}
            />
            <div class="well-send-a-consent-request-to-this-email-address">
              <span class="wellsendaconsentrequesttothisemailaddress_span"
                >We'll send a consent request to this email address</span
              >
            </div>
          </div>
          <div class="frame-1410103851">
            <div class="frame-1410103841">
              <PrimaryBtn
                text="Send Consent Request"
                {isLoading}
                spinner_name="send-consent-request"
                onClick={handleSendConsent}
              />
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
{/if}

<style>
  .backtohome_span {
    color: black;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    word-wrap: break-word;
  }
  .logo-img {
    background-image: url("../../assets/logo.png");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    width: 100%;
    height: 100%;
  }

  .stroke {
    align-self: stretch;
    height: 1px;
    background: #ededed;
  }

  .parentalconsentrequired_01_span {
    color: #141414;
    font-size: 32px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 44.8px;
    word-wrap: break-word;
  }

  .parental-consent-required_01 {
    align-self: stretch;
  }

  .weneedyourparentspermissiontocreateyourdrawtopiaaccount_span {
    color: #666d80;
    font-size: 20px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 28px;
    word-wrap: break-word;
  }

  .we-need-your-parents-permission-to-create-your-drawtopia-account {
    align-self: stretch;
  }

  .vector_01 {
    width: 100%;
    height: 100%;
    background-image: url("../../assets/Info.svg");
  }

  .yoursafetymattersdrawtopiaiscommittedtoprotectingchildrenonlinewefollowstrictprivacyguidelinesandneversharepersonalinformation_span {
    color: #141414;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .your-safety-matters-drawtopia-is-committed-to-protecting-children-online-we-follow-strict-privacy-guidelines-and-never-share-personal-information {
    flex: 1 1 0;
  }

  .howwekeepyousafe_span {
    color: black;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.2px;
    word-wrap: break-word;
  }

  .how-we-keep-you-safe {
    align-self: stretch;
  }

  .secureprivate_span {
    color: black;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.2px;
    word-wrap: break-word;
  }

  .secure-private {
    align-self: stretch;
  }

  .allyourstoriesanddrawingsarekeptprivateandsecure_span {
    color: black;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 16.8px;
    word-wrap: break-word;
  }

  .all-your-stories-and-drawings-are-kept-private-and-secure {
    align-self: stretch;
  }

  .parentcontrol_span {
    color: black;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.2px;
    word-wrap: break-word;
  }

  .parent-control {
    align-self: stretch;
  }

  .parentscanseeallactivitiesandcontrolaccountsettings_span {
    color: black;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 16.8px;
    word-wrap: break-word;
  }

  .parents-can-see-all-activities-and-control-account-settings {
    align-self: stretch;
  }

  .age-appropriate_span {
    color: black;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.2px;
    word-wrap: break-word;
  }

  .age-appropriate {
    align-self: stretch;
  }

  .contentisalwayssuitableforyourageanddevelopment_span {
    color: black;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 16.8px;
    word-wrap: break-word;
  }

  .content-is-always-suitable-for-your-age-and-development {
    align-self: stretch;
  }

  .parentsemailaddress_span {
    color: #141414;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .parents-email-address {
    align-self: stretch;
  }

  .wellsendaconsentrequesttothisemailaddress_span {
    color: #666d80;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .well-send-a-consent-request-to-this-email-address {
    align-self: stretch;
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
    padding-left: 4px;
    padding-right: 4px;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 8px;
    display: flex;
  }

  .information_01 {
    flex: 1 1 0;
    padding: 12px;
    background: #eef6ff;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: inline-flex;
  }

  .information_02 {
    flex: 1 1 0;
    padding: 12px;
    background: #ecffff;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: inline-flex;
  }

  .information_03 {
    flex: 1 1 0;
    padding: 12px;
    background: #f5f2ff;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: inline-flex;
  }

  .frame-1410103820 {
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
  }

  .arrowleft {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
    background-image: url("../../assets/ArrowLeft.svg");
  }

  .logo-text-full {
    width: 267px;
    height: 50px;
    position: relative;
  }

  .info {
    width: 32px;
    height: 32px;
    position: relative;
    overflow: hidden;
  }

  .information {
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
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

  .frame-1410103841 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
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

  .button {
    justify-content: flex-start;
    align-items: center;
    gap: 22px;
    display: inline-flex;
  }

  .notification {
    align-self: stretch;
    padding: 10px;
    background: #f8fafb;
    border-radius: 12px;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
    display: inline-flex;
  }

  .frame-1410103993 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .frame-1410103851 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 16px;
    display: flex;
  }

  .pop-up {
    width: 686px;
    padding-top: 24px;
    padding-bottom: 16px;
    padding-left: 12px;
    padding-right: 12px;
    background: white;
    box-shadow: 0px 5px 4px rgba(0, 0, 0, 0.1);
    border-radius: 20px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: flex;
  }

  .frame-1410104015 {
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 48px;
    display: flex;
  }

  .frame-1410104014 {
    align-self: stretch;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .parental-consent-required {
    width: 100%;
    height: 100%;
    padding-left: 48px;
    padding-right: 48px;
    padding-top: 80px;
    padding-bottom: 80px;
    background: white;
    overflow: hidden;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 48px;
    display: inline-flex;
  }
</style>
