<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { loadStripe, type Stripe, type StripeElements, type StripePaymentElement } from "@stripe/stripe-js";
  import { env } from "../lib/env";

  // Props
  export let clientSecret: string;
  export let onSuccess: (paymentIntentId: string) => void = () => {};
  export let onError: (error: string) => void = () => {};
  export let buttonText: string = "Pay Now";
  export let amount: number = 0; // Amount in cents

  // State
  let stripe: Stripe | null = null;
  let elements: StripeElements | null = null;
  let paymentElement: StripePaymentElement | null = null;
  let isLoading = true;
  let isProcessing = false;
  let errorMessage = "";
  let paymentElementContainer: HTMLDivElement;

  // Format amount for display
  $: amountDisplay = amount > 0 ? `$${(amount / 100).toFixed(2)}` : "";

  onMount(async () => {
    try {
      // Load Stripe
      const stripePublishableKey = env.STRIPE_PUBLISHABLE_KEY;
      if (!stripePublishableKey) {
        throw new Error("Stripe publishable key not configured");
      }

      stripe = await loadStripe(stripePublishableKey);
      if (!stripe) {
        throw new Error("Failed to load Stripe");
      }

      // Create elements instance
      elements = stripe.elements({
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#438bff",
            colorBackground: "#ffffff",
            colorText: "#141414",
            colorDanger: "#df1b41",
            fontFamily: "Quicksand, system-ui, sans-serif",
            spacingUnit: "4px",
            borderRadius: "12px",
          },
        },
      });

      // Create and mount payment element
      paymentElement = elements.create("payment", {
        layout: "tabs",
      });
      paymentElement.mount(paymentElementContainer);

      // Listen for element changes
      paymentElement.on("change", (event) => {
        if (event.error) {
          errorMessage = event.error.message;
        } else {
          errorMessage = "";
        }
      });

      isLoading = false;
    } catch (error) {
      console.error("Error initializing Stripe:", error);
      errorMessage = error instanceof Error ? error.message : "Failed to initialize payment form";
      isLoading = false;
      onError(errorMessage);
    }
  });

  onDestroy(() => {
    if (paymentElement) {
      paymentElement.unmount();
    }
  });

  async function handleSubmit(event: Event) {
    event.preventDefault();

    if (!stripe || !elements) {
      errorMessage = "Stripe not initialized";
      return;
    }

    if (isProcessing) {
      return;
    }

    isProcessing = true;
    errorMessage = "";

    try {
      // Confirm the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // Return URL is not needed for embedded flow
          return_url: window.location.origin + "/gift/purchase",
        },
        redirect: "if_required",
      });

      if (error) {
        // Payment failed
        errorMessage = error.message || "Payment failed";
        console.error("Payment error:", error);
        onError(errorMessage);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Payment succeeded
        console.log("Payment succeeded:", paymentIntent.id);
        onSuccess(paymentIntent.id);
      } else {
        // Unexpected state
        errorMessage = "Payment status unclear. Please contact support.";
        console.error("Unexpected payment state:", paymentIntent);
        onError(errorMessage);
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      onError(errorMessage);
    } finally {
      isProcessing = false;
    }
  }
</script>

<form on:submit={handleSubmit} class="stripe-payment-form">
  <!-- Payment Element Container -->
  <div class="payment-element-wrapper">
    {#if isLoading}
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Loading payment form...</p>
      </div>
    {/if}
    <div bind:this={paymentElementContainer} class="payment-element-container" class:hidden={isLoading}></div>
  </div>

  <!-- Error Message -->
  {#if errorMessage}
    <div class="error-message" role="alert">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 1.5C4.41 1.5 1.5 4.41 1.5 8C1.5 11.59 4.41 14.5 8 14.5C11.59 14.5 14.5 11.59 14.5 8C14.5 4.41 11.59 1.5 8 1.5ZM8.75 11.25H7.25V9.75H8.75V11.25ZM8.75 8.25H7.25V4.75H8.75V8.25Z" fill="currentColor"/>
      </svg>
      {errorMessage}
    </div>
  {/if}

  <!-- Submit Button -->
  <button type="submit" class="submit-button" disabled={isLoading || isProcessing}>
    {#if isProcessing}
      <div class="button-spinner"></div>
      <span>Processing...</span>
    {:else}
      <span>{buttonText}{#if amountDisplay} - {amountDisplay}{/if}</span>
    {/if}
  </button>

  <!-- Security Badge -->
  <div class="security-badge">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 1.25L3.75 3.75V9.375C3.75 13.3438 6.48125 17.0312 10 18.75C13.5188 17.0312 16.25 13.3438 16.25 9.375V3.75L10 1.25ZM8.75 13.75L5.625 10.625L6.6875 9.5625L8.75 11.625L13.3125 7.0625L14.375 8.125L8.75 13.75Z" fill="#40c4aa"/>
    </svg>
    <span>Secured by Stripe</span>
  </div>
</form>

<style>
  .stripe-payment-form {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .payment-element-wrapper {
    position: relative;
    min-height: 200px;
  }

  .payment-element-container {
    transition: opacity 0.3s ease;
  }

  .payment-element-container.hidden {
    opacity: 0;
    pointer-events: none;
  }

  .loading-spinner {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    background: white;
    z-index: 1;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #438bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .loading-spinner p {
    color: #666d80;
    font-size: 14px;
    font-family: Nunito, sans-serif;
  }

  .error-message {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: #fff5f5;
    border: 1px solid #fed7d7;
    border-radius: 8px;
    color: #c53030;
    font-size: 14px;
    font-family: Nunito, sans-serif;
  }

  .error-message svg {
    flex-shrink: 0;
  }

  .submit-button {
    width: 100%;
    padding: 16px 24px;
    background: #438bff;
    border: none;
    border-radius: 20px;
    color: white;
    font-size: 18px;
    font-family: Quicksand, sans-serif;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .submit-button:hover:not(:disabled) {
    background: #3a7ae4;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(67, 139, 255, 0.3);
  }

  .submit-button:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(67, 139, 255, 0.2);
    background: #2e6bc7;
  }

  .submit-button:disabled {
    background: #dcdcdc;
    cursor: not-allowed;
    opacity: 0.6;
  }

  .button-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .security-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px;
    background: #effefa;
    border: 1px solid #40c4aa;
    border-radius: 10px;
  }

  .security-badge span {
    color: #40c4aa;
    font-size: 16px;
    font-family: Quicksand, sans-serif;
    font-weight: 600;
  }

  /* Mobile responsive */
  @media (max-width: 800px) {
    .submit-button {
      padding: 14px 20px;
      font-size: 16px;
    }

    .security-badge span {
      font-size: 14px;
    }

    .error-message {
      font-size: 13px;
      padding: 10px;
    }
  }
</style>
