<script lang="ts">
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import { storyCreation } from "../lib/stores/storyCreation";
  import { createEventDispatcher } from "svelte";
  import { getStoriesForChild } from "../lib/database/stories";
  import eye from "../assets/BlueEye.svg";
  import Plus from "../assets/Plus.svg";

  export let item: any;
  
  const dispatch = createEventDispatcher();

  // Get child name
  const getChildName = () => {
    return item.first_name || item.name || "Unnamed Child";
  };

  // Get age label
  const getAgeLabel = () => {
    return item.ageLabel || `${item.age_group || "Unknown"} Years Old`;
  };

  // Get avatar URL
  const getAvatarUrl = () => {
    return item.avatarUrl || item.avatar_url || "https://placehold.co/48x48";
  };

  // Get stories created text
  const getStoriesCreatedText = () => {
    return item.storiesCreatedText || `${getChildName()} (Age ${item.age_group || "Unknown"})`;
  };

  // Get last story theme
  const getLastStory = () => {
    return item.lastStory || "Birthday";
  };

  // Handle "Edit" button click
  function handleEdit() {
    dispatch("editChild", { item });
  }

  // Handle "View Story" button click
  async function handleViewStory() {
    try {
      // Get the child profile ID
      const childProfileId = item.id;
      
      if (!childProfileId) {
        console.error("No child profile ID found");
        return;
      }

      console.log("Fetching stories for child:", childProfileId);

      // Fetch stories for this child (ordered by created_at descending, so most recent first)
      const result = await getStoriesForChild(childProfileId);

      if (result.success && result.data && result.data.length > 0) {
        // Get the most recent story (first in the array since ordered by created_at desc)
        const latestStory = result.data[0];
        
        console.log("Latest story:", latestStory);

        // Navigate to the preview page with the story UID
        if (latestStory.uid) {
          await goto(`/preview/default?storyId=${latestStory.uid}`);
        } else {
          console.error("Story UID not found");
        }
      } else {
        console.log("No stories found for this child");
        // Optionally show a message to the user that no stories exist yet
      }
    } catch (error) {
      console.error("Error fetching latest story:", error);
    }
  }

  // Handle "New Story" button click
  function handleNewStory() {
    const childName = getChildName();
    // Emit event for parent to handle (parent may have different navigation logic)
    dispatch("newStory", { name: childName, item });
  }
</script>

<div class="card">
  <div class="frame-2147227634">
    <div class="frame-1410104153">
      <div class="frame-1410104161">
        <img class="ellipse-16" src={getAvatarUrl()} alt={getChildName()} />
        <div class="frame-1410104152">
          <div class="emma"><span class="emma_span">{getChildName()}</span></div>
          <div class="text-6-years-old"><span class="fyearsold_span">{getAgeLabel()}</span></div>
        </div>
      </div>
      <div class="tag" on:click={handleEdit} on:keydown={(e) => e.key === 'Enter' && handleEdit()} role="button" tabindex="0">
        <div><span class="edit_span">Edit</span></div>
      </div>
    </div>
    <div class="rectangle-41"></div>
    <div class="frame-1410104158">
      <div class="frame-1410104124">
        <div><span class="storiescreated_span">Stories Created:</span></div>
        <div><span class="emmaage5-7_span">{getStoriesCreatedText()}</span></div>
      </div>
      <div class="frame-1410104125">
        <div><span class="laststory_span">Last Story:</span></div>
        <div><span class="birthday_span">{getLastStory()}</span></div>
      </div>
    </div>
    <div class="frame-2147227579">
      <div class="button" on:click={handleViewStory} on:keydown={(e) => e.key === 'Enter' && handleViewStory()} role="button" tabindex="0">
        <div class="eye">
          <img src={eye} alt="view" class="vector" />
        </div>
        <div class="view-story"><span class="viewstory_span">View Story</span></div>
      </div>
      <div class="frame-1410104245" on:click={handleNewStory} on:keydown={(e) => e.key === 'Enter' && handleNewStory()} role="button" tabindex="0">
        <div class="plus">
          <img src={Plus} alt="plus" class="vector_01" />
        </div>
        <div class="new-story"><span class="newstory_span">New Story</span></div>
        <div class="ellipse-1415"></div>
      </div>
    </div>
  </div>
