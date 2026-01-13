<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import xIcon from "../assets/X.svg";
  import ArrowsClockwise from "../assets/ArrowsClockwise.svg";
  import DownloadSimple from "../assets/DownloadSimple.svg";
  import Plus from "../assets/Plus.svg";
  import logo from "../assets/logo.png";

  export let storyTitle = "Luna's Adventure";
  export let pagesRead = 5;
  export let readingTime = "0:00";
  export let audioListened = "2 min";

  let reflectionText = "";
  const maxCharacters = 200;

  const dispatch = createEventDispatcher();

  function handleClose() {
    dispatch("close");
  }

  function handleReadAgain() {
    dispatch("readAgain");
  }

  function handleDownloadPDF() {
    dispatch("downloadPDF");
  }

  function handleCreateNewBook() {
    dispatch("createNewBook");
  }

  function handleReflectionInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    const value = target.value;
    if (value.length <= maxCharacters) {
      reflectionText = value;
    } else {
      target.value = reflectionText; // Revert if over limit
    }
  }

  $: characterCount = reflectionText.length;
</script>

<div class="information-helper-text">
  <div class="frame-1410103849">
    <div class="frame-1410103838">
      <div class="logo-text-full">
        <img src={logo} alt="Drawtopia Logo" class="logo-img" />
      </div>
      <button type="button" class="x" on:click={handleClose} aria-label="Close modal">
        <img src={xIcon} alt="Close" class="vector" />
      </button>
    </div>
    <div class="stroke"></div>
  </div>

  <div class="frame-2147227593">
    <div class="frame-1410103944">
      <div class="the-end-lunas-adventure">
        <span class="theendlunasadventure_span">The End "{storyTitle}"</span>
      </div>
      <div class="character-completed-an-amazing-adventure">
        <span class="charactercompletedanamazingadventure_span">Character completed an amazing adventure!</span>
      </div>
    </div>

    <div class="frame-1410104098">
      <div class="frame-1410104091">
        <div class="frame-1410104090">
          <div class="story-details">
            <span class="storydetails_span">Story Details</span>
          </div>
        </div>
      </div>
      <div class="stroke_01"></div>
      <div class="frame-1410104096">
        <div class="frame-1410104094">
          <div class="frame-1410104092">
            <div class="frame-1410104098_01">
              <div class="pages-read">
                <span class="pagesread_span">Pages Read</span>
              </div>
              <div class="text-5">
                <span class="f_span">{pagesRead}</span>
              </div>
            </div>
          </div>
          <div class="frame-1410104094_01">
            <div class="frame-1410104098_02">
              <div class="reading-time">
                <span class="readingtime_span">Reading time</span>
              </div>
              <div class="text-000">
                <span class="f00_span">{readingTime}</span>
              </div>
            </div>
          </div>
          <div class="frame-1410104093">
            <div class="frame-1410104100">
              <div class="audio-listened">
                <span class="audiolistened_span">Audio Listened</span>
              </div>
              <div class="text-2-min">
                <span class="fmin_span">{audioListened}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="form">
      <div class="what-did-you-learn-from-this-story">
        <span class="whatdidyoulearnfromthisstory_span">What did you learn from this story?</span>
      </div>
      <div class="frame-1410104041">
        <div class="input-placeholder">
          <textarea
            class="reflection-textarea"
            placeholder="Type your Reflection"
            value={reflectionText}
            on:input={handleReflectionInput}
            rows="6"
          ></textarea>
        </div>
        <div class="text-0200-characters">
          <span class="f200characters_span">{characterCount}/{maxCharacters} Characters</span>
        </div>
      </div>
    </div>
  </div>

  <div class="rectangle-261"></div>

  <div class="frame-2147227605">
    <button type="button" class="button" on:click={handleReadAgain}>
      <div class="arrowclockwise">
        <img src={ArrowsClockwise} alt="Arrow Clockwise" class="vector_01" />
      </div>
      <div class="read-again">
        <span class="readagain_span">Read Again</span>
      </div>
      <div class="ellipse-1415"></div>
    </button>
    <button type="button" class="button_01" on:click={handleDownloadPDF}>
      <div class="downloadsimple">
        <img src={DownloadSimple} alt="Download" class="download-icon-img" />
      </div>
      <div class="download-pdf">
        <span class="downloadpdf_span">Download PDF</span>
      </div>
    </button>
    <button type="button" class="notification" on:click={handleCreateNewBook}>
      <div class="frame-2147227606">
        <img src={Plus} alt="Plus" class="plus-icon-img" />
      </div>
      <div>
        <span class="createnewbook_span">Create New Book</span>
      </div>
    </button>
  </div>
