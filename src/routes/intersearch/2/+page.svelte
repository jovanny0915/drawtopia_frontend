<script lang="ts">
  import { goto } from '$app/navigation';
  import logo from "../../../assets/logo.png";
  // Placeholder image - replace with real cover asset
  import bookCover from "../../../assets/Luna1.png";
  import fullscreen from "../../../assets/fullscreen.svg";
  import shareIcon from "../../../assets/Share.svg";
  import menuIcon from "../../../assets/DotsThreeOutline.svg";
  import coverIcon from "../../../assets/covericon.svg";
  import mailIcon from "../../../assets/mailicon.svg";
  import lockKeyIcon from "../../../assets/LockKey.svg";

  let activePage = 1;
  const totalPages = 5; // adjust if needed
  type ViewMode = "one" | "two";
  let viewMode: ViewMode = "two";

  function handleStartScene1() {
    goto('/intersearch/3');
  }

  function handlePrevious() {
    goto('/intersearch/1');
  }
</script>

<div class="preview-outer">
  <div class="preview-logo-container">
    <img class="preview-logo" src={logo} alt="Drawtopia Logo" />
  </div>
  <div class="preview-content-container">
    <div class="preview-header-container">
      <div class="preview-header-title">
        Your Search Adventure : Where is Luna?
        <div class="preview-header-note">
          FREE PREVIEW · Other pages available after purchased
        </div>
      </div>
      <div class="header-right-actions">
        <button class="icon-btn" aria-label="Share">
          <img src={shareIcon} alt="Share" />
        </button>
        <button class="icon-btn" aria-label="More">
          <img src={menuIcon} alt="More" />
        </button>
      </div>
    </div>
    <div class="preview-header-actions">
      <div class="view-toggle">
        <button
          class:active={viewMode === "one"}
          on:click={() => (viewMode = "one")}>One-page view</button
        >
        <button
          class:active={viewMode === "two"}
          on:click={() => (viewMode = "two")}>Two-page view</button
        >
      </div>
    </div>
    <div class="preview-book-area">
      <div class="preview-book-container">
        {#if viewMode === "one"}
          <div class="preview-book-border single">
            <div class="preview-book-mockup">
              <img
                class="preview-book-img"
                src={bookCover}
                alt="Preview - Where Is Luna?"
              />
            </div>
          </div>
        {:else}
          <div class="two-page">
            <div class="preview-book-border">
              <div class="preview-book-mockup">
                <img class="preview-book-img" src={bookCover} alt="Left page" />
              </div>
            </div>
            <div class="preview-book-border">
              <div class="preview-book-mockup">
                <img
                  class="preview-book-img"
                  src={bookCover}
                  alt="Right page"
                />
              </div>  
            </div>
          </div>
        {/if}
        <button class="preview-fullscreen"
          ><img src={fullscreen} alt="Fullscreen" /> Full Screen Preview</button
        >
      </div>
    </div>
    <div class="preview-footer-area">
      <button class="preview-nav-btn" on:click={handlePrevious}>{"← Previous"}</button>
      <div class="preview-dots">
        {#each Array(totalPages) as _, idx}
          {#if idx === 0}
            <span class="preview-dot active">
              <img src={coverIcon} alt="cover icon">
            </span>
          {:else if idx == 1}
            <span class="preview-dot">
              <img src={mailIcon} alt="mail icon">
            </span>
          {:else if idx < 4}
            <span class="preview-dot" style="color: #fff; font-size: 24px; font-weight: 600;">
              {idx - 1}
            </span>
            {:else}
            <span class="preview-dot lock">
              <img src={lockKeyIcon} alt="mail icon">
            </span>
          {/if}
        {/each}
      </div>
      <button class="preview-start-btn" on:click={handleStartScene1}>Start Scene 1</button>
    </div>
  </div>
</div>

<style>
  .preview-outer {
    min-height: 100vh;
    width: 100%;
  padding: 24px 100px 80px 100px;
    background: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 30px;
    gap: 24px;
  }
  .preview-logo-container {
    justify-content: center;
    align-items: center;
    padding: 12px 12px 12px 24px;
  }

  .preview-logo {
    height: 43px;
  }

  .preview-header-container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .preview-content-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
  width: 1240px;
  max-width: 100%;
  height: 1130px;
    border-radius: 20px;
    outline: 1px #dcdcdc solid;
    padding: 12px;
  }

  .preview-header-title {
    gap: 12px;
    display: flex;
    flex-direction: column;
    font-family: Quicksand, sans-serif;
    font-weight: 700;
    font-size: 32px;
    color: #23243c;
    letter-spacing: 0.01em;
    margin-bottom: 24px;
  }
  .preview-header-note {
    font-family: Nunito, sans-serif;
    font-size: 12px;
    color: #b8b8bb;
  }
  .preview-header-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .view-toggle {
    background: #f1f5fb;
    border: 1px solid #e2e8f5;
    border-radius: 8px;
    padding: 2px;
    display: inline-flex;
    gap: 2px;
  }
  .view-toggle button {
    font-family: Nunito, sans-serif;
    width: 177px;
    height: 55px;
    font-size: 18px;
    color: #3b4160;
    background: transparent;
    border: 0;
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
  }
  .view-toggle button.active {
    background: #2a6bf3;
    color: #fff;
    box-shadow: 0 2px 10px #2a6bf320;
  }
  .header-right-actions {
    display: flex;
    gap: 8px;
  }
  .icon-btn {
    width: 32px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: #fff;
    cursor: pointer;
  }
  .icon-btn img {
    width: 16px;
    height: 16px;
  }
  .preview-book-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  width: 1216px;
  max-width: 100%;
  height: 1078px;
    background-color: #f8fafb;
    border-radius: 12px;
    padding: 12px;
  }
  .preview-book-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
  width: 1084px;
  }
  .two-page {
    display: flex;
    flex-direction: row;
    gap: 24px;
    align-items: start;
    justify-items: center;
  width: 1084px;
    height: 100%;
  }
  .preview-book-mockup {
    background: #000;
    border-radius: 19px 19px 22px 22px;
    box-shadow:
      0 4px 32px rgba(47, 70, 110, 0.16),
      0 0 0 2px #e7eaf8;
    padding: 0;
    margin-bottom: 0;
    border: 2.7px solid #e1e7f8;
    position: relative;
    z-index: 2;
  }
  .preview-book-img {
    width: 100%;
    height: 100%;
    border-radius: 18px 18px 22px 22px;
    background: white;
    object-fit: cover;
    box-shadow: none;
  }
  .preview-book-base {
    width: 77%;
    height: 24px;
    margin-top: -7px;
    background: radial-gradient(ellipse at center, #0001 33%, #fff0 74%);
    border-radius: 0 0 17px 17px / 0 0 48% 48%;
    box-shadow: 0 16px 32px 0 #abb4cf26;
    z-index: 1;
  }
  .preview-book-border.single .preview-book-img {
    width: 542px;
    height: 691px;
  }
  .preview-fullscreen {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: 270px;
    height: 56px;
    padding: 9px 23px;
    background: #f8fafc;
    border: 1.3px solid #e6ebf3;
    font-family: Nunito, sans-serif;
    font-size: 20px;
    font-weight: 600;
    color: #141414;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: background 0.18s;
  }
  .preview-fullscreen:hover {
    background: #edf4fd;
  }
  .preview-footer-area {
  height: 57px;
  width: 1216px;
  max-width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 28px;
  }
  .preview-nav-btn {
    font-family: Nunito, sans-serif;
    font-size: 13px;
    border: none;
    background: #f6f9fd;
    color: #3b4160;
    border-radius: 6px;
    padding: 6px 16px;
    cursor: pointer;
    height: 57px;
    width: 151px;
    transition: background 0.18s;
  }
  .preview-nav-btn:hover {
    background: #e8f0fb;
  }
  .preview-dots {
    display: flex;
    gap: 7px;
  }
  .preview-dot {
    width: 40px;
    height: 40px;
    border-radius: 7px;
    background: #f0f0f8;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 1px;
  }
  .preview-dot.active {
    background: #144BE1;
    box-shadow: 0 2px 12px #477de710;
  }
  .preview-dot.lock svg {
    margin: 0 auto;
  }
  .preview-start-btn {
    font-family: Quicksand, sans-serif;
    color: #fff;
    background: #438bff;
    font-weight: 600;
    border: none;
    border-radius: 9px;
    font-size: 15px;
    padding: 10px 28px;
    min-width: 122px;
    box-shadow: 0 1.5px 6px #438bff22;
    cursor: pointer;
    transition: background 0.18s;
    height: 57px;
    width: 159px;
  }
  .preview-start-btn:hover {
    background: #2566c9;
  }
  @media (max-width: 600px) {
    .preview-book-img {
      width: 96vw;
      max-width: 320px;
      height: auto;
    }
    .preview-footer-area {
      gap: 7px;
      flex-direction: column;
    }
    .preview-book-mockup {
      padding: 0;
    }
    .preview-book-base {
      height: 16px;
    }
    .preview-logo {
      margin-top: 8vw;
      height: 28px;
    }
  }
</style>