</div>

<style>
  .ellipse-16 {
    width: 48px;
    height: 48px;
    background: #D9D9D9;
    border-radius: 9999px;
    object-fit: cover;
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
    color: #727272;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.40px;
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
    background: #EDEDED;
  }

  .storiescreated_span {
    color: #727272;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .emmaage5-7_span {
    color: black;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.60px;
    word-wrap: break-word;
  }

  .laststory_span {
    color: #727272;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .birthday_span {
    color: black;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.60px;
    word-wrap: break-word;
  }

  .vector {
    width: 15px;
    height: 10px;
    object-fit: contain;
    filter: brightness(0) saturate(100%) invert(45%) sepia(93%) saturate(1352%) hue-rotate(195deg) brightness(101%) contrast(101%);
  }

  .viewstory_span {
    color: #438BFF;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.60px;
    word-wrap: break-word;
  }

  .view-story {
    text-align: center;
  }

  .vector_01 {
    width: 12px;
    height: 12px;
    object-fit: contain;
    filter: brightness(0) invert(1);
  }

  .newstory_span {
    color: white;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.60px;
    word-wrap: break-word;
  }

  .new-story {
    text-align: center;
  }

  .ellipse-1415 {
    width: 248px;
    height: 114px;
    left: -51px;
    top: 15px;
    position: absolute;
    background: radial-gradient(ellipse 42.11% 42.11% at 50.00% 52.94%, white 0%, rgba(255, 255, 255, 0) 100%);
    border-radius: 9999px;
  }

  .frame-1410104152 {
    width: 84px;
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
    background: #F8FAFB;
    border-radius: 12px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: flex-end;
    gap: 4px;
    display: flex;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .tag:hover {
    background: #F0F2F5;
  }

  .tag:active {
    background: #E8EAED;
  }

  .frame-1410104124 {
    align-self: stretch;
    height: 38px;
    justify-content: flex-start;
    align-items: center;
    gap: 4px;
    display: inline-flex;
  }

  .frame-1410104125 {
    align-self: stretch;
    height: 38px;
    justify-content: flex-start;
    align-items: center;
    gap: 4px;
    display: inline-flex;
  }

  .eye {
    width: 16px;
    height: 16px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .plus {
    width: 16px;
    height: 16px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
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
    height: 41px;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 12px;
    padding-bottom: 12px;
    background: #E7FEFF;
    box-shadow: 0px 4px 0px #438BFF;
    border-radius: 12px;
    outline: 2px rgba(231, 254, 255, 0.20) solid;
    outline-offset: -2px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    cursor: pointer;
    transition: transform 0.1s, box-shadow 0.1s;
  }

  .button:hover {
    transform: translateY(-1px);
    box-shadow: 0px 5px 0px #438BFF;
  }

  .button:active {
    transform: translateY(2px);
    box-shadow: 0px 2px 0px #438BFF;
  }

  .frame-1410104245 {
    flex: 1 1 0;
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 12px;
    padding-bottom: 12px;
    position: relative;
    background: #438BFF;
    overflow: hidden;
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    display: flex;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .frame-1410104245:hover {
    opacity: 0.9;
  }

  .frame-1410104245:active {
    opacity: 0.8;
  }

  .frame-1410104153 {
    align-self: stretch;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .frame-2147227579 {
    margin-top: 12px;
    align-self: stretch;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
  }

  .frame-2147227634 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .card {
    width: 100%;
    height: 100%;
    padding: 12px;
    background: white;
    border-radius: 16px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }
</style>

