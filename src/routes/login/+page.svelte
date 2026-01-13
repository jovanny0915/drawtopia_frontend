<script lang="ts">
  import { TelInput, normalizedCountries } from "svelte-tel-input";
  import type {
    DetailedValue,
    CountryCode,
    E164Number,
  } from "svelte-tel-input/types";
  import PhoneNumber from "../../components/PhoneNumber.svelte";
  import PrimaryBtn from "../../components/PrimaryBtn.svelte";
  import TextBtn from "../../components/TextBtn.svelte";
  import PrimaryInput from "../../components/PrimaryInput.svelte";
  import { signInWithEmail, signInWithPhone, signInWithGoogle, checkUserExists, checkUserExistsByPhone } from "../../lib/auth";
  import { goto } from "$app/navigation";
  import { isAuthenticated } from "$lib/stores/auth";
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
  // let isMobile = false;
  // You must use E164 number format. It's guarantee the parsing and storing consistency.
  let value: E164Number | null = "+36301234567";
  // Validity
  let valid = true;

  // Optional - Extended details about the parsed phone number
  let detailedValue: DetailedValue | null = null;
  let email = "";
  let phoneNumber = "";
  let password = "123456";
  let rememberMe = false;
  let isLoading = false;
  let errors: { [key: string]: string } = {};
  let loginMethod: "phone" | "email" = "email";
  // let selectedCountry = { name: 'United States', code: '+1', flag: '🇺🇸' };
  let showCountryDropdown = false;
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
    loginMethod = method;
    errors = {}; // Clear errors when switching
  };

  const selectCountry = (country: (typeof countries)[0]) => {
    // selectedCountry = country;
    // showCountryDropdown = false;
  };

  const validateForm = () => {
    errors = {};

    if (loginMethod === "email") {
      if (!email) {
        errors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        errors.email = "Please enter a valid email";
      }
    } else {
      if (!value || !phoneNumber) {
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

    return Object.keys(errors).length === 0;
  };

  const handleGoogleLogin = async () => {
    isLoading = true;
    errors = {}; // Clear previous errors

    try {
      // For Google OAuth, we need to let the OAuth flow handle user creation/verification
      // since we don't have the email until after OAuth completion.
      // The auth store will handle checking if user needs to complete signup.
      const result = await signInWithGoogle();
      
      if (result.success) {
        console.log("Google login initiated, redirecting to Google...");
        // The redirect will be handled by Supabase OAuth flow
        // User will be redirected to /dashboard after successful authentication
        // Note: isLoading will remain true since we're redirecting away
      } else {
        console.error("Google login failed:", result.error);
        errors.general = result.error || "Google login failed. Please try again.";
        isLoading = false;
      }
    } catch (error) {
      console.error("Google login error:", error);
      errors.general = error instanceof Error 
        ? error.message 
        : "An unexpected error occurred with Google login. Please try again.";
      isLoading = false;
    }
  };

  const handleSubmit = async (event: Event) => {
    event.preventDefault();

    if (!validateForm()) return;

    isLoading = true;
    errors = {}; // Clear previous errors

    try {
      // First check if user exists before attempting login
      if (loginMethod === "email") {
        const userCheck = await checkUserExists(email);
        
        if (userCheck.error) {
          errors.general = "Unable to verify user. Please try again.";
          isLoading = false;
          return;
        }
        
        if (!userCheck.exists) {
          // User doesn't exist, redirect to signup with error notification
          addNotification({
            type: 'error',
            message: 'No account found with this email. Please sign up first.',
            duration: 7000
          });
          goto("/signup");
          return;
        }
      } else {
        // Check phone number existence
        const phoneToUse = value || phoneNumber;
        const userCheck = await checkUserExistsByPhone(phoneToUse);
        
        if (userCheck.error) {
          errors.general = "Unable to verify user. Please try again.";
          isLoading = false;
          return;
        }
        
        if (!userCheck.exists) {
          // User doesn't exist, redirect to signup with error notification
          addNotification({
            type: 'error',
            message: 'No account found with this phone number. Please sign up first.',
            duration: 7000
          });
          goto("/signup");
          return;
        }
      }

      let result;

      if (loginMethod === "email") {
        result = await signInWithEmail(email, password);
        console.log("result", result);
      } else {
        // Use the formatted phone number from the TelInput component
        const phoneToUse = value || phoneNumber;
        result = await signInWithPhone(phoneToUse, password);
      }

      if (result.success) {
        // Success! User is signed in
        console.log("Login successful:", result.user);
        console.log("Session:", result.session);

        // Get redirect path from sessionStorage or default to dashboard
        const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/dashboard';
        sessionStorage.removeItem('redirectAfterLogin'); // Clean up

        // Redirect to intended destination or dashboard
        addNotification({
          type: 'success',
          message: 'Login successful! Redirecting...'
        });
        goto(redirectPath);
      } else {
        // Handle login error
        errors.general =
          result.error ||
          "Login failed. Please check your credentials and try again.";
      }
    } catch (error) {
      console.error("Login error:", error);
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
  <title>Login - Drawtopia</title>
  <meta name="description" content="Login to your Drawtopia account" />
</svelte:head>

<svelte:window on:click={handleClickOutside} />

<div class="login-with-phone-number">
  <div class="form">
    <div class="header">
      <div>
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
            on:click={handleGoogleLogin}
            disabled={isLoading}
          >
            <div class="icon-l">
              <div class="super-g-img"></div>
            </div>
            <div>
              <span class="loginwithgoogle_span">
                {isLoading ? 'Logging in...' : 'Login with Google'}
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
                class:active={loginMethod === "phone"}
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
                class="button_01"
                class:active={loginMethod === "email"}
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

            {#if loginMethod === "phone"}
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
          </div>
        </div>
      </div>
      <form on:submit={handleSubmit} style="width: 100%;">
        <div class="frame-1410104077">
          {#if errors.general}
            <div class="error-banner">{errors.general}</div>
          {/if}
          <PrimaryBtn
            text={loginMethod === 'phone' ? 'Login With Phone Number' : 'Login With Email'}
            {isLoading}
            spinner_name="Logging in..."
            onClick={handleSubmit}
          />
          <TextBtn
            text="Don't have account?"
            linkText="Sign Up"
            link="/signup"
          />
        </div>
      </form>
    </div>
  </div>
  <div class="background-image">
  </div>
</div>

<style>
  .header {
    display: flex;
    flex-direction: column;
    gap: 48px;
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

  .mobile-logo {
    width: 200px;
    display: none;
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

  .button_01 {
    flex: 1 1 0;
    padding: 8px;
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

  .button_01.active {
    background: white !important;
    color: #141414 !important;
  }

  .button,
  .button_01 {
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
    background: transparent;
  }

  .button:hover,
  .button_01:hover {
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
