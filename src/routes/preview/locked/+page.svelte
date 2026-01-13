<script>
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import share from "../../../assets/Share.svg";
  import DotsThreeOutline from "../../../assets/DotsThreeOutline.svg";
  import CornersOut from "../../../assets/CornersOut.svg";
  import Book from "../../../assets/Book.svg";
  import EnvelopeSimple from "../../../assets/EnvelopeSimple.svg";
  import LockKey from "../../../assets/LockKey.svg";
  import ArrowLeft from "../../../assets/ArrowLeft.svg";
  import ArrowRight from "../../../assets/ArrowRight-white.svg";
  import SpeakerSimpleHigh from "../../../assets/SpeakerSimpleHigh.svg";
  import Play from "../../../assets/Play.svg";
  import CaretDown from "../../../assets/CaretDown.svg";
  import MobileBackBtn from "../../../components/MobileBackBtn.svelte";
  import LockRedKey from "../../../assets/LockKey-red.svg";
  import ShareStoryModal from "../../../components/ShareStoryModal.svelte";
  import StoryInfoModal from "../../../components/StoryInfoModal.svelte";

  let showStoryInfoModal = false;
  let showShareStoryModal = false;
  let storyTitle = "Emma's Magical Forest Adventure";
</script>

<svelte:window
  on:keydown={(e) => {
    if (e.key === "Escape") {
      showStoryInfoModal = false;
      showShareStoryModal = false;
    }
  }}
/>

