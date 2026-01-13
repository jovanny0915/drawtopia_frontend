<script lang="ts">
  import { TelInput, normalizedCountries } from "svelte-tel-input";
  import type {
    DetailedValue,
    CountryCode,
    E164Number,
  } from "svelte-tel-input/types";
  import PrimarySelect from "../../components/PrimarySelect.svelte";
  import PhoneNumber from "../../components/PhoneNumber.svelte";
  import TextBtn from "../../components/TextBtn.svelte";
  import PrimaryBtn from "../../components/PrimaryBtn.svelte";
  import PrimaryInput from "../../components/PrimaryInput.svelte";
  import {
    signUpWithEmail,
    signUpWithPhone,
    signInWithGoogle,
    registerUser,
    formatGoogleUserData,
  } from "../../lib/auth";
  import { goto } from "$app/navigation";
  import { user, isAuthenticated } from "$lib/stores/auth";
  import { supabase } from "$lib/supabase";
  import { addNotification } from "$lib/stores/notification";
  import { onMount } from "svelte";

  import languageFlag from "../../assets/langbtnicon.svg";
  import logo from "../../assets/logo.png";

  // Check if user is already authenticated
  onMount(() => {
    const unsubscribe = isAuthenticated.subscribe(authenticated => {
      if (authenticated) {
        addNotification({
          type: 'info',
          message: 'You are already signed in!'
        });
        goto("/");
      }
    });
    
    return unsubscribe;
  });
  // Any Country Code Alpha-2 (ISO 3166)
  let selectedCountry: CountryCode | null = "HU";

  // You must use E164 number format. It's guarantee the parsing and storing consistency.
  let value: E164Number | null = "+36301234567";

  // Validity
  let valid = true;

  // Optional - Extended details about the parsed phone number
  let detailedValue: DetailedValue | null = null;
  let email = "";
  let phoneNumber = "";
  let password = "123456";
  let firstName = "";
  let lastName = "";
  let isLoading = false;
  let errors: { [key: string]: string } = {};
  let signupMethod: "phone" | "email" = "email";
  let accountType = "adult";
  let acceptedTerms = false;
  // let selectedCountry = { name: 'United States', code: '+1', flag: '🇺🇸' };
  let showCountryDropdown = false;
  let selectedOption = "";
  let options = [
    { value: "adult", label: "Adult" },
    { value: "child", label: "Child" },
  ];
  const countries = [
    { name: "United States", code: "+1", flag: "🇺🇸" },
    { name: "United Kingdom", code: "+44", flag: "🇬🇧" },
    { name: "Canada", code: "+1", flag: "🇨🇦" },
    { name: "Australia", code: "+61", flag: "🇦🇺" },
    { name: "Germany", code: "+49", flag: "🇩🇪" },
    { name: "France", code: "+33", flag: "🇫🇷" },
    { name: "Japan", code: "+81", flag: "🇯🇵" },
    { name: "India", code: "+91", flag: "🇮🇳" },
    { name: "China", code: "+86", flag: "🇨🇳" },
    { name: "Brazil", code: "+55", flag: "🇧🇷" },
    { name: "Mexico", code: "+52", flag: "🇲🇽" },
  ];

  const switchLoginMethod = (method: "phone" | "email") => {
    signupMethod = method;
    errors = {}; // Clear errors when switching
  };

  // const selectAccountType = (method: string) => {
  //   accountType = method as "adult" | "child";
  //   errors = {}; // Clear errors when switching
  // };

  const selectCountry = (country: (typeof countries)[0]) => {
    // selectedCountry = country;
    // showCountryDropdown = false;
  };

  const validateForm = (isGoogle: boolean) => {
    errors = {};
    if (!firstName.trim()) {
      errors.firstName = "First name is required";
    }

    if (!lastName.trim()) {
      errors.lastName = "Last name is required";
    }
    if (!accountType) {
      errors.accountType = "You must select account type";
    }
    if (signupMethod === "email" && !isGoogle) {
      if (!email) {
        errors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        errors.email = "Please enter a valid email";
      }
    } else {
      if (!value) {
        errors.phone = "Phone number is required";
      } else if (!valid) {
        errors.phone = "Please enter a valid phone number";
      }
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    // if (!acceptedTerms) {
    //   errors.terms = "You must accept the terms and conditions";
    // }

    return Object.keys(errors).length === 0;
  };

  const handleGoogleSignUp = async (event: Event) => {
    event.preventDefault();
    // if (!validateForm(true)) return;
    // isLoading = true;
    // errors = {}; // Clear previous errors

    try {
      // Ensure we have all required data before proceeding
      // if (!firstName.trim() || !lastName.trim()) {
      //   errors.general = "Please fill in all required fields before signing up with Google.";
      //   isLoading = false;
      //   return;
      // }

      // Store form data temporarily for after OAuth redirect
      sessionStorage.setItem('pendingGoogleSignup', JSON.stringify({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        accountType
      }));

      console.log('Storing signup data:', { firstName: firstName.trim(), lastName: lastName.trim(), accountType });
      const result = await signInWithGoogle();
      console.log("Google signup initiated:", result);
      
      if (result.success) {
        // OAuth redirect will happen automatically
        // User registration will be handled by auth state change listener
        console.log("Google OAuth redirect initiated");
      } else {
        errors.general = result.error || "Google signup failed. Please try again.";
        isLoading = false;
      }
    } catch (error) {
      console.error("Google signup error:", error);
      errors.general = "An unexpected error occurred with Google signup. Please try again.";
      isLoading = false;
    }
  };

  const handleSubmit = async (event: Event) => {
    event.preventDefault();
    if (!validateForm(false)) return;

    isLoading = true;
    errors = {}; // Clear previous errors

    try {
      let result;

      if (signupMethod === "email") {
        result = await signUpWithEmail(email, password, firstName, lastName);
        console.log("Signup result:", result);
      } else {
        // Use the formatted phone number from the TelInput component
        const phoneToUse = value || phoneNumber;
        result = await signUpWithPhone(
          phoneToUse,
          password,
          firstName,
          lastName
        );
      }

      if (result.success) {
        // Success! User has been created
        console.log("Signup successful:", result.user);

        // Check if email confirmation is required
        if (result.user && !result.session) {
          // Email verification required
          addNotification({
            type: 'info',
            message: 'Please check your email for a verification code before logging in.'
          });
        } else {
          // User is automatically signed in
          addNotification({
            type: 'success',
            message: 'Account created successfully! Redirecting to verification page...'
          });
        }

        // Store email or phone for verification
        if (signupMethod === "email") {
          localStorage.setItem("pendingEmailVerification", email);
          goto(`/otp-email?email=${encodeURIComponent(email)}`);
        } else {
          const phoneToUse = value || phoneNumber;
          localStorage.setItem("pendingPhoneVerification", phoneToUse);
          goto(`/otp-phone?phone=${encodeURIComponent(phoneToUse)}`);
        }
      } else {
        // Handle user already exists error
        if (result.error === 'USER_ALREADY_EXISTS') {
          const contactMethod = signupMethod === "email" ? "email address" : "phone number";
          addNotification({
            type: 'error',
            message: `An account with this ${contactMethod} already exists. Please login instead.`,
            duration: 7000
          });
          // Optionally redirect to login page after a delay
          setTimeout(() => {
            goto("/login");
          }, 3000);
        }
        // Handle signup error with specific rate limiting message
        else if (result.error && (result.error.includes('over_sms_send_rate_limit') || result.error.includes('rate limit'))) {
          errors.general = "Please wait 3 seconds before requesting another SMS code.";
        } else {
          errors.general = result.error || "Signup failed. Please try again.";
        }
      }
    } catch (error) {
      console.error("Signup error:", error);
      errors.general = "An unexpected error occurred. Please try again.";
    } finally {
      isLoading = false;
    }
  };

  // Function to get country flag emoji from ISO code
  

  // Close dropdown when clicking outside
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Element;
    if (!target.closest(".country-selector")) {
      showCountryDropdown = false;
    }
  };
