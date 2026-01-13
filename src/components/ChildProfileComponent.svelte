<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import eye from "../assets/eye.svg";

  export let name: string = "Emma";
  export let ageLabel: string = "6 Years Old";
  export let avatarUrl: string = "https://placehold.co/48x48";
  export let storiesCreatedText: string = "Emma (Age 5-7)";
  export let lastStory: string = "Birthday";

  const dispatch = createEventDispatcher();

  function onViewStory() {
    dispatch("viewStory", { name });
  }
  function onNewStory() {
    dispatch("newStory", { name });
  }
  function onEditChild() {
    dispatch("editChild", { name });
  }
</script>

<div class="card">
  <div class="frame-1410104153">
    <div class="frame-1410104161">
      <img class="ellipse-16" src={avatarUrl} alt={`${name} avatar`} />
      <div class="frame-1410104152">
        <div class="emma"><span class="emma_span">{name}</span></div>
        <div class="text-6-years-old">
          <span class="fyearsold_span">{ageLabel}</span>
        </div>
      </div>
    </div>
    <div class="tag" on:click={onEditChild} on:keydown={(e) => e.key === 'Enter' && onEditChild()} role="button" tabindex="0">
      <div><span class="edit_span">Edit</span></div>
    </div>
  </div>
  <div class="rectangle-41"></div>
  <div class="frame-1410104158">
    <div class="frame-1410104124">
      <div><span class="storiescreated_span">Stories Created:</span></div>
      <div><span class="emmaage5-7_span">{storiesCreatedText}</span></div>
    </div>
    <div class="frame-1410104125">
      <div><span class="laststory_span">Last Story:</span></div>
      <div><span class="birthday_span">{lastStory}</span></div>
    </div>
  </div>
  <div class="frame-1410104156">
    <div class="frame-1410104157">
      <button class="button" on:click={onViewStory}>
        <img src={eye} alt="eye" class="eye" />
        <div class="view-story">
          <span class="viewstory_span">View Story</span>
        </div>
      </button>
      <button class="button_01" on:click={onNewStory}>
        <div class="new-story">
          <span class="newstory_span">New Story</span>
        </div>
      </button>
    </div>
  </div>
</div>

<style>
  .ellipse-16 {
    width: 48px;
    height: 48px;
    background: #d9d9d9;
    border-radius: 9999px;
  }

  .emma_span {
    color: black;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 28px;
    word-wrap: break-word;
  }

  .emma {
    align-self: stretch;
  }

  .fyearsold_span {
    color: #666d80;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .text-6-years-old {
    align-self: stretch;
  }

  .edit_span {
    color: #141414;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    word-wrap: break-word;
  }

  .rectangle-41 {
    align-self: stretch;
    height: 1px;
    background: #ededed;
  }

  .storiescreated_span {
    color: #666d80;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .emmaage5-7_span {
    color: black;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .laststory_span {
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

  .viewstory_span {
    color: black;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .view-story {
    text-align: center;
  }

  .newstory_span {
    color: white;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .new-story {
    text-align: center;
  }

  .frame-1410104152 {
    width: 100%;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 2px;
    display: inline-flex;
  }

  .tag {
    padding-left: 16px;
    padding-right: 16px;
    padding-top: 8px;
    padding-bottom: 8px;
    background: #f8fafb;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: flex-end;
    gap: 4px;
    display: flex;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .tag:hover {
    background: #e2e8f0;
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

  .button_01 {
    flex: 1 1 0;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 12px;
    padding-bottom: 12px;
    background: #438bff;
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    border: none;
    cursor: pointer;
  }

  .eye {
    width: 16px;
    height: 16px;
    position: relative;
    overflow: hidden;
  }

  .frame-1410104161 {
    width: 208.17px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
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

  .button {
    flex: 1 1 0;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 12px;
    padding-bottom: 12px;
    box-shadow: 0px 4px 4px rgba(98.89, 98.89, 98.89, 0.25);
    border-radius: 12px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    border: none;
    background: white;
    cursor: pointer;
  }

  .frame-1410104153 {
    align-self: stretch;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .frame-1410104157 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 10px;
    display: inline-flex;
  }

  .frame-1410104156 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 10px;
    display: flex;
  }

  .card {
    width: 100%;
    height: 100%;
    padding: 12px;
    background: white;
    border-radius: 16px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
  }
</style>
