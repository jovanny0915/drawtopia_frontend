<script lang="ts">
  import SmallImg from "../../../assets/small.png";
  import ArrowLeft from "../../../assets/ArrowLeft.svg";
  import Play from "../../../assets/Play.svg";
  import TreasureChest from "../../../assets/TreasureChest.svg";
  import girl from "../../../assets/girl.jpg";
  import MobileBackBtn from "../../../components/MobileBackBtn.svelte";
  import { goto } from "$app/navigation";

  function handleStartReveal() {
    goto("/record/progress");
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleStartReveal();
    }
  }
</script>

<div class="review-reaction">
  <div class="navbar">
    <div class="logo-text-full">
      <div class="logo-img"></div>
    </div>
  </div>
  <MobileBackBtn />
  <div class="frame-1410103818">
    <div class="heading">
      <div class="heading_01">
        <div class="frame-1410103862">
          <div class="recording-reaction">
            <span class="recordingreaction_span">Recording Reaction</span>
          </div>
          <div class="pick-a-fun-way-to-enjoy-your-adventure">
            <span class="pickafunwaytoenjoyyouradventure_span"
              >Pick a fun way to enjoy your adventure!</span
            >
          </div>
        </div>
      </div>
    </div>
    <div class="frame-1410104054">
      <div class="frame-1410104083">
        <div class="frame-1410104105">
            <div class="image">
              <img class="frame-1410104055" src={SmallImg} alt="" />
            </div>
        </div>
        <div class="frame-1410104067">
          <div class="frame-1410104068">
              <img src={TreasureChest} alt="treasurechest" />
          </div>
          <div class="frame-1410104066">
            <div class="your-stories-awaits">
              <span class="yourstoriesawaits_span">Your stories awaits</span>
            </div>
            <div class="click-start-reveal-to-start-begin-advenvture">
              <span class="clickstartrevealtostartbeginadvenvture_span"
                >Click “Start Reveal” to start begin advenvture</span
              >
            </div>
          </div>
        </div>
      </div>
      <img class="frame-1410104194" src={girl} alt="" />
    </div>
    <div class="frame-1410103860">
      <div class="frame-1410103870">
        <div class="button" on:click={() => goto('/adventure-story/final')}>
          <img src={ArrowLeft} alt="arrow" />
          <div class="back"><span class="back_span">Back</span></div>
        </div>
      </div>
      <div class="button_01" on:click={handleStartReveal} on:keydown={handleKeyDown} role="button" tabindex="0">
        <div class="start-reveal">
          <span class="startreveal_span">Start Reveal</span>
        </div>
        <img src={Play} alt="play" />
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
  .recordingreaction_span {
    color: #121212;
    font-size: 48px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 67.2px;
    word-wrap: break-word;
  }

  .recording-reaction {
    width: 687px;
    text-align: center;
  }

  .pickafunwaytoenjoyyouradventure_span {
    color: #666d80;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    word-wrap: break-word;
  }

  .pick-a-fun-way-to-enjoy-your-adventure {
    width: 1040px;
    text-align: center;
  }

  .frame-1410104055 {
    flex: 1 1 0;
    align-self: stretch;
    padding: 24px;
    border-radius: 8px;
    filter: blur(10px);
    width: 100%;
  }

  .yourstoriesawaits_span {
    color: black;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .your-stories-awaits {
    align-self: stretch;
    text-align: center;
  }

  .clickstartrevealtostartbeginadvenvture_span {
    color: #666d80;
    font-size: 14px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .click-start-reveal-to-start-begin-advenvture {
    align-self: stretch;
    text-align: center;
  }

  .frame-1410104194 {
    width: 392px;
    height: 232px;
    left: 0px;
    top: 639px;
    position: absolute;
    background: white;
    border-radius: 12px;
    border: 6px #ededed solid;
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

  .startreveal_span {
    color: white;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .start-reveal {
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

  .frame-1410103862 {
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 16px;
    display: flex;
  }

  .frame-1410104066 {
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 4px;
    display: flex;
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

  .heading_01 {
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 16px;
    display: flex;
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
    justify-content: center;
    align-items: center;
    display: inline-flex;
  }
  
  .frame-1410104068 {
    padding: 8px;
    background: #eef6ff;
    border-radius: 12px;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }

  .button {
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    border-radius: 20px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .button_01 {
    width: 224px;
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
    cursor: pointer;
  }

  .heading {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 16px;
    display: flex;
  }

  .frame-1410104105 {
    align-self: stretch;
    height: 859px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .frame-1410104067 {
    width: 397px;
    padding: 24px;
    left: 174.5px;
    top: 341px;
    position: absolute;
    background: white;
    border-radius: 12px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 16px;
    display: flex;
  }

  .frame-1410103870 {
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .frame-1410104083 {
    width: 745px;
    position: relative;
    flex-direction: column;
    justify-content: center;
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

  .frame-1410104054 {
    align-self: stretch;
    padding: 12px;
    position: relative;
    background: #f8fafb;
    border-radius: 12px;
    flex-direction: column;
    justify-content: flex-end;
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

  .review-reaction {
    width: 100%;
    height: 100%;
    padding-top: 24px;
    padding-bottom: 80px;
    padding-left: 20px;
    padding-right: 20px;
    background: white;
    overflow: hidden;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 48px;
    display: inline-flex;
  }
  .logo-img {
    background-image: url("../../../assets/logo.png");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    width: 100%;
    height: 100%;
  }
  /* Title: single line, ellipsis if overflow */
  .recording-reaction {
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  /* Make main photo full width */
  .frame-1410104055 {
    width: 100%;
    height: auto;
    display: block;
  }
  @media (max-width: 800px) {
    /* Containers full width */
    .frame-1410103818 {
      width: 100%;
    }
    .frame-1410104083 {
      width: 100%;
    }
    /* Title full width */
    .recording-reaction {
      width: 100%;
    }
    .heading_01 {
      width: 100%;
    }
    /* Hide bottom Back button */
    .frame-1410103870 .button {
      display: none;
    }
    /* Bottom action primary full width */
    .frame-1410103860 {
      justify-content: center;
    }
    .button_01 {
      width: 100%;
    }
    .recordingreaction_span {
      font-size: 28px;
    }
    .frame-1410104194 {
      height: 300px;
      width: 200px;
      /* bottom: 100px; */
      top: auto;
    }
    .frame-1410104067 {
      left: auto;
      width : 300px;
      top: 300px;
    }
  }
</style>
