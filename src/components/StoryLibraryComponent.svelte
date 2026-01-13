<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import eye from "../assets/eye.svg";
  import download from "../assets/DownloadSimple-black.svg";
  import play from "../assets/Play-outline.svg";
  import share from "../assets/ShareFat.svg";
  import check from "../assets/completed.svg";
  import generating from "../assets/generating.svg";
  import draft from "../assets/draft.svg";
  import failed from "../assets/failed.svg";

  export let title: string = "Luna's Magic Adventure";
  export let author: string = "Andreas";
  export let status: "completed" | "generating" | "draft" | "failed" =
    "completed";
  export let createdDate: string = "15/01/2024";
  export let durationText: string = "8 min read";
  export let occasion: string = "Birthday";
  export let imageUrl: string = "https://placehold.co/332x225";

  const dispatch = createEventDispatcher();

  function onRead() {
    dispatch("read", { title });
  }
  function onDownload() {
    dispatch("download", { title });
  }
  function onPlay() {
    dispatch("play", { title });
  }
  function onShare() {
    dispatch("share", { title });
  }
</script>

<div class="cardd">
  <div class="frame-1410104163">
    <div class="lunas-magic-adventure">
      <span class="lunasmagicadventure_span">{title}</span>
    </div>
    <div class="frame-1410103891">
      <div class="andreas"><span class="andreas_span">{author}</span></div>
    </div>
  </div>
  <div class="image">
    <img src={imageUrl} alt={title} class="story-image" />
    <div class="status-overlay">
      {#if status === "completed"}
        <div class="frame-1410103869">
          <img src={check} alt="check" class="check" />
          <div class="sub-menu">
            <div class="completed">
              <span class="completed_span">Completed</span>
            </div>
          </div>
        </div>
      {:else if status === "generating"}
        <div class="frame-1410103869 generating-status">
          <img src={generating} alt="check" class="check" />
          <div class="sub-menu">
            <div class="completed">
              <span class="generating_span">Generating</span>
            </div>
          </div>
        </div>
      {:else if status === "draft"}
        <div class="frame-1410103869 draft-status">
          <img src={draft} alt="check" class="check" />
          <div class="sub-menu">
            <div class="completed"><span class="draft_span">Draft</span></div>
          </div>
        </div>
      {:else}
        <div class="frame-1410103869 failed-status">
          <img src={failed} alt="check" class="check" />
          <div class="sub-menu">
            <div class="completed"><span class="failed_span">Failed</span></div>
          </div>
        </div>
      {/if}
    </div>
  </div>
  <div class="frame-1410104158">
    <div class="frame-1410104124">
      <div><span class="created_span">Created:</span></div>
      <div><span class="f5012024_span">{createdDate}</span></div>
    </div>
    <div class="frame-1410104125">
      <div><span class="duration_span">Duration</span></div>
      <div><span class="fminread_span">{durationText}</span></div>
    </div>
    <div class="frame-1410104126">
      <div><span class="occasion_span">Occasion:</span></div>
      <div><span class="birthday_span">{occasion}</span></div>
    </div>
  </div>
  <div class="frame-1410104165">
    <button class="button" on:click={onRead}>
      <img src={eye} alt="eye" class="eye" />
      <div class="read-story">
        <span class="readstory_span">Read Story</span>
      </div>
    </button>
    <button class="button_01" on:click={onDownload} aria-label="Download story">
      <img
        src={download}
        alt="download"
        class="download"
        style="border-color:black; color : black"
      />
    </button>
    <button class="button_02" on:click={onPlay} aria-label="Play story">
      <img src={play} alt="play" class="play" />
    </button>
    <button class="button_03" on:click={onShare} aria-label="Share story">
      <img src={share} alt="share" class="share" />
    </button>
  </div>
</div>

<style>
  .lunasmagicadventure_span {
    color: black;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28px;
    word-wrap: break-word;
  }

  .lunas-magic-adventure {
    align-self: stretch;
  }

  .andreas_span {
    color: black;
    font-size: 12px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 16.8px;
    word-wrap: break-word;
  }

  .andreas {
    text-align: center;
  }

  .completed_span {
    color: #40c4aa;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .generating_span {
    color: #438bff;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .draft_span {
    color: #ffbe4c;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .failed_span {
    color: #df1c41;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .completed {
    text-align: center;
  }

  .created_span {
    color: #666d80;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .f5012024_span {
    color: black;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .duration_span {
    color: #666d80;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .fminread_span {
    color: black;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .occasion_span {
    color: #666d80;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .birthday_span {
    color: black;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .readstory_span {
    color: black;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .read-story {
    text-align: center;
  }

  .frame-1410103891 {
    padding-left: 8px;
    padding-right: 8px;
    padding-top: 4px;
    padding-bottom: 4px;
    background: white;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 4px;
    display: inline-flex;
  }

  .sub-menu {
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .frame-1410104124 {
    align-self: stretch;
    height: 38px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .frame-1410104125 {
    align-self: stretch;
    height: 38px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .frame-1410104126 {
    align-self: stretch;
    height: 38px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .check {
    width: 16px;
    height: 16px;
    position: relative;
    overflow: hidden;
  }

  .eye {
    width: 16px;
    height: 16px;
    position: relative;
    overflow: hidden;
  }

  .play {
    width: 18px;
    height: 18px;
    position: relative;
    overflow: hidden;
  }

  .frame-1410104163 {
    width: 324px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .frame-1410104158 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .frame-1410103869 {
    padding-top: 6px;
    padding-bottom: 6px;
    padding-left: 14px;
    padding-right: 16px;
    background: #effefa;
    border-radius: 12px;
    outline: 1px #40c4aa solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 4px;
    display: flex;
  }

  .generating-status {
    background: #eef6ff !important;
    outline: 1px #438bff solid !important;
  }

  .draft-status {
    background: #fff6e0 !important;
    outline: 1px #ffbe4c solid !important;
  }

  .failed-status {
    background: #fff0f3 !important;
    outline: 1px #df1c41 solid !important;
  }

  .button {
    width: 194px;
    height: 40px;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 7px;
    padding-bottom: 7px;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    border: none;
    background: white;
    cursor: pointer;
  }

  .button_01 {
    width: 40px;
    height: 40px;
    padding: 10px;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    border: none;
    background: white;
    cursor: pointer;
  }

  .button_02 {
    width: 40px;
    height: 40px;
    padding: 10px;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    border: none;
    background: white;
    cursor: pointer;
  }

  .button_03 {
    width: 40px;
    height: 40px;
    padding: 10px;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    border: none;
    background: white;
    cursor: pointer;
  }

  .image {
    align-self: stretch;
    height: 225px;
    background: #fbfbfb;
    overflow: hidden;
    border-radius: 12px;
    outline: 1px #d3d3d3 solid;
    outline-offset: -1px;
    position: relative;
    display: flex;
  }

  .story-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
  }

  .status-overlay {
    position: absolute;
    top: 8px;
    left: 8px;
    z-index: 1;
  }

  .frame-1410104165 {
    align-self: stretch;
    justify-content: center;
    align-items: center;
    gap: 6px;
    display: inline-flex;
  }

  .cardd {
    width: 100%;
    max-width: 400px;
    height: 100%;
    padding: 12px;
    background: white;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
  }
</style>
