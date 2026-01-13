<script lang="ts">
  import { goto } from '$app/navigation';
  import logo from "../../../assets/logo.png";
  import luna1 from "../../../assets/Luna1.png";
  import luna2 from "../../../assets/Luna2.png";
  import fullscreen from "../../../assets/fullscreen.svg";
  import Play from "../../../assets/Play.svg";
  import SpeakerSimpleHigh from "../../../assets/SpeakerSimpleHigh.svg";
  import CaretDown from "../../../assets/CaretDown.svg";
  import ArrowLeft from "../../../assets/ArrowLeft.svg";
  import ArrowRight from "../../../assets/ArrowRight-white.svg";
  import Book from "../../../assets/Book.svg";
  import EnvelopeSimple from "../../../assets/EnvelopeSimple.svg";
  import EndAdventureModal from "../../../components/EndAdventureModal.svelte";

  type ViewMode = "one" | "two";
  let viewMode: ViewMode = "two";
  let audioSpeed = "1x";
  let isPlaying = false;
  const currentPage = 5;
  let showEndModal = false;

  function handlePrevious() {
    goto('/adventure-story/1');
  }

  function handleNext() {
    // Show the end adventure modal when clicking next pages
    showEndModal = true;
  }

  function handleCloseModal() {
    showEndModal = false;
  }

  function handleReadAgain() {
    showEndModal = false;
    // Navigate back to first page or restart the story
    goto('/adventure-story/1');
  }

  function handleDownloadPDF() {
    // Handle PDF download logic here
    console.log('Download PDF clicked');
    // Add your PDF download logic
  }

  function handleCreateNewBook() {
    showEndModal = false;
    // Navigate to create new book page
    goto('/dashboard');
  }

  function handleFullScreen() {
    // Handle full screen preview
  }

  function togglePlay() {
    isPlaying = !isPlaying;
  }
</script>

