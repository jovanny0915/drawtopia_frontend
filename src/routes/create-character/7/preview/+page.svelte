<script lang="ts">
  import ProgressBar from "../../../../components/ProgressBar.svelte";
  import arrowLeft from "../../../../assets/ArrowLeft.svg";
  import shieldStar from "../../../../assets/ShieldStar.svg";
  import bookOpen from "../../../../assets/BookOpenText.svg";
  import palette from "../../../../assets/Palette.svg";
  import globe from "../../../../assets/GlobeHemisphereWest.svg";
  import globeStand from "../../../../assets/GlobeStand.svg";
  import printReady from "../../../../assets/Check_blue.svg";
  import FloppyDiskBack from "../../../../assets/FloppyDiskBack.svg";
  import { goto } from "$app/navigation";
  import MobileBackBtn from "../../../../components/MobileBackBtn.svelte";
  import MobileStepProgressBar from "../../../../components/MobileStepProgressBar.svelte";
  import { browser } from "$app/environment";
  import { onMount } from "svelte";
  import { getSelectedImageUrl } from "../../../../lib/imageGeneration";
  import { storyCreation } from "../../../../lib/stores/storyCreation";
  import { createStory } from "../../../../lib/database/stories";
  import { user } from "../../../../lib/stores/auth";

  let isMobile = false;
  let characterName = "";
  let specialAbility = "";
  let selectedStyle = "";
  let selectedWorld = "";
  let selectedAdventure = "";
  let selectedAdventureImageUrl = "";

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

  // Adventure name mapping
  const adventureNames = {
    treasure: "Treasure Hunt",
    helping: "Helping a Friend"
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
      const storedSelectedWorld = sessionStorage.getItem('selectedWorld');
      const storedSelectedAdventure = sessionStorage.getItem('selectedAdventure');
      
      if (storedCharacterName) {
        characterName = storedCharacterName;
      }
      if (storedSpecialAbility) {
        specialAbility = storedSpecialAbility;
      }
      if (storedSelectedStyle) {
        selectedStyle = storedSelectedStyle;
      }
      if (storedSelectedWorld) {
        selectedWorld = storedSelectedWorld;
      }
      if (storedSelectedAdventure) {
        selectedAdventure = storedSelectedAdventure;
      }
      
      // Load the selected adventure image from step 6
      const step6SelectedImage = getSelectedImageUrl('6');
      if (step6SelectedImage) {
        selectedAdventureImageUrl = step6SelectedImage;
      } else if (selectedWorld && selectedAdventure) {
        // Fallback: try to get the adventure image from sessionStorage
        const adventureImageKey = `adventureImage_${selectedWorld}_${selectedAdventure}`;
        const storedAdventureImage = sessionStorage.getItem(adventureImageKey);
        if (storedAdventureImage) {
          selectedAdventureImageUrl = storedAdventureImage.split('?')[0];
        }
      }
    }
  });

  // Handle complete story creation button click
  const handleCompleteStoryCreation = async () => {
    try {

      // Get current story state
      let currentState;
      const unsubscribe = storyCreation.subscribe(state => {
        console.log(state);
        currentState = state;
      });
      unsubscribe();
      if (currentState) {

        // Create story in database
        const storyData = {
          ...storyCreation.toStoryObject(currentState),
          user_id: $user?.id
        };

        const result = await createStory(storyData as any);
        
        if (result.success) {
          console.log('Story created successfully:', result.data);
          
          // Clear the story creation data after successful creation
          storyCreation.clear();
          
          // Navigate to dashboard or success page
          goto('/dashboard');
        } else {

          console.error('Failed to create story:', result.error);
          alert('Failed to create story. Please try again.');
        }
      } else {
        console.error('No story data found');
        alert('Story data is missing. Please go back and complete all steps.');
      }
    } catch (error) {
      console.error('Error creating story:', error);
      alert('An error occurred while creating the story. Please try again.');
    }
  };
</script>

