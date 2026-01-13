<script lang="ts">
  import StarEmoticon from "../../../components/StarEmoticon.svelte";
  import ProgressBar from "../../../components/ProgressBar.svelte";
  import arrowLeft from "../../../assets/ArrowLeft.svg";
  import shieldStar from "../../../assets/ShieldStar.svg";
  import { goto } from "$app/navigation";
  import MobileBackBtn from "../../../components/MobileBackBtn.svelte";
  import MobileStepProgressBar from "../../../components/MobileStepProgressBar.svelte";
  import EnhancementCard from "../../../components/EnhancementCard.svelte";
  import { browser } from "$app/environment";
  import { onMount } from "svelte";
  import { 
    saveSelectedImageUrl
  } from "../../../lib/imageGeneration";
  import { storyCreation } from "../../../lib/stores/storyCreation";

  let isMobile = false;
  let selectedEnhancement = ""; // Default: no selection - "minimal", "normal", or "high"
  let uploadedImageUrl = "";
  let selectedStyle = "";
  let lastSelectedStyle = "";
  let checkInterval: ReturnType<typeof setInterval> | null = null;
  let allImagesGenerated = false;
  let imageCheckInterval: ReturnType<typeof setInterval> | null = null;

  $: if (browser) {
    isMobile = window.innerWidth < 800;
  }

  // Check if all three enhancement images are generated
  const checkAllImagesGenerated = () => {
    if (!browser || !selectedStyle) {
      allImagesGenerated = false;
      return;
    }
    
    const enhancements = ['minimal', 'normal', 'high'];
    const allGenerated = enhancements.every(enhancement => {
      const enhancementKey = `enhancementImage_${selectedStyle}_${enhancement}`;
      const enhancedImageUrl = sessionStorage.getItem(enhancementKey);
      return enhancedImageUrl && enhancedImageUrl.trim().length > 0;
    });
    
    allImagesGenerated = allGenerated;
    
    // Clear interval if all images are generated
    if (allGenerated && imageCheckInterval) {
      clearInterval(imageCheckInterval);
      imageCheckInterval = null;
    }
  };

  // Watch for selected enhancement and store the enhanced image when available
  $: if (browser && selectedEnhancement && selectedStyle) {
    const enhancementKey = `enhancementImage_${selectedStyle}_${selectedEnhancement}`;
    const enhancedImageUrl = sessionStorage.getItem(enhancementKey);
    if (enhancedImageUrl) {
      // Store the selected character enhanced image to session storage
      const cleanedUrl = enhancedImageUrl.split('?')[0];
      sessionStorage.setItem('selectedCharacterEnhancedImage', cleanedUrl);
      saveSelectedImageUrl('4', cleanedUrl);
      
      // Clear any existing interval since we found the image
      if (checkInterval) {
        clearInterval(checkInterval);
        checkInterval = null;
      }
      
      // Check if all images are now generated
      checkAllImagesGenerated();
    }
  }

  // Periodically check if all images are generated when style is available
  $: if (browser && selectedStyle) {
    // Clear existing interval if it exists
    if (imageCheckInterval) {
      clearInterval(imageCheckInterval);
      imageCheckInterval = null;
    }
    
    // Initial check
    checkAllImagesGenerated();
    
    // Set up periodic check every 500ms only if not all images are generated yet
    if (!allImagesGenerated) {
      imageCheckInterval = setInterval(() => {
        checkAllImagesGenerated();
      }, 500);
    }
  }

  onMount(() => {
    if (browser) {
      // Get the uploaded image URL and selected style from previous steps
      uploadedImageUrl = sessionStorage.getItem('characterImageUrl') || "";
      selectedStyle = sessionStorage.getItem('selectedStyle') || "cartoon";
      lastSelectedStyle = selectedStyle;
      
      // Get character details from sessionStorage 
      const characterType = sessionStorage.getItem('selectedCharacterType') || "";
      const specialAbility = sessionStorage.getItem('specialAbility') || "";
      const description = ""; // Description field doesn't exist yet, but keeping for future use
      
      // Clear enhancement cache
      ['minimal', 'normal', 'high'].forEach(enhancement => {
        ['3d', 'cartoon', 'anime'].forEach(style => {
          sessionStorage.removeItem(`enhancementImage_${style}_${enhancement}`);
        });
      });
      
      // No longer generating base character image with special ability
      // Using original uploaded image directly
      
      // Initial check for all images
      checkAllImagesGenerated();
    }
    
    // Cleanup interval on unmount
    return () => {
      if (imageCheckInterval) {
        clearInterval(imageCheckInterval);
        imageCheckInterval = null;
      }
      if (checkInterval) {
        clearInterval(checkInterval);
        checkInterval = null;
      }
    };
  });


  // Watch for style changes - no longer generating base character image
  $: if (browser && selectedStyle && lastSelectedStyle && selectedStyle !== lastSelectedStyle) {
    lastSelectedStyle = selectedStyle;
    // Reset allImagesGenerated when style changes since new images need to be generated
    allImagesGenerated = false;
    // Clear existing check interval
    if (imageCheckInterval) {
      clearInterval(imageCheckInterval);
      imageCheckInterval = null;
    }
    // Start checking again for new style
    checkAllImagesGenerated();
  }

  function selectEnhancement(enhancement: string) {
    // Clear any existing interval before selecting a new enhancement
    if (checkInterval) {
      clearInterval(checkInterval);
      checkInterval = null;
    }
    
    selectedEnhancement = enhancement;
    
    // Save selected enhancement to sessionStorage
    if (browser) {
      sessionStorage.setItem('selectedEnhancement', enhancement);
      
      // Save the selected enhanced image URL if available
      const enhancementKey = `enhancementImage_${selectedStyle}_${enhancement}`;
      const enhancedImageUrl = sessionStorage.getItem(enhancementKey);
      if (enhancedImageUrl) {
        // Store the selected character enhanced image to session storage
        const cleanedUrl = enhancedImageUrl.split('?')[0];
        sessionStorage.setItem('selectedCharacterEnhancedImage', cleanedUrl);
        saveSelectedImageUrl('4', cleanedUrl);
      } else {
        // If image is not yet generated, set up a watcher to store it when it becomes available
        // Check periodically for the image (in case it's still generating)
        checkInterval = setInterval(() => {
          const imageUrl = sessionStorage.getItem(enhancementKey);
          if (imageUrl) {
            const cleanedUrl = imageUrl.split('?')[0];
            sessionStorage.setItem('selectedCharacterEnhancedImage', cleanedUrl);
            saveSelectedImageUrl('4', cleanedUrl);
            if (checkInterval) {
              clearInterval(checkInterval);
              checkInterval = null;
            }
          }
        }, 500);
        
        // Clear interval after 30 seconds to avoid infinite checking
        setTimeout(() => {
          if (checkInterval) {
            clearInterval(checkInterval);
            checkInterval = null;
          }
        }, 30000);
      }
    }
  }

  // Handle continue to next step - collect all enhanced images
  const handleContinue = () => {
    if (!browser || !allImagesGenerated) return;
    
    try {
      // Get the selected enhanced image URL
      let selectedEnhancedImage = '';
      if (selectedEnhancement && selectedStyle) {
        const enhancementKey = `enhancementImage_${selectedStyle}_${selectedEnhancement}`;
        const enhancedImageUrl = sessionStorage.getItem(enhancementKey);
        if (enhancedImageUrl) {
          selectedEnhancedImage = enhancedImageUrl.split('?')[0];
        }
      }

      // Collect all enhanced images for the selected style
      const enhancedImages: string[] = [];
      const enhancements = ['minimal', 'normal', 'high'];
      
      enhancements.forEach(enhancement => {
        const enhancementKey = `enhancementImage_${selectedStyle}_${enhancement}`;
        const enhancedImageUrl = sessionStorage.getItem(enhancementKey);
        if (enhancedImageUrl) {
          // Clean the URL (remove query parameters)
          enhancedImages.push(enhancedImageUrl.split('?')[0]);
        }
      });
      
      // Save enhanced images to story creation store
      storyCreation.setEnhancedImages(enhancedImages);
      
      console.log('Enhanced images collected:', enhancedImages);

      // Navigate to next step
      goto("/create-character/3");
    } catch (error) {
      console.error('Error in handleContinue:', error);
      // Continue anyway
      goto("/create-character/3");
    }
  };
