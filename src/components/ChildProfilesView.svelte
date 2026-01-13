<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { user } from "../lib/stores/auth";
  import { getChildProfiles } from "../lib/database/childProfiles";
  import ChildCard from "./ChildCard.svelte";
  import usercircleplus from "../assets/UserCirclePlus.svg";

  // Only keep event handler callbacks as props - component manages its own data
  export let handleAddChildren: () => void;
  export let handleNewStory: (event: CustomEvent) => void;

  // Internal state for child profiles and loading
  let childProfiles: any[] = [];
  let loading: boolean = false;
  let error: string = "";
  let childProfilesFetched: boolean = false;

  // Fetch child profiles from API
  const fetchChildProfiles = async (userId: string) => {
    if (!userId || loading) return;
    
    console.log('[ChildProfilesView] Fetching child profiles for user:', userId);
    loading = true;
    error = "";
    
    try {
      const result = await getChildProfiles(userId);
      if (result.success && result.data) {
        childProfiles = result.data;
        console.log('[ChildProfilesView] Successfully fetched', childProfiles.length, 'child profiles');
      } else {
        error = result.error || "Failed to fetch child profiles";
        childProfiles = [];
        console.error('[ChildProfilesView] Error fetching child profiles:', error);
      }
    } catch (err) {
      error = "An error occurred while fetching child profiles";
      childProfiles = [];
      console.error('[ChildProfilesView] Exception fetching child profiles:', err);
    } finally {
      loading = false;
    }
  };

  // Fetch child profiles when component mounts
  onMount(() => {
    const unsubscribe = user.subscribe(($user) => {
      if ($user?.id && !childProfilesFetched) {
        fetchChildProfiles($user.id);
        childProfilesFetched = true;
      }
    });

    return () => {
      unsubscribe();
    };
  });

  // Reactive statement to handle user changes
  $: if ($user?.id && !childProfilesFetched) {
    console.log('[ChildProfilesView] User available, fetching child profiles:', $user.id);
    fetchChildProfiles($user.id);
    childProfilesFetched = true;
  }
</script>

<div class="frame-1410104149">
  <div class="frame-1410104154">
    <div class="frame-1410104155">
      <div class="frame-1410104151">
        <div class="child-profiles_01">
          <span class="childprofiles_01_span">Child Profiles</span>
        </div>
        <div class="manage-your-childrens-story-preferences-and-progress">
          <span
            class="manageyourchildrensstorypreferencesandprogress_span"
            >Manage your children's story preferences and progress</span
          >
        </div>
      </div>
      <div
        class="frame-1410103868"
        on:click={handleAddChildren}
        on:keydown={(e) => e.key === "Enter" && handleAddChildren()}
        role="button"
        tabindex="0"
      >
        <img src={usercircleplus} alt="plus" class="plus" />
        <div class="sub-menu">
          <div class="add-children">
            <span class="addchildren_span">Add Children</span>
          </div>
        </div>
      </div>
    </div>
    <div class="child-profiles-grid">
      {#if loading}
        <div class="loading-state">
          <div class="loading-spinner"></div>
          <p class="loading-text">Loading child profiles...</p>
        </div>
      {:else if error}
        <div class="error-state">
          <p class="error-text">{error}</p>
          {#if $user?.id}
            <button
              class="retry-button"
              on:click={() => {
                childProfilesFetched = false;
                fetchChildProfiles($user.id);
              }}
            >
              Try Again
            </button>
          {/if}
        </div>
      {:else if childProfiles.length === 0}
        <div class="empty-state">
          <p class="empty-text">No child profiles found.</p>
          <p class="empty-subtext">
            Add your first child profile to get started!
          </p>
        </div>
      {:else}
        {#each childProfiles as child (child.id || child.name)}
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
      {/if}
    </div>
  </div>
</div>

<style>
  .childprofiles_01_span {
    color: black;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .child-profiles_01 {
    align-self: stretch;
  }

  .manageyourchildrensstorypreferencesandprogress_span {
    color: #666d80;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .manage-your-childrens-story-preferences-and-progress {
    align-self: stretch;
    height: 100%;
  }

  .addchildren_span {
    color: white;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.20px;
    word-wrap: break-word;
  }

  .add-children {
    text-align: center;
  }

  .frame-1410104151 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: inline-flex;
  }

  .sub-menu {
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .frame-1410103868 {
    height: 49px;
    padding-left: 16px;
    padding-right: 16px;
    padding-top: 4px;
    padding-bottom: 4px;
    background: #438bff;
    border-radius: 12px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .frame-1410103868:hover {
    background: #3b7ce6;
  }

  .plus {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .frame-1410104155 {
    align-self: stretch;
    justify-content: center;
    align-items: center;
    gap: 4px;
    display: inline-flex;
  }

  .child-profiles-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 16px;
    width: 100%;
  }

  .frame-1410104154 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
  }

  .frame-1410104149 {
    align-self: stretch;
    padding: 16px;
    background: white;
    border-radius: 8px;
    justify-content: center;
    align-items: center;
    gap: 4px;
    display: inline-flex;
  }

  /* Loading, Error, and Empty States */
  .loading-state,
  .error-state,
  .empty-state {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    text-align: center;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #438bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .loading-text {
    color: #666d80;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 500;
    margin: 0;
  }

  .error-text {
    color: #dc2626;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 500;
    margin: 0 0 16px 0;
  }

  .retry-button {
    padding: 8px 16px;
    background: #438bff;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .retry-button:hover {
    background: #3b7ce6;
  }

  .retry-button:active {
    transform: scale(0.98);
  }

  .empty-text {
    color: #666d80;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    margin: 0 0 8px 0;
  }

  .empty-subtext {
    color: #90a1b9;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 400;
    margin: 0;
  }

  /* Mobile responsive styles */
  @media (max-width: 800px) {
    .frame-1410104149 {
      padding: 12px;
    }

    .frame-1410104154 {
      gap: 16px;
    }

    .frame-1410104155 {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .child-profiles-grid {
      grid-template-columns: 1fr 1fr 1fr;
      gap: 12px;
      width: 100%;
    }

    .frame-1410103868 {
      width: 100%;
      height: 49px;
      padding-left: 16px;
      padding-right: 16px;
      padding-top: 4px;
      padding-bottom: 4px;
    }

    .childprofiles_01_span {
      font-size: 20px;
      line-height: 28px;
    }

    .manageyourchildrensstorypreferencesandprogress_span {
      font-size: 14px;
      line-height: 19.6px;
    }
  }
</style>

