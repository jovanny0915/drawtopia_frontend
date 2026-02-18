<script lang="ts">
  import StarEmoticon from "../../../components/StarEmoticon.svelte";
  import ProgressBar from "../../../components/ProgressBar.svelte";
  import arrowLeft from "../../../assets/ArrowLeft.svg";
  import shieldStar from "../../../assets/ShieldStar.svg";
  import { goto } from "$app/navigation";
  import MobileBackBtn from "../../../components/MobileBackBtn.svelte";
  import MobileStepProgressBar from "../../../components/MobileStepProgressBar.svelte";
  import { browser } from "$app/environment";
  import { onMount } from "svelte";
  import small from "../../../assets/small.png";
  import classic from "../../../assets/classic.png";
  import spinner from "../../../assets/Spinner.svg";
  import { storyCreation } from "../../../lib/stores/storyCreation";
  import { generateIntersearchCover, saveSelectedImageUrl, generateCoverImageWithTemplate } from "../../../lib/imageGeneration";
  import { generateStoryTitles } from "../../../lib/api/storyTitles";
  import { getRandomTemplateByStoryWorld } from "../../../lib/api/admin";
  import { user } from "../../../lib/stores/auth";

  let isMobile = false;
  let characterName = "";
  let selectedImageFromStep6 = "";
  let selectedStyle = "";
  let selectedEnhancement = "";
  let selectedWorld = "";
  let selectedAdventure = "";
  let selectedFormat = "";
  let enhancedCharacterImage = "";
  let isGeneratingImage = false;
  let isGeneratingTitles = false;
  let isInitialLoadComplete = false; // Track if initial load is done
  let selectedCharacterEnhancedImage = "";
  let intersearchWorld = "";
  let intersearchDifficulty = "";
  // Selection state variables - these will be updated with the character name
  let selectedTitle = "";
  let selectedCoverDesign = "Classic Storybook";
  let customTitleText = "";
  let customTitleDebounceTimer: ReturnType<typeof setTimeout> | undefined;

  // Title options with character name
  let titleOptions: string[] = [];
  
  // Effective title for continue/store: preset or custom text when "Custom Title" is selected
  $: effectiveTitle = selectedTitle === "Custom Title" ? customTitleText.trim() : selectedTitle;

  // Computed property to check if continue button should be enabled
  $: canContinue = !isGeneratingImage && !isGeneratingTitles &&
                   selectedImageFromStep6 && 
                   selectedImageFromStep6.trim().length > 0 &&
                   (selectedTitle !== "Custom Title" ? (selectedTitle && selectedTitle.trim().length > 0) : (customTitleText && customTitleText.trim().length > 0));

  $: if (browser) {
    isMobile = window.innerWidth < 800;
  }

  // Fallback titles when API fails or data is missing
  const getFallbackTitles = () => {
    const name = characterName || '[Your Name]';
    return [
      `The Great Adventure of ${name}`,
      `The Amazing Journey of ${name}`,
      `${name} and the Magical Quest`
    ];
  };

  // Retrieve character data from sessionStorage on component mount
  onMount(async () => {
    if (browser) {
      const storedCharacterName = sessionStorage.getItem('characterName');
      characterName = storedCharacterName || '';
      
      // Get selections from sessionStorage
      selectedStyle = sessionStorage.getItem('selectedStyle') || "";
      selectedEnhancement = sessionStorage.getItem('selectedEnhancement') || "";
      selectedWorld = sessionStorage.getItem('selectedWorld') || "";
      selectedAdventure = sessionStorage.getItem('selectedAdventure') || "";
      selectedFormat = sessionStorage.getItem('selectedFormat') || "";
      enhancedCharacterImage = sessionStorage.getItem('selectedCharacterEnhancedImage') || "";
      const specialAbility = sessionStorage.getItem('specialAbility') || '';
      const characterType = sessionStorage.getItem('selectedCharacterType') || 'person';
      const ageGroup = sessionStorage.getItem('ageGroup') || '7-10';

      // STEP 1: Generate story titles first (show only loading during this)
      isGeneratingTitles = true;
      const titlesResult = await generateStoryTitles({
        characterName: characterName || 'Character',
        specialAbility: specialAbility,
        storyWorld: selectedWorld || 'forest',
        adventureType: selectedAdventure || 'treasure',
        characterType: characterType,
        characterStyle: selectedStyle || 'cartoon',
        storyFormat: selectedFormat || 'story',
        ageGroup: ageGroup
      });

      if (titlesResult.success && titlesResult.titles && titlesResult.titles.length >= 3) {
        titleOptions = titlesResult.titles;
        // Don't auto-select any title
      } else {
        // Fallback to default titles
        titleOptions = getFallbackTitles();
        // Don't auto-select any title
        if (titlesResult.error) {
          console.warn('Story titles API failed, using fallback:', titlesResult.error);
        }
      }
      isGeneratingTitles = false;
      
      // Mark initial load as complete
      isInitialLoadComplete = true;
    }
  });

  // Generate cover image using template and character image (no environment generation)
  const generateImages = async (title?: string) => {
    if (!enhancedCharacterImage || !selectedWorld || !selectedAdventure || isGeneratingImage) return;
    
    isGeneratingImage = true;
    
    try {
      // Generate cover image using template and character image
      const worldMapping: { [key: string]: 'forest' | 'underwater' | 'outerspace' } = {
        'forest': 'forest',
        'outerspace': 'outerspace',
        'underwater': 'underwater'
      };
      const mappedWorld = worldMapping[selectedWorld] || 'forest';
      
      // Use the title parameter or effective title
      const titleToUse = title || effectiveTitle || selectedTitle;
      
      // Skip if title is empty or just "Custom Title" without actual text
      if (!titleToUse || titleToUse.trim().length === 0 || titleToUse === "Custom Title") {
        console.log('Skipping cover generation - no valid title');
        isGeneratingImage = false;
        return;
      }
      
      const coverCacheKey = `coverImage_${selectedWorld}_${selectedAdventure}_${titleToUse}`;
      
      // Check cache first (don't clear it!)
      let coverImageUrl = sessionStorage.getItem(coverCacheKey);
      
      if (!coverImageUrl) {
        // Only clear these when we're about to generate a new image
        sessionStorage.removeItem('storyCover');
        sessionStorage.removeItem('selectedImage_step6');
        
        // Get character image for cover generation
        const characterImageUrl = sessionStorage.getItem('selectedCharacterEnhancedImage');
        
        if (!characterImageUrl) {
          console.error('No character image available for cover generation');
          isGeneratingImage = false;
          return;
        }
        
        // Get a random book template for the story world
        const templateResult = await getRandomTemplateByStoryWorld(mappedWorld);

        if (!templateResult.success || !templateResult.data?.cover_image) {
          console.warn(`No template found for ${mappedWorld}, cannot generate cover`);
          if (templateResult.error) {
            console.warn(`Template lookup error: ${templateResult.error}`);
          }
          isGeneratingImage = false;
          alert('No book template available for the selected story world. Please contact support.');
          return;
        }
        
        // Save book template ID to sessionStorage for later use
        if (templateResult.data.id) {
          sessionStorage.setItem('bookTemplateId', templateResult.data.id);
          console.log(`Saved book template ID: ${templateResult.data.id}`);
        }
        
        // Use the new API with template
        console.log(`Using template cover: ${templateResult.data.cover_image}`);
        console.log(`Generating cover with title: ${titleToUse}`);
        
        const coverResult = await generateCoverImageWithTemplate({
          templateCoverUrl: templateResult.data.cover_image,
          characterImageUrl: characterImageUrl,
          storyWorld: mappedWorld,
          storyTitle: titleToUse,
          saveToStorage: true,
          storageKey: coverCacheKey
        });
        
        if (coverResult.success && coverResult.url) {
          coverImageUrl = coverResult.url;
          selectedImageFromStep6 = coverResult.url;
          saveSelectedImageUrl('6', coverImageUrl);
          storyCreation.setOriginalImageUrl(coverImageUrl);
        } else {
          console.error('Failed to generate cover with template:', coverResult.error);
        }
      } else {
        console.log(`Using cached cover for title: ${titleToUse}`);
        coverImageUrl = coverImageUrl.split('?')[0];
        selectedImageFromStep6 = coverImageUrl;
        storyCreation.setOriginalImageUrl(coverImageUrl);
      }
    } catch (error) {
      console.error('Error generating images:', error);
    } finally {
      isGeneratingImage = false;
    }
  };

  // Generate interactive search story cover
  const generateInteractiveSearchCover = async () => {
    if (isGeneratingImage) return;
    
    isGeneratingImage = true;
    
    try {
      // Generate the intersearch cover using the new function
      const result = await generateIntersearchCover();
      
      if (result.success && result.url) {
        selectedImageFromStep6 = result.url;
        saveSelectedImageUrl('6', result.url);
        storyCreation.setOriginalImageUrl(result.url);
      } else {
        console.error('Failed to generate intersearch cover:', result.error);
      }
    } catch (error) {
      console.error('Error generating interactive search cover:', error);
    } finally {
      isGeneratingImage = false;
    }
  };

  // Title selection handler - regenerate cover when title changes (only after initial load)
  function selectTitle(title: string) {
    selectedTitle = title;
    
    // Only regenerate if initial load is complete and it's NOT custom title
    // (custom title will regenerate via reactive statement)
    if (isInitialLoadComplete && selectedFormat !== "interactive" && title !== "Custom Title") {
      generateImages(title);
    }
  }

  // Handle custom title text changes with debounce (only after initial load)
  let previousCustomTitleText = '';
  $: if (browser && isInitialLoadComplete && selectedTitle === "Custom Title" && customTitleText && customTitleText.trim().length > 0 && customTitleText !== previousCustomTitleText) {
    // Clear existing timer
    if (customTitleDebounceTimer) {
      clearTimeout(customTitleDebounceTimer);
    }
    
    // Set new timer to regenerate cover after user stops typing
    customTitleDebounceTimer = setTimeout(() => {
      if (selectedFormat !== "interactive" && customTitleText.trim().length > 0) {
        previousCustomTitleText = customTitleText;
        generateImages(customTitleText);
      }
    }, 1000); // Wait 1 second after user stops typing
  }

  // Handle preview story button click (continue generation)
  const handleContinueToDedicationPage = async () => {
    // Only proceed if conditions are met
    if (!canContinue) return;

    const currentUser = $user;
    if (!currentUser?.id) {
      return;
    }

    // Update story creation store with final story presentation data
    // Include the cover image URL if available (use effective title: custom text when "Custom Title" is selected)
    const coverImageUrl = selectedImageFromStep6 ? selectedImageFromStep6.split('?')[0] : undefined;
    storyCreation.setStoryPresentation(effectiveTitle, selectedCoverDesign, coverImageUrl);

    // Determine which dedication page to navigate to based on the gift_mode from sessionStorage
    let dedicationPath = "/create-character/dedication/creation-link"; // Default to creation-link

    if (browser) {
      const giftMode = sessionStorage.getItem("gift_mode");
      if (!giftMode || giftMode === "create") {
        // If the flow is "Create & Send", go to create-send dedication page
        dedicationPath = "/create-character/dedication/create-send";
      } else {
        // If the flow is "Send Creation Link" or not set, go to creation-link dedication page
        dedicationPath = "/create-character/dedication/creation-link";
      }
    }

    // Navigate to the appropriate dedication page
    goto(dedicationPath);
  };

  const goToDashboard = () => {
    goto('/dashboard');
  };
