<script lang="ts">
  import StarEmoticon from "../../../components/StarEmoticon.svelte";
  import ProgressBar from "../../../components/ProgressBar.svelte";
  import arrowLeft from "../../../assets/WhiteArrowLeft.svg";
  import shieldStar from "../../../assets/ShieldStar.svg";
  import { goto } from "$app/navigation";
  import MobileBackBtn from "../../../components/MobileBackBtn.svelte";
  import MobileStepProgressBar from "../../../components/MobileStepProgressBar.svelte";
  import { browser } from "$app/environment";
  import { onMount } from "svelte";
  import forest from "../../../assets/big.png";
  import outspace from "../../../assets/outspace.png";
  import underwater from "../../../assets/underwater.png";
  import treasure from "../../../assets/treasurehunt.png";
  import helping from "../../../assets/helpfriend.png";
  import globehemispherewest from "../../../assets/BlackGlobeHemiSphereWest.svg";
  import { storyCreation } from "../../../lib/stores/storyCreation";

  let isMobile = false;
  let selectedWorld = ""; // Default selection: "forest", "outspace", or "underwater"
  let selectedAdventure = ""; // Default: no selection - user must choose "treasure" or "helping"
  let characterName = "";
  let specialAbility = "";
  let selectedStyle = "";
  let selectedEnhancement = "";

  // Style name mapping
  const styleNames = {
    "3d": "3D Realistic",
    "cartoon": "Cartoon",
    "anime": "Anime"
  };

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
      const storedSpecialAbility = sessionStorage.getItem('specialAbility');
      const storedSelectedStyle = sessionStorage.getItem('selectedStyle');
      const storedSelectedEnhancement = sessionStorage.getItem('selectedEnhancement');
      const storedOriginalImageUrl = sessionStorage.getItem('characterImageUrl');
      const storedSelectedWorld = sessionStorage.getItem('selectedWorld');
      const storedSelectedAdventure = sessionStorage.getItem('selectedAdventure');
      
      if (storedCharacterName) characterName = storedCharacterName;
      if (storedSpecialAbility) specialAbility = storedSpecialAbility;
      if (storedSelectedStyle) selectedStyle = storedSelectedStyle;
      if (storedSelectedEnhancement) selectedEnhancement = storedSelectedEnhancement;
      if (storedSelectedWorld) selectedWorld = storedSelectedWorld;
      if (storedSelectedAdventure) selectedAdventure = storedSelectedAdventure;
      
      // Don't generate images on page load - they will be generated on page 7
    }
  });

  function selectWorld(world: string) {
    selectedWorld = world;
    
    // Save the selected world to sessionStorage
    if (browser) {
      sessionStorage.setItem('selectedWorld', world);
    }
    
    // Update story creation store
    storyCreation.setStoryWorld(world as any);
  }

  function selectAdventure(adventure: string) {
    selectedAdventure = adventure;
    
    // Save the selected adventure to sessionStorage
    if (browser) {
      sessionStorage.setItem('selectedAdventure', adventure);
    }
  }


  // Check if both selections are made
  $: canContinue = selectedWorld !== "" && selectedAdventure !== "";

  // Handle continue to next step
  const handleContinue = async () => {
    // Only proceed if both selections are made
    if (!canContinue) return;
    
    // Update story creation store with selected world and adventure
    storyCreation.setStoryWorld(selectedWorld as any);
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
  <MobileBackBtn backRoute="/create-character/3" />
  <div class="frame-1410103818">
    <div class="heading">
      <div class="configure-your-story-adventure">
        <span class="configureyourstoryadventure_span">Configure Your Story Adventure</span>
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
    <MobileStepProgressBar currentStep={4} />
    <ProgressBar currentStep={4} />
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
              >Let's craft the perfect world for your story!</span
            >
          </div>
        </div>
      </div>
    </div>
    <div class="rectangle-261"></div>
    <div class="frame-1410103884">
      <div class="step-1-choose-story-world">
        <span class="step1choosestoryworld_span">Step 1: Choose Story World</span>
      </div>
      <div class="frame-1410103852">
        <div class="card" class:card-selected={selectedWorld === "forest"}>
          <div class="image-container">
            <img class="image" src={forest} alt="Enchanted Forest" />
          </div>
          <div class="frame-10">
            <div class="heading_01">
              <div class="enchanted-forest">
                <span class="enchantedforest_span">Enchanted Forest</span>
              </div>
              <div class="frame-2147227581">
                <div class="icons">
                  <div class="globehemispherewest">
                    <img src={globehemispherewest} alt="globehemispherewest">
                  </div>
                  <div>
                    <span class="magicalcreaturestalkingtrees_span">Magical Creatures & Talking Trees</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="button" class:button-selected={selectedWorld === "forest"} on:click={() => selectWorld("forest")}>
              <div class="select">
                <span class="select_span">Select</span>
              </div>
            </div>
          </div>
        </div>
        <div class="card" class:card-selected={selectedWorld === "outerspace"}>
          <div class="image-container">
            <img class="image" src={outspace} alt="Outer Space" />
          </div>
          <div class="frame-10">
            <div class="heading_01">
              <div class="outer-space">
                <span class="outerspace_span">Outer Space</span>
              </div>
              <div class="frame-2147227581">
                <div class="icons">
                  <div class="globehemispherewest">
                    <img src={globehemispherewest} alt="globehemispherewest">
                  </div>
                  <div>
                    <span class="cosmicplanetaliensfriendly_span">Cosmic Planet & Aliens Friendly</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="button" class:button-selected={selectedWorld === "outerspace"} on:click={() => selectWorld("outerspace")}>
              <div class="select">
                <span class="select_span" class:select-selected={selectedWorld === "outerspace"}>Select</span>
              </div>
            </div>
          </div>
        </div>
        <div class="card" class:card-selected={selectedWorld === "underwater"}>
          <div class="image-container">
            <img class="image" src={underwater} alt="Underwater Kingdom" />
          </div>
          <div class="frame-10">
            <div class="heading_01">
              <div class="underwater-kingdom">
                <span class="underwaterkingdom_span">Underwater Kingdom</span>
              </div>
              <div class="frame-2147227581">
                <div class="icons">
                  <div class="globehemispherewest">
                    <img src={globehemispherewest} alt="globehemispherewest">
                  </div>
                  <div>
                    <span class="mermaidsvibrantsealife_span">Mermaids & Vibrant Sea Life</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="button" class:button-selected={selectedWorld === "underwater"} on:click={() => selectWorld("underwater")}>
              <div class="select">
                <span class="select_span">Select</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="frame-1410103885">
      <div class="step-2-choose-adventure-type">
        <span class="step2chooseadventuretype_span">Step 2: Choose Adventure Type</span>
      </div>
      <div class="frame-1410103852_01">
        <div class="card_03" class:card-selected={selectedAdventure === "treasure"}>
          <div class="image-container">
            <img class="image_03" src={treasure} alt="Treasure Hunt" />
          </div>
          <div class="frame-10_03">
            <div class="frame-2147227609">
              <div class="treasure-hunt">
                <span class="treasurehunt_span">Treasure Hunt</span>
              </div>
              <div class="frame-1410104048">
                <div class="character-name-will-search-for-a-legendary-treasure-hidden-in-the-selected-world">
                  <span class="characternamewillsearchforalegendarytreasurehiddenintheselectedworld_span">
                    {characterName || '[Character Name]'} will search for a legendary treasure hidden in the {worldNames[selectedWorld as keyof typeof worldNames] || '[Selected World]'}
                  </span>
                </div>
              </div>
            </div>
            <div class="button_03" class:button-selected={selectedAdventure === "treasure"} on:click={() => selectAdventure("treasure")}>
              <div class="select_03">
                <span class="select_03_span">Select</span>
              </div>
            </div>
          </div>
        </div>
        <div class="card_04" class:card-selected={selectedAdventure === "helping"}>
          <div class="image_04">
            <img class="image-6" src={helping} alt="Helping a Friend" />
          </div>
          <div class="frame-10_04">
            <div class="frame-2147227610">
              <div class="helping-a-friend">
                <span class="helpingafriend_span">Helping a Friend</span>
              </div>
              <div class="frame-1410104048_01">
                <div class="character-name-will-help-a-friend-in-a-need-using-their-special-ability">
                  <span class="characternamewillhelpafriendinaneedusingtheirspecialability_span">
                    {characterName || '[Character Name]'} will help a friend in a need using their {specialAbility || '[Special Ability]'} <br/>
                  </span>
                </div>
              </div>
            </div>
            <div class="button_04" class:button-selected={selectedAdventure === "helping"} on:click={() => selectAdventure("helping")}>
              <div class="select_04">
                <span class="select_04_span" class:select-selected={selectedAdventure === "helping"}>Select</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="frame-1410104246" class:button-disabled={!canContinue} on:click={handleContinue}>
      <div class="generate-search-adventure">
        <span class="generatesearchadventure_span">Generate Search Adventure</span>
      </div>
      <div class="ellipse-1415"></div>
      <div class="arrowleft">
        <img src={arrowLeft} alt="arrowLeft" />
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
  .configureyourstoryadventure_span {
    color: #141414;
    font-size: 48px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 57.60px;
    word-wrap: break-word;
  }

  .configure-your-story-adventure {
    align-self: stretch;
    text-align: center;
  }

  .rectangle-261 {
    align-self: stretch;
    height: 1px;
    background: #EDEDED;
  }

  .step1choosestoryworld_span {
    color: #121212;
    font-size: 32px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 38.40px;
    word-wrap: break-word;
  }

  .step-1-choose-story-world {
    text-align: center;
  }

  .step2chooseadventuretype_span {
    color: #121212;
    font-size: 32px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 38.40px;
    word-wrap: break-word;
  }

  .step-2-choose-adventure-type {
    text-align: center;
  }

  .image {
    align-self: stretch;
    height: 400px;
    position: relative;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    border: 1px #D3D3D3 solid;
    object-fit: cover;
    width: 100%;
  }

  .image-container {
    position: relative;
    width: 100%;
    align-self: stretch;
  }

  .image_03 {
    align-self: stretch;
    height: 400px;
    position: relative;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    object-fit: cover;
    width: 100%;
  }

  .image_04 {
    align-self: stretch;
    height: 400px;
    position: relative;
    overflow: hidden;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
  }

  .image-6 {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }


  .enchantedforest_span {
    color: #141414;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.60px;
    word-wrap: break-word;
  }

  .enchanted-forest {
    align-self: stretch;
  }

  .vector {
    width: 16.25px;
    height: 16.25px;
    left: 1.88px;
    top: 1.88px;
    position: absolute;
    background: black;
  }

  .magicalcreaturestalkingtrees_span {
    color: #141414;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .select_span {
    color: black;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.20px;
    word-wrap: break-word;
  }

  .select {
    text-align: center;
  }

  .outerspace_span {
    color: #141414;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.60px;
    word-wrap: break-word;
  }

  .outer-space {
    align-self: stretch;
  }

  .cosmicplanetaliensfriendly_span {
    color: #141414;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .select-selected {
    color: #438BFF !important;
  }

  .underwaterkingdom_span {
    color: #141414;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.60px;
    word-wrap: break-word;
  }

  .underwater-kingdom {
    align-self: stretch;
  }

  .mermaidsvibrantsealife_span {
    color: #141414;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .treasurehunt_span {
    color: #141414;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.60px;
    word-wrap: break-word;
  }

  .treasure-hunt {
    align-self: stretch;
  }

  .characternamewillsearchforalegendarytreasurehiddenintheselectedworld_span {
    color: #727272;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .character-name-will-search-for-a-legendary-treasure-hidden-in-the-selected-world {
    align-self: stretch;
  }

  .select_03_span {
    color: black;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.20px;
    word-wrap: break-word;
  }

  .select_03 {
    text-align: center;
  }

  .helpingafriend_span {
    color: #141414;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.60px;
    word-wrap: break-word;
  }

  .helping-a-friend {
    align-self: stretch;
  }

  .characternamewillhelpafriendinaneedusingtheirspecialability_span {
    color: #727272;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .character-name-will-help-a-friend-in-a-need-using-their-special-ability {
    align-self: stretch;
  }

  .select_04_span {
    color: black;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.20px;
    word-wrap: break-word;
  }

  .select_04 {
    text-align: center;
  }

  .generatesearchadventure_span {
    color: white;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.20px;
    word-wrap: break-word;
  }

  .generate-search-adventure {
    text-align: center;
  }

  .ellipse-1415 {
    width: 248px;
    height: 114px;
    left: 24px;
    top: 25px;
    position: absolute;
    background: radial-gradient(ellipse 42.11% 42.11% at 50.00% 52.94%, white 0%, rgba(255, 255, 255, 0) 100%);
    border-radius: 9999px;
  }


  .frame-1410104246 {
    height: 54px;
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 16px;
    padding-bottom: 16px;
    position: relative;
    background: #438BFF;
    overflow: hidden;
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    display: inline-flex;
    cursor: pointer;
  }

  .frame-1410104246.button-disabled {
    background: #D3D3D3;
    cursor: not-allowed;
    opacity: 0.6;
  }

  .frame-1410103884 {
    align-self: stretch;
    padding: 24px;
    border-radius: 12px;
    outline: 2px #EDEDED solid;
    outline-offset: -2px;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 24px;
    display: flex;
  }

  .frame-1410103885 {
    align-self: stretch;
    padding: 24px;
    border-radius: 12px;
    outline: 2px #EDEDED solid;
    outline-offset: -2px;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 24px;
    display: flex;
  }

  .frame-1410103852_01 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
    display: inline-flex;
  }

  .card {
    flex: 1 1 0;
    padding-top: 1px;
    padding-bottom: 10px;
    padding-left: 1px;
    padding-right: 1px;
    background: white;
    border-radius: 20px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
    cursor: pointer;
    position: relative;
  }

  .card-selected {
    box-shadow: 0px 1px 8px #438BFF;
    outline: 1px #173DB6 solid;
  }

  .card_03 {
    flex: 1 1 0;
    padding-bottom: 10px;
    background: white;
    border-radius: 20px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
    cursor: pointer;
    position: relative;
  }

  .card_04 {
    flex: 1 1 0;
    padding-bottom: 10px;
    background: white;
    border-radius: 20px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
    cursor: pointer;
    position: relative;
  }

  .card_03.card-selected,
  .card_04.card-selected {
    box-shadow: 0px 1px 8px #438BFF;
    outline: 1px #173DB6 solid;
  }

  .frame-10 {
    align-self: stretch;
    padding-top: 8px;
    padding-bottom: 12px;
    padding-left: 12px;
    padding-right: 12px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 32px;
    display: flex;
  }

  .frame-10_03 {
    align-self: stretch;
    padding-top: 8px;
    padding-bottom: 12px;
    padding-left: 12px;
    padding-right: 12px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 32px;
    display: flex;
  }

  .frame-10_04 {
    align-self: stretch;
    padding-top: 8px;
    padding-bottom: 12px;
    padding-left: 12px;
    padding-right: 12px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 32px;
    display: flex;
  }

  .frame-1410104027 {
    justify-content: center;
    align-items: center;
    display: flex;
    width: 100%;
  }

  .heading_01 {
    align-self: stretch;
    padding-left: 8px;
    padding-right: 8px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .frame-2147227581 {
    align-self: stretch;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 6px;
    display: flex;
  }

  .icons {
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: inline-flex;
  }

  .globehemispherewest {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
  }

  .button {
    align-self: stretch;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 12px;
    padding-bottom: 12px;
    background: white;
    border-radius: 12px;
    outline: 1px #DCDCDC solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }

  .button-selected {
    height: 49px;
    background: #E7FEFF;
    box-shadow: 0px 4px 0px #438BFF;
    outline: 2px rgba(231, 254, 255, 0.20) solid;
  }

  .button_03 {
    align-self: stretch;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 12px;
    padding-bottom: 12px;
    background: white;
    border-radius: 12px;
    outline: 1px #DCDCDC solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }

  .button_04 {
    align-self: stretch;
    height: 49px;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 12px;
    padding-bottom: 12px;
    background: white;
    border-radius: 12px;
    outline: 1px #DCDCDC solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }

  .button_03.button-selected,
  .button_04.button-selected {
    background: #E7FEFF;
    box-shadow: 0px 4px 0px #438BFF;
    outline: 2px rgba(231, 254, 255, 0.20) solid;
  }

  .frame-2147227609 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .frame-2147227610 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .frame-1410104048 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .frame-1410104048_01 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .ffreepagepreview_span {
    color: #438bff;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
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

  .heading {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 16px;
    display: flex;
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

  .frame-1410103852 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
    display: inline-flex;
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

  .message-content {
    padding-left: 12px;
    padding-right: 12px;
    padding-top: 16px;
    padding-bottom: 16px;
    background: #d9eaff;
    border-radius: 24px;
    margin-left: 22px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .lets-bring-your-character-to-life-upload-a-drawing-or-photo {
    /* width: 600px; */
  }

  .letsbringyourcharactertolifeuploadadrawingorphoto_span {
    color: black;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  @media (max-width: 800px) {
    .configure-your-story-adventure {
      text-align: left;
    }
    .heading {
      align-items: flex-start;
    }
    .frame-1410103852,
    .frame-1410103852_01 {
      flex-direction: column;
      gap: 12px;
    }

    .character-creation-default {
      padding-left: 20px;
      padding-right: 20px;
    }

    .configureyourstoryadventure_span {
      font-size: 32px;
      line-height: 38.4px;
    }

    .step1choosestoryworld_span,
    .step2chooseadventuretype_span {
      font-size: 24px;
      line-height: 28.8px;
    }

    .card,
    .card_03,
    .card_04 {
      width: 100%;
      flex: none;
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
</style>
