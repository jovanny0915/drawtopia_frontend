<script lang="ts">
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import { storyCreation } from "../lib/stores/storyCreation";
  import { createEventDispatcher } from "svelte";
  import UserCirclePlus from "../assets/UserCirclePlus.svg";
  import ChildCard from "./ChildCard.svelte";

  export let childProfiles: any[] = [];
  // Kept for parent component API compatibility (passed from parent but not used in this component)
  export let fetchChildProfiles: (userId: string) => Promise<void>;


  // Handle "Add Children" button click
  function handleAddChildren() {
    // TODO: Implement add children functionality
    console.log("Add children clicked");
    // You might want to navigate to a create child profile page
    // goto("/create-child-profile");
  }

  // Handle "New Story" button click for a specific child
  function handleNewStory(event: CustomEvent) {
    const child = event.detail.item || event.detail;
    const childId = child.id?.toString();
    const childName = child.name || child.first_name || "Unnamed Child";

    if (!childId) {
      console.error("Child ID is missing");
      return;
    }

    // Store child info in sessionStorage
    if (browser) {
      sessionStorage.setItem("selectedChildProfileId", childId);
      sessionStorage.setItem("selectedChildProfileName", childName);
    }

    // Update story creation store
    storyCreation.setSelectedChild(childId, childName);

    // Navigate to create-character/1
    goto("/create-character/1");
  }
</script>

<div class="sidebar">
  <div class="frame-1410104150">
    <div class="frame-1410104155">
      <div class="frame-1410104151">
        <div class="child-profiles">
          <span class="childprofiles_span">Child Profiles</span>
        </div>
        <div class="select-a-character-to-use-in-your-new-book">
          <span class="selectacharactertouseinyournewbook_span">Select a character to use in your new book</span>
        </div>
      </div>
      <div 
        class="frame-1410104246" 
        on:click={handleAddChildren} 
        role="button" 
        tabindex="0"
        on:keydown={(e) => (e.key === "Enter" || e.key === " ") && handleAddChildren()}
      >
        <div class="usercircleplus">
          <img src={UserCirclePlus} alt="Add" class="vector" />
        </div>
        <div class="add-children">
          <span class="addchildren_span">Add Children</span>
        </div>
        <div class="ellipse-1415"></div>
      </div>
    </div>
  </div>

  <div class="frame-1410104159">
    {#each childProfiles as child (child.id)}
      <ChildCard 
        item={child}
        on:newStory={handleNewStory}
        on:editChild={(event) => {
          const childItem = event.detail.item || child;
          goto(
            `/create-child-profile/edit?id=${childItem.id || ""}&name=${encodeURIComponent(childItem.name || childItem.first_name || "")}`,
          );
        }}
      />
    {/each}
  </div>
</div>

<style>
  .childprofiles_span {
    color: #141414;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28.80px;
    word-wrap: break-word;
  }

  .child-profiles {
    align-self: stretch;
  }

  .selectacharactertouseinyournewbook_span {
    color: #727272;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .select-a-character-to-use-in-your-new-book {
    align-self: stretch;
  }

  .vector {
    width: 16.24px;
    height: 16.24px;
    object-fit: contain;
    filter: brightness(0) invert(1);
  }

  .addchildren_span {
    color: white;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 600;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .add-children {
    text-align: center;
  }

  .ellipse-1415 {
    width: 248px;
    height: 114px;
    left: 52px;
    top: 17px;
    position: absolute;
    background: radial-gradient(ellipse 42.11% 42.11% at 50.00% 52.94%, white 0%, rgba(255, 255, 255, 0) 100%);
    border-radius: 9999px;
  }

  .usercircleplus {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .frame-1410104246 {
    align-self: stretch;
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
    display: inline-flex;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .frame-1410104246:hover {
    opacity: 0.9;
  }

  .frame-1410104246:active {
    opacity: 0.8;
  }

  .frame-1410104151 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .frame-1410104155 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
    display: flex;
  }

  .frame-1410104150 {
    align-self: stretch;
    border-radius: 8px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 24px;
    display: flex;
  }

  .frame-1410104159 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .sidebar {
    width: 100%;
    height: 100%;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
  }
</style>
