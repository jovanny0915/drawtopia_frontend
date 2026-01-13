<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { fly } from "svelte/transition";
  import { browser } from "$app/environment";
  import { user } from "../lib/stores/auth";
  import {
    getChildProfiles,
    type ChildProfile,
  } from "../lib/database/childProfiles";
  import {
    getAllCharacters,
    getAllStoriesForParent,
    deleteCharacter,
    type Story,
  } from "../lib/database/stories";
  import { getGiftsForUser, type Gift } from "../lib/database/gifts";
  import drawtopialogo from "../assets/logo.png";
  import selectLayerIcon from "../assets/List.svg";
  import AccountDropdown from "./AccountDropdown.svelte";
  import MobileDashboardHomeComponent from "./MobileDashboardHomeComponent.svelte";
  import MobileStoryLibraryComponent from "./MobileStoryLibraryComponent.svelte";
  import MobileDashboardCharactersComponent from "./MobileDashboardCharactersComponent.svelte";
  import MobileDashboardChildProfile from "./MobileDashboardChildProfile.svelte";
  import MobileDashboardGift from "./MobileDashboardGift.svelte";
  import MobileBookPreview from "./MobileBookPreview.svelte";
  import house from "../assets/House.svg";
  import bookopen from "../assets/BookOpen.svg";
  import userSquare from "../assets/UserSquare.svg";
  import baby from "../assets/Baby.svg";
  import gift from "../assets/Gift.svg";
  import books from "../assets/Books.svg";

  let libraryView: "all" | "characters" | "children" = "all";
  let sidebarOpen = false;
  let activeMenu: "home" | "story-library" | "characters" | "child-profiles" | "gift-tracking" = "home";
  let storyCredits: number = 3;
  
  // State for character preview
  let showCharacterPreview = false;
  let selectedCharacter: any = null;
  let characterBooks: any[] = [];

  const toggleSidebar = () => {
    sidebarOpen = !sidebarOpen;
  };

  const closeSidebar = () => {
    sidebarOpen = false;
  };
  const setLibraryView = (v: "all" | "characters" | "children") =>
    (libraryView = v);

  function handleMenuClick(menu: "home" | "story-library" | "characters" | "child-profiles" | "gift-tracking") {
    activeMenu = menu;
    // Close sidebar when menu item is selected
    sidebarOpen = false;
    // You can add navigation logic here if needed
    // Example: goto(`/${menu}`);
  }

  let childProfiles: any[] = [];
  let stories: any[] = [];
  let rawStories: any[] = [];
  let characters: any[] = [];
  let gifts: any[] = [];
  let loading = true;
  let loadingStories = true;
  let loadingGifts = true;
  let error = "";
  let storiesError = "";
  let giftsError = "";

  // Reading statistics
  let adventureStoriesCount: number = 0;
  let searchStoriesCount: number = 0;
  let adventureReadingTime: number = 0; // Total reading time in seconds
  let searchReadingTime: number = 0; // Total reading time in seconds
  let audioListenedCount: number = 0;
  let averageStars: number = 0;
  let averageHints: number = 0;

  // Calculate reading statistics whenever rawStories changes
  $: {
    const adventureStories = rawStories.filter(story => {
      const storyType = (story.story_type || "story").toLowerCase();
      return storyType === "story";
    });
    
    const searchStories = rawStories.filter(story => {
      const storyType = (story.story_type || "story").toLowerCase();
      return storyType === "search";
    });
    
    // Count stories
    adventureStoriesCount = adventureStories.length;
    searchStoriesCount = searchStories.length;
    
    // Calculate total reading times
    adventureReadingTime = adventureStories.reduce((total, story) => {
      if (story.reading_state && typeof story.reading_state === 'object') {
        const readingTime = story.reading_state.reading_time || 0;
        return total + readingTime;
      }
      return total;
    }, 0);
    
    searchReadingTime = searchStories.reduce((total, story) => {
      if (story.reading_state && typeof story.reading_state === 'object') {
        const readingTime = story.reading_state.reading_time || 0;
        return total + readingTime;
      }
      return total;
    }, 0);
    
    // Count adventure stories where audio has been listened
    audioListenedCount = adventureStories.filter(story => {
      if (story.reading_state && typeof story.reading_state === 'object') {
        return story.reading_state.audio_listened === true;
      }
      return false;
    }).length;
    
    // Calculate average stars for interactive search stories
    const searchStoriesWithStars = searchStories.filter(story => 
      story.reading_state && 
      typeof story.reading_state === 'object' && 
      typeof story.reading_state.avg_star === 'number'
    );
    
    if (searchStoriesWithStars.length > 0) {
      const totalStars = searchStoriesWithStars.reduce((sum, story) => {
        return sum + (story.reading_state.avg_star || 0);
      }, 0);
      averageStars = totalStars / searchStoriesWithStars.length;
    } else {
      averageStars = 0;
    }
    
    // Calculate average hints for interactive search stories
    const searchStoriesWithHints = searchStories.filter(story => 
      story.reading_state && 
      typeof story.reading_state === 'object' && 
      typeof story.reading_state.avg_hint === 'number'
    );
    
    if (searchStoriesWithHints.length > 0) {
      const totalHints = searchStoriesWithHints.reduce((sum, story) => {
        return sum + (story.reading_state.avg_hint || 0);
      }, 0);
      averageHints = totalHints / searchStoriesWithHints.length;
    } else {
      averageHints = 0;
    }
  }

  // Filter states for dashboard dropdowns
  let selectedFormat: string = "all";
  let selectedChild: string = "all";
  let selectedStatus: string = "all";

  // Format options
  $: formatOptions = [
    { value: "all", label: "All Formats" },
    { value: "story_adventure", label: "Story Adventure Mode" },
    { value: "interactive_search", label: "Interactive Search Mode" },
  ];

  // Children options - dynamically generated from childProfiles
  $: childrenOptions = [
    { value: "all", label: "All Children" },
    ...childProfiles.map((child) => ({
      value: child.id,
      label: child.name || child.first_name,
    })),
  ];

  // Status options
  $: statusOptions = [
    { value: "all", label: "All Status" },
    { value: "completed", label: "Completed" },
    { value: "drafting", label: "Drafting" },
    { value: "generating", label: "Generating" },
    { value: "failed", label: "Failed" },
  ];

  // Filtered stories based on selected filters (matching HomeLibraryView logic)
  $: filteredStories = stories.filter((story) => {
    // Filter by story type (format)
    if (selectedFormat !== "all") {
      // Default to "story" if story_type is not set (as per createStory default)
      const storyType = (story.story_type || "story").toLowerCase();
      if (selectedFormat === "story_adventure" && storyType !== "story") {
        return false;
      }
      if (selectedFormat === "interactive_search" && storyType !== "search") {
        return false;
      }
    }

    // Filter by child
    if (selectedChild !== "all") {
      const childId = story.child_profile_id?.toString() || story.child_profile_id;
      const selectedChildId = selectedChild.toString();
      if (childId !== selectedChildId) {
        return false;
      }
    }

    // Filter by status
    if (selectedStatus !== "all") {
      const storyStatus = (story.status || "").toLowerCase();
      if (storyStatus !== selectedStatus.toLowerCase()) {
        return false;
      }
    }

    return true;
  });

  const storyThemes = [
    "Birthday", "Bedtime", "Holiday", "Adventure", "Magic", "Friendship",
    "Animals", "Space", "Ocean", "Forest", "Castle", "Dragon", "Princess",
    "Superhero", "Pirate", "Fairy Tale", "Mystery", "Science", "Sports", "Music",
  ];

  const getRandomStoryTheme = () => {
    return storyThemes[Math.floor(Math.random() * storyThemes.length)];
  };

  const formatAgeLabel = (ageGroup: string) => {
    return `${ageGroup} Years Old`;
  };

  const formatStoriesCreatedText = (firstName: string, ageGroup: string) => {
    return `${firstName} (Age ${ageGroup})`;
  };

  const fetchChildProfiles = async (userId: string) => {
    try {
      loading = true;
      error = "";
      const result = await getChildProfiles(userId);
      if (result.success && result.data) {
        childProfiles = result.data
          .map((profile: ChildProfile, index: number) => ({
            id: profile.id || `temp_child_${index}_${Date.now()}`,
            name: profile.first_name,
            first_name: profile.first_name,
            ageLabel: formatAgeLabel(profile.age_group),
            avatarUrl: profile.avatar_url || "https://placehold.co/48x48",
            storiesCreatedText: formatStoriesCreatedText(
              profile.first_name,
              profile.age_group,
            ),
            lastStory: getRandomStoryTheme(),
            relationship: profile.relationship,
            created_at: profile.created_at,
          }))
          .filter((profile: any) => profile.id);
      } else {
        error = result.error || "Failed to fetch child profiles";
        childProfiles = [];
      }
    } catch (err) {
      console.error("Error fetching child profiles:", err);
      error = "An unexpected error occurred while fetching child profiles";
      childProfiles = [];
    } finally {
      loading = false;
    }
  };

  const fetchCharacters = async (userId: string) => {
    try {
      const result = await getAllCharacters(userId);
      if (result.success && result.data) {
        characters = result.data;
      } else {
        characters = [];
      }
    } catch (err) {
      characters = [];
    }
  };

  const fetchStories = async (userId: string) => {
    try {
      loadingStories = true;
      storiesError = "";
      stories = [];
      rawStories = [];
      characters = [];

      const result = await getAllStoriesForParent(userId);

      if (result.success && result.data) {
        const storiesData = Array.isArray(result.data) ? result.data : [];
        rawStories = storiesData;
        stories = storiesData
          .map(
            (story: Story & { child_profiles?: any, user_name?: string }, index: number) => ({
              uid: story.uid,
              id: story.id || `temp_story_${index}_${Date.now()}`,
              title: story.story_title || `${story.character_name}'s Adventure`,
              author: story.child_profiles?.first_name || "Unknown",
              status: story.status || "completed",
              story_cover: story.story_cover,
              createdDate: story.created_at
                ? new Date(story.created_at).toLocaleDateString("en-GB")
                : "Unknown",
              created_at: story.created_at,
              durationText: "8 min read",
              occasion: determineOccasion(
                story.adventure_type,
                story.story_world,
              ),
              imageUrl:
                story.original_image_url || "https://placehold.co/332x225",
              story_title: story.story_title,
              user_name: story.user_name,
              child_profiles: story.child_profiles,
              format: (story.adventure_type as string) === 'interactive_search' ? 'interactive' : 'story',
              adventure_type: story.adventure_type,
              child_profile_id: story.child_profile_id,
              story_type: story.story_type,
            }),
          )
          .filter((story) => story.id);
      } else {
        storiesError = result.error || "Failed to fetch stories";
        stories = [];
        rawStories = [];
        characters = [];
      }
    } catch (err) {
      console.error("[MobileDashboard] Error fetching stories:", err);
      storiesError = "An unexpected error occurred while fetching stories";
      stories = [];
      rawStories = [];
      characters = [];
    } finally {
      loadingStories = false;
    }
  };

  // Helper to convert age range to a single age for display
  const getAgeFromRange = (ageRange: string): number => {
    if (!ageRange) return 7;
    // Extract middle age from range like "3-6" -> 4 or "7-10" -> 8
    const match = ageRange.match(/(\d+)-(\d+)/);
    if (match) {
      const min = parseInt(match[1]);
      const max = parseInt(match[2]);
      return Math.floor((min + max) / 2);
    }
    // Handle single ages like "11-12" -> 11
    return parseInt(ageRange.split("-")[0]) || 7;
  };

  // Helper to format date for display
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "Unknown";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Unknown";
      // Format as "Oct 15, 2024"
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Unknown";
    }
  };

  const fetchGifts = async () => {
    try {
      loadingGifts = true;
      giftsError = "";
      const result = await getGiftsForUser();
      if (result.success && result.data) {
        gifts = result.data.map((gift: Gift) => ({
          id: gift.id,
          childName: gift.child_name,
          age: getAgeFromRange(gift.age_group),
          ageGroup: gift.age_group,
          status: gift.status === 'completed' ? 'completed' : 'pending',
          giftFrom: gift.relationship,
          occasion: gift.occasion,
          send_to: gift.delivery_email || "Unknown",
          sentDate: formatDate(gift.created_at),
          deliveryDate: formatDate(gift.delivery_time),
          expectedDelivery: gift.delivery_time
            ? new Date(gift.delivery_time).toLocaleDateString("en-GB")
            : "Unknown",
          created_at: gift.created_at ? new Date(gift.created_at) : new Date(),
          notification_sent: gift.notification_sent
        }));
      } else {
        giftsError = result.error || "Failed to fetch gifts";
        gifts = [];
      }
    } catch (err) {
      console.error("Error fetching gifts:", err);
      giftsError = "An unexpected error occurred while fetching gifts";
      gifts = [];
    } finally {
      loadingGifts = false;
    }
  };

  const determineOccasion = (
    adventureType: string,
    storyWorld: string,
  ): string => {
    const occasionMap: { [key: string]: string } = {
      treasure_hunt: "Adventure",
      helping_friend: "Friendship",
      forest: "Nature",
      space: "Space Adventure",
      underwater: "Ocean Adventure",
    };
    return occasionMap[adventureType] || occasionMap[storyWorld] || "Adventure";
  };

  // Handle character preview
  const handleCharacterPreview = (event: CustomEvent) => {
    const character = event.detail;
    selectedCharacter = character;
    
    // Find all books featuring this character
    const characterName = character.character_name?.toLowerCase();
    if (characterName && rawStories) {
      characterBooks = rawStories.filter((story: any) => 
        story.character_name?.toLowerCase() === characterName
      );
    } else {
      characterBooks = [];
    }
    
    showCharacterPreview = true;
  };

  // Handle back from character preview
  const handleBackFromPreview = () => {
    showCharacterPreview = false;
    selectedCharacter = null;
    characterBooks = [];
  };

  // Handle book click from preview
  const handleBookClick = (event: CustomEvent) => {
    const book = event.detail;
    // TODO: Navigate to book view or handle book click
    console.log("Book clicked:", book);
  };

  // Handle delete character
  const handleDeleteCharacter = async (event: CustomEvent) => {
    const character = event.detail;
    
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete "${character.character_name}"? This action cannot be undone.`)) {
      return;
    }
    
    handleBackFromPreview();
    
    try {
      const userId = $user?.id;
      if (!userId) {
        console.error('User not authenticated');
        return;
      }
      
      const result = await deleteCharacter(character.id, userId);
      
      if (result.success) {
        console.log('Character deleted successfully:', result.data);
        
        // Refresh character data
        await fetchCharacters(userId);
        await fetchStories(userId);
      } else {
        console.error('Failed to delete character:', result.error);
        alert(`Failed to delete character: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting character:', error);
      alert('An error occurred while deleting the character');
    }
  };

  // Handle view stories from child profile
  const handleViewStoriesFromChild = (event: CustomEvent) => {
    const { childId, childName } = event.detail;
    // Switch to story library and filter by the selected child
    activeMenu = "story-library";
    selectedChild = childId;
    console.log(`Viewing stories for child: ${childName} (ID: ${childId})`);
  };

  // Gift tracking event handlers
  const handleAddChildren = () => {
    // Navigate to add children page or open modal
    goto("/create-child-profile");
  };

  const handleResendLink = (event: CustomEvent) => {
    const { giftId } = event.detail;
    // TODO: Implement resend gift link functionality
    console.log(`Resending link for gift: ${giftId}`);
  };

  const handleViewGift = (event: CustomEvent) => {
    const { giftId } = event.detail;
    // TODO: Navigate to gift view page
    console.log(`Viewing gift: ${giftId}`);
  };

  const handleViewBook = (event: CustomEvent) => {
    const { giftId } = event.detail;
    // TODO: Navigate to book view page for completed gift
    console.log(`Viewing book for gift: ${giftId}`);
  };

  const handleSendThankYou = (event: CustomEvent) => {
    const { giftId } = event.detail;
    // TODO: Implement send thank you functionality
    console.log(`Sending thank you for gift: ${giftId}`);
  };

  onMount(() => {
    const unsubscribe = user.subscribe(($user: any) => {
      if ($user?.id) {
        fetchChildProfiles($user.id);
        fetchStories($user.id);
        fetchGifts();
        fetchCharacters($user.id);
      } else {
        childProfiles = [];
        stories = [];
        rawStories = [];
        characters = [];
        gifts = [];
        loading = false;
        loadingStories = false;
        loadingGifts = false;
        error = "";
        storiesError = "";
        giftsError = "";
      }
    });
    return unsubscribe;
  });