</div>

<style>
  .information-helper-text {
    width: 100%;
    height: 100%;
    padding-top: 16px;
    padding-bottom: 24px;
    padding-left: 16px;
    padding-right: 16px;
    background: white;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
  }

  .frame-1410103849 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
    display: flex;
  }

  .frame-1410103838 {
    align-self: stretch;
    padding-left: 12px;
    padding-right: 12px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .logo-text-full {
    width: 216px;
    height: 40.37px;
    position: relative;
  }

  .logo-img {
    width: 100%;
    height: 100%;
  }

  .drawtopia {
    width: 216px;
    height: 40.37px;
    left: 0px;
    top: 0px;
    position: absolute;
    background: radial-gradient(ellipse 50.00% 50.00% at 50.00% 50.00%, #0fe3ef 44%, #438bff 100%);
    box-shadow: 0px 0.6032477617263794px 1.8097431659698486px #871fff inset;
  }

  .subtract {
    width: 30.16px;
    height: 30.16px;
    left: 129.13px;
    top: 1.94px;
    position: absolute;
    transform: rotate(4deg);
    transform-origin: top left;
    background: radial-gradient(ellipse 50.00% 50.00% at 50.00% 50.00%, #0fe3ef 44%, #438bff 100%);
    box-shadow: 0px 0.6032479405403137px 1.8097436428070068px #871fff inset;
  }

  .x {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .vector {
    width: 15px;
    height: 15px;
    position: relative;
  }

  .stroke {
    align-self: stretch;
    height: 1px;
    background: #dcdcdc;
  }

  .frame-2147227593 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: flex;
  }

  .frame-1410103944 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;
    display: flex;
  }

  .theendlunasadventure_span {
    color: black;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.60px;
    word-wrap: break-word;
  }

  .the-end-lunas-adventure {
    text-align: center;
  }

  .charactercompletedanamazingadventure_span {
    color: black;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 28px;
    word-wrap: break-word;
  }

  .character-completed-an-amazing-adventure {
    align-self: stretch;
    text-align: center;
  }

  .frame-1410104098 {
    align-self: stretch;
    padding: 12px;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
    display: flex;
  }

  .frame-1410104091 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .frame-1410104090 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 10px;
    display: inline-flex;
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
    background: #ededed;
  }

  .frame-1410104096 {
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

  .frame-1410104092 {
    flex: 1 1 0;
    padding: 12px;
    background: #f8fafb;
    border-radius: 12px;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
  }

  .frame-1410104094_01 {
    flex: 1 1 0;
    padding: 12px;
    background: #f8fafb;
    border-radius: 12px;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
  }

  .frame-1410104093 {
    flex: 1 1 0;
    padding: 12px;
    background: #f8fafb;
    border-radius: 12px;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
  }

  .frame-1410104098_01 {
    align-self: stretch;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 2px;
    display: flex;
  }

  .pagesread_span {
    color: #727272;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .pages-read {
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

  .text-5 {
    align-self: stretch;
    text-align: center;
  }

  .frame-1410104098_02 {
    align-self: stretch;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 2px;
    display: flex;
  }

  .readingtime_span {
    color: #727272;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .reading-time {
    align-self: stretch;
    text-align: center;
  }

  .f00_span {
    color: #141414;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.60px;
    word-wrap: break-word;
  }

  .text-000 {
    align-self: stretch;
    text-align: center;
  }

  .frame-1410104100 {
    align-self: stretch;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 2px;
    display: flex;
  }

  .audiolistened_span {
    color: #727272;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .audio-listened {
    width: 141px;
    text-align: center;
  }

  .fmin_span {
    color: #141414;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.60px;
    word-wrap: break-word;
  }

  .text-2-min {
    align-self: stretch;
    text-align: center;
  }

  .form {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: flex;
  }

  .whatdidyoulearnfromthisstory_span {
    color: #141414;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .what-did-you-learn-from-this-story {
    align-self: stretch;
  }

  .frame-1410104041 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .input-placeholder {
    align-self: stretch;
    height: 168px;
    padding: 12px;
    background: white;
    overflow: hidden;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 10px;
    display: inline-flex;
  }

  .reflection-textarea {
    width: 100%;
    height: 100%;
    border: none;
    outline: none;
    background: transparent;
    resize: none;
    font-family: DM Sans;
    font-size: 16px;
    font-weight: 400;
    line-height: 22.40px;
    color: #141414;
  }

  .reflection-textarea::placeholder {
    color: #727272;
  }

  .f200characters_span {
    color: #727272;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .text-0200-characters {
    align-self: stretch;
  }

  .rectangle-261 {
    align-self: stretch;
    height: 1px;
    background: #ededed;
  }

  .frame-2147227605 {
    align-self: stretch;
    justify-content: center;
    align-items: center;
    gap: 12px;
    display: inline-flex;
    flex-wrap: wrap;
  }

  .button {
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    position: relative;
    background: #438bff;
    overflow: hidden;
    border-radius: 20px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    border: none;
    cursor: pointer;
  }

  .arrowclockwise {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .vector_01 {
    width: 19.50px;
    height: 18px;
    left: 3px;
    top: 3px;
    position: absolute;
    filter: brightness(0) invert(1);
  }

  .readagain_span {
    color: white;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.20px;
    word-wrap: break-word;
  }

  .read-again {
    text-align: center;
  }

  .ellipse-1415 {
    width: 248px;
    height: 114px;
    left: -33px;
    top: 15px;
    position: absolute;
    background: radial-gradient(ellipse 42.11% 42.11% at 50.00% 52.94%, white 0%, rgba(255, 255, 255, 0) 100%);
    border-radius: 9999px;
    pointer-events: none;
  }

  .button_01 {
    width: 231px;
    height: 52px;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    background: #e7feff;
    box-shadow: 0px 4px 0px #438bff;
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

  .downloadsimple {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .download-icon-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: brightness(0) saturate(100%) invert(45%) sepia(93%) saturate(1352%) hue-rotate(195deg) brightness(101%) contrast(101%);
  }

  .downloadpdf_span {
    color: #438bff;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.20px;
    word-wrap: break-word;
  }

  .download-pdf {
    text-align: center;
  }

  .notification {
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 18px;
    padding-right: 24px;
    background: #f8fafb;
    box-shadow: 0px 1px 4px rgba(141.80, 141.80, 141.80, 0.25) inset;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: flex;
    border: none;
    cursor: pointer;
  }

  .frame-2147227606 {
    width: 24px;
    height: 24px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .plus-icon-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: brightness(0) saturate(100%) invert(43%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(90%) contrast(89%);
  }

  .createnewbook_span {
    color: #141414;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28px;
    word-wrap: break-word;
  }

  @media (max-width: 768px) {
    .information-helper-text {
      border-radius: 0;
    }

    .frame-2147227605 {
      flex-direction: column;
    }

    .button {
      width: 100%;
    }

    .button_01 {
      width: 100%;
    }

    .notification {
      width: 100%;
      justify-content: center;
    }

    .theendlunasadventure_span {
      font-size: 20px;
    }

    .charactercompletedanamazingadventure_span {
      font-size: 16px;
    }

    .pagesread_span {
      font-size: 12px;
    }

    .readingtime_span {
      font-size: 12px;
    }

    .audiolistened_span {
      font-size: 12px;
    }

    .audio-listened {
      width: auto;
    }
  }
</style>

