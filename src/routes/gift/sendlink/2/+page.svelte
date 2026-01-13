<script lang="ts">
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import { onMount } from "svelte";

  import arrow_left from "../../../../assets/ArrowLeft.svg";
  import logo from "../../../../assets/logo.png";
  import PaperPlaneTilt from "../../../../assets/PaperPlaneTilt.svg";
  import XIcon from "../../../../assets/X.svg";
  import green_check from "../../../../assets/green_check.svg";

  import GiftPackaging1 from "../../../../assets/giftpackage1.png";
  import GiftPackaging2 from "../../../../assets/giftpackage2.png";
  import GiftPackaging3 from "../../../../assets/giftpackage3.png";

  import { giftCreation } from "../../../../lib/stores/giftCreation";
  import {
    user,
    authLoading,
    isAuthenticated,
  } from "../../../../lib/stores/auth";
  import GiftStepComponent from "../../../../components/GiftStepComponent.svelte";
  import { createGift } from "../../../../lib/database/gifts";

  const exampleMessages = [
    "Happy Birthday, Emma!",
    "Congratulations, Emma!",
    "You're Amazing",
    "Love, Grandma",
    "Proud of You!",
  ];

  type GiftCardDesign = "blue" | "green" | "orange" | null;

  let giftMessage = "";
  let selectedCardDesign: GiftCardDesign = "blue";
  let characterCount = 0;
  let showPreviewModal = false;
  let showStatusModal = false;
  let isSuccess = false;
  let isLoading = false;
  let errorMessage = "";
  const maxCharacters = 200;

  // Reactive statements for auth state
  $: currentUser = $user;
  $: loading = $authLoading;
  $: authenticated = $isAuthenticated;
  $: safeToRedirect = browser && !loading && currentUser !== undefined;

  // Update character count
  $: characterCount = giftMessage.length;

  // Check authentication on mount
  onMount(() => {
    if (browser) {
      setTimeout(() => {
        if (safeToRedirect && !authenticated) {
          goto("/login");
          return;
        }
      }, 100);
    }
  });

  // Reactive redirect when auth state changes
  $: if (safeToRedirect && !authenticated) {
    goto("/login");
  }

  const handleMessageChange = (event: Event) => {
    const target = event.target as HTMLTextAreaElement;
    if (target.value.length <= maxCharacters) {
      giftMessage = target.value;
    }
  };

  const handleExampleClick = (message: string) => {
    if (giftMessage.length + message.length <= maxCharacters) {
      giftMessage = message;
    }
  };

  const handleCardSelect = (design: GiftCardDesign) => {
    selectedCardDesign = design;
  };

  const handlePreview = () => {
    if (!giftMessage.trim()) {
      alert("Please enter a gift message to preview");
      return;
    }
    showPreviewModal = true;
  };

  const handleCloseModal = () => {
    showPreviewModal = false;
  };

  const handleModalBackdropClick = (event: MouseEvent) => {
    if (event.target === event.currentTarget) {
      handleCloseModal();
    }
  };

  const handleSend = async () => {
    // Validate required fields
    if (!giftMessage.trim()) {
      alert("Please enter a gift message");
      return;
    }
    if (!selectedCardDesign) {
      alert("Please select a gift card design");
      return;
    }

    if (isLoading) return;

    try {
      isLoading = true;
      isSuccess = false;
      errorMessage = "";

      // Update the store with the message from this page
      giftCreation.setDeliveryDetails({
        specialMsg: giftMessage,
      });
      
      // Get updated state after setting the message
      const giftState = $giftCreation;

      // Convert gift state to Gift object for database
      const giftData = giftCreation.toGiftObject(giftState);
      
      // Save gift to database
      const result = await createGift(giftData);
      
      if (result.success) {
        // Store the gift ID
        if (result.data?.id) {
          giftCreation.setGiftId(result.data.id);
        }
        
        isSuccess = true;
        showStatusModal = true;
      } else {
        isSuccess = false;
        errorMessage = result.error || 'Failed to send gift creation link';
        showStatusModal = true;
      }
    } catch (error: any) {
      console.error('Error sending gift:', error);
      isSuccess = false;
      errorMessage = error.message || 'An error occurred while sending the gift creation link';
      showStatusModal = true;
    } finally {
      isLoading = false;
    }
  };

  const handleCloseStatusModal = () => {
    showStatusModal = false;
  };

  const handleDoneButton = () => {
    if (isSuccess) {
      goto("/dashboard");
    } else {
      // If failed, just close the modal
      handleCloseStatusModal();
    }
  };

  const handleStatusModalBackdropClick = (event: MouseEvent) => {
    if (event.target === event.currentTarget) {
      handleCloseStatusModal();
    }
  };

  const handleBack = () => {
    goto("/gift/sendlink/1");
  };
