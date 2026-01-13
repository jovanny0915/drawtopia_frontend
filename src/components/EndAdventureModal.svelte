<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import logo from "../assets/logo.png";
  import xIcon from "../assets/X.svg";
  import ArrowsClockwise from "../assets/ArrowsClockwise.svg";
  import DownloadSimple from "../assets/DownloadSimple.svg";
  import UserCirclePlus from "../assets/UserCirclePlus.svg";

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
</script>

<div class="modal-overlay" role="dialog" aria-modal="true" on:click|self={handleClose}>
  <div class="modal-container" on:click|stopPropagation>
    <!-- Header -->
    <div class="modal-header">
      <img class="modal-logo" src={logo} alt="Drawtopia Logo" />
      <button class="close-btn" on:click={handleClose} aria-label="Close modal">
        <img src={xIcon} alt="Close" />
      </button>
    </div>

    <!-- Title Section -->
    <div class="modal-title-section">
      <h2 class="modal-title">The End '{storyTitle}'</h2>
      <p class="modal-subtitle">Character completed an amazing adventure!</p>
    </div>

    <!-- Story Details Section -->
    <div class="story-details-section">
      <h3 class="section-heading">Story Details</h3>
      <div class="metrics-container">
        <div class="metric-box">
          <div class="metric-value">{pagesRead}</div>
          <div class="metric-label">Pages Read</div>
        </div>
        <div class="metric-box">
          <div class="metric-value">{readingTime}</div>
          <div class="metric-label">Reading time</div>
        </div>
        <div class="metric-box">
          <div class="metric-value">{audioListened}</div>
          <div class="metric-label">Audio Listened</div>
        </div>
      </div>
    </div>

    <!-- Reflection Section -->
    <div class="reflection-section">
      <h3 class="section-heading">What did you learn from this story?</h3>
      <textarea
        class="reflection-textarea"
        placeholder="Type your Reflection"
        value={reflectionText}
        on:input={handleReflectionInput}
      ></textarea>
      <div class="character-count">{reflectionText.length}/{maxCharacters} Characters</div>
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <button class="action-btn read-again-btn" on:click={handleReadAgain}>
        <img src={ArrowsClockwise} alt="Refresh" class="btn-icon" />
        Read Again
      </button>
      <button class="action-btn download-btn" on:click={handleDownloadPDF}>
        <img src={DownloadSimple} alt="Download" class="btn-icon" />
        Download PDF
      </button>
      <button class="action-btn create-new-btn" on:click={handleCreateNewBook}>
        <img src={UserCirclePlus} alt="Plus" class="btn-icon" />
        Create New Book
      </button>
    </div>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 20px;
    box-sizing: border-box;
  }

  .modal-container {
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    width: 100%;
    max-width: 800px;
    max-height: 90vh;
    overflow-y: auto;
    padding: 32px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    position: relative;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .modal-logo {
    height: 40px;
    width: auto;
  }

  .close-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.2s;
  }

  .close-btn:hover {
    opacity: 0.7;
  }

  .close-btn img {
    width: 24px;
    height: 24px;
  }

  .modal-title-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .modal-title {
    font-family: Quicksand, sans-serif;
    font-weight: 700;
    font-size: 28px;
    color: #23243c;
    margin: 0;
    line-height: 1.2;
  }

  .modal-subtitle {
    font-family: Nunito, sans-serif;
    font-size: 16px;
    color: #6b7280;
    margin: 0;
  }

  .story-details-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .reflection-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .section-heading {
    font-family: Quicksand, sans-serif;
    font-weight: 600;
    font-size: 20px;
    color: #23243c;
    margin: 0;
  }

  .metrics-container {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }

  .metric-box {
    flex: 1;
    min-width: 140px;
    padding: 20px;
    background: #f8fafb;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    border: 1px solid #e5e7eb;
  }

  .metric-value {
    font-family: Quicksand, sans-serif;
    font-weight: 700;
    font-size: 32px;
    color: #23243c;
    line-height: 1;
  }

  .metric-label {
    font-family: Nunito, sans-serif;
    font-size: 14px;
    color: #6b7280;
    text-align: center;
  }

  .reflection-textarea {
    width: 100%;
    min-height: 120px;
    padding: 16px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-family: Nunito, sans-serif;
    font-size: 16px;
    color: #23243c;
    background: white;
    resize: vertical;
    box-sizing: border-box;
  }

  .reflection-textarea::placeholder {
    color: #9ca3af;
  }

  .reflection-textarea:focus {
    outline: none;
    border-color: #438bff;
    box-shadow: 0 0 0 3px rgba(67, 139, 255, 0.1);
  }

  .character-count {
    font-family: Nunito, sans-serif;
    font-size: 14px;
    color: #9ca3af;
    text-align: right;
    margin-top: -4px;
  }

  .action-buttons {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .action-btn {
    flex: 1;
    min-width: 160px;
    padding: 14px 24px;
    border-radius: 10px;
    font-family: Quicksand, sans-serif;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: all 0.2s;
    border: none;
  }

  .create-new-btn .btn-icon {
    width: 18px;
    height: 18px;
    opacity: 0.8;
  }

  .read-again-btn {
    background: #438bff;
    color: white;
  }

  .read-again-btn:hover {
    background: #2566c9;
  }

  .download-btn {
    background: #e0f2fe;
    color: #438bff;
  }

  .download-btn:hover {
    background: #bae6fd;
  }

  .create-new-btn {
    background: white;
    color: #23243c;
    border: 1px solid #e5e7eb;
  }

  .create-new-btn:hover {
    background: #f8fafb;
    border-color: #d1d5db;
  }

  .btn-icon {
    width: 20px;
    height: 20px;
  }

  @media (max-width: 768px) {
    .modal-container {
      padding: 24px 20px;
      max-width: 95vw;
    }

    .modal-title {
      font-size: 24px;
    }

    .metrics-container {
      flex-direction: column;
    }

    .metric-box {
      width: 100%;
    }

    .action-buttons {
      flex-direction: column;
    }

    .action-btn {
      width: 100%;
      min-width: unset;
    }
  }
</style>

