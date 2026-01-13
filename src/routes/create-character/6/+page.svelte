<script lang="ts">
  import StarEmoticon from "../../../components/StarEmoticon.svelte";
  import ProgressBar from "../../../components/ProgressBar.svelte";
  import arrowLeft from "../../../assets/ArrowLeft.svg";
  import shieldStar from "../../../assets/ShieldStar.svg";
  import { goto } from "$app/navigation";
  import MobileBackBtn from "../../../components/MobileBackBtn.svelte";
  import MobileStepProgressBar from "../../../components/MobileStepProgressBar.svelte";
  import AdventureCard from "../../../components/AdventureCard.svelte";
  import { browser } from "$app/environment";
  import { onMount } from "svelte";
  import treasure from "../../../assets/treasurehunt.png";
  import helping from "../../../assets/helpfriend.png";
  import { 
    generateStyledImage,
    saveSelectedImageUrl,
    hasSelectedImageChanged,
    getSelectedImageUrl
  } from "../../../lib/imageGeneration";
  import { storyCreation } from "../../../lib/stores/storyCreation";

  let isMobile = false;
  let selectedAdventure = "treasure"; // Default selection: "treasure" or "helping"
  let characterName = "";
  let selectedWorld = "";
  let specialAbility = "";
  let selectedStyle = "";
  let selectedEnhancement = "";
  let environmentImage = "";
  let adventureImages: { [key: string]: string } = {};
  let generatingStates: { [key: string]: boolean } = {};

  // World name mapping
  const worldNames = {
    forest: "Enchanted Forest",
    outspace: "Outer Space", 
    underwater: "Underwater Kingdom"
  };

  $: if (browser) {
    isMobile = window.innerWidth < 800;
  }

  // Retrieve character data from sessionStorage on component mount
  onMount(() => {
    if (browser) {
      const storedCharacterName = sessionStorage.getItem('characterName');
      const storedSelectedWorld = sessionStorage.getItem('selectedWorld');
      const storedSpecialAbility = sessionStorage.getItem('specialAbility');
      const storedSelectedStyle = sessionStorage.getItem('selectedStyle');
      const storedSelectedEnhancement = sessionStorage.getItem('selectedEnhancement');
      
      if (storedCharacterName) characterName = storedCharacterName;
      if (storedSelectedWorld) selectedWorld = storedSelectedWorld;
      if (storedSpecialAbility) specialAbility = storedSpecialAbility;
      if (storedSelectedStyle) selectedStyle = storedSelectedStyle;
      if (storedSelectedEnhancement) selectedEnhancement = storedSelectedEnhancement;
      
      // Get the environment image from step 5
      if (selectedWorld && selectedStyle && selectedEnhancement) {
        const environmentKey = `environmentImage_${selectedStyle}_${selectedEnhancement}_${selectedWorld}`;
        const storedEnvironmentImage = sessionStorage.getItem(environmentKey);
        if (storedEnvironmentImage) {
          environmentImage = storedEnvironmentImage.split('?')[0];
        }
      }
      
      // Check if the selected image from step 5 has changed
      const step5SelectedImage = getSelectedImageUrl('5');
      if (step5SelectedImage && hasSelectedImageChanged('5', step5SelectedImage)) {
        // Clear adventure cache if the source image changed
        ['treasure', 'helping'].forEach(adventure => {
          ['forest', 'underwater', 'outerspace'].forEach(world => {
            sessionStorage.removeItem(`adventureImage_${world}_${adventure}`);
          });
        });
      }
      
      // Load any previously generated adventure images
      loadAdventureImages();
      
      // Generate adventure images for all adventure types
      generateAllAdventureImages();
    }
  });

  function selectAdventure(adventure: string) {
    selectedAdventure = adventure;
    
    // Save the selected adventure image URL
    if (browser && adventureImages[adventure]) {
      saveSelectedImageUrl('6', adventureImages[adventure]);
      // Set the adventure image as the original_image_url in the story creation store
      storyCreation.setOriginalImageUrl(adventureImages[adventure]);
    }
  }

  // Load previously generated adventure images
  const loadAdventureImages = () => {
    const adventures = ['treasure', 'helping'];
    adventures.forEach(adventure => {
      const cachedImage = sessionStorage.getItem(`adventureImage_${selectedWorld}_${adventure}`);
      if (cachedImage) {
        adventureImages[adventure] = cachedImage.split('?')[0];
        // If this is the currently selected adventure, update the story store
        if (adventure === selectedAdventure) {
          storyCreation.setOriginalImageUrl(adventureImages[adventure]);
        }
      }
    });
    adventureImages = { ...adventureImages };
  };

  // Generate adventure images for all adventure types
  const generateAllAdventureImages = async () => {
    if (!environmentImage || !selectedWorld) return;
    
    const adventures = ['treasure', 'helping'];
    
    // Generate all adventure images in parallel
    const promises = adventures.map(adventure => generateAdventureImage(adventure, environmentImage));
    await Promise.allSettled(promises);
  };

  // Generate adventure image for a specific adventure type
  const generateAdventureImage = async (adventure: string, baseImage: string) => {
    if (!baseImage || generatingStates[adventure]) return;
    
    // Check if already cached
    const cacheKey = `adventureImage_${selectedWorld}_${adventure}`;
    const cachedImage = sessionStorage.getItem(cacheKey);
    if (cachedImage) {
      adventureImages[adventure] = cachedImage.split('?')[0];
      adventureImages = { ...adventureImages };
      return;
    }
    
    generatingStates[adventure] = true;
    generatingStates = { ...generatingStates };
    
    try {
      // Map adventure names to match prompt.json structure
      const adventureMapping: { [key: string]: string } = {
        'treasure': 'treasurehunt',
        'helping': 'helpfriend'
      };
      
      const adventureKey = adventureMapping[adventure] || adventure;
      
      const result = await generateStyledImage({
        imageUrl: baseImage,
        style: 'adventure',
        quality: `${selectedWorld}_${adventureKey}` as any,
        saveToStorage: true,
        storageKey: cacheKey
      });

      if (result.success && result.url) {
        adventureImages[adventure] = result.url;
        adventureImages = { ...adventureImages };
        
        // If this is the currently selected adventure, save it and update story store
        if (adventure === selectedAdventure) {
          saveSelectedImageUrl('6', result.url);
          storyCreation.setOriginalImageUrl(result.url);
        }
      }
    } catch (error) {
      console.error(`Error generating ${adventure} image:`, error);
    } finally {
      generatingStates[adventure] = false;
      generatingStates = { ...generatingStates };
    }
  };

  // Handle continue to next step
  const handleContinue = async () => {
      // Update story creation store with selected adventure
      const adventureType = selectedAdventure === 'treasure' ? 'treasure_hunt' : 'helping_friend';
      storyCreation.setAdventureType(adventureType);
    goto("/create-character/7");
  };