</script>

<div class="finishing-touches-page">
  <div class="navbar">
    <div class="logo-text-full">
      <img src={logo} alt="logo" class="logo-img">
    </div>
  </div>

  <div class="content">
    <div class="header">
      <h1 class="title">Add the finishing touches</h1>
      <p class="subtitle">
        Make this gift extra special with a personal message
      </p>
    </div>

    <GiftStepComponent
      currentStep={2}
      totalSteps={2}
      stepTitle="Final Touches"
      stepLabel="Step 2"
    />

    <div class="content-container">
      <!-- Gift Message Section -->
      <div class="section">
        <div class="section-title">Gift Message</div>

        <div class="form-group">
          <label class="form-label" for="gift-message">Your Gift Messages</label
          >
          <textarea
            id="gift-message"
            class="message-textarea"
            placeholder="Example : Happy birthday, Emma!"
            bind:value={giftMessage}
            on:input={handleMessageChange}
          ></textarea>
          <div class="character-count">
            {characterCount}/{maxCharacters} Characters
          </div>
        </div>

        <div class="example-messages">
          <label class="example-label">Example</label>
          <div class="example-buttons-group">
            {#each exampleMessages as message}
              <button
                class="example-button"
                on:click={() => handleExampleClick(message)}
              >
                {message}
              </button>
            {/each}
          </div>
        </div>
      </div>

      <!-- Gift Packaging Section -->
      <div class="section">
        <div class="section-title">Gift Packaging</div>
        <div class="section-content">
          <div class="section-subtitle">Select Digital Gift Card Design</div>
          <div class="gift-cards">
            <button
              class="gift-card"
              class:selected={selectedCardDesign === "blue"}
              on:click={() => handleCardSelect("blue")}
              aria-label="Select blue gift card design"
            >
              <div class="card-content blue-card">
              </div>
            </button>

            <button
              class="gift-card"
              class:selected={selectedCardDesign === "green"}
              on:click={() => handleCardSelect("green")}
              aria-label="Select green gift card design"
            >
              <div class="card-content green-card">
              </div>
            </button>

            <button
              class="gift-card"
              class:selected={selectedCardDesign === "orange"}
              on:click={() => handleCardSelect("orange")}
              aria-label="Select orange gift card design"
            >
              <div class="card-content orange-card">
              </div>
            </button>
          </div>

          <button class="preview-button" on:click={handlePreview}>
            Preview Digital Gift Card
          </button>
        </div>
      </div>
    </div>

    <div class="actions">
      <button
        class="send-button"
        on:click={handleSend}
        disabled={!giftMessage.trim() || !selectedCardDesign || isLoading}
      >
      {#if isLoading}
        Sending...
      {:else}
        Send Gift Creation Link
        <img src={PaperPlaneTilt} alt="send" class="send-icon" />
      {/if}
      </button>
      <button class="back-button" on:click={handleBack}>
        <img src={arrow_left} alt="back" class="arrow-icon" />
        Back
      </button>
    </div>
  </div>
</div>

{#if showPreviewModal}
  <!-- Preview Modal -->
  <div
    class="modal-overlay"
    on:click={handleModalBackdropClick}
    on:keydown={(e) => e.key === "Escape" && handleCloseModal()}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    tabindex="-1"
  >
    <div class="modal-content" on:click|stopPropagation role="document">
      <div class="modal-header">
        <div class="modal-logo">
          <img src={logo} alt="logo" class="logo-img" />
        </div>
        <button
          class="modal-close"
          on:click={handleCloseModal}
          aria-label="Close preview"
        >
          <img src={XIcon} alt="close" />
        </button>
      </div>

      <div class="modal-body">
        <div class="preview-gift-card">
          <div
            class="preview-card-bg {selectedCardDesign === 'blue'
              ? 'blue-preview'
              : selectedCardDesign === 'green'
                ? 'green-preview'
                : 'orange-preview'}"
          >
            <div
              class:bow-blue={selectedCardDesign === "blue"}
              class:bow-green={selectedCardDesign === "green"}
              class:bow-orange={selectedCardDesign === "orange"}
            ></div>
              <div class="preview-card-message">
                {giftMessage || "Your gift message will appear here"}
              </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

{#if showStatusModal}
  <!-- Status Modal (Success/Failed) -->
  <div
    class="modal-overlay"
    on:click={handleStatusModalBackdropClick}
    on:keydown={(e) => e.key === "Escape" && handleCloseStatusModal()}
    role="dialog"
    aria-modal="true"
    aria-labelledby="status-modal-title"
    tabindex="-1"
  >
    <div class="status-modal-content" on:click|stopPropagation role="document">
      <div class="status-modal-header">
        <div class="modal-logo">
          <img src={logo} alt="logo" class="logo-img" />
        </div>
        <button
          class="modal-close"
          on:click={handleCloseStatusModal}
          aria-label="Close status modal"
        >
          <img src={XIcon} alt="close" />
        </button>
      </div>

      <div class="status-modal-body">
        {#if isSuccess}
          <img src={green_check} alt="success" class="status-icon" />
          <div class="status-title">Gift Sent Successfully!</div>
          <div class="status-message">
            Your gift creation link has been sent successfully. The recipient will receive the link shortly.
          </div>
        {:else}
          <div class="status-icon error-icon">❌</div>
          <div class="status-title error-title">Failed to Send Gift</div>
          <div class="status-message error-message">
            {errorMessage || 'An error occurred while sending the gift creation link. Please try again.'}
          </div>
        {/if}
        <button class="status-button" on:click={handleDoneButton}>
          {#if isSuccess}
            Done
          {:else}
            Try Again
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .finishing-touches-page {
    width: 1240px;
    min-height: 100%;
    padding: 24px 100px 80px 100px;
    margin: auto;
    background: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 48px;
  }

  .content {
    width: 730px;
    min-height: 1075px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
  }

  .navbar {
    align-self: stretch;
    height: 79px;
    padding: 12px 12px 12px 24px;
    border-radius: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .logo-text-full {
    width: 203.32px;
    height: 38px;
    position: relative;
  }

  .logo-img {
    width: 203.32px;
    height: 38px;
  }

  .header {
    text-align: center;
  }

  .title {
    font-family: Quicksand;
    font-weight: 700;
    font-size: 42px;
    line-height: 56px;
    margin: 0;
    color: #121212;
  }

  .subtitle {
    font-family: Nunito;
    font-size: 18px;
    line-height: 22px;
    color: #666d80;
    margin-top: 8px;
  }

  .content-container {
    width: 100%;
    max-width: 730px;
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .section {
    background: white;
    border-radius: 20px;
    outline: 1px #dcdcdc solid;
    padding:  24px 12px 16px 12px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .section-title {
    font-family: Quicksand;
    font-weight: 600;
    font-size: 24px;
    color: #121212;
  }

  .section-subtitle {
    font-family: Quicksand;
    font-weight: 400;
    font-size: 18px;
    color: #121212;
    font-weight: 600;
    padding: 9px 0;
  }

  .section-content {
    display: flex;
    flex-direction: column;
    padding: 12px;
    border-radius: 12px;
    outline: 1px #dcdcdc solid;
    font-weight: 600;
    gap: 12px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .form-label {
    font-family: Quicksand;
    font-weight: 600;
    font-size: 16px;
    color: #141414;
  }

  .message-textarea {
    min-height: 168px;
    padding: 10px;
    background: white;
    border-radius: 12px;
    outline: 1px #dcdcdc solid;
    border: none;
    font-family: Nunito;
    font-size: 16px;
    color: #141414;
    resize: vertical;
    transition: all 0.2s ease;
  }

  .message-textarea:focus {
    outline: 2px solid #438bff;
    outline-offset: -2px;
    box-shadow: 0 0 0 3px rgba(67, 139, 255, 0.1);
  }

  .message-textarea::placeholder {
    color: #727272;
  }

  .character-count {
    font-family: Nunito;
    font-size: 14px;
    color: #666d80;
    text-align: left;
    margin-top: 4px;
  }

  .example-messages {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
  }

  .example-button {
    padding: 8px 16px;
    background: #f8fafb;
    border: 1px solid #dcdcdc;
    border-radius: 12px;
    font-family: Nunito;
    font-size: 14px;
    color: #141414;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .example-button:hover {
    background: #eef6ff;
    border-color: #438bff;
    color: #438bff;
  }

  .example-buttons-group {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .example-label {
    font-family: Quicksand;
    font-weight: 600;
    font-size: 16px;
    color: #141414;
  }

  .gift-cards {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-top: 16px;
  }

  .gift-card {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    outline: 2px solid transparent;
    border-radius: 12px;
    transition: all 0.2s ease;
  }

  .gift-card:hover {
    transform: translateY(-2px);
  }

  .gift-card.selected {
    outline: 2px solid #438bff;
  }

  .card-content {
    width: 219.3333282470703px;
    height: 322px;
    border-radius: 12px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .blue-card {
    background-image: url("../../../../assets/giftpackage1.png");
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
  }
  
  .green-card {
    background-image: url("../../../../assets/giftpackage2.png");
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }
  
  .orange-card {
    background-image: url("../../../../assets/giftpackage3.png");
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }

  .bow-blue {
    background: #ffb3d9;
    left: 50%;
    transform: translateX(-50%);
  }

  .bow-green {
    background: #ffcc99;
    left: 50%;
    transform: translateX(-50%);
  }

  .preview-button {
    padding: 12px 24px;
    width: 100%;
    background: #eef6ff;
    border: 1px solid #438bff;
    border-radius: 12px;
    color: #438bff;
    font-family: Quicksand;
    font-weight: 600;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    align-self: flex-start;
    margin-top: 8px;
  }

  .preview-button:hover {
    background: #d9eaff;
  }

  .actions {
    width: 100%;
    max-width: 730px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .send-button {
    padding: 16px 24px;
    background: #e0e0e0;
    border: none;
    border-radius: 20px;
    color: #666666;
    font-family: Quicksand;
    font-weight: 600;
    font-size: 18px;
    cursor: not-allowed;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: all 0.2s ease;
  }

  .send-button:not(:disabled) {
    background: #438bff;
    color: white;
    cursor: pointer;
  }

  .send-button:not(:disabled):hover {
    background: #3a7ae4;
  }

  .send-icon {
    width: 20px;
    height: 20px;
  }

  .back-button {
    padding: 16px 24px;
    background: white;
    border: 1px solid #dcdcdc;
    border-radius: 20px;
    color: #121212;
    font-family: Quicksand;
    font-weight: 600;
    font-size: 18px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: all 0.2s ease;
  }

  .back-button:hover {
    background: #f8fafb;
  }

  .arrow-icon {
    width: 20px;
    height: 20px;
  }

  @media (max-width: 800px) {
    .finishing-touches-page {
      padding: 16px;
      gap: 20px;
    }

    .title {
      font-size: 32px;
      line-height: 44px;
    }

    .subtitle {
      font-size: 16px;
    }

    .section {
      padding: 16px;
    }

    .section-title {
      font-size: 20px;
    }

    .gift-cards {
      flex-direction: column;
      align-items: center;
    }

    .gift-card {
      width: 100%;
    }

    .card-content {
      width: 100%;
      max-width: 280px;
    }

    .example-messages {
      flex-direction: column;
    }

    .example-button {
      width: 100%;
    }

    .actions {
      gap: 12px;
    }

    .send-button,
    .back-button {
      width: 100%;
    }
  }

  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .modal-content {
    background: white;
    border-radius: 20px;
    width: 592px;
    height: 836.548095703125px;
    max-width: 592px;
    max-height: 836.548095703125px;
    overflow-y: auto;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.3s ease;
    display: flex;
    flex-direction: column;
  }

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #ededed;
  }

  .modal-logo {
    font-family: Quicksand;
    font-weight: 700;
    font-size: 24px;
    color: #438bff;
  }

  .modal-close {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.2s ease;
  }

  .modal-close:hover {
    opacity: 0.7;
  }

  .modal-close img {
    width: 24px;
    height: 24px;
  }

  .modal-body {
    padding: 32px 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  .preview-gift-card {
    width: 100%;
    height: 100%;
  }

  .preview-card-bg {
    position: relative;
    padding: 60px 40px 40px;
    border-radius: 20px;
    display: flex;
  }

  .blue-preview {
    background-image: url("../../../../assets/giftpackage1.png");
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    height: 100%;
  }

  .green-preview {
    background-image: url("../../../../assets/giftpackage2.png");
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    height: 100%;
  }
  
  .orange-preview {
    background-image: url("../../../../assets/giftpackage3.png");
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    height: 100%;
  }

  .bow-blue {
    background: #ffb3d9;
  }

  .bow-green {
    background: #ffcc99;
  }

  .bow-orange {
    background: #ff9966;
  }


  .preview-card-message {
    font-family: "Comic Sans MS", "Marker Felt", cursive;
    font-size: 32px;
    font-weight: 700;
    line-height: 1.6;
    color: #722603;
    text-align: center;
    align-content: center;
    white-space: pre-wrap;
    width: 100%;
  }

  @media (max-width: 800px) {
    .modal-content {
      max-width: 95%;
      max-height: 95vh;
    }

    .modal-body {
      padding: 24px 16px;
      height: 100%;
    }

    .preview-card-bg {
      padding: 50px 30px 30px;
      min-height: 350px;
    }

  .preview-card-message {
    font-size: 18px;
  }
}

/* Status Modal Styles */
.status-modal-content {
  background: white;
  border-radius: 20px;
  width: 592px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
  display: flex;
  flex-direction: column;
}

.status-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #ededed;
}

.status-modal-body {
  padding: 40px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  text-align: center;
}

.status-icon {
  width: 80px;
  height: 80px;
  margin-bottom: 8px;
}

.error-icon {
  font-size: 80px;
  line-height: 80px;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-title {
  font-family: Quicksand;
  font-weight: 600;
  font-size: 24px;
  color: #121212;
  margin: 0;
}

.error-title {
  color: #ef4444;
}

.status-message {
  font-family: Nunito;
  font-size: 16px;
  font-weight: 400;
  color: #727272;
  line-height: 1.5;
  max-width: 433px;
}

.error-message {
  color: #ef4444;
}

.status-button {
  margin-top: 12px;
  padding: 16px 32px;
  background: #438bff;
  border: none;
  border-radius: 20px;
  color: white;
  font-family: Quicksand;
  font-weight: 600;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 182px;
}

.status-button:hover {
  background: #3a7ae4;
}

.status-button:active {
  transform: translateY(1px);
}

@media (max-width: 800px) {
  .status-modal-content {
    max-width: 95%;
  }

  .status-modal-body {
    padding: 32px 16px;
  }

  .status-title {
    font-size: 20px;
  }

  .status-message {
    font-size: 14px;
  }

  .status-button {
    width: 100%;
    max-width: 300px;
  }
}
</style>
