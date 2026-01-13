<script lang="ts">
  import Navbar from "../../components/Navbar.svelte";
  import AccountDropdown from "../../components/AccountDropdown.svelte";
  import { goto } from '$app/navigation';
  import purplecheck from "../../assets/purple-check.svg";
  import arrowleft from "../../assets/ArrowLeft.svg";

  import giantImage from "../../assets/Giant-book.png";
  import splendidImage from "../../assets/splendid-book.png";
  import stickerImage from "../../assets/sticker-pack.png";

  // Track selected item (single selection)
  let selectedItem: 'giant' | 'splendid' | 'sticker' = 'splendid'; // Default to splendid

  const handleBack = () => {
    
    goto('/purchase');
  };

  const handleContinue = () => {
    if (typeof window !== 'undefined') {
      goto('/chart');
    }
  };

  const handleSelectItem = (item: 'giant' | 'splendid' | 'sticker') => {
    selectedItem = item;
  };

  const handleKeydownItem = (event: KeyboardEvent, item: 'giant' | 'splendid' | 'sticker') => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSelectItem(item);
    }
  };
</script>
<div class="additional-items-screen-preview">
  <div class="navbar">
    <div class="logo-text-full">
      <div class="logo-img"></div>
    </div>
    <AccountDropdown />
  </div>
  
  <!-- Mobile Back Button -->
  <div class="mobile-back-button">
    <div class="mobile-back-btn" role="button" tabindex="0" 
         on:click={handleBack} 
         on:keydown={(e) => e.key === 'Enter' && handleBack()}>
      <img class="arrow-left-icon" src={arrowleft} alt="back" />
    </div>
    <span class="back-text">Back</span>
  </div>
  
  <div class="menu">
      <div class="heading_01">
          <div><span class="wrapitupwithatouchofmagic_span"> Wrap It Up with a Touch of Magic</span></div>
          <div><span class="addoneormoreofthesedelightfulextrastoyourgift_span">Add one or more of these delightful extras to your gift</span></div>
      </div>
      <div class="frame-1410103954">
          <div 
            class="frame-1410103903 {selectedItem === 'giant' ? 'selected-card' : ''}"
            on:click={() => handleSelectItem('giant')}
            on:keydown={(e) => handleKeydownItem(e, 'giant')}
            role="button"
            tabindex="0"
          >
              <div class="frame-1410103837">
                <img src={giantImage} alt="giantImage" style="width: 100%;">
              </div>
              <div class="frame-1410103957">
                  <div class="heading_02">
                      <div class="great-giant-coloring-poster"><span class="greatgiantcoloringposter_span">Great Giant Coloring Poster</span></div>
                      <div><span class="f499usd_span">+ $14.99 USD</span></div>
                  </div>
                  <div class="button">
                      <div class="look-inside"><span class="lookinside_span">Look Inside</span></div>
                  </div>
              </div>
              {#if selectedItem === 'giant'}
                <img src={purplecheck} alt="selected" class="purple-check" />
              {/if}
          </div>
          <div 
            class="frame-1410103904 {selectedItem === 'splendid' ? 'selected-card' : ''}"
            on:click={() => handleSelectItem('splendid')}
            on:keydown={(e) => handleKeydownItem(e, 'splendid')}
            role="button"
            tabindex="0"
          >
              <div class="frame-1410103837_01">
                <img src={splendidImage} alt="the splendid book" style="width: 100%; object-fit: cover
              "/>
              </div>
              <div class="frame-1410103956">
                  <div class="heading_03">
                      <div class="the-splendid-book"><span class="thesplendidbook_span">The Splendid Book</span></div>
                      <div><span class="f499usd_01_span">+ $14.99 USD</span></div>
                  </div>
                  <div class="button_01">
                      <div class="look-inside_01"><span class="lookinside_01_span">Look Inside</span></div>
                  </div>
              </div>
              {#if selectedItem === 'splendid'}
                <img src={purplecheck} alt="selected" class="purple-check" />
              {/if}
          </div>
          <div 
            class="frame-1410103905 {selectedItem === 'sticker' ? 'selected-card' : ''}"
            on:click={() => handleSelectItem('sticker')}
            on:keydown={(e) => handleKeydownItem(e, 'sticker')}
            role="button"
            tabindex="0"
          >
              <div class="frame-1410103837_02">
                <img src={stickerImage} alt="stickerImage" style="width: 100%;">
              </div>
              <div class="frame-1410103955">
                  <div class="heading_04">
                      <div class="stiker-pack"><span class="stikerpack_span">Stiker Pack</span></div>
                      <div><span class="f499usd_02_span">+ $14.99 USD</span></div>
                  </div>
                  <div class="button_02">
                      <div class="look-inside_02"><span class="lookinside_02_span">Look Inside</span></div>
                  </div>
              </div>
              {#if selectedItem === 'sticker'}
                <img src={purplecheck} alt="selected" class="purple-check" />
              {/if}
          </div>
      </div>
      <div class="frame-1410103959">
          <div 
            class="button_03"
            on:click={handleBack}
            on:keydown={(e) => e.key === 'Enter' && handleBack()}
            role="button"
            tabindex="0"
          >
              <div class="arrowleft">
                  <img src={arrowleft} alt="arrow left" />
              </div>
              <div class="back"><span class="back_span">Back</span></div>
          </div>
          <div class="button_04">
              <div
                class="continue"
                role="button"
                tabindex="0"
                on:click={handleContinue}
                on:keydown={(e) => e.key === 'Enter' && handleContinue()}
              >
                <span class="continue_span">Continue</span>
              </div>
          </div>
      </div>
  </div>
  <div class="frame-1410103899">
      <div class="contact-us-hellodrawtopiacom"><span class="contactushellodrawtopiacom_span">Contact us: hello@drawtopia.com</span></div>
      <div class="rectangle-34"></div>
      <div class="frame-1410103820">
          <div class="privacy-policy"><span class="privacypolicy_span">Privacy Policy</span></div>
          <div class="terms-of-service"><span class="termsofservice_span">Terms of Service</span></div>
      </div>
  </div>
</div>

<style>

.wrapitupwithatouchofmagic_span {
  color: black;
  font-size: 48px;
  font-family: Quicksand;
  font-weight: 600;
  line-height: 67.20px;
  word-wrap: break-word;
}

.addoneormoreofthesedelightfulextrastoyourgift_span {
  color: #727272;
  font-size: 16px;
  font-family: Quicksand;
  font-weight: 600;
  line-height: 22.40px;
  word-wrap: break-word;
}

.ellipse-13 {
  width: 32px;
  height: 32px;
  background: white;
  border-radius: 9999px;
}

.greatgiantcoloringposter_span {
  color: black;
  font-size: 24px;
  font-family: Quicksand;
  font-weight: 600;
  line-height: 33.60px;
  word-wrap: break-word;
}

.great-giant-coloring-poster {
  align-self: stretch;
}

.f499usd_span {
  color: black;
  font-size: 24px;
  font-family: Quicksand;
  font-weight: 600;
  line-height: 33.60px;
  word-wrap: break-word;
}

.lookinside_span {
  color: black;
  font-size: 18px;
  font-family: Quicksand;
  font-weight: 600;
  line-height: 25.20px;
  word-wrap: break-word;
}

.look-inside {
  text-align: center;
}

.thesplendidbook_span {
  color: black;
  font-size: 24px;
  font-family: Quicksand;
  font-weight: 600;
  line-height: 33.60px;
  word-wrap: break-word;
}

.the-splendid-book {
  align-self: stretch;
}

.f499usd_01_span {
  color: #6912C5;
  font-size: 24px;
  font-family: Quicksand;
  font-weight: 600;
  line-height: 33.60px;
  word-wrap: break-word;
}

.lookinside_01_span {
  color: #6912C5;
  font-size: 18px;
  font-family: Quicksand;
  font-weight: 600;
  line-height: 25.20px;
  word-wrap: break-word;
}

.look-inside_01 {
  text-align: center;
}

.stikerpack_span {
  color: black;
  font-size: 24px;
  font-family: Quicksand;
  font-weight: 600;
  line-height: 33.60px;
  word-wrap: break-word;
}

.stiker-pack {
  align-self: stretch;
}

.f499usd_02_span {
  color: black;
  font-size: 24px;
  font-family: Quicksand;
  font-weight: 600;
  line-height: 33.60px;
  word-wrap: break-word;
}

.lookinside_02_span {
  color: black;
  font-size: 18px;
  font-family: Quicksand;
  font-weight: 600;
  line-height: 25.20px;
  word-wrap: break-word;
}

.look-inside_02 {
  text-align: center;
}

.back_span {
  color: black;
  font-size: 18px;
  font-family: Quicksand;
  font-weight: 600;
  line-height: 25.20px;
  word-wrap: break-word;
}

.back {
  text-align: center;
}

.continue_span {
  color: white;
  font-size: 18px;
  font-family: Quicksand;
  font-weight: 600;
  line-height: 25.20px;
  word-wrap: break-word;
}

.continue {
  text-align: center;
}

.contactushellodrawtopiacom_span {
  color: #141414;
  font-size: 18px;
  font-family: Nunito;
  font-weight: 400;
  line-height: 25.20px;
  word-wrap: break-word;
}

.contact-us-hellodrawtopiacom {
  text-align: center;
}

.rectangle-34 {
  align-self: stretch;
  height: 1px;
  background: #EDEDED;
}

.privacypolicy_span {
  color: #141414;
  font-size: 18px;
  font-family: Nunito;
  font-weight: 400;
  line-height: 25.20px;
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
  line-height: 25.20px;
  word-wrap: break-word;
}

.terms-of-service {
  text-align: center;
}

.heading_01 {
  align-self: stretch;
  padding-left: 4px;
  padding-right: 4px;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  gap: 8px;
  display: flex;
}

.heading_02 {
  align-self: stretch;
  padding-top: 8px;
  padding-left: 8px;
  padding-right: 8px;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 8px;
  display: flex;
}

.button {
  align-self: stretch;
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
  display: inline-flex;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.button:hover {
  background: #f8f8f8;
  outline: 2px rgb(105, 18, 197) solid;
  box-shadow: 0px 6px 12px rgba(105, 18, 197, 0.15);
}

.button:active {
  transform: translateY(0px);
  box-shadow: 0px 2px 4px rgba(98.89, 98.89, 98.89, 0.25);
}

.heading_03 {
  align-self: stretch;
  padding-top: 8px;
  padding-left: 8px;
  padding-right: 8px;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 8px;
  display: flex;
}

.button_01 {
  align-self: stretch;
  padding-left: 24px;
  padding-right: 24px;
  padding-top: 16px;
  padding-bottom: 16px;
  background: #F5F2FF;
  border-radius: 20px;
  outline: 1px #EDEDED solid;
  outline-offset: -1px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  display: inline-flex;
  cursor: pointer;
  transition: all 0.3s ease;
}

.button_01:hover {
  background: #ebe4ff;
  outline: 2px #6912C5 solid;
  box-shadow: 0px 6px 12px rgba(105, 18, 197, 0.2);
}

.button_01:active {
  transform: translateY(0px);
  box-shadow: 0px 2px 4px rgba(105, 18, 197, 0.15);
}

.heading_04 {
  align-self: stretch;
  padding-top: 8px;
  padding-left: 8px;
  padding-right: 8px;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 8px;
  display: flex;
}

.button_02 {
  width: 100%;
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
  display: inline-flex;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.button_02:hover {
  background: #f8f8f8;
  outline: 2px rgb(105, 18, 197) solid;
  box-shadow: 0px 6px 12px rgba(105, 18, 197, 0.15);
}

.button_02:active {
  transform: translateY(0px);
  box-shadow: 0px 2px 4px rgba(98.89, 98.89, 98.89, 0.25);
}

.button_04 {
  width: 160px;
  padding-left: 24px;
  padding-right: 24px;
  padding-top: 16px;
  padding-bottom: 16px;
  background: #438BFF;
  border-radius: 20px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  display: flex;
  cursor: pointer;
  transition: all 0.3s ease;
}

.button_04:hover {
  background: #3578e5;
  box-shadow: 0px 8px 16px rgba(67, 139, 255, 0.4);
}

.button_04:active {
  background: #2d6bd1;
  transform: translateY(0px);
  box-shadow: 0px 4px 8px rgba(67, 139, 255, 0.3);
}

.frame-1410103820 {
  justify-content: flex-start;
  align-items: flex-start;
  gap: 24px;
  display: inline-flex;
}

.frame-1410103837 {
  align-self: stretch;
  padding: 12px;
  background: #E9E9E9;
  overflow: hidden;
  border-radius: 16px;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 10px;
  display: flex;
}

.frame-1410103837_01 {
  align-self: stretch;
  padding: 12px;
  background: #E9E9E9;
  overflow: hidden;
  border-radius: 16px;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 10px;
  display: flex;
}

.frame-1410103837_02 {
  align-self: stretch;
  padding: 12px;
  background: #F3F8FF;
  overflow: hidden;
  border-radius: 16px;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 10px;
  display: flex;
}

.arrowleft {
  width: 24px;
  height: 24px;
  position: relative;
  overflow: hidden;
}

.frame-1410103957 {
  align-self: stretch;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 24px;
  display: flex;
}

.frame-1410103956 {
  align-self: stretch;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 24px;
  display: flex;
}

.frame-1410103955 {
  align-self: stretch;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 24px;
  display: flex;
}

.frame-1410103899 {
  align-self: stretch;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  display: flex;
}

.button_03 {
  width: 174px;
  padding-left: 24px;
  padding-right: 24px;
  padding-top: 16px;
  padding-bottom: 16px;
  box-shadow: 0px 4px 4px rgba(98.89, 98.89, 98.89, 0.25);
  border-radius: 20px;
  outline: 2px #6912C5 solid;
  outline-offset: -1px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  display: flex;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.button_03:hover {
  background: #f8f8f8;
  outline: 2px #871FFF solid;
  box-shadow: 0px 6px 12px rgba(105, 18, 197, 0.2);
}

.button_03:active {
  transform: translateY(0px);
  box-shadow: 0px 2px 4px rgba(105, 18, 197, 0.25);
}

.frame-1410103903 {
  flex: 1 1 0;
  padding: 12px;
  border-radius: 16px;
  outline: 1px #dcdcdc solid;
  outline-offset: -1px;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 8px;
  display: inline-flex;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.frame-1410103903:hover {
  outline: 2px rgb(105, 18, 197) solid;
  box-shadow: 0px 4px 12px rgba(105, 18, 197, 0.15);
}

.frame-1410103903.selected-card {
  outline: 3px #6912C5 solid;
  box-shadow: 0px 1px 8px rgba(105, 18, 197, 0.3);
}

.frame-1410103904 {
  flex: 1 1 0;
  padding: 12px;
  border-radius: 16px;
  outline: 1px #dcdcdc solid;
  outline-offset: -1px;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 8px;
  display: inline-flex;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.frame-1410103904:hover {
  outline: 2px #6912C5 solid;
  box-shadow: 0px 4px 12px rgba(105, 18, 197, 0.15);
}

.frame-1410103904.selected-card {
  outline: 3px #6912C5 solid;
  box-shadow: 0px 1px 8px #871FFF;
}

.frame-1410103905 {
  flex: 1 1 0;
  padding: 12px;
  border-radius: 16px;
  outline: 1px #dcdcdc solid;
  outline-offset: -1px;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 8px;
  display: inline-flex;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.frame-1410103905:hover {
  outline: 2px rgb(105, 18, 197) solid;
  box-shadow: 0px 4px 12px rgba(105, 18, 197, 0.15);
}

.frame-1410103905.selected-card {
  outline: 3px rgb(105, 18, 197) solid;
  box-shadow: 0px 1px 8px rgba(105, 18, 197, 0.3);
}

.frame-1410103959 {
  align-self: stretch;
  justify-content: space-between;
  align-items: center;
  display: inline-flex;
}

.frame-1410103954 {
  align-self: stretch;
  justify-content: center;
  align-items: center;
  gap: 16px;
  display: inline-flex;
}

.menu {
  align-self: stretch;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 48px;
  display: flex;
}

.additional-items-screen-preview {
  width: 100%;
  height: 100%;
  padding-left: 100px;
  padding-right: 100px;
  padding-top: 24px;
  padding-bottom: 24px;
  background: white;
  overflow: hidden;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 53px;
  display: inline-flex;
}

/* Mobile Back Button Styles */
.mobile-back-button {
  display: none;
}

.mobile-back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 8px;
  background: white;
  border-radius: 8px;
  outline: 1px #dcdcdc solid;
  outline-offset: -1px;
  cursor: pointer;
  transition: background-color 0.2s;
  width: fit-content;
}

.mobile-back-btn:hover {
  background-color: #f8fafb;
}

.arrow-left-icon {
  width: 20px;
  height: 20px;
}

.back-text {
  color: #121212;
  font-size: 16px;
  font-family: Quicksand;
  font-weight: 600;
  line-height: 22.4px;
}

.purple-check {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 24px;
  height: 24px;
  z-index: 10;
}

/* Mobile responsive styles */
@media (max-width: 800px) {
  .mobile-back-button {
    display: flex;
    width: 100%;
    margin-bottom: 16px;
    align-items: center;
    gap: 10px;
  }

  .additional-items-screen-preview {
    padding-left: 16px;
    padding-right: 16px;
    padding-top: 16px;
    padding-bottom: 16px;
    gap: 24px;
  }

  .menu {
    gap: 24px;
  }

  .wrapitupwithatouchofmagic_span {
    font-size: 32px;
    line-height: 44.8px;
    text-align: center;
  }

  .addoneormoreofthesedelightfulextrastoyourgift_span {
    font-size: 16px;
    line-height: 22.4px;
    text-align: center;
  }

  .frame-1410103954 {
    flex-direction: column;
    gap: 16px;
  }

  .frame-1410103903,
  .frame-1410103904,
  .frame-1410103905 {
    width: 100%;
  }

  .frame-1410103837,
  .frame-1410103837_01,
  .frame-1410103837_02 {
    height: 200px;
  }

  .greatgiantcoloringposter_span,
  .thesplendidbook_span,
  .stikerpack_span {
    font-size: 20px;
    line-height: 28px;
  }

  .f499usd_span,
  .f499usd_01_span,
  .f499usd_02_span {
    font-size: 20px;
    line-height: 28px;
  }

  .lookinside_span,
  .lookinside_01_span,
  .lookinside_02_span {
    font-size: 16px;
    line-height: 22.4px;
  }

  .button,
  .button_01,
  .button_02 {
    width: 100%;
    padding: 12px 16px;
  }

  .button_02 {
    width: 100%;
  }

  .frame-1410103959 {
    flex-direction: column;
    gap: 16px;
  }

  .button_03,
  .button_04 {
    width: 100%;
  }

  .back_span,
  .continue_span {
    font-size: 16px;
    line-height: 22.4px;
  }

  .contactushellodrawtopiacom_span,
  .privacypolicy_span,
  .termsofservice_span {
    font-size: 16px;
    line-height: 22.4px;
  }

  .frame-1410103820 {
    flex-direction: column;
    gap: 16px;
  }

  .frame-1410103899 {
    gap: 16px;
    padding: 16px;
  }

  .heading_01 {
    gap: 16px;
  }

  .heading_02,
  .heading_03,
  .heading_04 {
    padding: 12px;
  }
  .button_03 {
    display: none;
  }
}

/* Small header styles for page-level navbar wrapper */
.navbar {
  width: 100%;
  padding-top: 12px;
  padding-bottom: 12px;
  padding-left: 24px;
  padding-right: 12px;
  background: white;
  border-radius: 20px;
  outline: 1px #ededed solid;
  outline-offset: -1px;
  justify-content: space-between;
  align-items: center;
  display: inline-flex;
}

.logo-text-full {
  width: 203.32px;
  height: 38px;
  position: relative;
}

.logo-img {
  background-image: url("../../assets/logo.png");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  width: 100%;
  height: 100%;
}
</style>