</script>

<div class="character-creation-default">
  <div class="navbar">
    <div class="logo-text-full">
      <div class="logo-img"></div>
    </div>
  </div>
  <MobileBackBtn backRoute="/create-character/5" />
  <div class="frame-1410103818">
    <div class="heading">
      <div class="create-your-character">
        <span class="createyourcharacter_span"
          >Choose your Character Style Selection</span
        >
      </div>
      <div class="upload-your-drawing-or-draw-your-own-character-right-here">
        <span class="uploadyourdrawingordrawyourowncharacterrighthere_span"
          >Choose the artistic style that will bring your character to life.
          Each style offers a unique way to tell your story.</span
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
              >What kind of adventure should hisyam have?</span
            >
          </div>
        </div>
      </div>
    </div>
    <div class="frame-1410103852">
      <AdventureCard
        adventureId="treasure"
        title="Treasure Hunt"
        storyPreview={`"${characterName || '[Character Name]'} will search for a legendary treasure hidden in the ${worldNames[selectedWorld as keyof typeof worldNames] || '[Selected World]'}"`}
        focusTags={["Problem-solving", "discovery", "perseverance"]}
        imageSrc={adventureImages["treasure"] || treasure}
        imageAlt="image_card_1"
        isSelected={selectedAdventure === "treasure"}
        onSelect={selectAdventure}
        isGenerating={generatingStates["treasure"] || false}
      />
      <AdventureCard
        adventureId="helping"
        title="Helping a Friend"
        storyPreview={`"${characterName || '[Character Name]'} will help a friend in need using their special ${specialAbility || '[Ability]'}"`}
        focusTags={["Kindness", "cooperation", "using talents for good"]}
        imageSrc={adventureImages["helping"] || helping}
        imageAlt="image_card_2"
        isSelected={selectedAdventure === "helping"}
        onSelect={selectAdventure}
        isGenerating={generatingStates["helping"] || false}
      />
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
        on:click={handleContinue}
      >
        <div class="continue-to-style-selection">
          <span class="continuetostyleselection_span"
            >Continue to Companion</span
          >
        </div>
      </button>
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
  }

  .frame-1410103852 {
    width: 90%;
    height: 100%;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
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
    .frame-1410103852 {
      flex-direction: column;
      gap: 12px;
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
      width: 25%;
    }

    .message-container {
      margin-left: 0;
      justify-content: center;
      max-width: 75%;
    }

    .message-content {
      width: 90%;
    }
  }
</style>