<div class="preview-story-cover">
  <div class="navbar">
    <div class="logo-text-full">
      <div class="logo-img"></div>
    </div>
  </div>
  <MobileBackBtn />
  <div class="frame-1410103818">
    <div class="frame-13">
      <div class="frame-1410103946">
        <div class="frame-8">
          <div class="frame-1410104191">
            <div class="frame-1410104190">
              <div class="emmas-magical-forest-adventure">
                <span class="emmasmagicalforestadventure_span"
                  >Emma's Magical Forest Adventure</span
                >
              </div>
              <div
                class="page-1-of-2-free-preview-pages-3-5-available-after-purchase"
              >
                <span
                  class="page1of2freepreviewpages3-5availableafterpurchase_span"
                  >Page 1 of 2 (FREE PREVIEW) • Pages 3-5 available after
                  purchase</span
                >
              </div>
              <div class="share-dots-button-group">
                <div
                  class="button"
                  role="button"
                  tabindex="0"
                  on:click={() => (showStoryInfoModal = true)}
                  on:keydown={(e) =>
                    (e.key === "Enter" || e.key === " ") &&
                    (showStoryInfoModal = true)}
                >
                  <img src={DotsThreeOutline} alt="dots" />
                </div>
                <div
                  class="button_01"
                  role="button"
                  tabindex="0"
                  on:click={() => (showShareStoryModal = true)}
                  on:keydown={(e) =>
                    (e.key === "Enter" || e.key === " ") &&
                    (showShareStoryModal = true)}
                >
                  <img src={share} alt="share" />
                </div>
              </div>
            </div>
          </div>
          <div class="mobile-share-dots-button-group">
            <div
              class="button"
              role="button"
              tabindex="0"
              on:click={() => (showStoryInfoModal = true)}
              on:keydown={(e) =>
                (e.key === "Enter" || e.key === " ") &&
                (showStoryInfoModal = true)}
            >
              <img src={DotsThreeOutline} alt="dots" />
            </div>
            <div
              class="button_01"
              role="button"
              tabindex="0"
              on:click={() => (showShareStoryModal = true)}
              on:keydown={(e) =>
                (e.key === "Enter" || e.key === " ") &&
                (showShareStoryModal = true)}
            >
              <img src={share} alt="share" />
            </div>
          </div>
          <div class="rectangle-35"></div>
          <div class="frame-1410104054">
            <div class="view-option">
              <div class="button_view">
                <div class="one-page-view">
                  <span class="one-pageview_span">One-page view</span>
                </div>
              </div>
              <div class="button_view_01">
                <div class="two-page-view">
                  <span class="two-pageview_span">Two-page view</span>
                </div>
              </div>
            </div>
            <div class="frame-1410104106">
              <div class="frame-1410104064">
                <div class="image">
                  <div class="frame-1410104055">
                    <div class="frame-1410104067">
                      <div class="frame-1410104068">
                        <img
                          style="width: 30px;"
                          src={LockRedKey}
                          alt="lock-svg"
                        />
                      </div>
                      <div class="frame-1410104066">
                        <div class="the-adventure-continues">
                          <span class="theadventurecontinues_span"
                            >The adventure continues...</span
                          >
                        </div>
                        <div
                          class="unlock-more-pages-to-see-how-emmas-story-ends-unlock-to-read"
                        >
                          <span
                            class="unlockmorepagestoseehowemmasstoryendsunlocktoread_span"
                            >Unlock more pages to see how Emma's story ends!<br
                            />Unlock to Read</span
                          >
                        </div>
                      </div>
                      <div class="button-unlock">
                        <div class="unclock-to-read">
                          <span class="unclocktoread_span">Unclock To Read</span
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="frame-1410104064">
                <div class="image_01">
                  <div class="frame-1410104055">
                    <div class="frame-1410104067">
                      <div class="frame-1410104068">
                        <img
                          style="width: 30px;"
                          src={LockRedKey}
                          alt="lock-svg"
                        />
                      </div>
                      <div class="frame-1410104066">
                        <div class="the-adventure-continues">
                          <span class="theadventurecontinues_span"
                            >The adventure continues...</span
                          >
                        </div>
                        <div
                          class="unlock-more-pages-to-see-how-emmas-story-ends-unlock-to-read"
                        >
                          <span
                            class="unlockmorepagestoseehowemmasstoryendsunlocktoread_span"
                            >Unlock more pages to see how Emma's story ends!<br
                            />Unlock to Read</span
                          >
                        </div>
                      </div>
                      <div class="button-unlock">
                        <div class="unclock-to-read">
                          <span class="unclocktoread_span">Unclock To Read</span
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="notification">
              <img src={CornersOut} alt="corners" />
              <div>
                <span class="fullscreenpreview_span">Full Screen Preview</span>
              </div>
            </div>
            <div class="frame-1410104061">
              <div class="frame-1410104060">
                <div>
                  <span class="audionaration_span">Audio Naration</span>
                </div>
                <div><span class="pages1-2_span">Pages 1 -2</span></div>
              </div>
              <div class="frame-1410104059">
                <div class="frame-1410104056">
                  <img src={Play} alt="play" />
                </div>
                <div class="audio">
                  <img src={SpeakerSimpleHigh} alt="speaker" />

                  <div class="frame-1410104058">
                    <div class="rectangle-36"></div>
                  </div>
                </div>
                <div class="frame-1410104063">
                  <div><span class="speed_span">Speed</span></div>
                  <div class="frame-1410104062">
                    <div><span class="fx_span">1x</span></div>
                    <img src={CaretDown} alt="caret" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="frame-1410103860">
            <div class="button_02">
              <div class="arrowleft">
                <img src={ArrowLeft} alt="arrow" />
              </div>
              <div class="previous">
                <span class="previous_span">Previous</span>
              </div>
            </div>
            <div class="frame-1410104065">
              <div class="number">
                <img src={Book} alt="book" />
              </div>
              <div class="number_01">
                <img src={EnvelopeSimple} alt="envelope" />
              </div>
              <div class="number_02">
                <div class="text-1"><span class="f_span">1</span></div>
              </div>
              <div class="number_03">
                <div class="text-2"><span class="f_span_01">2</span></div>
              </div>
              <div class="number_04">
                <img src={LockKey} alt="lock" />
              </div>
              <div class="number_05">
                <img src={LockKey} alt="lock" />
              </div>
            </div>
            <div class="button_03">
              <div class="next"><span class="next_span">Next</span></div>
              <div class="arrowleft_01">
                <img src={ArrowRight} alt="arrow" />
              </div>
            </div>
          </div>
          <div class="mobile-button-container">
            <div class="mobile-button_02">
              <div class="arrowleft">
                <img src={ArrowLeft} alt="arrow" />
              </div>
              <div class="previous">
                <span class="previous_span">Previous</span>
              </div>
            </div>
            <div class="mobile-button_03">
              <div class="next"><span class="next_span">Next</span></div>
              <div class="arrowleft_01">
                <img src={ArrowRight} alt="arrow" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="frame-1410103860_01">
    <div class="frame-1410103870">
      <div class="button_04">
        <img src={ArrowLeft} alt="arrow" />
        <div class="back"><span class="back_span">Back</span></div>
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
  {#if showStoryInfoModal}
    <StoryInfoModal 
      storyId=""
      storyTitle={storyTitle}
      on:close={() => showStoryInfoModal = false}
      on:delete={(e) => {
        showStoryInfoModal = false;
        goto('/dashboard');
      }}
    />
  {/if}
  {#if showShareStoryModal}
    <ShareStoryModal 
      storyTitle={storyTitle} 
      storyId=""
      userId=""
      on:close={() => showShareStoryModal = false}
    />
  {/if}
</div>

<style>
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

  .emmasmagicalforestadventure_span {
    color: #121212;
    font-size: 32px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 44.8px;
    word-wrap: break-word;
  }

  .emmas-magical-forest-adventure {
    text-align: center;
  }

  .page1of2freepreviewpages3-5availableafterpurchase_span {
    color: #666d80;
    font-size: 16px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .page-1-of-2-free-preview-pages-3-5-available-after-purchase {
    text-align: center;
  }

  .rectangle-35 {
    align-self: stretch;
    height: 1px;
    background: #dcdcdc;
  }

  .frame-1410104055 {
    flex: 1 1 0;
    align-self: stretch;
    padding: 24px;
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0.25) 100%
    );
    border-radius: 8px;
  }

  .fullscreenpreview_span {
    color: #141414;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28px;
    word-wrap: break-word;
  }

  .previous_span {
    color: black;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .previous {
    text-align: center;
  }

  .f_span {
    color: white;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .text-1 {
    align-self: stretch;
    text-align: center;
  }

  .f_span_01 {
    color: white;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .text-2 {
    align-self: stretch;
    text-align: center;
  }

  .next_span {
    color: white;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .next {
    text-align: center;
  }

  .back_span {
    color: black;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .back {
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

  .frame-1410104190 {
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .number_02 {
    width: 40px;
    height: 40px;
    padding: 2px;
    background: #c1c7d0;
    border-radius: 12px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }

  .number_03 {
    width: 40px;
    height: 40px;
    padding: 2px;
    background: #c1c7d0;
    border-radius: 12px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }

  .frame-1410103820 {
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
  }

  .logo-text-full {
    width: 203.32px;
    height: 38px;
    position: relative;
  }

  .image {
    flex: 1 1 0;
    align-self: stretch;
    padding: 16px;
    background: white;
    overflow: hidden;
    border-radius: 16px;
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

  .arrowleft_01 {
    width: 24px;
    height: 24px;
    position: relative;
    transform-origin: top left;
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

  .button {
    width: 48px;
    height: 48px;
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 8px;
    padding-bottom: 8px;
    left: 1163px;
    top: 16px;
    position: absolute;
    border-radius: 8px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .button_01 {
    width: 48px;
    height: 48px;
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 8px;
    padding-bottom: 8px;
    left: 1107px;
    top: 16px;
    position: absolute;
    border-radius: 8px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .notification {
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 16px;
    padding-right: 20px;
    background: #f8fafb;
    box-shadow: 0px 1px 4px rgba(141.8, 141.8, 141.8, 0.25) inset;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 18px;
    display: flex;
  }

  .button_02 {
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    box-shadow: 0px 4px 4px rgba(98.89, 98.89, 98.89, 0.25);
    border-radius: 20px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .number {
    width: 40px;
    height: 40px;
    padding: 2px;
    background: #144be1;
    border-radius: 12px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }

  .number_01 {
    width: 40px;
    height: 40px;
    padding: 2px;
    background: #c1c7d0;
    border-radius: 12px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }

  .number_04 {
    width: 40px;
    height: 40px;
    padding: 2px;
    background: #c1c7d0;
    border-radius: 12px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }

  .number_05 {
    width: 40px;
    height: 40px;
    padding: 2px;
    background: #c1c7d0;
    border-radius: 12px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }

  .button_03 {
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    background: #438bff;
    border-radius: 20px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .mobile-button_03 {
    display: none;
  }

  .button_04 {
    width: 200px;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    box-shadow: 0px 4px 4px rgba(98.89, 98.89, 98.89, 0.25);
    border-radius: 20px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .frame-1410104191 {
    align-self: stretch;
    position: relative;
    justify-content: center;
    align-items: center;
    gap: 32px;
    display: inline-flex;
  }

  .frame-1410104065 {
    justify-content: flex-start;
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

  .frame-1410103860 {
    align-self: stretch;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .frame-1410103860_01 {
    align-self: stretch;
    justify-content: center;
    align-items: center;
    display: inline-flex;
  }

  .frame-1410104054 {
    align-self: stretch;
    padding: 12px;
    background: #f8fafb;
    border-radius: 12px;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    gap: 24px;
    display: flex;
  }

  .frame-8 {
    align-self: stretch;
    padding: 12px;
    background: white;
    border-radius: 20px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .frame-1410103946 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: flex;
  }

  .frame-13 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 24px;
    display: flex;
  }

  .frame-1410103818 {
    width: 1240px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 24px;
    display: flex;
  }

  .preview-story-cover {
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
  .one-pageview_span {
    color: white;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .one-page-view {
    text-align: center;
  }

  .two-pageview_span {
    color: white;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .two-page-view {
    text-align: center;
  }

  .fullscreenpreview_span {
    color: #141414;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28px;
    word-wrap: break-word;
  }

  .audionaration_span {
    color: #438bff;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28px;
    word-wrap: break-word;
  }

  .pages1-2_span {
    color: #438bff;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28px;
    word-wrap: break-word;
  }

  .rectangle-36 {
    width: 73px;
    height: 3px;
    left: 0px;
    top: -0.5px;
    position: absolute;
    background: #438bff;
  }

  .speed_span {
    color: #141414;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .fx_span {
    color: #141414;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .button_view {
    width: 177px;
    height: 57px;
    padding: 2px;
    background: #c1c7d0;
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .button_view_01 {
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    background: #438bff;
    border-radius: 20px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .frame-1410104060 {
    align-self: stretch;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .frame-1410104058 {
    flex: 1 1 0;
    height: 3px;
    position: relative;
    background: white;
    border-radius: 12px;
  }

  .view-option {
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
  }

  .frame-1410104055 {
    flex: 1 1 0;
    height: 668px;
    padding: 12px;
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0.25) 100%
    );
    overflow: hidden;
    border-radius: 8px;
    background-image: url(https://placehold.co/558x668);
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-end;
    gap: 10px;
    justify-content: center;
    display: inline-flex;
  }

  .notification {
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 16px;
    padding-right: 20px;
    background: #f8fafb;
    box-shadow: 0px 1px 4px rgba(141.8, 141.8, 141.8, 0.25) inset;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 18px;
    display: inline-flex;
  }

  .frame-1410104056 {
    padding: 12px;
    background: #438bff;
    border-radius: 9999px;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .audio {
    flex: 1 1 0;
    justify-content: flex-start;
    align-items: center;
    gap: 9px;
    display: flex;
  }

  .frame-1410104062 {
    padding-left: 12px;
    padding-right: 12px;
    padding-top: 4px;
    padding-bottom: 4px;
    background: #f8fafb;
    border-radius: 12px;
    outline: 1px #438bff solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: flex;
  }

  .image {
    flex: 1 1 0;
    height: 700px;
    padding: 16px;
    background: white;
    overflow: hidden;
    border-radius: 16px;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 10px;
    display: flex;
  }

  .image_01 {
    flex: 1 1 0;
    height: 700px;
    padding: 16px;
    background: white;
    overflow: hidden;
    border-radius: 16px;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 10px;
    display: flex;
  }

  .frame-1410104063 {
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: flex;
  }

  .frame-1410104064 {
    flex: 1 1 0;
    width: 50%;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
  }
  .frame-1410104059 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .frame-1410104106 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
  }

  .frame-1410104061 {
    align-self: stretch;
    padding: 16px;
    background: #eef6ff;
    border-radius: 12px;
    outline: 1px #438bff solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .frame-1410104054 {
    width: 100%;
    height: 100%;
    padding: 12px;
    background: #f8fafb;
    border-radius: 12px;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }
  .mobile-share-dots-button-group {
    display: none;
  }
  .mobile-button-container {
    display: none;
  }

  .theadventurecontinues_span {
    color: black;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .the-adventure-continues {
    align-self: stretch;
    text-align: center;
  }

  .unlockmorepagestoseehowemmasstoryendsunlocktoread_span {
    color: #666d80;
    font-size: 14px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .unlock-more-pages-to-see-how-emmas-story-ends-unlock-to-read {
    align-self: stretch;
    text-align: center;
  }

  .unclocktoread_span {
    color: white;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .unclock-to-read {
    text-align: center;
  }

  .frame-1410104066 {
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 4px;
    display: flex;
  }

  .button-unlock {
    align-self: stretch;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    background: #df1c41;
    border-radius: 20px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }

  .frame-1410104068 {
    padding: 8px;
    background: #fff0f3;
    border-radius: 12px;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }

  .frame-1410104067 {
    width: 100%;
    padding: 24px;
    background: white;
    border-radius: 12px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 16px;
    display: inline-flex;
  }
  @media (max-width: 800px) {
    .mobile-share-dots-button-group {
      display: flex;
      width: 100%;
      justify-content: center;
    }
    .preview-story-cover {
      padding-left: 20px;
      padding-right: 20px;
    }
    .frame-1410103818 {
      width: 100%;
    }
    .notification {
      width: 100%;
      justify-content: center;
    }
    .mobile-button-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      gap: 10px;
    }
    .frame-8 {
      outline: none;
    }
    .mobile-button_03 {
      padding-left: 24px;
      padding-right: 24px;
      padding-top: 16px;
      padding-bottom: 16px;
      background: #438bff;
      border-radius: 20px;
      justify-content: center;
      align-items: center;
      gap: 10px;
      display: flex;
      width: 50%;
    }
    .mobile-button_02 {
      width: 50%;
      padding-left: 24px;
      padding-right: 24px;
      padding-top: 16px;
      padding-bottom: 16px;
      box-shadow: 0px 4px 4px rgba(98.89, 98.89, 98.89, 0.25);
      border-radius: 20px;
      outline: 1px #ededed solid;
      outline-offset: -1px;
      justify-content: center;
      align-items: center;
      gap: 10px;
      display: flex;
    }
    .button_03 {
      display: none;
    }
    .button_02 {
      display: none;
    }
    .frame-1410103860 {
      justify-content: center;
    }
    .frame-1410103860_01 {
      display: none;
    }
    .button {
      position: inherit;
    }
    .button_01 {
      position: inherit;
    }
    .frame-1410104060 {
      display: none;
    }
    .frame-1410104106 {
      flex-direction: column;
    }
    .frame-1410104064 {
      width: 100%;
    }
    .two-pageview_span {
      font-size: 14px;
    }
    .one-pageview_span {
      font-size: 14px;
    }
    .button_view_01 {
      width: 50%;
    }
    .button_view {
      width: 50%;
    }
    .view-option {
      width: 100%;
    }
    .share-dots-button-group {
      display: none;
    }
  }
</style>