</script>

<div class="character-creation-default">
  <div class="navbar">
    <div class="logo-text-full" role="button" tabindex="0" on:click={goToDashboard} on:keydown={(e) => e.key === 'Enter' && goToDashboard()}>
      <div class="logo-img"></div>
    </div>
  </div>
  <MobileBackBtn backRoute="/create-character/5" />
  <div class="frame-1410103818">
    <div class="heading">
      <div class="create-your-character">
        <span class="createyourcharacter_span">Here your Magical Story</span>
      </div>
      <div class="upload-your-drawing-or-draw-your-own-character-right-here">
        <span class="uploadyourdrawingordrawyourowncharacterrighthere_span"
          >Your character is now part of their very own adventure!</span
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
    <MobileStepProgressBar currentStep={5} />
    <ProgressBar currentStep={5} />
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
              >Let's design the perfect cover for your story!</span
            >
          </div>
        </div>
      </div>
    </div>
    {#if isGeneratingTitles}
      <!-- Show only loading spinner while generating titles -->
      <div class="initial-loading-container">
        <img src={spinner} alt="Loading" class="spinner" />
        <div class="generating-text">Generating story titles...</div>
      </div>
    {:else}
      <!-- Show main content after titles are generated -->
      <div class="frame-1410104031">
        <div class="frame-8">
          <div class="frame-1410104034">
            <div class="cover-book-preview">
              <span class="coverbookpreview_span">Cover Book Preview</span>
            </div>
          </div>
          {#if isGeneratingImage}
            <div class="generating-overlay">
              <img src={spinner} alt="Loading" class="spinner" />
              <div class="generating-text">Generating cover image...</div>
            </div>
          {:else if selectedImageFromStep6}
            <img
              class="image"
              src={selectedImageFromStep6}
              alt="image_card_1"
            />
          {:else}
            <div class="no-cover-placeholder">
              <span class="no-cover-text">No Cover</span>
            </div>
          {/if}
        </div>
        <div class="frame-9">
        <div class="information-cover">
          <span class="informationcover_span">Information Cover</span>
        </div>
        <div class="form">
          <div><span class="titleselection_span">Title Selection</span></div>
          <div class="frame-1410103942">
            <div 
              class="selected" 
              class:selected={selectedTitle === (titleOptions[0] || "The Great Addventure [Your Name]")}
              class:selected_01={selectedTitle !== (titleOptions[0] || "The Great Addventure [Your Name]")}
              on:click={() => selectTitle(titleOptions[0] || "The Great Addventure [Your Name]")}
              on:keydown={(e) => e.key === 'Enter' && selectTitle(titleOptions[0] || "The Great Addventure [Your Name]")}
              tabindex="0"
              role="button"
              aria-label="Select The Great Adventure title"
            >
              <div class="frame-1410103940">
                <div class="frame-1410103939">
                  <div>
                    <span class="thegreataddventureyourname_span"
                      >{titleOptions[0] || "The Great Addventure [Your Name]"}
                    </span>
                  </div>
                </div>
              </div>
              {#if selectedTitle === (titleOptions[0] || "The Great Addventure [Your Name]")}
                <div class="frame-1410104043">
                  <div class="ellipse-14"></div>
                  <div class="ellipse-13_01"></div>
                </div>
              {:else}
                <div class="ellipse-13"></div>
              {/if}
            </div>
            <div 
              class="selected_01" 
              class:selected={selectedTitle === (titleOptions[1] || "The Amazing of Journey [Your Name]")}
              class:selected_01={selectedTitle !== (titleOptions[1] || "The Amazing of Journey [Your Name]")}
              on:click={() => selectTitle(titleOptions[1] || "The Amazing of Journey [Your Name]")}
              on:keydown={(e) => e.key === 'Enter' && selectTitle(titleOptions[1] || "The Amazing of Journey [Your Name]")}
              tabindex="0"
              role="button"
              aria-label="Select The Amazing Journey title"
            >
              <div class="frame-1410103940_01">
                <div class="frame-1410103939_01">
                  <div>
                    <span class="theamazingofjourneyyourname_span"
                      >{titleOptions[1] || "The Amazing of Journey [Your Name]"}
                    </span>
                  </div>
                </div>
              </div>
              {#if selectedTitle === (titleOptions[1] || "The Amazing of Journey [Your Name]")}
                <div class="frame-1410104043">
                  <div class="ellipse-14"></div>
                  <div class="ellipse-13_01"></div>
                </div>
              {:else}
                <div class="ellipse-13_02"></div>
              {/if}
            </div>
            <div 
              class="selected_02" 
              class:selected={selectedTitle === (titleOptions[2] || "[Your Name] and the Space Adventure")}
              class:selected_02={selectedTitle !== (titleOptions[2] || "[Your Name] and the Space Adventure")}
              on:click={() => selectTitle(titleOptions[2] || "[Your Name] and the Space Adventure")}
              on:keydown={(e) => e.key === 'Enter' && selectTitle(titleOptions[2] || "[Your Name] and the Space Adventure")}
              tabindex="0"
              role="button"
              aria-label="Select Space Adventure title"
            >
              <div class="frame-1410103940_02">
                <div class="frame-1410103939_02">
                  <div>
                    <span class="yournameandthespaceadventure_span"
                      >{titleOptions[2] || "[Your Name] and the Space Adventure"}</span
                    >
                  </div>
                </div>
              </div>
              {#if selectedTitle === (titleOptions[2] || "[Your Name] and the Space Adventure")}
                <div class="frame-1410104043">
                  <div class="ellipse-14"></div>
                  <div class="ellipse-13_01"></div>
                </div>
              {:else}
                <div class="ellipse-13_03"></div>
              {/if}
            </div>
          </div>
        </div>
        <div class="form_01">
          <div><span class="customstorytitle_span">Custom Story Title</span></div>
          <div class="frame-1410103942_01">
            <div 
              class="selected_04" 
              class:selected-custom={selectedTitle === "Custom Title"}
              on:click={() => selectTitle("Custom Title")}
              on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && (selectTitle("Custom Title"), e.preventDefault())}
              tabindex="0"
              role="button"
              aria-label="Select Custom Title"
            >
              <div class="frame-1410104084">
                <div class="frame-1410103940_04">
                  <div class="frame-1410103939_04">
                    <div><span class="customtitle_span">Custom Title</span></div>
                  </div>
                </div>
              </div>
              <div class="frame-1410104043">
                <div class="ellipse-14"></div>
                <div class="ellipse-13_01" class:hidden={selectedTitle !== "Custom Title"}></div>
              </div>
            </div>
            {#if selectedTitle === "Custom Title"}
              <div class="input-form title-input-form">
                <div class="input-placeholder title-input-placeholder">
                  <input
                    type="text"
                    class="custom-title-input"
                    bind:value={customTitleText}
                    placeholder="Enter your custom story title..."
                    aria-label="Custom story title"
                  />
                </div>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>

    <div
      style="display: flex; justify-content: {isMobile
        ? 'center'
        : 'space-between'}; width: 100%;"
    >
      {#if !isMobile}
        <button class="button_01" on:click={() => goto("/create-character/5")}>
          <div class="arrowleft">
            <img src={arrowLeft} alt="arrowLeft" />
          </div>
          <div class="back-to-step">
            <span class="backtostep_span">Back To Step</span>
          </div>
        </button>
      {/if}
      <button
        class="button-fill"
        class:mobile-full-width={isMobile}
        class:disabled={!canContinue}
        disabled={!canContinue}
        on:click={handleContinueToDedicationPage}
      >
        <div class="continue-to-style-selection">
          <span class="continuetostyleselection_span">Continue to Dedication Page</span>
        </div>
      </button>
    </div>
    {/if}
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
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .back-to-step {
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
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    box-shadow: 0px 4px 4px rgba(98.89, 98.89, 98.89, 0.25);
    border-radius: 20px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    background-color: white;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
    width: 200px;
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
    cursor: pointer;
  }
  .logo-img {
    background-image: url("../../../assets/logo.png");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    width: 100%;
    height: 100%;
  }

  .continuetostyleselection_span {
    color: white;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .continue-to-style-selection {
    text-align: center;
  }

  .button-fill {
    width: 300px;
    height: 100%;
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
    border: none;
    cursor: pointer;
    transition: opacity 0.2s ease, background-color 0.2s ease;
  }

  .button-fill:disabled,
  .button-fill.disabled {
    background: #cccccc;
    cursor: not-allowed;
    opacity: 0.6;
  }

  .button-fill:disabled:hover,
  .button-fill.disabled:hover {
    background: #cccccc;
  }

  .image {
    position: relative;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
  }

  .coverbookpreview_span {
    color: black;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28px;
    word-wrap: break-word;
  }

  .cover-book-preview {
    text-align: center;
  }

  .image {
    align-self: center;
    height: 837px;
    position: relative;
    border-radius: 12px;
  }

  .informationcover_span {
    color: #141414;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28px;
    word-wrap: break-word;
  }

  .information-cover {
    align-self: stretch;
  }

  .titleselection_span {
    color: #141414;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .thegreataddventureyourname_span {
    color: #141414;
    font-size: 16px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .ellipse-13 {
    width: 24px;
    height: 24px;
    border-radius: 9999px;
    border: 1px #ededed solid;
  }

  .ellipse-14 {
    width: 24px;
    height: 24px;
    left: 0px;
    top: 0px;
    position: absolute;
    border-radius: 9999px;
    border: 1px #438bff solid;
  }

  .ellipse-13_01 {
    width: 12px;
    height: 12px;
    left: 6px;
    top: 6px;
    position: absolute;
    background: #438bff;
    border-radius: 9999px;
    border: 1px #438bff solid;
  }

  .theamazingofjourneyyourname_span {
    color: #141414;
    font-size: 16px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .ellipse-13_02 {
    width: 24px;
    height: 24px;
    border-radius: 9999px;
    border: 2px #ededed solid;
  }

  .yournameandthespaceadventure_span {
    color: #141414;
    font-size: 16px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .ellipse-13_03 {
    width: 24px;
    height: 24px;
    border-radius: 9999px;
    border: 2px #ededed solid;
  }

  .customtitle_span {
    color: #141414;
    font-size: 16px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  /* Custom title input (aligned with Information Dedication Pages on dedication/creation-link) */
  .title-input-form,
  .input-form.title-input-form {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .title-input-placeholder,
  .input-placeholder.title-input-placeholder {
    align-self: stretch;
    min-height: 48px;
    padding: 12px;
    background: white;
    overflow: hidden;
    border-radius: 12px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    display: inline-flex;
  }

  .custom-title-input {
    flex: 1 1 0;
    width: 100%;
    color: #141414;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
    border: none;
    outline: none;
    background: transparent;
  }

  .custom-title-input::placeholder {
    color: #727272;
  }

  .frame-1410104034 {
    align-self: stretch;
    padding: 8px;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }

  .frame-1410103939 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 2px;
    display: inline-flex;
  }

  .frame-1410103939_01 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 2px;
    display: inline-flex;
  }

  .frame-1410103939_02 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 2px;
    display: inline-flex;
  }

  .frame-1410104043 {
    width: 24px;
    height: 24px;
    position: relative;
  }

  .frame-8 {
    flex: 1 1 0;
    padding: 10px;
    background: white;
    border-radius: 20px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
    position: relative;
  }

  .frame-1410103940 {
    flex: 1 1 0;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .frame-1410103940_01 {
    flex: 1 1 0;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .frame-1410103940_02 {
    flex: 1 1 0;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .selected {
    align-self: stretch;
    padding: 12px;
    background: #eef6ff;
    border-radius: 12px;
    outline: 1px #438bff solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .selected:hover {
    background: #d9eaff;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(67, 139, 255, 0.15);
  }

  .selected_01 {
    align-self: stretch;
    padding: 12px;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .selected_01:hover {
    background: #f8f9fa;
    outline: 1px #c0c0c0 solid;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .selected_02 {
    align-self: stretch;
    padding: 12px;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .selected_02:hover {
    background: #f8f9fa;
    outline: 1px #c0c0c0 solid;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .frame-1410104084 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: inline-flex;
  }

  .selected-custom {
    background: #EEF6FF !important;
    outline: 1px #173DB6 solid !important;
  }

  .frame-1410103942 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .form_01 {
    align-self: stretch;
    padding: 12px;
    border-radius: 10px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: flex;
  }

  .customstorytitle_span {
    color: #141414;
    font-size: 18px;
    font-family: DM Sans;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .frame-1410103942_01 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .selected_04 {
    align-self: stretch;
    padding: 12px;
    border-radius: 12px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .selected_04:hover {
    background: #f8f9fa;
    outline: 1px #c0c0c0 solid;
  }

  .frame-1410103940_04 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .frame-1410103939_04 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 2px;
    display: inline-flex;
  }

  .ellipse-13_01.hidden {
    display: none;
  }

  .form {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .frame-9 {
    width: 627px;
    padding: 16px;
    background: white;
    border-radius: 20px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
  }

  .frame-1410104031 {
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
  }

  .mobile-full-width {
    width: 100% !important;
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
    .frame-1410104031 {
      flex-direction: column;
      gap: 16px;
    }

    .frame-8,
    .frame-9 {
      width: 100%;
      flex: none;
    }

    .frame-9 {
      width: 100%;
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

    .lets-bring-your-character-to-life-upload-a-drawing-or-photo {
      width: auto;
      max-width: 300px;
    }

    .message-content {
      margin-left: 12px;
      max-width: 300px;
    }

    .star-container {
      align-self: center;
    }

    .message-container {
      margin-left: 0;
      justify-content: center;
    }

    .image {
      height: 400px;
    }

    .coverbookpreview_span,
    .informationcover_span {
      font-size: 18px;
      line-height: 25.2px;
    }

    .titleselection_span{
      font-size: 14px;
      line-height: 19.6px;
    }

    .selected,
    .selected_01,
    .selected_02,
    .selected_04 {
      padding: 8px;
    }

    .thegreataddventureyourname_span,
    .theamazingofjourneyyourname_span,
    .yournameandthespaceadventure_span,
    .customtitle_span {
      font-size: 14px;
      line-height: 19.6px;
    }

    .custom-title-input {
      font-size: 14px;
      line-height: 19.6px;
    }

    .customstorytitle_span {
      font-size: 16px;
      line-height: 22.4px;
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
  }

  .generating-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.95);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 12px;
    gap: 16px;
  }

  .initial-loading-container {
    width: 100%;
    min-height: 600px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 24px;
    padding: 48px;
  }

  .spinner {
    width: 48px;
    height: 48px;
    animation: spin 1.5s linear infinite;
  }

  .generating-text {
    color: #438bff;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    text-align: center;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .no-cover-placeholder {
    width: 700px;
    height: 837px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 2px dashed #dcdcdc;
    border-radius: 12px;
    background: #f9f9f9;
  }

  .no-cover-text {
    color: #999999;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    text-align: center;
  }

  @media (max-width: 800px) {
    .no-cover-placeholder {
      height: 400px;
    }

    .no-cover-text {
      font-size: 18px;
    }
  }
</style>