</script>

<svelte:head>
  <title>Signup - Drawtopia</title>
  <meta name="description" content="Signup to your Drawtopia account" />
</svelte:head>

<svelte:window on:click={handleClickOutside} />

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
            <span class="welcometodrawtopia_span">Welcome to Drawtopia!</span>
          </div>
          <div>
            <span class="logintocontinuewithyourdrawtopiajourney_span"
              >Log in to continue with your drawtopia journey</span
            >
          </div>
        </div>
        <div class="frame-1410103986">
          <button
            type="button"
            class="button-social"
            on:click={handleGoogleSignUp}
            disabled={isLoading}
          >
            <div class="icon-l">
              <div class="super-g-img"></div>
            </div>
            <div>
              <span class="loginwithgoogle_span">
                {isLoading ? "Signing up..." : "Sign up with Google"}
              </span>
            </div>
          </button>
          <div class="frame-1410103989">
            <div class="stroke"></div>
            <div><span class="or_span">Or</span></div>
            <div class="stroke_01"></div>
          </div>
          <div class="frame-1410103988">
            <div class="switch">
              <button
                type="button"
                class="button"
                class:active={signupMethod === "phone"}
                on:click={() => switchLoginMethod("phone")}
              >
                <div class="phone">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <div><span class="phonenumber_span">Phone Number</span></div>
              </button>
              <button
                type="button"
                class="button"
                class:active={signupMethod === "email"}
                on:click={() => switchLoginMethod("email")}
              >
                <div class="envelope">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <div><span class="email_span">Email</span></div>
              </button>
            </div>
            

            <!-- <div class="select-wrapper">
              <label for="accountType">Account Type</label>
              <PrimarySelect
                {options}
                {selectedOption}
                onChange={(event) => {
                  const target = event.target as HTMLSelectElement;
                  selectAccountType(target.value);
                }}
              />
              {#if errors.accountType}
                <span class="error-text">{errors.accountType}</span>
              {/if}
            </div> -->
            
            <div class="text-field">
              <div><span class="phonenumber_01_span">Name</span></div>
              <div class="name-inputs-row">
                <div class="name-input-wrapper">
                  <PrimaryInput
                    type="text"
                    bind:value={firstName}
                    placeholder="First name"
                    {errors}
                    disabled={isLoading}
                  />
                  {#if errors.firstName}
                    <span class="error-text">{errors.firstName}</span>
                  {/if}
                </div>
                <div class="name-input-wrapper">
                  <PrimaryInput
                    type="text"
                    bind:value={lastName}
                    placeholder="Last name"
                    {errors}
                    disabled={isLoading}
                  />
                  {#if errors.lastName}
                    <span class="error-text">{errors.lastName}</span>
                  {/if}
                </div>
              </div>
            </div>
            {#if signupMethod === "phone"}
              <div class="text-field">
                <div><span class="phonenumber_01_span">Phone Number</span></div>
                <PhoneNumber
                  bind:valid
                  bind:detailedValue
                  bind:selectedCountry
                  bind:value
                />
                {#if errors.phone}
                  <span class="error-text">{errors.phone}</span>
                {/if}
              </div>
            {:else}
              <div class="text-field">
                <div><span class="phonenumber_01_span">Email</span></div>
                <PrimaryInput
                  type="email"
                  bind:value={email}
                  placeholder="Enter your Email Here"
                  {errors}
                  disabled={isLoading}
                />
                {#if errors.email}
                  <span class="error-text">{errors.email}</span>
                {/if}
              </div>
            {/if}

            <!-- <div class="text-field">
              <div><span class="phonenumber_01_span">Password</span></div>
              <PrimaryInput type="password" bind:value={password} placeholder="Enter your password" errors={errors} disabled={isLoading} />
              {#if errors.password}
                <span class="error-text">{errors.password}</span>
              {/if}
            </div> -->
          </div>
        </div>
      </div>
      <div
        class="by-creating-an-account-you-agree-to-our-terms-of-service-and-privacy-policy"
      >
        <span class="policy_terms_1"
          >By creating an account, you agree to our
        </span>
        <span class="policy_terms_2">Terms of Service</span>
        <span class="policy_terms_1">and </span>
        <span class="policy_terms_2">Privacy Policy</span>
        {#if errors.terms}
          <div style="margin-top: 4px;">
            <span class="error-text">{errors.terms}</span>
          </div>
        {/if}
      </div>

      <form on:submit={handleSubmit} style="width: 100%;">
        <div class="frame-1410104077">
          {#if errors.general}
            <div class="error-banner">{errors.general}</div>
          {/if}
          <PrimaryBtn
            text="Create Account"
            {isLoading}
            spinner_name="Creating account..."
            onClick={handleSubmit}
          />
          <TextBtn
            text="Already have an account?"
            linkText="Login"
            link="/login"
          />
        </div>
      </form>
    </div>
  </div>
  <div class="background-image"></div>
</div>

<style>
  .header {
    display: flex;
    flex-direction: column;
    gap: 48px;
  }

  .mobile-logo {
    width: 100%;
    display: none;
  }

  .welcometodrawtopia_span {
    color: #141414;
    font-size: 40px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 56px;
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
  .super-g-img {
    background-image: url("../../assets/super-g.svg");
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

  .loginwithgoogle_span {
    color: #121212;
    font-size: 18px;
    font-family: Geist;
    font-weight: 500;
    line-height: 25.2px;
    word-wrap: break-word;
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

  .stroke {
    flex: 1 1 0;
    height: 2px;
    transform: rotate(180deg);
    background: #ededed;
  }

  .or_span {
    color: #666d80;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .stroke_01 {
    flex: 1 1 0;
    height: 2px;
    transform: rotate(180deg);
    background: #ededed;
  }

  .phonenumber_span {
    color: #141414;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .email_span {
    color: #666d80;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .phonenumber_01_span {
    color: #0d0d12;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.4px;
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

  .icon-l {
    width: 20px;
    height: 20px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .frame-1410103989 {
    align-self: stretch;
    justify-content: center;
    align-items: center;
    gap: 24px;
    display: inline-flex;
  }

  .phone {
    width: 18px;
    height: 18px;
    position: relative;
    overflow: hidden;
  }

  .envelope {
    width: 18px;
    height: 18px;
    position: relative;
    overflow: hidden;
  }

  .frame-1410104077 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .button-social {
    align-self: stretch;
    height: 57px;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    background: white;
    box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
    border-radius: 20px;
    outline: 1px #d2d6db solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 4px;
    display: inline-flex;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .button-social:hover:not(:disabled) {
    background: #f8fafc;
    transform: translateY(-1px);
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  }

  .button-social:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: #f5f5f5;
  }

  .button {
    flex: 1 1 0;
    padding: 8px;
    background: white;
    border-radius: 8px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    display: flex;
  }

  .switch {
    align-self: stretch;
    padding: 4px;
    background: #f6f8fa;
    border-radius: 8px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 4px;
    display: inline-flex;
  }

  /* .email-input {
    width: 100%;
    height: 50px;
    padding-left: 12px;
    padding-right: 12px;
    border-radius: 10px;
    border: 1px solid #bbb;
    font-size: 16px;
    outline: none;
  } */
  .text-field {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: flex;
  }

  .frame-1410103988 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .frame-1410103986 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 24px;
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

  /* New interactive styles */
  .button.active {
    background: white !important;
    color: #141414 !important;
  }

  .button {
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
    background: transparent;
  }

  .button:hover {
    background: rgba(255, 255, 255, 0.8) !important;
  }

  .error-text {
    color: #dc2626;
    font-size: 12px;
    margin-top: 4px;
    display: block;
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

  .policy_terms_1 {
    color: #666d80;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }
  .policy_terms_2 {
    color: #141414;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 500;
    text-decoration: underline;
    line-height: 25.2px;
    word-wrap: break-word;
    cursor: pointer;
  }
  .by-creating-an-account-you-agree-to-our-terms-of-service-and-privacy-policy {
    width: 100%;
  }

  .name-inputs-row {
    display: flex;
    gap: 12px;
    width: 100%;
  }

  .name-input-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
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
    }

    .logintocontinuewithyourdrawtopiajourney_span {
      font-size: 16px;
    }

    .welcometodrawtopia_span {
      font-size: 32px;
    }

    .background-image {
      display: none;
    }

    .logo-text-full {
      display: none;
    }

    .mobile-logo {
      display: inline;
    }
  }
</style>