</script>

<div class="character-creation-default">
  <div class="navbar">
    <div class="logo-text-full">
      <div class="logo-img"></div>
    </div>
  </div>
  <MobileBackBtn backRoute="/create-character/1" />
  <div class="frame-1410103818">
    <div class="heading">
      <div class="create-your-character">
        <span class="createyourcharacter_span"
          >Select your Enchancement Level</span
        >
      </div>
      <div class="upload-your-drawing-or-draw-your-own-character-right-here">
        <span class="uploadyourdrawingordrawyourowncharacterrighthere_span"
          >Choose the level of enhancement for your character. All levels are
          included in your story package.</span
        >
      </div>
      <div class="tag">
        <div class="shieldstar">
          <img src={shieldStar} alt="star" />
        </div>
        <div>
          <span class="ffreepagepreview_span">2 Free Page Preview</span>
        </div>
      </div>
    </div>
    <MobileStepProgressBar currentStep={2} />
    <ProgressBar currentStep={2} />
    <div class="frame-1410104027">
      <div class="star-container">
        <StarEmoticon />
      </div>
      <div class="message-container">
        <div class="polygon-1"></div>
        <div class="message-content">
          <div
            class="lets-bring-your-character-to-life-upload-a-drawing-or-photo"
          >
            <span class="letsbringyourcharactertolifeuploadadrawingorphoto_span"
              >How polished should your character look?</span
            >
          </div>
        </div>
      </div>
    </div>
    <div class="frame-1410104073">
      <EnhancementCard
        enhancementId="minimal"
        title="Minimal Enhancement"
        subtitle="Keep that hand-drawn charm"
        features={[
          "Light cleanup and coloring",
          "Preserves original drawing style",
          "Perfect for younger kids (3-6)"
        ]}
        isSelected={selectedEnhancement === "minimal"}
        onSelect={selectEnhancement}
        beforeImage={uploadedImageUrl}
        originalImageUrl={uploadedImageUrl}
        selectedStyle={selectedStyle}
      />
      <EnhancementCard
        enhancementId="normal"
        title="Normal Enhancement"
        subtitle="Professional storybook quality"
        features={[
          "Balanced enhancement with polish",
          "Maintains character personality",
          "Great for all ages"
        ]}
        isSelected={selectedEnhancement === "normal"}
        onSelect={selectEnhancement}
        showMostPopular={true}
        beforeImage={uploadedImageUrl}
        originalImageUrl={uploadedImageUrl}
        selectedStyle={selectedStyle}
      />
      <EnhancementCard
        enhancementId="high"
        title="High Enhancement"
        subtitle="Publication-ready artwork"
        features={[
          "Fully rendered, professional quality",
          "Advanced lighting and details",
          "Perfect for keepsakes and gifts"
        ]}
        isSelected={selectedEnhancement === "high"}
        onSelect={selectEnhancement}
        beforeImage={uploadedImageUrl}
        originalImageUrl={uploadedImageUrl}
        selectedStyle={selectedStyle}
      />
    </div>

    <div class="frame-1410104075">
      {#if !isMobile}
        <div class="frame-1410103870">
          <button class="button" on:click={() => goto("/create-character/1")}>
            <div class="arrowleft">
              <img src={arrowLeft} alt="arrowLeft" class="vector" />
            </div>
            <div class="back-to-step">
              <span class="backtostep_span">Back To Step</span>
            </div>
          </button>
        </div>
      {/if}
      <div class="frame-2147227476">
        <button class="button_01">
          <div class="keep-current-version">
            <span class="keepcurrentversion_span">Keep Current Version</span>
          </div>
        </button>
        <button
          class="button_02"
          class:mobile-full-width={isMobile}
          class:disabled={!allImagesGenerated}
          disabled={!allImagesGenerated}
          on:click={handleContinue}
        >
          <div class="continue-to-story-configuration">
            <span class="continuetostoryconfiguration_span"
              >Continue to Story Configuration</span
            >
          </div>
        </button>
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
  .createyourcharacter_span {
    color: #121212;
    font-size: 48px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 67.2px;
    word-wrap: break-word;
  }

  .create-your-character {
    align-self: stretch;
    text-align: center;
  }

  .uploadyourdrawingordrawyourowncharacterrighthere_span {
    color: #666d80;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 21.6px;
    word-wrap: break-word;
  }

  .upload-your-drawing-or-draw-your-own-character-right-here {
    align-self: stretch;
    text-align: center;
  }

  .ffreepagepreview_span {
    color: #438bff;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    word-wrap: break-word;
  }

  .polygon-1 {
    width: 0;
    height: 0;
    position: absolute;
    left: 0px;
    top: 50%;
    transform: translateY(-50%);
    border-top: 12px solid transparent;
    /* border-bottom: 12px solid transparent; */
    border-right: 18px solid #d9eaff;
  }

  .letsbringyourcharactertolifeuploadadrawingorphoto_span {
    color: black;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .lets-bring-your-character-to-life-upload-a-drawing-or-photo {
    width: 417px;
  }

  .backtostep_span {
    color: black;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.20px;
    word-wrap: break-word;
  }

  .back-to-step {
    text-align: center;
  }

  .keepcurrentversion_span {
    color: #438BFF;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.20px;
    word-wrap: break-word;
  }

  .keep-current-version {
    text-align: center;
  }

  .continuetostoryconfiguration_span {
    color: white;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.20px;
    word-wrap: break-word;
  }

  .continue-to-story-configuration {
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

  .frame-1410103820 {
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
  }

  .shieldstar {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
    top: -2px;
  }

  .vector {
    width: 18px;
    height: 15px;
    left: 3px;
    top: 4.50px;
    position: absolute;
    object-fit: contain;
  }

  .arrowleft {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .star-container {
    flex-shrink: 0;
    width: 88px;
    height: 88px;
  }

  .message-container {
    position: relative;
    display: flex;
    align-items: center;
    margin-left: 12px;
  }

  .message-content {
    padding-left: 12px;
    padding-right: 12px;
    padding-top: 16px;
    padding-bottom: 16px;
    background: #d9eaff;
    border-radius: 24px;
    margin-left: 22px;
    max-width: 446px;
    display: flex;
    justify-content: center;
    align-items: center;
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
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
    justify-content: center;
  }

  .tag {
    padding-top: 8px;
    padding-bottom: 8px;
    padding-left: 8px;
    padding-right: 12px;
    background: #eef6ff;
    border-radius: 99px;
    outline: 1px #438bff solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: flex-end;
    gap: 4px;
    display: inline-flex;
  }


  .button_01 {
    width: 231px;
    height: 52px;
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
    display: flex;
    border: none;
    cursor: pointer;
  }

  .button_01:hover {
    background: #d0f5f7;
    box-shadow: 0px 4px 0px #357ae8;
  }

  .button_01:active {
    transform: translateY(2px);
    box-shadow: 0px 2px 0px #438BFF;
  }

  .button_02 {
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    background: #438BFF;
    color: white;
    border-radius: 20px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    border: none;
    cursor: pointer;
    transition: opacity 0.2s ease, background-color 0.2s ease;
  }

  .button_02:disabled,
  .button_02.disabled {
    background: #cccccc;
    cursor: not-allowed;
    opacity: 0.6;
  }

  .button_02:disabled:hover,
  .button_02.disabled:hover {
    background: #cccccc;
  }

  .button {
    width: 200px;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    box-shadow: 0px 4px 4px rgba(98.89, 98.89, 98.89, 0.25);
    border-radius: 20px;
    outline: 1px #DCDCDC solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    background: white;
    border: none;
    cursor: pointer;
  }

  .frame-2147227476 {
    justify-content: flex-end;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .frame-1410103870 {
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .frame-1410104075 {
    width: 100%;
    height: 100%;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .heading {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 16px;
    display: flex;
  }

  .frame-1410104027 {
    justify-content: center;
    align-items: center;
    display: flex;
    width: 100%;
  }

  .frame-1410103818 {
    width: 100%;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    gap: 24px;
    display: flex;
  }

  .character-creation-default {
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
  .logo-text-full {
    width: 203.32px;
    height: 38px;
    min-height: 38px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .logo-img {
    background-image: url("../../../assets/logo.png");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    width: 100%;
    height: 100%;
  }






  .frame-1410104073 {
    width: 100%;
    height: 100%;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .mobile-full-width {
    width: 100% !important;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @media (max-width: 800px) {
    .create-your-character {
      text-align: left;
    }
    .upload-your-drawing-or-draw-your-own-character-right-here {
      text-align: left;
    }
    .heading {
      align-items: flex-start;
    }
    .frame-1410104073 {
      flex-direction: column;
      gap: 12px;
    }

    .character-creation-default {
      padding-left: 20px;
      padding-right: 20px;
    }

    .createyourcharacter_span {
      font-size: 32px;
      line-height: 44.8px;
    }

    .uploadyourdrawingordrawyourowncharacterrighthere_span {
      font-size: 16px;
      line-height: 19.2px;
    }

    .star-container {
      width: 25%;
    }
    .message-container {
      max-width: 75%;
    }
    .message-content {
      width: 90%;
    }

    .frame-1410104075 {
      flex-direction: column;
      gap: 12px;
      align-items: stretch;
    }

    .frame-2147227476 {
      flex-direction: column;
      width: 100%;
      gap: 12px;
    }

    .button_01,
    .button_02 {
      width: 100%;
    }
  }
</style>
