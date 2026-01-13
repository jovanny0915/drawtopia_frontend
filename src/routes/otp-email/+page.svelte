<script lang="ts">
  import PrimaryBtn from "../../components/PrimaryBtn.svelte";
  import OutlineBtn from "../../components/OutlineBtn.svelte";
  import { verifyEmail, resendEmailOTP } from "../../lib/auth";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { addNotification } from "$lib/stores/notification";
  import languageFlag from "../../assets/langbtnicon.svg";
  import logo from "../../assets/logo.png";

  // OTP related variables
  let otpValues: string[] = ["", "", "", "", "", ""];
  let otpInputs: HTMLInputElement[] = [];
  let email = "";
  let isLoading = false;
  let errors: { [key: string]: string } = {};
  let isResendingOTP = false;

  // Get email from URL params or localStorage
  onMount(() => {
    // Try to get email from URL params first
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get("email");

    if (emailParam) {
      email = emailParam;
    } else {
      // Fallback to localStorage if available
      const storedEmail = localStorage.getItem("pendingEmailVerification");
      if (storedEmail) {
        email = storedEmail;
      }
    }
  });

  // Handle OTP input changes
  const handleOTPInput = (index: number, event: Event) => {
    const target = event.target as HTMLInputElement;
    const value = target.value;

    // Only allow single digit
    if (value.length > 1) {
      target.value = value.slice(-1);
    }

    otpValues[index] = target.value;

    // Move to next input if current is filled
    if (target.value && index < 5) {
      otpInputs[index + 1]?.focus();
    }

    // Clear errors when user types
    if (errors.otp) {
      errors.otp = "";
    }
  };

  // Handle paste event for automatic OTP filling
  const handleOTPPaste = (index: number, event: ClipboardEvent) => {
    event.preventDefault();

    const pastedData = event.clipboardData?.getData("text") || "";
    const cleanedData = pastedData.replace(/\D/g, ""); // Remove non-digits

    if (cleanedData.length === 6) {
      // Fill all 6 inputs with the pasted digits
      for (let i = 0; i < 6; i++) {
        otpValues[i] = cleanedData[i];
        if (otpInputs[i]) {
          otpInputs[i].value = cleanedData[i];
        }
      }

      // Focus the last input
      otpInputs[5]?.focus();

      // Clear any existing errors
      if (errors.otp) {
        errors.otp = "";
      }
    } else if (cleanedData.length > 0) {
      // If partial digits, fill from current position
      const remainingSlots = 6 - index;
      const digitsToFill = Math.min(cleanedData.length, remainingSlots);

      for (let i = 0; i < digitsToFill; i++) {
        if (index + i < 6) {
          otpValues[index + i] = cleanedData[i];
          if (otpInputs[index + i]) {
            otpInputs[index + i].value = cleanedData[i];
          }
        }
      }

      // Focus the next empty input or last filled input
      const nextIndex = Math.min(index + digitsToFill, 5);
      otpInputs[nextIndex]?.focus();
    }
  };

  // Handle backspace in OTP inputs
  const handleOTPKeydown = (index: number, event: KeyboardEvent) => {
    if (event.key === "Backspace" && !otpValues[index] && index > 0) {
      otpInputs[index - 1]?.focus();
    }
  };

  // Validate OTP
  const validateOTP = () => {
    const otpCode = otpValues.join("");

    if (otpCode.length !== 6) {
      errors.otp = "Please enter the complete 6-digit code";
      return false;
    }

    if (!/^\d{6}$/.test(otpCode)) {
      errors.otp = "OTP must contain only numbers";
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: Event) => {
    event.preventDefault();

    if (!validateOTP()) return;

    if (!email) {
      errors.general = "Email address is required";
      return;
    }

    isLoading = true;
    errors = {};

    try {
      const otpCode = otpValues.join("");
      console.log("Verifying OTP:", otpCode, "for email:", email);

      const result = await verifyEmail(email, otpCode);

      if (result.success) {
        console.log("Email verification successful");

        // Clear any stored pending verification data
        localStorage.removeItem("pendingEmailVerification");

        // Get redirect path from sessionStorage or default to home
        const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/';
        sessionStorage.removeItem('redirectAfterLogin'); // Clean up

        // Show success message
        addNotification({
          type: "success",
          message: "Email verified successfully! Redirecting...",
        });

        // Redirect to intended destination or home page
        goto(redirectPath);
      } else {
        console.error("Email verification failed:", result.error);
        errors.general =
          result.error || "Invalid verification code. Please try again.";
      }
    } catch (error) {
      console.error("Email verification error:", error);
      errors.general = "An unexpected error occurred. Please try again.";
    } finally {
      isLoading = false;
    }
  };

  // Handle back button
  const handleBack = () => {
    goto("/signup");
  };

  // Resend OTP function
  const handleResendOTP = async () => {
    if (!email) {
      errors.general = "Email address is required to resend code";
      return;
    }

    isResendingOTP = true;
    errors = {};

    try {
      const result = await resendEmailOTP(email);

      if (result.success) {
        addNotification({
          type: "success",
          message:
            "A new verification code has been sent to your email address.",
        });
      } else {
        errors.general =
          result.error ||
          "Failed to resend verification code. Please try again.";
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      errors.general = "Failed to resend verification code. Please try again.";
    } finally {
      isResendingOTP = false;
    }
  };
</script>

<svelte:head>
  <title>OTP-Verify your email</title>
  <meta name="description" content="Verify your email" />
</svelte:head>

<div class="login-with-phone-number">
  <div class="form">
    <div class="header">
      <div class="">
        <img src={logo} alt="" class="mobile-logo">
      </div>
      <div class="language-button">
        <img src={languageFlag} alt="Language Flag" class="language-flag-img">
        English
      </div>
      <div class="logo-text-full">
        <div class="logo-img"></div>
      </div>
    </div>
    <div class="container">
      <div class="form_01">
        <div class="heading">
          <div class="welcome-to-drawtopia">
            <span class="welcometodrawtopia_span">Check Your Email</span>
          </div>
          <div class="weve-sent-a-6-digit-code-to-your-email-address-logoipsumgmailcom-if-you-havent-received-it-within-15-minutes-please-click-resend-code">
            <span class="wevesenta6-digitcodetoyouremailaddresslogoipsumgmailcomifyouhaventreceiveditwithin15minutespleaseclickresendcode_span_01">We've sent a 6-digit code to your email address </span>
            <span class="wevesenta6-digitcodetoyouremailaddresslogoipsumgmailcomifyouhaventreceiveditwithin15minutespleaseclickresendcode_span_02">{email || "your email"}</span>
            <span class="wevesenta6-digitcodetoyouremailaddresslogoipsumgmailcomifyouhaventreceiveditwithin15minutespleaseclickresendcode_span_03">. </span>
            <span class="wevesenta6-digitcodetoyouremailaddresslogoipsumgmailcomifyouhaventreceiveditwithin15minutespleaseclickresendcode_span_04">If you haven't received it within 15 minutes, please click </span>
            <span class="wevesenta6-digitcodetoyouremailaddresslogoipsumgmailcomifyouhaventreceiveditwithin15minutespleaseclickresendcode_span_05" on:click={handleResendOTP} on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleResendOTP(); } }} role="button" tabindex="0">Resend code</span>
            <span class="wevesenta6-digitcodetoyouremailaddresslogoipsumgmailcomifyouhaventreceiveditwithin15minutespleaseclickresendcode_span_06">.</span>
          </div>
        </div>
      </div>
      <div class="frame-1410103856">
        {#each otpValues as value, index}
          <input
            bind:this={otpInputs[index]}
            class="input-placeholder f_span"
            type="text"
            maxlength="1"
            bind:value={otpValues[index]}
            on:input={(e) => handleOTPInput(index, e)}
            on:keydown={(e) => handleOTPKeydown(index, e)}
            on:paste={(e) => handleOTPPaste(index, e)}
            disabled={isLoading}
          />
        {/each}
      </div>

      {#if errors.otp}
        <div class="error-text-center">{errors.otp}</div>
      {/if}
      <form on:submit={handleSubmit} style="width: 100%;">
        <div class="frame-1410104077">
          {#if errors.general}
            <div class="error-banner">{errors.general}</div>
          {/if}
          <PrimaryBtn
            text="Continue"
            {isLoading}
            spinner_name="Verifying..."
            onClick={handleSubmit}
          />
          <div
            class="button"
            role="button"
            tabindex="0"
            aria-label="Go back to signup"
            on:click={handleBack}
            on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleBack(); }}
          >
            <div class="back"><span class="back_span">Back</span></div>
          </div>
        </div>
      </form>
    </div>
  </div>
  <div class="background-image"></div>
</div>

<style>
  .welcometodrawtopia_span {
    color: #141414;
    font-size: 32px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 38.40px;
    word-wrap: break-word;
  }

  .welcome-to-drawtopia {
    align-self: stretch;
  }
  .logo-img {
    background-image: url("../../assets/logo.png");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    width: 100%;
    height: 100%;
  }
  .logintocontinuewithyourdrawtopiajourney_span {
    color: #666d80;
    font-size: 20px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 28px;
    word-wrap: break-word;
  }

  .header {
    display: flex;
    flex-direction: column;
    gap: 48px;
  }

  .mobile-logo {
    width: 100%;
    display: none;
  }

  .weve-sent-a-6-digit-code-to-your-email-address-logoipsumgmailcom-if-you-havent-received-it-within-15-minutes-please-click-resend-code {
    align-self: stretch;
  }

  .wevesenta6-digitcodetoyouremailaddresslogoipsumgmailcomifyouhaventreceiveditwithin15minutespleaseclickresendcode_span_01 {
    color: #727272;
    font-size: 14px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 19.60px;
    word-wrap: break-word;
  }

  .wevesenta6-digitcodetoyouremailaddresslogoipsumgmailcomifyouhaventreceiveditwithin15minutespleaseclickresendcode_span_02 {
    color: #141414;
    font-size: 14px;
    font-family: DM Sans;
    font-weight: 500;
    line-height: 19.60px;
    word-wrap: break-word;
  }

  .wevesenta6-digitcodetoyouremailaddresslogoipsumgmailcomifyouhaventreceiveditwithin15minutespleaseclickresendcode_span_03 {
    color: #141414;
    font-size: 14px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 19.60px;
    word-wrap: break-word;
  }

  .wevesenta6-digitcodetoyouremailaddresslogoipsumgmailcomifyouhaventreceiveditwithin15minutespleaseclickresendcode_span_04 {
    color: #727272;
    font-size: 14px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 19.60px;
    word-wrap: break-word;
  }

  .wevesenta6-digitcodetoyouremailaddresslogoipsumgmailcomifyouhaventreceiveditwithin15minutespleaseclickresendcode_span_05 {
    color: #438BFF;
    font-size: 14px;
    font-family: DM Sans;
    font-weight: 400;
    text-decoration: underline;
    line-height: 19.60px;
    word-wrap: break-word;
    cursor: pointer;
  }

  .wevesenta6-digitcodetoyouremailaddresslogoipsumgmailcomifyouhaventreceiveditwithin15minutespleaseclickresendcode_span_05:hover {
    color: #0066cc;
  }

  .wevesenta6-digitcodetoyouremailaddresslogoipsumgmailcomifyouhaventreceiveditwithin15minutespleaseclickresendcode_span_06 {
    color: #438BFF;
    font-size: 14px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 19.60px;
    word-wrap: break-word;
  }

  .background-image {
    width: 48%;
    height: 98vh;
    position: relative;
    background-image: url("../../assets/victorycele.png");
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    border-radius: 12px;
    border: 1px #ededed solid;
    display: flex;
    align-items: center;
    justify-content: center;
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

  .logo-text-full {
    width: 290px;
    min-height: 54.2px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .frame-1410104077 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .form_01 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: flex;
  }

  .container {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 40px;
    display: flex;
  }

  .language-button {
    display: flex;
    flex-direction: row;
    gap: 4px;
    width: 110px;
    height: 42px;
    border-radius: 100px;
    border: 1px solid #ededed;
    padding: 10px 20px 10px 16px;
    align-items: center;
  }

  .form {
    width: 50%;
    height: 100vh;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 40px;
    display: inline-flex;
    padding: 48px;
  }

  .login-with-phone-number {
    width: 100%;
    height: 100vh;
    background: white;
    overflow: hidden;
    justify-content: center;
    align-items: center;
    gap: 0;
    display: flex;
    flex-wrap: nowrap;
  }

  .error-banner {
    background-color: #fee2e2;
    color: #dc2626;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 16px;
    text-align: center;
    font-size: 14px;
  }

  .error-text-center {
    color: #dc2626;
    font-size: 14px;
    text-align: center;
    margin-top: 8px;
    margin-bottom: 16px;
  }


  .f_span {
    color: #141414;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28.80px;
    word-wrap: break-word;
  }

  .input-placeholder {
    flex: 1 1 0;
    text-align: center;
    height: 75px;
    width: 100%;
    padding-left: 10px;
    padding-right: 10px;
    padding-top: 12px;
    padding-bottom: 12px;
    background: white;
    overflow: hidden;
    border-radius: 12px;
    outline: 1px #DCDCDC solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    border: none;
  }

  .frame-1410103856 {
    width: 100%;
    height: 100%;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 768px) {
    .login-with-phone-number {
      flex-direction: column;
      height: auto;
      min-height: 100vh;
    }

    .header {
      flex-direction: row;
      justify-content: space-between;
      width: 100%;
      gap: 0;
      align-items: center;
      margin-bottom: 0;
      margin-top: 50px;
    }
    
    .language-button {
      justify-content: center;
      align-items: center;
    }

    .form {
      width: 100%;
      height: auto;
      min-height: 100vh;
      padding: 16px;
      justify-content: flex-start;
    }

    .container {
      gap: 32px;
    }

    .welcometodrawtopia_span {
      font-size: 32px;
      line-height: 38.40px;
    }

    .logintocontinuewithyourdrawtopiajourney_span,
    .wevesenta6-digitcodetoyouremailaddresslogoipsumgmailcomifyouhaventreceiveditwithin15minutespleaseclickresendcode_span_01,
    .wevesenta6-digitcodetoyouremailaddresslogoipsumgmailcomifyouhaventreceiveditwithin15minutespleaseclickresendcode_span_02,
    .wevesenta6-digitcodetoyouremailaddresslogoipsumgmailcomifyouhaventreceiveditwithin15minutespleaseclickresendcode_span_03,
    .wevesenta6-digitcodetoyouremailaddresslogoipsumgmailcomifyouhaventreceiveditwithin15minutespleaseclickresendcode_span_04,
    .wevesenta6-digitcodetoyouremailaddresslogoipsumgmailcomifyouhaventreceiveditwithin15minutespleaseclickresendcode_span_05,
    .wevesenta6-digitcodetoyouremailaddresslogoipsumgmailcomifyouhaventreceiveditwithin15minutespleaseclickresendcode_span_06 {
      font-size: 14px;
      line-height: 19.60px;
    }

    .background-image {
      display: none;
    }

    .logo-text-full {
      display: none;
    }

    .mobile-logo {
      display: inline;
      width: 200px;
      height: auto;
    }

    .frame-1410103856 {
      gap: 12px;
    }

    .input-placeholder {
      height: 60px;
      padding-left: 8px;
      padding-right: 8px;
      padding-top: 12px;
      padding-bottom: 12px;
    }

    .f_span {
      font-size: 24px;
      line-height: 28.80px;
    }
  }

  /* Back button styles (upgraded) */
  .button {
    width: 100%;
    height: 100%;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    background: #E7FEFF;
    box-shadow: 0px 4px 0px #438BFF;
    border-radius: 12px;
    outline: 2px rgba(231, 254, 255, 0.20) solid;
    outline-offset: -2px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
    cursor: pointer;
  }

  .button:focus {
    box-shadow: 0 0 0 4px rgba(67,139,255,0.12), 0px 4px 0px #438BFF;
    outline: none;
  }

  .button:active {
    transform: translateY(1px);
    box-shadow: 0px 2px 0px #2b63b2;
  }

  .back_span {
    color: #438BFF;
    font-size: 18px;
    font-family: 'DM Sans', 'Quicksand', sans-serif;
    font-weight: 600;
    line-height: 25.20px;
    word-wrap: break-word;
  }

  .back {
    text-align: center;
    display: block;
  }

  @media (max-width: 480px) {
    .button {
      padding-left: 12px;
      padding-right: 12px;
    }

    .back_span {
      font-size: 16px;
    }

    .welcometodrawtopia_span {
      font-size: 28px;
      line-height: 33.60px;
    }

    .logintocontinuewithyourdrawtopiajourney_span,
    .wevesenta6-digitcodetoyouremailaddresslogoipsumgmailcomifyouhaventreceiveditwithin15minutespleaseclickresendcode_span_01,
    .wevesenta6-digitcodetoyouremailaddresslogoipsumgmailcomifyouhaventreceiveditwithin15minutespleaseclickresendcode_span_02,
    .wevesenta6-digitcodetoyouremailaddresslogoipsumgmailcomifyouhaventreceiveditwithin15minutespleaseclickresendcode_span_03,
    .wevesenta6-digitcodetoyouremailaddresslogoipsumgmailcomifyouhaventreceiveditwithin15minutespleaseclickresendcode_span_04,
    .wevesenta6-digitcodetoyouremailaddresslogoipsumgmailcomifyouhaventreceiveditwithin15minutespleaseclickresendcode_span_05,
    .wevesenta6-digitcodetoyouremailaddresslogoipsumgmailcomifyouhaventreceiveditwithin15minutespleaseclickresendcode_span_06 {
      font-size: 13px;
      line-height: 18px;
    }

    .input-placeholder {
      height: 55px;
      gap: 8px;
      padding-top: 10px;
      padding-bottom: 10px;
    }

    .container {
      gap: 24px;
    }

    .f_span {
      font-size: 20px;
      line-height: 24px;
    }

    .mobile-logo {
      width: 200px;
    }
  }
</style>