<div class="character-creation-default">
  <div class="navbar">
    <div class="logo-text-full">
      <div class="logo-img"></div>
    </div>
  </div>
  {#if isMobile}
    <MobileBackBtn backRoute="/create-character/7" />
  {/if}
  <div class="frame-1410103818">
    <div class="heading">
      <div class="create-your-character">
        <span class="createyourcharacter_span"
          >Here your Magical Story</span
        >
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
    {#if isMobile}
      <MobileStepProgressBar currentStep={7} />
    {:else}
      <ProgressBar currentStep={7} />
    {/if}
    <div class="frame-1410104031">
      <div class="frame-9">
          <div class="story-summary"><span class="storysummary_span">Story Summary</span></div>
          <div class="frame-1410104097">
              <div class="frame-1410104091">
                  <img class="frame-1410104089" src={selectedAdventureImageUrl || "https://placehold.co/91x90"} alt="image_card_2"/>
                  <div class="frame-1410104090">
                      <div class="your-name-character"><span class="yournamecharacter_span">{characterName || "[Your Name Character]"}</span></div>
                      <div class="person-with-special-ability"><span class="personwithspecialability_span">Person with {specialAbility || "[Special Ability]"}</span></div>
                  </div>
              </div>
              <div class="stroke"></div>
              <div class="frame-1410104096">
                  <div class="frame-1410104094">
                      <div class="frame-1410104092">
                          <div class="frame-1410104099">
                            <img src={bookOpen} alt="bookOpen" />
                          </div>
                          <div class="frame-1410104098">
                              <div class="style"><span class="style_span">Style</span></div>
                              <div class="anime"><span class="anime_span">{styleNames[selectedStyle as keyof typeof styleNames] || "Anime"}</span></div>
                          </div>
                      </div>
                      <div class="frame-1410104093">
                          <div class="frame-1410104099_01">
                            <img src={palette} alt="palette" />
                          </div>
                          <div class="frame-1410104100">
                              <div class="enhancement"><span class="enhancement_span">Enhancement:</span></div>
                              <div class="normal"><span class="normal_span">Normal</span></div>
                          </div>
                      </div>
                  </div>
                  <div class="frame-1410104095">
                      <div class="frame-1410104092_01">
                          <div class="frame-1410104099_02">
                            <img src={globe} alt="globe" />
                          </div>
                          <div class="frame-1410104102">
                              <div class="world"><span class="world_span">World:</span></div>
                              <div class="cartoon"><span class="cartoon_span">{worldNames[selectedWorld as keyof typeof worldNames] || "Cartoon"}</span></div>
                          </div>
                      </div>
                      <div class="frame-1410104093_01">
                          <div class="frame-1410104099_03">
                            <img src={globeStand} alt="globestand" />
                          </div>
                          <div class="frame-1410104101">
                              <div class="adventure"><span class="adventure_span">Adventure:</span></div>
                              <div class="making-friends"><span class="makingfriends_span">{adventureNames[selectedAdventure as keyof typeof adventureNames] || "Making Friends"}</span></div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
          <div class="frame-1410104098_01">
              <div class="frame-1410104091_01">
                  <div class="frame-1410104090_01">
                      <div class="story-details"><span class="storydetails_span">Story Details</span></div>
                  </div>
              </div>
              <div class="stroke_01"></div>
              <div class="frame-1410104096_01">
                  <div class="frame-1410104094_01">
                      <div class="frame-1410104092_02">
                          <div class="frame-1410104098_02">
                              <div class="pages"><span class="pages_span">Pages</span></div>
                              <div class="text-8"><span class="f_span">8</span></div>
                          </div>
                      </div>
                      <div class="frame-1410104094_02">
                          <div class="frame-1410104098_03">
                              <div class="min-read"><span class="minread_span">Min Read</span></div>
                              <div class="text-5-7-min"><span class="f-7min_span">5-7 Min</span></div>
                          </div>
                      </div>
                      <div class="frame-1410104093_02">
                          <div class="frame-1410104100_01">
                              <div class="min-audio"><span class="minaudio_span">Min Audio</span></div>
                              <div class="text-12-min"><span class="f2min_span">12 Min</span></div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
      <div class="form">
          <div class="information-book-cover"><span class="informationbookcover_span">Information Book Cover</span></div>
          <div class="frame-1410104103">
              <img class="image" src={selectedAdventureImageUrl || "https://placehold.co/287x431"} alt="image_card_1"/>
              <div class="frame-1410104075">
                  <div class="checklist">
                      <div class="check">
                        <img src={printReady} alt="printReady" />
                      </div>
                      <div><span class="digitalbook_span">Digital Book</span></div>
                  </div>
                  <div class="checklist_01">
                      <div class="check_02">
                        <img src={printReady} alt="audioVersion" />
                      </div>
                      <div><span class="audioversion_span">Audio Version</span></div>
                  </div>
                  <div class="checklist_02">
                      <div class="check_04">
                        <img src={printReady} alt="printReady" />
                      </div>
                      <div><span class="print-readypdf_span"> Print-Ready PDF</span></div>
                  </div>
              </div>
          </div>
          <div class="frame-1410103870">
              <div class="button">
                <img src={FloppyDiskBack} alt="printReady" />
                  <div class="preview-and-purchase-story"><span class="previewandpurchasestory_span">Create Author Story</span></div>
              </div>
          </div>
      </div>
  </div>
  
    <div style="display: flex; justify-content: {isMobile ? 'center' : 'space-between'}; width: 100%;">
      {#if !isMobile}
      <button class="button_01" on:click={() => goto('/create-character/7')}>
        <div class="arrowleft">
          <img src={arrowLeft} alt="arrowLeft" />
        </div>
        <div class="back-to-step">
          <span class="backtostep_span">Back To Step</span>
        </div>
      </button>
      {/if}
      <button class="button-fill" class:mobile-full-width={isMobile} on:click={handleCompleteStoryCreation}>
        <div class="continue-to-style-selection">
          <span class="continuetostyleselection_span"
            >Complete Story Creation</span
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
    background-image: url("../../../../assets/logo.png");
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
      outline: 1px #EDEDED solid;
      outline-offset: -1px;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      gap: 24px;
      display: inline-flex;
  }

  .storysummary_span {
      color: #141414;
      font-size: 20px;
      font-family: Quicksand;
      font-weight: 600;
      line-height: 28px;
      word-wrap: break-word;
  }
  
  .story-summary {
      align-self: stretch;
  }
  
  .frame-1410104089 {
      width: 91px;
      height: 90px;
      position: relative;
      background: white;
      border-radius: 4px;
  }
  
  .yournamecharacter_span {
      color: black;
      font-size: 16px;
      font-family: Quicksand;
      font-weight: 600;
      line-height: 22.40px;
      word-wrap: break-word;
  }
  
  .your-name-character {
      width: 320px;
  }
  
  .personwithspecialability_span {
      color: #666D80;
      font-size: 16px;
      font-family: Nunito;
      font-weight: 400;
      line-height: 22.40px;
      word-wrap: break-word;
  }
  
  .person-with-special-ability {
      align-self: stretch;
  }
  
  .stroke {
      align-self: stretch;
      height: 1px;
      background: #EDEDED;
  }

  .style_span {
      color: #666D80;
      font-size: 16px;
      font-family: Nunito;
      font-weight: 600;
      line-height: 22.40px;
      word-wrap: break-word;
  }
  
  .style {
      align-self: stretch;
  }
  
  .anime_span {
      color: #141414;
      font-size: 16px;
      font-family: Quicksand;
      font-weight: 600;
      line-height: 22.40px;
      word-wrap: break-word;
  }
  
  .anime {
      align-self: stretch;
  }
  
  .enhancement_span {
      color: #666D80;
      font-size: 16px;
      font-family: Nunito;
      font-weight: 600;
      line-height: 22.40px;
      word-wrap: break-word;
  }
  
  .enhancement {
      width: 141px;
  }
  
  .normal_span {
      color: #141414;
      font-size: 16px;
      font-family: Quicksand;
      font-weight: 600;
      line-height: 22.40px;
      word-wrap: break-word;
  }
  
  .normal {
      align-self: stretch;
  }

  .world_span {
      color: #666D80;
      font-size: 16px;
      font-family: Nunito;
      font-weight: 600;
      line-height: 22.40px;
      word-wrap: break-word;
  }
  
  .world {
      align-self: stretch;
  }
  
  .cartoon_span {
      color: #141414;
      font-size: 16px;
      font-family: Quicksand;
      font-weight: 600;
      line-height: 22.40px;
      word-wrap: break-word;
  }
  
  .cartoon {
      align-self: stretch;
  }
  

  .adventure_span {
      color: #666D80;
      font-size: 16px;
      font-family: Nunito;
      font-weight: 600;
      line-height: 22.40px;
      word-wrap: break-word;
  }
  
  .adventure {
      width: 141px;
  }
  
  .makingfriends_span {
      color: #141414;
      font-size: 16px;
      font-family: Quicksand;
      font-weight: 600;
      line-height: 22.40px;
      word-wrap: break-word;
  }
  
  .making-friends {
      width: 150px;
  }
  
  .storydetails_span {
      color: black;
      font-size: 16px;
      font-family: Quicksand;
      font-weight: 600;
      line-height: 22.40px;
      word-wrap: break-word;
  }
  
  .story-details {
      width: 320px;
  }
  
  .stroke_01 {
      align-self: stretch;
      height: 1px;
      background: #EDEDED;
  }
  
  .pages_span {
      color: #666D80;
      font-size: 16px;
      font-family: Nunito;
      font-weight: 600;
      line-height: 22.40px;
      word-wrap: break-word;
  }
  
  .pages {
      align-self: stretch;
      text-align: center;
  }
  
  .f_span {
      color: #141414;
      font-size: 24px;
      font-family: Quicksand;
      font-weight: 600;
      line-height: 33.60px;
      word-wrap: break-word;
  }
  
  .text-8 {
      align-self: stretch;
      text-align: center;
  }
  
  .minread_span {
      color: #666D80;
      font-size: 16px;
      font-family: Nunito;
      font-weight: 600;
      line-height: 22.40px;
      word-wrap: break-word;
  }
  
  .min-read {
      align-self: stretch;
      text-align: center;
  }
  
  .f-7min_span {
      color: #141414;
      font-size: 24px;
      font-family: Quicksand;
      font-weight: 600;
      line-height: 33.60px;
      word-wrap: break-word;
  }
  
  .text-5-7-min {
      align-self: stretch;
      text-align: center;
  }
  
  .minaudio_span {
      color: #666D80;
      font-size: 16px;
      font-family: Nunito;
      font-weight: 600;
      line-height: 22.40px;
      word-wrap: break-word;
  }
  
  .min-audio {
      width: 141px;
      text-align: center;
  }
  
  .f2min_span {
      color: #141414;
      font-size: 24px;
      font-family: Quicksand;
      font-weight: 600;
      line-height: 33.60px;
      word-wrap: break-word;
  }
  
  .text-12-min {
      align-self: stretch;
      text-align: center;
  }
  
  .informationbookcover_span {
      color: #141414;
      font-size: 20px;
      font-family: Quicksand;
      font-weight: 600;
      line-height: 28px;
      word-wrap: break-word;
  }
  
  .information-book-cover {
      align-self: stretch;
  }
  
  .image {
      width: 287px;
      height: 431px;
      position: relative;
      border-radius: 12px;
  }
  

  .digitalbook_span {
      color: #727272;
      font-size: 18px;
      font-family: Nunito;
      font-weight: 400;
      line-height: 25.20px;
      word-wrap: break-word;
  }
  

  .audioversion_span {
      color: #727272;
      font-size: 18px;
      font-family: Nunito;
      font-weight: 400;
      line-height: 25.20px;
      word-wrap: break-word;
  }
  

  .print-readypdf_span {
      color: #727272;
      font-size: 18px;
      font-family: Nunito;
      font-weight: 400;
      line-height: 25.20px;
      word-wrap: break-word;
  }
  

  .previewandpurchasestory_span {
      color: white;
      font-size: 18px;
      font-family: Quicksand;
      font-weight: 600;
      line-height: 25.20px;
      word-wrap: break-word;
  }
  
  .preview-and-purchase-story {
      text-align: center;
  }
  
  .frame-1410104090 {
      flex: 1 1 0;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      gap: 10px;
      display: inline-flex;
  }
  
  .frame-1410104098 {
      flex: 1 1 0;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      gap: 2px;
      display: inline-flex;
  }
  
  .frame-1410104100 {
      flex: 1 1 0;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      gap: 2px;
      display: inline-flex;
  }
  
  .frame-1410104102 {
      flex: 1 1 0;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      gap: 2px;
      display: inline-flex;
  }
  
  .frame-1410104101 {
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      gap: 2px;
      display: inline-flex;
  }
  
  .frame-1410104090_01 {
      flex: 1 1 0;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      gap: 10px;
      display: inline-flex;
  }
  
  .frame-1410104098_02 {
      align-self: stretch;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 2px;
      display: flex;
  }
  
  .frame-1410104098_03 {
      align-self: stretch;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 2px;
      display: flex;
  }
  
  .frame-1410104100_01 {
      align-self: stretch;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 2px;
      display: flex;
  }

  .frame-1410104091 {
      align-self: stretch;
      justify-content: flex-start;
      align-items: center;
      gap: 12px;
      display: inline-flex;
  }
  
  .frame-1410104091_01 {
      align-self: stretch;
      justify-content: flex-start;
      align-items: center;
      gap: 12px;
      display: inline-flex;
  }
  
  .frame-1410104092_02 {
      flex: 1 1 0;
      padding: 12px;
      background: #F8FAFB;
      border-radius: 12px;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      gap: 12px;
      display: inline-flex;
  }
  
  .frame-1410104094_02 {
      flex: 1 1 0;
      padding: 12px;
      background: #F8FAFB;
      border-radius: 12px;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      gap: 12px;
      display: inline-flex;
  }
  
  .frame-1410104093_02 {
      flex: 1 1 0;
      padding: 12px;
      background: #F8FAFB;
      border-radius: 12px;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      gap: 12px;
      display: inline-flex;
  }
  
  .frame-1410104099 {
      padding: 8px;
      background: #FF2F6A;
      border-radius: 12px;
      justify-content: flex-start;
      align-items: center;
      gap: 10px;
      display: flex;
  }
  
  .frame-1410104099_01 {
      padding: 8px;
      background: #6912C5;
      border-radius: 12px;
      outline: 1px #EDEDED solid;
      outline-offset: -1px;
      justify-content: flex-start;
      align-items: center;
      gap: 10px;
      display: flex;
  }
  
  .frame-1410104099_02 {
      padding: 8px;
      background: #173DB6;
      border-radius: 12px;
      outline: 1px #EDEDED solid;
      outline-offset: -1px;
      justify-content: flex-start;
      align-items: center;
      gap: 10px;
      display: flex;
  }
  
  .frame-1410104099_03 {
      padding: 8px;
      background: #0C8092;
      border-radius: 12px;
      outline: 1px #EDEDED solid;
      outline-offset: -1px;
      justify-content: flex-start;
      align-items: center;
      gap: 10px;
      display: flex;
  }
  
  .check {
      width: 18px;
      height: 18px;
      position: relative;
      background: #EEF6FF;
      overflow: hidden;
      border-radius: 99999px;
  }
  
  .check_02 {
      width: 18px;
      height: 18px;
      position: relative;
      background: #EEF6FF;
      overflow: hidden;
      border-radius: 99999px;
  }
  
  .check_04 {
      width: 18px;
      height: 18px;
      position: relative;
      background: #EEF6FF;
      overflow: hidden;
      border-radius: 99999px;
  }
  
  .button {
      align-self: stretch;
      padding-left: 24px;
      padding-right: 24px;
      padding-top: 16px;
      padding-bottom: 16px;
      background: #438BFF;
      border-radius: 20px;
      outline: 1px #438BFF solid;
      outline-offset: -1px;
      justify-content: center;
      align-items: center;
      gap: 10px;
      display: inline-flex;
  }
  
  .frame-1410104094_01 {
      align-self: stretch;
      justify-content: flex-start;
      align-items: center;
      gap: 12px;
      display: inline-flex;
  }
  
  .frame-1410104092 {
      flex: 1 1 0;
      padding: 12px;
      background: #F8FAFB;
      border-radius: 12px;
      justify-content: flex-start;
      align-items: center;
      gap: 12px;
      display: flex;
  }
  
  .frame-1410104093 {
      flex: 1 1 0;
      padding: 12px;
      background: #F8FAFB;
      border-radius: 12px;
      justify-content: flex-start;
      align-items: center;
      gap: 12px;
      display: flex;
  }
  
  .frame-1410104092_01 {
      flex: 1 1 0;
      padding: 12px;
      background: #F8FAFB;
      border-radius: 12px;
      justify-content: flex-start;
      align-items: center;
      gap: 12px;
      display: flex;
  }
  
  .frame-1410104093_01 {
      flex: 1 1 0;
      padding: 12px;
      background: #F8FAFB;
      border-radius: 12px;
      justify-content: flex-start;
      align-items: center;
      gap: 12px;
      display: flex;
  }
  
  .checklist {
      justify-content: flex-start;
      align-items: center;
      gap: 4px;
      display: flex;
  }
  
  .checklist_01 {
      justify-content: flex-start;
      align-items: center;
      gap: 4px;
      display: flex;
  }
  
  .checklist_02 {
      justify-content: flex-start;
      align-items: center;
      gap: 4px;
      display: flex;
  }
  
  .frame-1410103870 {
      align-self: stretch;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      gap: 12px;
      display: flex;
  }
  
  .frame-1410104096_01 {
      align-self: stretch;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      gap: 12px;
      display: flex;
  }
  
  .frame-1410104094 {
      align-self: stretch;
      justify-content: flex-start;
      align-items: center;
      gap: 12px;
      display: inline-flex;
  }
  
  .frame-1410104095 {
      align-self: stretch;
      justify-content: flex-start;
      align-items: center;
      gap: 12px;
      display: inline-flex;
  }
  
  .frame-1410104075 {
      align-self: stretch;
      justify-content: center;
      align-items: center;
      gap: 12px;
      display: inline-flex;
  }
  
  .frame-1410104098_01 {
      align-self: stretch;
      padding: 12px;
      border-radius: 12px;
      outline: 1px #EDEDED solid;
      outline-offset: -1px;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      gap: 16px;
      display: flex;
  }
  
  .frame-1410104096 {
      align-self: stretch;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      gap: 12px;
      display: flex;
  }
  
  .frame-1410104103 {
      align-self: stretch;
      padding: 16px;
      background: #F8FAFB;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      gap: 24px;
      display: flex;
  }
  
  .frame-1410104097 {
      align-self: stretch;
      padding: 12px;
      border-radius: 12px;
      outline: 1px #EDEDED solid;
      outline-offset: -1px;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      gap: 16px;
      display: flex;
  }
  
  .form {
      flex: 1 1 0;
      padding: 16px;
      border-radius: 20px;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 24px;
      display: inline-flex;
  }
  
  .frame-9 {
      width: 627px;
      padding: 16px;
      background: white;
      border-radius: 20px;
      outline: 1px #EDEDED solid;
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
    .frame-1410104031 {
      flex-direction: column;
      gap: 16px;
    }
    
    .frame-9, .form {
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

    .storysummary_span, .informationbookcover_span {
      font-size: 18px;
      line-height: 25.2px;
    }

    .frame-1410104089 {
      width: 70px;
      height: 69px;
    }

    .your-name-character {
      width: auto;
    }

    .frame-1410104094, .frame-1410104095 {
      flex-direction: column;
      gap: 8px;
    }

    .frame-1410104092, .frame-1410104093, 
    .frame-1410104092_01, .frame-1410104093_01 {
      padding: 8px;
      width: 100%;
      align-items: flex-start;
    }

    .frame-1410104094_01 {
      flex-direction: column;
      gap: 8px;
    }

    .frame-1410104092_02, .frame-1410104094_02, .frame-1410104093_02 {
      padding: 8px;
      width: 100%;
    }

    .frame-1410104099, .frame-1410104099_01, 
    .frame-1410104099_02, .frame-1410104099_03 {
      padding: 6px;
    }

    .yournamecharacter_span, .storydetails_span {
      font-size: 14px;
      line-height: 19.6px;
    }

    .personwithspecialability_span, .style_span, .enhancement_span,
    .world_span, .adventure_span, .pages_span, .minread_span, .minaudio_span {
      font-size: 14px;
      line-height: 19.6px;
    }

    .anime_span, .normal_span, .cartoon_span, .makingfriends_span {
      font-size: 14px;
      line-height: 19.6px;
    }

    .f_span, .f-7min_span, .f2min_span {
      font-size: 20px;
      line-height: 28px;
    }

    .image {
      width: 200px;
      height: 300px;
    }

    .frame-1410104075 {
      flex-direction: column;
      gap: 8px;
    }

    .digitalbook_span, .audioversion_span, .print-readypdf_span {
      font-size: 16px;
      line-height: 22.4px;
    }

    .previewandpurchasestory_span {
      font-size: 16px;
      line-height: 22.4px;
    }

    .button {
      padding: 12px 20px;
    }

    .adventure, .min-audio {
      width: auto;
    }

    .making-friends, .story-details {
      width: auto;
    }
  }
</style>
