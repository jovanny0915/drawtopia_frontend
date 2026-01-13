<script>
  import StarEmoticon from "../../../../components/StarEmoticon.svelte";
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

  let isMobile = false;

  $: if (browser) {
    isMobile = window.innerWidth < 800;
  }
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
      <div class="frame-8">
          <div class="frame-1410104034">
              <div class="dedication-pages-preview"><span class="dedicationpagespreview_span">Dedication Pages Preview</span></div>
          </div>
          <img class="image" src="https://placehold.co/588x579" alt="image_card_1"/>
      </div>
      <div class="frame-9">
          <div><span class="informationdedicationpages_span">Information Dedication Pages</span></div>
          <div class="form">
              <div class="form_01">
                  <div><span class="selectiondedicationmessages_span"> Selection Dedication Messages</span></div>
                  <div class="frame-1410103942">
                      <div class="selected">
                          <div class="frame-1410103940">
                              <div class="frame-1410103939">
                                  <div class="may-you-always-believe-in-magic-wonder-and-your-beautiful-imagination-with-love-grandma"><span class="mayyoualwaysbelieveinmagicwonderandyourbeautifulimaginationwithlovegrandma_span">May you always believe in magic, wonder, and your beautiful imagination.                 — With love, Grandma</span></div>
                              </div>
                          </div>
                          <div class="ellipse-13"></div>
                      </div>
                      <div class="selected_01">
                          <div class="frame-1410103940_01">
                              <div class="frame-1410103939_01">
                                  <div class="every-page-is-a-hug-from-me-to-you-with-love-grandma"><span class="everypageisahugfrommetoyouwithlovegrandma_span">Every page is a hug from me to you.                 — With love, Grandma</span></div>
                              </div>
                          </div>
                          <div class="ellipse-13_01"></div>
                      </div>
                      <div class="selected_02">
                          <div class="frame-1410103940_02">
                              <div class="frame-1410103939_02">
                                  <div><span class="shinebrightdreambigandneverstopbeingyouwithlovegrandma_span">Shine bright, dream big, and never stop being you.                 — With love, Grandma</span></div>
                              </div>
                          </div>
                          <div class="ellipse-13_02"></div>
                      </div>
                      <div class="selected_03">
                          <div class="frame-1410104084">
                              <div class="frame-1410103940_03">
                                  <div class="frame-1410103939_03">
                                      <div><span class="customdedicationmessage_span">Custom Dedication Message</span></div>
                                  </div>
                              </div>
                          </div>
                          <div class="frame-1410104043">
                              <div class="ellipse-14"></div>
                              <div class="ellipse-13_03"></div>
                          </div>
                      </div>
                      <div class="frame-1410104041">
                          <div class="input-placeholder">
                              <div class="dear-emma-adventure-awaits-for-the-bravest-of-hearts-just-like-yours-from-papa"><span class="dearemmaadventureawaitsforthebravestofheartsjustlikeyoursfrompapa_span">Dear Emma, Adventure awaits for the bravest of hearts — just like yours.               — From Papa</span></div>
                          </div>
                          <div class="text-42200-characters"><span class="f2200characters_span">42/200 Characters</span></div>
                      </div>
                  </div>
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
      <button class="button-fill" class:mobile-full-width={isMobile} on:click={() => goto('/')}>
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

  .image {
      align-self: stretch;
      height: 280px;
      position: relative;
      border-top-left-radius: 12px;
      border-top-right-radius: 12px;
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

  
  
  .image {
      width: 287px;
      height: 431px;
      position: relative;
      border-radius: 12px;
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

  .dedicationpagespreview_span {
      color: black;
      font-size: 20px;
      font-family: Quicksand;
      font-weight: 600;
      line-height: 28px;
      word-wrap: break-word;
  }
  
  .dedication-pages-preview {
      text-align: center;
  }
  
  .image {
      align-self: stretch;
      height: 579px;
      position: relative;
      border-radius: 12px;
  }
  
  .informationdedicationpages_span {
      color: #141414;
      font-size: 20px;
      font-family: Quicksand;
      font-weight: 600;
      line-height: 28px;
      word-wrap: break-word;
  }
  
  .selectiondedicationmessages_span {
      color: #141414;
      font-size: 16px;
      font-family: Quicksand;
      font-weight: 600;
      line-height: 22.40px;
      word-wrap: break-word;
  }
  
  .mayyoualwaysbelieveinmagicwonderandyourbeautifulimaginationwithlovegrandma_span {
      color: #141414;
      font-size: 16px;
      font-family: Nunito;
      font-weight: 400;
      line-height: 22.40px;
      word-wrap: break-word;
  }
  
  .may-you-always-believe-in-magic-wonder-and-your-beautiful-imagination-with-love-grandma {
      align-self: stretch;
  }
  
  .ellipse-13 {
      width: 24px;
      height: 24px;
      border-radius: 9999px;
      border: 2px #EDEDED solid;
  }
  
  .everypageisahugfrommetoyouwithlovegrandma_span {
      color: #141414;
      font-size: 16px;
      font-family: Nunito;
      font-weight: 400;
      line-height: 22.40px;
      word-wrap: break-word;
  }
  
  .every-page-is-a-hug-from-me-to-you-with-love-grandma {
      align-self: stretch;
  }
  
  .ellipse-13_01 {
      width: 24px;
      height: 24px;
      border-radius: 9999px;
      border: 2px #EDEDED solid;
  }
  
  .shinebrightdreambigandneverstopbeingyouwithlovegrandma_span {
      color: #141414;
      font-size: 16px;
      font-family: Nunito;
      font-weight: 400;
      line-height: 22.40px;
      word-wrap: break-word;
  }
  
  .ellipse-13_02 {
      width: 24px;
      height: 24px;
      border-radius: 9999px;
      border: 2px #EDEDED solid;
  }
  
  .customdedicationmessage_span {
      color: #141414;
      font-size: 16px;
      font-family: Nunito;
      font-weight: 400;
      line-height: 22.40px;
      word-wrap: break-word;
  }
  
  .ellipse-14 {
      width: 24px;
      height: 24px;
      left: 0px;
      top: 0px;
      position: absolute;
      border-radius: 9999px;
      border: 1px #438BFF solid;
  }
  
  .ellipse-13_03 {
      width: 12px;
      height: 12px;
      left: 6px;
      top: 6px;
      position: absolute;
      background: #438BFF;
      border-radius: 9999px;
      border: 1px #438BFF solid;
  }
  
  .dearemmaadventureawaitsforthebravestofheartsjustlikeyoursfrompapa_span {
      color: #141414;
      font-size: 16px;
      font-family: Nunito;
      font-weight: 400;
      line-height: 22.40px;
      word-wrap: break-word;
  }
  
  .dear-emma-adventure-awaits-for-the-bravest-of-hearts-just-like-yours-from-papa {
      flex: 1 1 0;
  }
  
  .f2200characters_span {
      color: #666D80;
      font-size: 16px;
      font-family: Nunito;
      font-weight: 400;
      line-height: 22.40px;
      word-wrap: break-word;
  }
  
  .text-42200-characters {
      align-self: stretch;
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
  
  .frame-1410103939_03 {
      flex: 1 1 0;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      gap: 2px;
      display: inline-flex;
  }
  
  .input-placeholder {
      align-self: stretch;
      height: 168px;
      padding: 12px;
      background: white;
      overflow: hidden;
      border-radius: 12px;
      outline: 1px #EDEDED solid;
      outline-offset: -1px;
      justify-content: flex-start;
      align-items: flex-start;
      gap: 10px;
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
      outline: 1px #DCDCDC solid;
      outline-offset: -1px;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      gap: 12px;
      display: inline-flex;
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
  
  .frame-1410103940_03 {
      align-self: stretch;
      justify-content: flex-start;
      align-items: center;
      gap: 12px;
      display: inline-flex;
  }
  
  .frame-1410104041 {
      align-self: stretch;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      gap: 4px;
      display: flex;
  }
  
  .selected {
      align-self: stretch;
      padding: 12px;
      border-radius: 12px;
      justify-content: flex-start;
      align-items: center;
      gap: 12px;
      display: inline-flex;
  }
  
  .selected_01 {
      align-self: stretch;
      padding: 12px;
      border-radius: 12px;
      outline: 1px #EDEDED solid;
      outline-offset: -1px;
      justify-content: flex-start;
      align-items: center;
      gap: 12px;
      display: inline-flex;
  }
  
  .selected_02 {
      align-self: stretch;
      padding: 12px;
      border-radius: 12px;
      outline: 1px #EDEDED solid;
      outline-offset: -1px;
      justify-content: flex-start;
      align-items: center;
      gap: 12px;
      display: inline-flex;
  }
  
  .frame-1410104084 {
      flex: 1 1 0;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      gap: 4px;
      display: inline-flex;
  }
  
  .selected_03 {
      align-self: stretch;
      padding: 12px;
      background: #EEF6FF;
      border-radius: 12px;
      outline: 1px #EDEDED solid;
      outline-offset: -1px;
      justify-content: flex-start;
      align-items: center;
      gap: 12px;
      display: inline-flex;
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
      outline: 1px #EDEDED solid;
      outline-offset: -1px;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      gap: 8px;
      display: flex;
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
      flex: 1 1 0;
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

    .image {
      width: 100%;
      height: 300px;
    }
    .frame-8 {
      width: 100%;
      flex: none;
    }
  }
</style>