</script>

<div class="dashboard-home">
  <div class="navbar">
    <div class="logo-text-full">
      <div class="drawtopia">
        <img src={drawtopialogo} alt="drawtopialogo" class="drawtopia-logo" />
      </div>
    </div>
    <div class="frame-2147227655">
      <AccountDropdown />
      <div class="icon-list" on:click={toggleSidebar} role="button" tabindex="0" on:keydown={(e) => (e.key === "Enter" || e.key === " ") && toggleSidebar()}>
        <img src={selectLayerIcon} alt="selectLayerIcon" />
      </div>
    </div>
  </div>
  {#if showCharacterPreview && selectedCharacter}
    <MobileBookPreview
      characterName={selectedCharacter.character_name}
      characterData={selectedCharacter}
      on:bookClick={handleBookClick}
      on:back={handleBackFromPreview}
      on:deleteCharacter={handleDeleteCharacter}
    />
  {:else if activeMenu === "story-library"}
    <MobileStoryLibraryComponent
      bind:libraryView
      {setLibraryView}
      {stories}
      {characters}
      {childProfiles}
      {loading}
      {loadingStories}
      {error}
      {storiesError}
      bind:selectedFormat
      bind:selectedChild
      bind:selectedStatus
      {formatOptions}
      {childrenOptions}
      {statusOptions}
      {filteredStories}
      {fetchStories}
      {fetchChildProfiles}
    />
  {:else if activeMenu === "characters"}
    <MobileDashboardCharactersComponent
      on:characterPreview={handleCharacterPreview}
    />
  {:else if activeMenu === "child-profiles"}
    <MobileDashboardChildProfile
      {childProfiles}
      {fetchChildProfiles}
      on:viewStories={handleViewStoriesFromChild}
    />
  {:else if activeMenu === "gift-tracking"}
    <MobileDashboardGift
      {gifts}
      loading={loadingGifts}
      error={giftsError}
      on:addChildren={handleAddChildren}
      on:resendLink={handleResendLink}
      on:viewGift={handleViewGift}
      on:viewBook={handleViewBook}
      on:sendThankYou={handleSendThankYou}
    />
  {:else}
    <MobileDashboardHomeComponent
      bind:libraryView
      {setLibraryView}
      {stories}
      {characters}
      {childProfiles}
      {loading}
      {loadingStories}
      {error}
      {storiesError}
      bind:selectedFormat
      bind:selectedChild
      bind:selectedStatus
      {formatOptions}
      {childrenOptions}
      {statusOptions}
      {filteredStories}
      {fetchStories}
      {fetchChildProfiles}
      {adventureStoriesCount}
      {searchStoriesCount}
      {adventureReadingTime}
      {searchReadingTime}
      {audioListenedCount}
      {averageStars}
      {averageHints}
      on:characterPreview={handleCharacterPreview}
    />
  {/if}

  <!-- Mobile Slide Sidebar -->
  {#if sidebarOpen}
    <div 
      class="sidebar-overlay" 
      on:click={closeSidebar} 
      role="button" 
      tabindex="0" 
      on:keydown={(e) => (e.key === "Enter" || e.key === " ") && closeSidebar()}
      transition:fly={{ x: 0, duration: 300 }}
    ></div>
    <div 
      class="mobile-sidebar-container"
      transition:fly={{ x: -280, duration: 300 }}
    >
      <!-- Integrated Mobile Sidebar Content -->
      <div class="frame-2147227656">
        <div class="content">
          <div class="sidebargrouping-label">
            <div><span class="menu_span">MENU</span></div>
          </div>
          <div class="menu_01">
            <div 
              class="parent-menu-dropdown" 
              class:active={activeMenu === "home"}
              on:click={() => handleMenuClick("home")}
              role="button"
              tabindex="0"
              on:keydown={(e) => e.key === "Enter" && handleMenuClick("home")}
            >
              <div class="sidebar-menu-parent">
                <div class="title-icon">
                  <div class="house">
                    <img src={house} alt="house" />
                  </div>
                  <div><span class="home_span">Home</span></div>
                </div>
              </div>
            </div>
            <div 
              class="parent-menu-dropdown_01" 
              class:active={activeMenu === "story-library"}
              on:click={() => handleMenuClick("story-library")}
              role="button"
              tabindex="0"
              on:keydown={(e) => e.key === "Enter" && handleMenuClick("story-library")}
            >
              <div class="sidebar-menu-parent_01">
                <div class="title-icon_01">
                  <div class="bookopen_sidebar">
                    <img src={bookopen} alt="bookopen" />
                  </div>
                  <div><span class="storylibrary_span">Story Library</span></div>
                </div>
              </div>
            </div>
            <div 
              class="parent-menu-dropdown_02" 
              class:active={activeMenu === "characters"}
              on:click={() => handleMenuClick("characters")}
              role="button"
              tabindex="0"
              on:keydown={(e) => e.key === "Enter" && handleMenuClick("characters")}
            >
              <div class="sidebar-menu-parent_02">
                <div class="title-icon_02">
                  <div class="usersquare">
                    <img src={userSquare} alt="characters" />
                  </div>
                  <div><span class="characters_span_sidebar">Characters</span></div>
                </div>
              </div>
            </div>
            <div 
              class="parent-menu-dropdown_03" 
              class:active={activeMenu === "child-profiles"}
              on:click={() => handleMenuClick("child-profiles")}
              role="button"
              tabindex="0"
              on:keydown={(e) => e.key === "Enter" && handleMenuClick("child-profiles")}
            >
              <div class="sidebar-menu-parent_03">
                <div class="title-icon_03">
                  <div class="baby_sidebar">
                    <img src={baby} alt="baby" />
                  </div>
                  <div><span class="childprofiles_span">Child Profiles</span></div>
                </div>
              </div>
            </div>
            <div 
              class="parent-menu-dropdown_04" 
              class:active={activeMenu === "gift-tracking"}
              on:click={() => handleMenuClick("gift-tracking")}
              role="button"
              tabindex="0"
              on:keydown={(e) => e.key === "Enter" && handleMenuClick("gift-tracking")}
            >
              <div class="sidebar-menu-parent_04">
                <div class="title-icon_04">
                  <div class="gift_sidebar">
                    <img src={gift} alt="gift" />
                  </div>
                  <div><span class="gifttracking_span">Gift Tracking</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="chips">
          <div class="frame-2147227644">
            <div class="books_sidebar">
              <img src={books} alt="books" />
            </div>
          </div>
          <div><span class="fstorycreditsleft_span">{storyCredits} story credits left</span></div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .drawtopia {
    width: 170.15px;
    height: 31.8px;
    left: 0px;
    top: 0px;
    position: absolute;
  }

  .drawtopia-logo {
    width: 100%;
  }

  .logo-text-full {
    width: 170.15px;
    height: 31.8px;
    position: relative;
  }


  .icon-list {
    width: 32px;
    height: 32px;
    position: relative;
  }


  .frame-2147227655 {
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: flex;
  }


  .navbar {
    align-self: stretch;
    padding-top: 12px;
    padding-bottom: 12px;
    border-radius: 20px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .dashboard-home {
    width: 100%;
    height: 100%;
    padding-top: 24px;
    padding-left: 16px;
    padding-right: 16px;
    padding-bottom: 16px;
    background: white;
    overflow: hidden;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 10px;
    display: inline-flex;
  }

  /* Loading, Error, and Empty States */
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Mobile Sidebar Styles */
  .sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
    animation: fadeIn 0.3s ease-out;
  }

  .mobile-sidebar-container {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 280px;
    max-width: 85vw;
    background: white;
    z-index: 1000;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
    overflow-y: auto;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .icon-list {
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .icon-list:hover {
    opacity: 0.7;
  }

  .icon-list:active {
    opacity: 0.5;
  }

  /* Integrated Mobile Sidebar Styles */
  .menu_span {
    color: var(--Gray-gray-400, #90A1B9);
    font-size: 12px;
    font-family: DM Sans;
    font-weight: 500;
    text-transform: uppercase;
    line-height: 16.80px;
    letter-spacing: 1.20px;
    word-wrap: break-word;
  }

  .home_span {
    color: white;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 600;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .storylibrary_span {
    color: #727272;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .characters_span_sidebar {
    color: #727272;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .childprofiles_span {
    color: #727272;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .gifttracking_span {
    color: #727272;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .fstorycreditsleft_span {
    color: #438BFF;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 500;
    word-wrap: break-word;
  }

  .sidebargrouping-label {
    align-self: stretch;
    padding-left: 24px;
    padding-right: 24px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .house {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .house img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .bookopen_sidebar {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .bookopen_sidebar img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .usersquare {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .usersquare img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .baby_sidebar {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .baby_sidebar img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .gift_sidebar {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .gift_sidebar img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .books_sidebar {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
  }

  .books_sidebar img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .title-icon {
    flex: 1 1 0;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .title-icon_01 {
    flex: 1 1 0;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .title-icon_02 {
    flex: 1 1 0;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .title-icon_03 {
    flex: 1 1 0;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .title-icon_04 {
    flex: 1 1 0;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .frame-2147227644 {
    padding: 8px;
    background: white;
    border-radius: 4px;
    outline: 1px #438BFF solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .sidebar-menu-parent {
    align-self: stretch;
    padding: 12px;
    border-radius: 6px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .sidebar-menu-parent_01 {
    align-self: stretch;
    padding: 12px;
    border-radius: 6px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .sidebar-menu-parent_02 {
    align-self: stretch;
    padding: 12px;
    border-radius: 6px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .sidebar-menu-parent_03 {
    align-self: stretch;
    padding: 12px;
    border-radius: 6px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .sidebar-menu-parent_04 {
    align-self: stretch;
    padding: 12px;
    border-radius: 6px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .chips {
    align-self: stretch;
    padding-top: 4px;
    padding-bottom: 4px;
    padding-left: 4px;
    padding-right: 10px;
    background: #EEF6FF;
    border-radius: 8px;
    outline: 1px #438BFF solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: inline-flex;
  }

  .parent-menu-dropdown {
    align-self: stretch;
    position: relative;
    background: #438BFF;
    border-radius: 12px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    display: flex;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .parent-menu-dropdown:not(.active) {
    background: transparent;
  }

  .parent-menu-dropdown:not(.active) .home_span {
    color: #727272;
  }

  .parent-menu-dropdown_01 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    display: flex;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .parent-menu-dropdown_01.active {
    background: #438BFF;
    border-radius: 12px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
  }

  .parent-menu-dropdown.active .house img {
    filter: brightness(0) invert(1);
  }

  .parent-menu-dropdown_01.active .storylibrary_span {
    color: white;
  }

  .parent-menu-dropdown_01.active .bookopen_sidebar img {
    filter: brightness(0) invert(1);
  }

  .parent-menu-dropdown_02 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    display: flex;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .parent-menu-dropdown_02.active {
    background: #438BFF;
    border-radius: 12px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
  }

  .parent-menu-dropdown_02.active .characters_span_sidebar {
    color: white;
  }

  .parent-menu-dropdown_02.active .usersquare img {
    filter: brightness(0) invert(1);
  }

  .parent-menu-dropdown_03 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    display: flex;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .parent-menu-dropdown_03.active {
    background: #438BFF;
    border-radius: 12px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
  }

  .parent-menu-dropdown_03.active .childprofiles_span {
    color: white;
  }

  .parent-menu-dropdown_03.active .baby_sidebar img {
    filter: brightness(0) invert(1);
  }

  .parent-menu-dropdown_04 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    display: flex;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .parent-menu-dropdown_04.active {
    background: #438BFF;
    border-radius: 12px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
  }

  .parent-menu-dropdown_04.active .gifttracking_span {
    color: white;
  }

  .parent-menu-dropdown_04.active .gift_sidebar img {
    filter: brightness(0) invert(1);
  }

  .menu_01 {
    align-self: stretch;
    padding: 12px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 10px;
    display: flex;
  }

  .content {
    align-self: stretch;
    padding-top: 16px;
    padding-bottom: 16px;
    background: var(--White-bg-white, white);
    overflow: hidden;
    border-right: 1px var(--Gray-stk-gray-200, #E2E8F0) solid;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: flex;
  }

  .frame-2147227656 {
    width: 100%;
    height: 100%;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
    display: inline-flex;
  }
</style>