<div class="storybook-outer">
  <div class="storybook-logo-container">
    <img class="storybook-logo" src={logo} alt="Drawtopia Logo" />
  </div>
  
  <div class="storybook-content">
    <div class="storybook-header">
      <div class="storybook-title-section">
        <h1 class="storybook-title">Luna's Adventure</h1>
        <div class="storybook-subtitle">FREE PREVIEW • Other pages available after purchased</div>
      </div>
      <div class="view-toggle-container">
        <button
          class="view-toggle-btn"
          class:active={viewMode === "one"}
          on:click={() => (viewMode = "one")}
        >
          One-page view
        </button>
        <button
          class="view-toggle-btn"
          class:active={viewMode === "two"}
          on:click={() => (viewMode = "two")}
        >
          Two-page view
        </button>
      </div>
    </div>

    <div class="storybook-pages-container">
      {#if viewMode === "one"}
        <div class="storybook-page single">
          <div class="page-image-container">
            <img class="page-image" src={luna1} alt="Luna the dragon" />
          </div>
          <div class="page-text">Luna is a purple dragon. She has big wings. She can fly!</div>
          <button class="preview-tag-btn">Free Preview Pages</button>
        </div>
      {:else}
        <div class="two-pages">
          <div class="storybook-page">
            <div class="page-image-container">
              <img class="page-image" src={luna1} alt="Luna the dragon" />
            </div>
            <div class="page-text">Luna is a purple dragon. She has big wings. She can fly!</div>
            <button class="preview-tag-btn">Free Preview Pages</button>
          </div>
          <div class="storybook-page">
            <div class="page-image-container">
              <img class="page-image" src={luna2} alt="Luna with bunny" />
            </div>
            <div class="page-text">
              Luna gently picked up the bunny and flew through the forest, searching for his home. 
              Together they soared over streams and meadows.
            </div>
            <button class="preview-tag-btn">Free Preview Pages</button>
          </div>
        </div>
      {/if}
      
      <button class="fullscreen-btn" on:click={handleFullScreen}>
        <img src={fullscreen} alt="Fullscreen icon" />
        Full Screen Preview
      </button>
    </div>

    <div class="audio-narration-section">
      <div class="audio-narration-header">
        <div class="audio-narration-label">Audio Narration</div>
        <div class="audio-pages-label">Pages 1-2</div>
      </div>
      <div class="audio-controls">
        <button class="play-btn" on:click={togglePlay}>
          <img src={Play} alt="Play" />
        </button>
        <div class="audio-slider-container">
          <img class="volume-icon" src={SpeakerSimpleHigh} alt="Volume" />
          <div class="audio-slider">
            <div class="audio-slider-progress"></div>
          </div>
        </div>
        <div class="speed-control">
          <span class="speed-label">Speed</span>
          <div class="speed-dropdown">
            <span>{audioSpeed}</span>
            <img src={CaretDown} alt="Dropdown" />
          </div>
        </div>
      </div>
    </div>

    <div class="pagination-section">
      <button class="pagination-btn prev-btn" on:click={handlePrevious}>
        <img src={ArrowLeft} alt="Previous" />
        Previous Pages
      </button>
      <div class="page-indicators">
        <div class="page-indicator locked">
          <img src={Book} alt="Page icon" />
        </div>
        <div class="page-indicator locked">
          <img src={EnvelopeSimple} alt="Envelope icon" />
        </div>
        <div class="page-indicator">
          <span>1</span>
        </div>
        <div class="page-indicator">
          <span>2</span>
        </div>
        <div class="page-indicator">
          <span>3</span>
        </div>
        <div class="page-indicator">
          <span>4</span>
        </div>
        <div class="page-indicator active">
          <span>5</span>
        </div>
      </div>
      <button class="pagination-btn next-btn" on:click={handleNext}>
        Next Pages
        <img src={ArrowRight} alt="Next" />
      </button>
    </div>
  </div>
</div>

{#if showEndModal}
  <EndAdventureModal
    storyTitle="Luna's Adventure"
    pagesRead={5}
    readingTime="0:00"
    audioListened="2 min"
    on:close={handleCloseModal}
    on:readAgain={handleReadAgain}
    on:downloadPDF={handleDownloadPDF}
    on:createNewBook={handleCreateNewBook}
  />
{/if}

<style>
  .storybook-outer {
    min-height: 100vh;
    width: 100%;
    padding: 24px 100px 80px 100px;
    background: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
  }

  .storybook-logo-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 12px;
  }

  .storybook-logo {
    height: 43px;
  }

  .storybook-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
    width: 1240px;
    max-width: 100%;
  }

  .storybook-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 24px;
  }

  .storybook-title-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex: 1;
  }

  .storybook-title {
    font-family: Quicksand, sans-serif;
    font-weight: 700;
    font-size: 32px;
    color: #23243c;
    margin: 0;
    letter-spacing: 0.01em;
  }

  .storybook-subtitle {
    font-family: Nunito, sans-serif;
    font-size: 12px;
    color: #b8b8bb;
  }

  .view-toggle-container {
    display: flex;
    gap: 2px;
    background: #f1f5fb;
    border: 1px solid #e2e8f5;
    border-radius: 8px;
    padding: 2px;
  }

  .view-toggle-btn {
    font-family: Nunito, sans-serif;
    font-size: 18px;
    color: #3b4160;
    background: transparent;
    border: none;
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.18s;
    min-width: 177px;
    height: 55px;
  }

  .view-toggle-btn.active {
    background: #2a6bf3;
    color: #fff;
    box-shadow: 0 2px 10px rgba(42, 107, 243, 0.12);
  }

  .storybook-pages-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    width: 100%;
    padding: 12px;
    background-color: #f8fafb;
    border-radius: 12px;
  }

  .two-pages {
    display: flex;
    gap: 24px;
    width: 100%;
    justify-content: center;
  }

  .storybook-page {
    flex: 1;
    max-width: 530px;
    background: white;
    border-radius: 16px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 32px rgba(47, 70, 110, 0.16);
    border: 2px solid #e1e7f8;
    min-height: 700px;
    position: relative;
  }

  .storybook-page.single {
    max-width: 530px;
    margin: 0 auto;
  }

  .page-image-container {
    width: 100%;
    flex: 1;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 16px;
    position: relative;
    background: white;
  }

  .page-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .page-text {
    font-family: Nunito, sans-serif;
    font-size: 16px;
    color: #141414;
    line-height: 1.5;
    margin-bottom: 12px;
    padding: 0 4px;
  }

  .preview-tag-btn {
    align-self: center;
    padding: 12px 24px;
    background: white;
    border: 1px solid #ededed;
    border-radius: 12px;
    font-family: Quicksand, sans-serif;
    font-size: 16px;
    font-weight: 600;
    color: #141414;
    cursor: pointer;
    transition: background 0.18s;
    margin-top: auto;
  }

  .preview-tag-btn:hover {
    background: #f8fafb;
  }

  .fullscreen-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 12px 23px;
    background: white;
    border: 1.3px solid #e6ebf3;
    border-radius: 8px;
    font-family: Nunito, sans-serif;
    font-size: 20px;
    font-weight: 500;
    color: #141414;
    cursor: pointer;
    transition: background 0.18s;
  }

  .fullscreen-btn:hover {
    background: #edf4fd;
  }

  .fullscreen-btn img {
    width: 20px;
    height: 20px;
  }

  .audio-narration-section {
    padding: 16px;
    background: #eef6ff;
    border: 1px solid #438bff;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .audio-narration-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .audio-narration-label {
    font-family: Quicksand, sans-serif;
    font-size: 20px;
    font-weight: 600;
    color: #438bff;
  }

  .audio-pages-label {
    font-family: Quicksand, sans-serif;
    font-size: 20px;
    font-weight: 600;
    color: #438bff;
  }

  .audio-controls {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .play-btn {
    width: 48px;
    height: 48px;
    padding: 12px;
    background: #438bff;
    border: none;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.18s;
  }

  .play-btn:hover {
    background: #2566c9;
  }

  .play-btn img {
    width: 24px;
    height: 24px;
  }

  .audio-slider-container {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 9px;
  }

  .volume-icon {
    width: 24px;
    height: 24px;
  }

  .audio-slider {
    flex: 1;
    height: 3px;
    background: white;
    border-radius: 12px;
    position: relative;
  }

  .audio-slider-progress {
    width: 73px;
    height: 100%;
    background: #438bff;
    border-radius: 12px;
  }

  .speed-control {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .speed-label {
    font-family: Quicksand, sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: #141414;
  }

  .speed-dropdown {
    padding: 4px 12px;
    background: #f8fafb;
    border: 1px solid #438bff;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  .speed-dropdown span {
    font-family: Quicksand, sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: #141414;
  }

  .speed-dropdown img {
    width: 16px;
    height: 16px;
  }

  .pagination-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 28px;
  }

  .pagination-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 24px;
    border: none;
    border-radius: 20px;
    font-family: Quicksand, sans-serif;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.18s;
    height: 57px;
  }

  .pagination-btn img {
    width: 24px;
    height: 24px;
  }

  .prev-btn {
    background: white;
    color: #141414;
    box-shadow: 0px 4px 4px rgba(98.89, 98.89, 98.89, 0.25);
    border: 1px solid #ededed;
  }

  .prev-btn:hover {
    background: #f8fafb;
  }

  .next-btn {
    background: #438bff;
    color: white;
  }

  .next-btn:hover {
    background: #2566c9;
  }

  .page-indicators {
    display: flex;
    gap: 7px;
    align-items: center;
  }

  .page-indicator {
    width: 40px;
    height: 40px;
    border-radius: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f0f0f8;
  }

  .page-indicator.active {
    background: #144BE1;
    box-shadow: 0 2px 12px rgba(71, 125, 231, 0.1);
  }

  .page-indicator.active span {
    color: white;
    font-family: Quicksand, sans-serif;
    font-size: 24px;
    font-weight: 600;
  }

  .page-indicator span {
    color: #3b4160;
    font-family: Quicksand, sans-serif;
    font-size: 24px;
    font-weight: 600;
  }

  .page-indicator.locked {
    background: #c1c7d0;
  }

  .page-indicator img {
    width: 24px;
    height: 24px;
  }

  @media (max-width: 800px) {
    .storybook-outer {
      padding: 24px 20px 80px 20px;
    }

    .storybook-content {
      width: 100%;
    }

    .storybook-header {
      flex-direction: column;
      gap: 16px;
    }

    .view-toggle-container {
      width: 100%;
    }

    .view-toggle-btn {
      flex: 1;
      min-width: auto;
      font-size: 16px;
    }

    .two-pages {
      flex-direction: column;
    }

    .storybook-page {
      max-width: 100%;
      min-height: auto;
    }

    .page-image-container {
      height: 300px;
    }
  }
</style>

