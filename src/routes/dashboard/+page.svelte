<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import { user } from "../../lib/stores/auth";
  import {
    getAllStoriesForParent,
    deleteCharacter,
    type Story,
  } from "../../lib/database/stories";
  import { supabase } from "../../lib/supabase";
  import { getGiftsForUser, type Gift } from "../../lib/database/gifts";
  import caretdown from "../../assets/CaretDown.svg";
  import house from "../../assets/House.svg";
  import baby from "../../assets/Baby.svg";
  import userSquare from "../../assets/UserSquare.svg";
  import bookopen from "../../assets/BookOpen.svg";
  import gift from "../../assets/Gift.svg";
  import list from "../../assets/Sidebar.svg";
  import x from "../../assets/X.svg";
  import GiftTrackingComponent from "../../components/GiftTrackingComponent.svelte";
  import NotificationComponent from "../../components/NotificationComponent.svelte";
  import AccountDropdown from "../../components/AccountDropdown.svelte";
  import { storyCreation } from "../../lib/stores/storyCreation";
  import books from "../../assets/Books.svg";
  import starIcon from "../../assets/OutlineStar.svg";
  import speakerIcon from "../../assets/OutlineHeadset.svg";
  import BookIcon from "../../assets/Book.svg";
  import CharacterDetailsModal from "../../components/CharacterDetailsModal.svelte";
  import MobileDashboardComponent from "../../components/MobileDashboardComponent.svelte";
  import HomeLibraryView from "../../components/HomeLibraryView.svelte";
  import ChildProfilesView from "../../components/ChildProfilesView.svelte";
  import StoryLibraryView from "../../components/StoryLibraryView.svelte";
  import CharacterLibraryView from "../../components/CharacterLibraryView.svelte";

  // Sidebar library switch state
  let libraryView: "all" | "characters" | "children" = "all";
  const setLibraryView = (v: "all" | "characters" | "children") =>
    (libraryView = v);

  // Active menu item state
  let activeMenu: "home" | "story-library" | "characters" | "child-profiles" | "gift-tracking" = "home";

  // Function to handle menu item clicks
  function handleMenuClick(menu: "home" | "story-library" | "characters" | "child-profiles" | "gift-tracking") {
    activeMenu = menu;
    // You can add navigation logic here if needed
  }

  let showMobileMenu = false;
  let childProfiles: any[] = [];
  let stories: any[] = [];
  let rawStories: any[] = []; // Store raw story data for character extraction
  let characters: any[] = []; // Extracted unique characters
  let gifts: any[] = [];
  let loading = true;
  let loadingStories = true;
  let loadingGifts = true;
  let error = "";
  let storiesError = "";
  let giftsError = "";
  let showGiftSelectModal = false;
  let homeCategory: string | null = "AllBooks";
  let showCharacterModal = false;
  let selectedCharacter: any = null;
  let characterBooks: any[] = [];
  let subscriptionStatus: string = "Premium Plan";
  
  // Story counts and reading times from HomeLibraryView
  let adventureStoriesCount: number = 0;
  let searchStoriesCount: number = 0;
  let adventureReadingTime: number = 0; // Total reading time in seconds
  let searchReadingTime: number = 0; // Total reading time in seconds
  let audioListenedCount: number = 0; // Count of stories with audio listened
  let averageStars: number = 0; // Average stars across interactive search stories
  let averageHints: number = 0; // Average hints across interactive search stories
  
  // Responsive detection
  let isMobile = false;
  
  // Check screen size on mount and window resize
  const checkScreenSize = () => {
    if (browser) {
      isMobile = window.innerWidth <= 800;
    }
  };

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

  // Random story themes for lastStory
  const storyThemes = [
    "Birthday",
    "Bedtime",
    "Holiday",
    "Adventure",
    "Magic",
    "Friendship",
    "Animals",
    "Space",
    "Ocean",
    "Forest",
    "Castle",
    "Dragon",
    "Princess",
    "Superhero",
    "Pirate",
    "Fairy Tale",
    "Mystery",
    "Science",
    "Sports",
    "Music",
  ];

  const toggleMobileMenu = () => {
    showMobileMenu = !showMobileMenu;
  };

  // Function to format seconds into "h m s" format
  function formatReadingTime(seconds: number): string {
    if (seconds === 0) return "0 s";
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours} h`);
    if (minutes > 0) parts.push(`${minutes} m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs} s`);
    
    return parts.join(' ');
  }

  // Function to get a random story theme
  const getRandomStoryTheme = () => {
    return storyThemes[Math.floor(Math.random() * storyThemes.length)];
  };

  // Function to format age group for display
  const formatAgeLabel = (ageGroup: string) => {
    // Convert age group like "3-5" to "3-5 Years Old"
    return `${ageGroup} Years Old`;
  };

  // Function to format subscription status for display
  const formatSubscriptionStatus = (status: string | null | undefined): string => {
    if (!status) return "Free Plan";
    
    // Convert status to display format
    const statusMap: { [key: string]: string } = {
      'premium': 'Premium Plan',
      'free': 'Free Plan',
      'trial': 'Trial Plan',
      'basic': 'Basic Plan'
    };
    
    const normalizedStatus = status.toLowerCase();
    return statusMap[normalizedStatus] || status.charAt(0).toUpperCase() + status.slice(1) + ' Plan';
  };

  // Fetch user subscription status
  const fetchSubscriptionStatus = async (userId: string) => {
    try {
      const { getUserProfile } = await import("../../lib/auth");
      const result = await getUserProfile(userId);
      if (result.success && result.profile) {
        const profile = Array.isArray(result.profile) ? result.profile[0] : result.profile;
        if (profile?.subscription_status) {
          subscriptionStatus = formatSubscriptionStatus(profile.subscription_status);
        } else {
          subscriptionStatus = formatSubscriptionStatus(null);
        }
      }
    } catch (error) {
      console.error("Error fetching subscription status:", error);
      subscriptionStatus = "Free Plan";
    }
  };

  // Function to format stories created text
  const formatStoriesCreatedText = (firstName: string, ageGroup: string) => {
    return `${firstName} (Age ${ageGroup})`;
  };

  // Direct query to Supabase stories table (for debugging/verification)
  const fetchStoriesDirectly = async (userId: string) => {
    try {
      // First get child profiles for this user
      const { data: childProfiles, error: childError } = await supabase
        .from('child_profiles')
        .select('*')
        .eq('parent_id', userId);

      if (childError) {
        console.error('[Dashboard] Error fetching child profiles:', childError);
        return [];
      }

      if (!childProfiles || childProfiles.length === 0) {
        console.log('[Dashboard] No child profiles found for user');
        return [];
      }

      const childProfileIds = childProfiles.map(cp => cp.id);
      
      // Direct query to stories table
      const { data: storiesData, error: storiesError } = await supabase
        .from('stories')
        .select('*')
        .in('child_profile_id', childProfileIds)
        .order('created_at', { ascending: false });

      if (storiesError) {
        console.error('[Dashboard] Error fetching stories directly:', storiesError);
        return [];
      }

      console.log('[Dashboard] Direct query result:', storiesData?.length || 0, 'stories');
      return storiesData || [];
    } catch (err) {
      console.error('[Dashboard] Error in direct query:', err);
      return [];
    }
  };

  // Fetch stories for the user
  const fetchStories = async (userId: string) => {
    try {
      // Validate userId
      if (!userId || typeof userId !== 'string' || userId.trim() === '' || userId === 'undefined' || userId === 'null') {
        console.error('[Dashboard] Invalid userId:', userId);
        storiesError = 'Invalid user ID';
        loadingStories = false;
        return;
      }
      
      loadingStories = true;
      storiesError = "";
      
      // Clear existing data first
      stories = [];
      rawStories = [];
      characters = [];

      console.log('[Dashboard] Fetching stories from Supabase for user:', userId);
      
      // First, try direct query to verify what's in the database
      const directStories = await fetchStoriesDirectly(userId);
      console.log('[Dashboard] Direct query returned:', directStories.length, 'stories');
      
      // Then use the standard function
      const result = await getAllStoriesForParent(userId);
      
      console.log('[Dashboard] getAllStoriesForParent response:', {
        success: result.success,
        dataCount: result.data,
        error: result.error
      });

      if (result.success && result.data) {
        // Ensure we have an array
        const storiesData = Array.isArray(result.data) ? result.data : [];
        
        console.log('[Dashboard] Stories from Supabase:', storiesData.length, 'stories');
        console.log('[Dashboard] Stories data:', storiesData);
        
        // Store raw story data from Supabase
        rawStories = storiesData;
        
        // Transform the data to match the StoryLibraryComponent interface
        stories = storiesData
          .map(
            (story: Story & { child_profiles?: any, user_name?: string, uid?: string }, index: number) => ({
              id: story.id || `temp_story_${index}_${Date.now()}`,
              title: story.story_title || `${story.character_name}'s Adventure`,
              author: story.child_profiles?.first_name || "Unknown",
              status: story.status || "completed",
              story_cover: story.story_cover,
              createdDate: story.created_at
                ? new Date(story.created_at).toLocaleDateString("en-GB")
                : "Unknown",
              created_at: story.created_at,
              durationText: "8 min read", // Default duration - could be calculated based on story content
              occasion: determineOccasion(
                story.adventure_type,
                story.story_world,
              ),
              imageUrl:
                story.original_image_url || "https://placehold.co/332x225",
              story_title: story.story_title,
              user_name: story.user_name,
              child_profile_id: story.child_profile_id,
              child_profiles: story.child_profiles,
              adventure_type: story.adventure_type,
              scene_images: story.scene_images,
              story_content: story.story_content,
              story_type: story.story_type,
              uid: story.uid
            }),
          )
          .filter((story) => story.id); // Ensure all stories have valid ids

        console.log('[Dashboard] Transformed stories for display:', stories.length, 'stories');

        // Extract unique characters from stories
        extractCharacters(storiesData);
        
        console.log('[Dashboard] Extracted characters:', characters.length, 'characters');
      } else {
        console.warn('[Dashboard] Failed to fetch stories:', result.error);
        storiesError = result.error || "Failed to fetch stories";
        stories = [];
        rawStories = [];
        characters = [];
      }
    } catch (err) {
      console.error("[Dashboard] Error fetching stories:", err);
      storiesError = "An unexpected error occurred while fetching stories";
      stories = [];
      rawStories = [];
      characters = [];
    } finally {
      loadingStories = false;
      console.log('[Dashboard] Stories loading complete. Final stories count:', stories.length);
    }
  };

  // Extract unique characters from stories
  const extractCharacters = (storiesData: any[]) => {
    const characterMap = new Map();
    const characterBookCounts = new Map();
    let characterIdCounter = 1;
    
    storiesData.forEach((story: Story & { child_profiles?: any }) => {
      if (story.character_name) {
        const key = story.character_name.toLowerCase();
        
        // Count books for this character
        characterBookCounts.set(key, (characterBookCounts.get(key) || 0) + 1);
        
        if (!characterMap.has(key)) {
          characterMap.set(key, {
            id: `char_${characterIdCounter++}`,
            character_name: story.character_name,
            character_type: story.character_type,
            character_style: story.character_style,
            special_ability: story.special_ability,
            original_image_url: story.original_image_url || "https://placehold.co/332x225",
            created_at: story.created_at,
            child_profiles: story.child_profiles,
            booksCount: 0, // Will be set below
          });
        }
      }
    });

    // Set book counts for each character
    characters = Array.from(characterMap.values())
      .map((char) => ({
        ...char,
        booksCount: characterBookCounts.get(char.character_name.toLowerCase()) || 0,
      }))
      .filter((char) => char.id); // Ensure all characters have valid ids
  };

  // Fetch gifts for the user
  const fetchGifts = async () => {
    try {
      loadingGifts = true;
      giftsError = "";

      const result = await getGiftsForUser();

      if (result.success && result.data) {
        // Transform the data to match the GiftTrackingComponent interface
        gifts = result.data.map((gift: Gift) => ({
          id: gift.id,
          childName: gift.child_name,
          ageGroup: gift.age_group,
          status: gift.status,
          giftFrom: gift.relationship,
          occasion: gift.occasion,
          expectedDelivery: gift.delivery_time
            ? new Date(gift.delivery_time).toLocaleDateString("en-GB")
            : "Unknown",
          createdAt: gift.created_at ? new Date(gift.created_at) : new Date(),
          notification_sent: gift.notification_sent,
          send_to: gift.delivery_email,
          created_at: gift.created_at
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

  // Helper function to determine occasion based on story properties
  const determineOccasion = (
    adventureType: string,
    storyWorld: string,
  ): string => {
    // Map adventure types and worlds to occasions
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
    
    showCharacterModal = true;
  };

  // Handle character modal close
  const handleCharacterModalClose = () => {
    showCharacterModal = false;
    selectedCharacter = null;
    characterBooks = [];
  };

  // Handle character modal actions
  const handleUseInNewBook = (event: CustomEvent) => {
    const character = event.detail;
    handleCharacterModalClose();
    // TODO: Navigate to create new book with this character
    console.log("Use in new book:", character);
  };

  const handleEditCharacter = (event: CustomEvent) => {
    const character = event.detail;
    handleCharacterModalClose();
    // TODO: Navigate to edit character
    console.log("Edit character:", character);
  };

  const handleDeleteCharacter = async (event: CustomEvent) => {
    const character = event.detail;
    
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete "${character.character_name}"? This action cannot be undone.`)) {
      return;
    }
    
    handleCharacterModalClose();
    
    try {
      const userId = $user?.id;
      if (!userId) {
        console.error('User not authenticated');
        return;
      }
      
      const result = await deleteCharacter(character.id, userId);
      
      if (result.success) {
        console.log('Character deleted successfully:', result.data);
        
        // Reload the page data to reflect the changes
        if (browser) {
          window.location.reload();
        }
      } else {
        console.error('Failed to delete character:', result.error);
        alert(`Failed to delete character: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting character:', error);
      alert('An error occurred while deleting the character');
    }
  };

  const handleBookClick = (event: CustomEvent) => {
    const book = event.detail;
    handleCharacterModalClose();
    // TODO: Navigate to book view
    console.log("Book clicked:", book);
  };

  // Handle view book button click from BookCard
  

  // Track the last fetched user ID to prevent duplicate fetches
  let lastFetchedUserId: string | null = null;

  // Fetch profiles, stories, and gifts when component mounts and user is available
  onMount(() => {
    // Clear sessionStorage on dashboard page load
    if (browser) {
      sessionStorage.clear();
    }
    
    // Check initial screen size
    checkScreenSize();

    return () => {
      if (browser) {
        window.removeEventListener('resize', checkScreenSize);
      }
    };
  });

  // Handle Add Children button click
  const handleAddChildren = () => {
    goto("/create-child-profile");
  };

  // Handle New Story button click from child profile component
  const handleNewStory = (event: CustomEvent) => {
    const childName = event.detail.name;
    const childItem = event.detail.item;

    // Find the selected child profile - check both name and first_name fields
    const selectedChild = childProfiles.find(
      (child) => (child.name === childName || child.first_name === childName),
    ) || childItem; // Fallback to the passed item if not found in childProfiles

    if (selectedChild && browser) {
      // Store the child profile ID and name for the character creation flow
      const childId = selectedChild.id?.toString() || '';
      const childDisplayName = selectedChild.first_name || selectedChild.name || childName;
      
      sessionStorage.setItem("selectedChildProfileId", childId);
      sessionStorage.setItem("selectedChildProfileName", childDisplayName);
      
      // Update the story creation store with selected child
      storyCreation.setSelectedChild(childId, childDisplayName);
    }
    
    // Navigate to create-character/1 page
    goto("/create-character/1");
  };
</script>

{#if !isMobile}
<div class="parent-dashboard">
  <div class="navigation">
    <div class="sidebarheader">
      <div class="logo-text-full">
        <div class="logo-img"></div>
      </div>
      <div
        data-weight="Regular"
        class="icon-list"
        on:click={toggleMobileMenu}
        on:keydown={(e) => e.key === "Enter" && toggleMobileMenu()}
        role="button"
        tabindex="0"
      >
        <img
          src={showMobileMenu ? x : list}
          alt={showMobileMenu ? "close" : "menu"}
          class="list"
        />
      </div>
    </div>
    <div class="content">
      <div class="sidebargrouping-label">
        <div><span class="mainmenu_span">MENU</span></div>
      </div>
      <div class="menu">
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
                <img src={house} alt="house" class="house" />
              </div>
              <div><span class="home_span">Home</span></div>
            </div>
          </div>
        </div>
        <div 
          class="parent-menu-dropdown_02" 
          class:active={activeMenu === "story-library"}
          on:click={() => handleMenuClick("story-library")}
          role="button"
          tabindex="0"
          on:keydown={(e) => e.key === "Enter" && handleMenuClick("story-library")}
        >
          <div class="sidebar-menu-parent_02">
            <div class="title-icon_02">
              <div class="bookopen">
                <img src={bookopen} alt="bookopen" class="bookopen" />
              </div>
              <div><span class="storylibrary_span">Story Library</span></div>
            </div>
          </div>
        </div>

        <div 
        class="parent-menu-dropdown_01" 
          class:active={activeMenu === "characters"}
          on:click={() => handleMenuClick("characters")}
          role="button"
          tabindex="0"
          on:keydown={(e) => e.key === "Enter" && handleMenuClick("characters")}
        >
        <div class="sidebar-menu-parent_01">
            <div class="title-icon_01">
              <div class="baby">
                <img src={userSquare} alt="characters" class="baby" />
              </div>
              <div><span class="childprofiles_span">Characters</span></div>
            </div>
          </div>
        </div>
        <div 
          class="parent-menu-dropdown_01" 
          class:active={activeMenu === "child-profiles"}
          on:click={() => handleMenuClick("child-profiles")}
          role="button"
          tabindex="0"
          on:keydown={(e) => e.key === "Enter" && handleMenuClick("child-profiles")}
        >
          <div class="sidebar-menu-parent_01">
            <div class="title-icon_01">
              <div class="baby">
                <img src={baby} alt="baby" class="baby" />
              </div>
              <div><span class="childprofiles_span">Child Profiles</span></div>
            </div>
          </div>
        </div>
        <div 
          class="parent-menu-dropdown_03" 
          class:active={activeMenu === "gift-tracking"}
          on:click={() => handleMenuClick("gift-tracking")}
          role="button"
          tabindex="0"
          on:keydown={(e) => e.key === "Enter" && handleMenuClick("gift-tracking")}
        >
          <div class="sidebar-menu-parent_03">
            <div class="title-icon_03">
              <div class="gift">
                <img src={gift} alt="gift" class="gift" />
              </div>
              <div><span class="gifttracking_span">Gift Tracking</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Mobile Menu Overlay -->
  {#if showMobileMenu}
    <div
      class="mobile-menu-overlay"
      on:click={toggleMobileMenu}
      on:keydown={(e) => e.key === "Escape" && toggleMobileMenu()}
      role="dialog"
      tabindex="-1"
    >
      <div
        class="mobile-menu"
        on:click|stopPropagation
        on:keydown|stopPropagation
        role="dialog"
        tabindex="0"
      >
        <div class="mobile-menu-header">
          <div class="logo-text-full">
            <div class="logo-img"></div>
          </div>
          <div class="mobile-header-actions">
            <NotificationComponent />
            <div
              class="close-menu"
              on:click={toggleMobileMenu}
              on:keydown={(e) => e.key === "Enter" && toggleMobileMenu()}
              role="button"
              tabindex="0"
            >
              <img src={x} alt="close" class="list" />
            </div>
          </div>
        </div>
        <div class="mobile-menu-content">
          <div class="mobile-menu-label">
            <span class="mainmenu_span">MENU</span>
          </div>
          <div class="mobile-menu-items">
            <div class="mobile-menu-item active">
              <div class="mobile-menu-icon">
                <img src={house} alt="house" class="house" />
              </div>
              <span class="home_span">Home</span>
            </div>
            <div class="mobile-menu-item">
              <div class="mobile-menu-icon">
                <img src={baby} alt="baby" class="baby" />
              </div>
              <span class="childprofiles_span">Child Profiles</span>
            </div>
            <div class="mobile-menu-item">
              <div class="mobile-menu-icon">
                <img src={bookopen} alt="bookopen" class="bookopen" />
              </div>
              <span class="storylibrary_span">Story Library</span>
            </div>
            <div class="mobile-menu-item">
              <div class="mobile-menu-icon">
                <img src={gift} alt="gift" class="gift" />
              </div>
              <span class="gifttracking_span">Gift Tracking</span>
            </div>
          </div>
        </div>

        <div class="mobile-menu-footer">
          <div class="mobile-profile-close">
            <img
              class="ellipse-7"
              src="https://placehold.co/40x40"
              alt="Alex Smith"
            />
            <div class="heading">
              <div class="alex-smith">
                <span class="alexsmith_span">Alex Smith</span>
              </div>
              <div class="premium-plan">
                <span class="premiumplan_span">Premium Plan</span>
              </div>
            </div>
            <img src={caretdown} alt="caretdown" class="caretdown" />
          </div>
        </div>
      </div>
    </div>
  {/if}

  <div class="frame-1410104150_02">
    <div class="sidebarpenaksir-kasir">
      <div class="sidebarheader_01">
        <div class="title">
          <div class="welcome-back">
            <span class="welcomeback_span">Welcome back!</span>
          </div>
          <div class="manage-your-childrens-stories-and-gifts">
            <span class="manageyourchildrensstoriesandgifts_span"
              >Manage your children's stories and gifts</span
            >
          </div>
        </div>
        <div class="header-actions">
          <NotificationComponent />
          <div class="chips">
            <div class="frame-2147227644">
              <div class="books">
                <img src={books} alt="books" />
              </div>
            </div>
            <div>
              <span class="fstorycreditsleft_span">3 story credits left</span>
            </div>
          </div>
          <AccountDropdown />
        </div>
      </div>
    </div>
    <div class="sidebar">
      {#if activeMenu === "home"}
        <HomeLibraryView 
          {handleAddChildren} 
          {handleCharacterPreview} 
          {handleNewStory} 
          bind:libraryView 
          bind:adventureStoriesCount
          bind:searchStoriesCount
          bind:adventureReadingTime
          bind:searchReadingTime
          bind:audioListenedCount
          bind:averageStars
          bind:averageHints
        />
      {/if}
        
      <!-- Reading Stats Component -->
      {#if activeMenu === "home" && libraryView === "all"}
      <div class="reading-stats-container">
        <div class="reading-stats-header-section">
          <div class="reading-stats-header-wrapper">
            <div class="reading-stats-title-section">
              <div class="reading-stats-title">
                <span class="reading-stats-title-text">Your Reading Stats </span>
              </div>
            </div>
          </div>
          <div class="reading-stats-divider"></div>
        </div>
        <div class="reading-stats-cards">
          <div class="reading-stats-card-story">
            <div class="reading-stats-card-header">
              <div class="reading-stats-icon-wrapper">
                <div class="reading-stats-icon-bg">
                  <div class="reading-stats-book-icon">
                    <img src={BookIcon} alt="Book" class="book-icon" />
                  </div>
                  <div class="reading-stats-icon-glow"></div>
                </div>
                <div class="reading-stats-card-title-group">
                  <div class="reading-stats-card-label">
                    <span class="reading-stats-card-label-text">Story Adventure</span>
                  </div>
                  <div class="reading-stats-card-value">
                    <span class="reading-stats-card-value-text">{adventureStoriesCount} {adventureStoriesCount === 1 ? 'Book' : 'Books'}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="reading-stats-card-divider"></div>
            <div class="reading-stats-stat-item">
              <div class="reading-stats-stat-icon">
                <img src={bookopen} alt="Book Open" />
              </div>
              <div class="reading-stats-stat-text">
                <span class="reading-stats-stat-label">Total reading time: </span>
                <span class="reading-stats-stat-value">{formatReadingTime(adventureReadingTime)}</span>
              </div>
            </div>
            <div class="reading-stats-stat-item">
              <div class="reading-stats-stat-icon">
                <img src={speakerIcon} alt="Audio" />
              </div>
              <div class="reading-stats-stat-text">
                <span class="reading-stats-stat-label">Audio listened: </span>
                <span class="reading-stats-stat-value">{audioListenedCount} {audioListenedCount === 1 ? 'Book' : 'Books'}</span>
              </div>
            </div>
          </div>
          <div class="reading-stats-card-search">
            <div class="reading-stats-card-header">
              <div class="reading-stats-icon-wrapper">
                <div class="reading-stats-icon-bg">
                  <div class="reading-stats-book-icon">
                    <img src={BookIcon} alt="Book" />
                  </div>
                  <div class="reading-stats-icon-glow"></div>
                </div>
                <div class="reading-stats-card-title-group">
                  <div class="reading-stats-card-label">
                    <span class="reading-stats-card-label-text">Interactive Search</span>
                  </div>
                  <div class="reading-stats-card-value">
                    <span class="reading-stats-card-value-text">{searchStoriesCount} {searchStoriesCount === 1 ? 'Book' : 'Books'}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="reading-stats-card-divider"></div>
            <div class="reading-stats-stat-item">
              <div class="reading-stats-stat-icon">
                <img src={bookopen} alt="Book Open" />
              </div>
              <div class="reading-stats-stat-text">
                <span class="reading-stats-stat-label">Total reading time: </span>
                <span class="reading-stats-stat-value">{formatReadingTime(searchReadingTime)}</span>
              </div>
            </div>
            <div class="reading-stats-stat-item">
              <div class="reading-stats-stat-icon">
                <img src={starIcon} alt="Star" />
              </div>
              <div class="reading-stats-stat-text">
                <span class="reading-stats-stat-label">Average stars : </span>
                <span class="reading-stats-stat-value">{averageStars > 0 ? averageStars.toFixed(1) : '0'}/5</span>
              </div>
            </div>
            <div class="reading-stats-stat-item">
              <div class="reading-stats-stat-icon">
                <img src={starIcon} alt="Star" />
              </div>
              <div class="reading-stats-stat-text">
                <span class="reading-stats-stat-label">Average Hints : </span>
                <span class="reading-stats-stat-value">{averageHints > 0 ? averageHints.toFixed(1) : '0'} Per Scene</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/if}
      
      {#if activeMenu === "child-profiles"}
        <ChildProfilesView
          {handleAddChildren}
          {handleNewStory}
        />
      {/if}
      
      {#if activeMenu === "story-library"}
        <StoryLibraryView
          {stories}
          {loadingStories}
          {storiesError}
          {fetchStories}
          {childProfiles}
        />
      {/if}

      {#if activeMenu === "characters"}
        <CharacterLibraryView
          handleCharacterPreview={handleCharacterPreview}
        />
      {/if}
      
      {#if activeMenu === "gift-tracking"}
        <GiftTrackingComponent />
      {/if}
    </div>
  </div>
</div>
{/if}

{#if isMobile}
<MobileDashboardComponent />
{/if}

<!-- Character Details Modal -->
{#if showCharacterModal && selectedCharacter}
  <div
    class="modal-overlay"
    role="dialog"
    aria-modal="true"
    aria-labelledby="character-modal-title"
    on:click={handleCharacterModalClose}
    on:keydown={(e) => e.key === "Escape" && handleCharacterModalClose()}
    tabindex="-1"
  >
    <div 
      class="modal-container character-modal-container" 
      role="document"
      on:click|stopPropagation
    >
      <CharacterDetailsModal
        character={selectedCharacter}
        on:close={handleCharacterModalClose}
        on:useInNewBook={handleUseInNewBook}
        on:editCharacter={handleEditCharacter}
        on:deleteCharacter={handleDeleteCharacter}
        on:bookClick={handleBookClick}
      />
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 20px;
    box-sizing: border-box;
  }

  .modal-container {
    max-width: min(95vw, 1200px);
    max-height: min(95vh, 850px);
    min-width: 900px;
    width: auto;
    height: auto;
    overflow: visible;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }

  .character-modal-container {
    max-width: min(95vw, 800px);
    max-height: min(95vh, 900px);
  }

  /* Ensure modal is centered on all screen sizes */
  @media (max-width: 768px) {
    .modal-overlay {
      padding: 10px;
    }

    .modal-container {
      max-width: 98vw;
      max-height: 98vh;
    }
  }

  .logo-img {
    background-image: url("../../assets/logo.png");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    width: 100%;
    height: 100%;
  }

  .mainmenu_span {
    color: var(--Gray-gray-400, #90a1b9);
    font-size: 12px;
    font-family: Open Sauce One;
    font-weight: 500;
    text-transform: uppercase;
    line-height: 16.8px;
    letter-spacing: 1.2px;
    word-wrap: break-word;
  }

  .home_span {
    color: #727272;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
    transition: color 0.2s ease;
  }

  .parent-menu-dropdown.active .home_span {
    color: white;
    font-weight: 600;
  }

  .childprofiles_span {
    color: #727272;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
    transition: color 0.2s ease;
  }

  .parent-menu-dropdown_01.active .childprofiles_span {
    color: white;
    font-weight: 600;
  }

  .storylibrary_span {
    color: #727272;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
    transition: color 0.2s ease;
  }

  .parent-menu-dropdown_02.active .storylibrary_span {
    color: white;
    font-weight: 600;
  }

  .gifttracking_span {
    color: #727272;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
    transition: color 0.2s ease;
  }

  .parent-menu-dropdown_03.active .gifttracking_span {
    color: white;
    font-weight: 600;
  }

  .welcomeback_span {
    color: black;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28px;
    word-wrap: break-word;
  }

  .welcome-back {
    align-self: stretch;
  }

  .manageyourchildrensstoriesandgifts_span {
    color: #666d80;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .manage-your-childrens-stories-and-gifts {
    align-self: stretch;
  }

  .ellipse-7 {
    width: 40px;
    height: 40px;
    background: #d9d9d9;
    border-radius: 9999px;
  }

  .alexsmith_span {
    color: #121212;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .alex-smith {
    align-self: stretch;
  }

  .premiumplan_span {
    color: #727272;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .premium-plan {
    align-self: stretch;
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

  .title {
    width: 305px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: inline-flex;
  }

  .heading {
    width: 119px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 2px;
    display: inline-flex;
  }

  .logo-text-full {
    width: 131px;
    height: 24.48px;
    position: relative;
  }

  .icon-list {
    width: 24px;
    height: 24px;
    position: relative;
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
    opacity: 0.6;
    transition: opacity 0.2s ease, filter 0.2s ease;
  }

  .parent-menu-dropdown.active .house img {
    opacity: 1;
    filter: brightness(0) invert(1);
  }

  .baby {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .baby img {
    width: 100%;
    height: 100%;
    opacity: 0.6;
    transition: opacity 0.2s ease, filter 0.2s ease;
  }

  .parent-menu-dropdown_01.active .baby img {
    opacity: 1;
    filter: brightness(0) invert(1);
  }

  .bookopen {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .bookopen img {
    width: 100%;
    height: 100%;
    opacity: 0.6;
    transition: opacity 0.2s ease, filter 0.2s ease;
  }

  .parent-menu-dropdown_02.active .bookopen img {
    opacity: 1;
    filter: brightness(0) invert(1);
  }

  .gift {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .gift img {
    width: 100%;
    height: 100%;
    opacity: 0.6;
    transition: opacity 0.2s ease, filter 0.2s ease;
  }

  .parent-menu-dropdown_03.active .gift img {
    opacity: 1;
    filter: brightness(0) invert(1);
  }

  .caretdown {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .sidebarheader {
    width: 260px;
    height: 87px;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    background: var(--Color-Neutral-White, white);
    border-right: 1px var(--Color-Border-Default, #e2e8f0) solid;
    border-bottom: 1px var(--Color-Border-Default, #e2e8f0) solid;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
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

  .sidebarheader_01 {
    align-self: stretch;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    background: var(--Color-Neutral-White, white);
    border-right: 1px var(--Color-Border-Default, #e2e8f0) solid;
    border-bottom: 1px var(--Color-Border-Default, #e2e8f0) solid;
    justify-content: space-between;
    align-items: flex-end;
    display: inline-flex;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .parent-menu-dropdown {
    width: 236px;
    border-radius: 12px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    display: flex;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .parent-menu-dropdown.active {
    position: relative;
    background: #438BFF;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
  }

  .parent-menu-dropdown_01 {
    width: 236px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    display: flex;
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: 12px;
  }

  .parent-menu-dropdown_01.active {
    position: relative;
    background: #438BFF;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
  }

  .parent-menu-dropdown_02 {
    width: 236px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    display: flex;
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: 12px;
  }

  .parent-menu-dropdown_02.active {
    position: relative;
    background: #438BFF;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
  }

  .parent-menu-dropdown_03 {
    width: 236px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    display: flex;
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: 12px;
  }

  .parent-menu-dropdown_03.active {
    position: relative;
    background: #438BFF;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
  }

  .ellipse-1415 {
    width: 248px;
    height: 114px;
    left: -6px;
    top: 15px;
    position: absolute;
    background: radial-gradient(ellipse 42.11% 42.11% at 50.00% 52.94%, white 0%, rgba(255, 255, 255, 0) 100%);
    border-radius: 9999px;
    pointer-events: none;
  }

  .sidebarpenaksir-kasir {
    width: 100%;
    height: 91px;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    display: flex;
  }

  .menu {
    width: 260px;
    padding: 12px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 10px;
    display: flex;
  }

  .content {
    width: 260px;
    height: 927px;
    padding-top: 16px;
    padding-bottom: 16px;
    background: var(--White-bg-white, white);
    overflow: hidden;
    border-right: 1px var(--Gray-stk-gray-200, #e2e8f0) solid;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: flex;
  }

  .navigation {
    height: 1024px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    display: inline-flex;
  }

  .sidebar {
    width: 100%;
    padding: 24px;
    background: #f8fafb;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: flex;
  }

  .frame-1410104150_02 {
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    display: inline-flex;
    width: 100%;
  }

  .parent-dashboard {
    width: 100%;
    height: 100%;
    background: white;
    overflow: hidden;
    justify-content: flex-start;
    align-items: flex-start;
    display: inline-flex;
  }

  /* Mobile responsive styles */
  @media (max-width: 800px) {
    .parent-dashboard {
      flex-direction: column;
    }

    .navigation {
      display: block;
      height: auto;
      width: 100%;
    }

    .sidebarheader {
      display: flex;
      width: 100%;
      height: auto;
      padding-left: 20px;
      padding-right: 20px;
      padding-top: 24px;
      padding-bottom: 24px;
      border-right: none;
      border-bottom: 1px var(--Color-Border-Default, #e2e8f0) solid;
    }

    .content {
      display: none;
    }

    .sidebar {
      width: 100%;
      padding: 0px;
      gap: 16px;
    }

    .sidebarheader_01 {
      padding-left: 16px;
      padding-right: 16px;
      padding-top: 12px;
      padding-bottom: 12px;
    }

    .title {
      width: 100%;
    }

    .welcomeback_span {
      font-size: 24px;
      line-height: 33.6px;
      text-align: center;
    }

    .manageyourchildrensstoriesandgifts_span {
      font-size: 16px;
      line-height: 22.4px;
      text-align: center;
    }

    .heading {
      width: auto;
    }

    .alexsmith_span {
      font-size: 16px;
      line-height: 22.4px;
    }

    .premiumplan_span {
      font-size: 12px;
      line-height: 16.8px;
    }

    .ellipse-7 {
      width: 32px;
      height: 32px;
    }
    .icon-list {
      cursor: pointer;
    }
  }

  /* Mobile Menu Styles */
  .mobile-menu-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    z-index: 1000;
  }

  .mobile-menu {
    width: 100%;
    height: 100%;
    background: white;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .mobile-menu-header {
    padding: 24px 20px;
    border-bottom: 1px var(--Color-Border-Default, #e2e8f0) solid;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
  }

  .mobile-header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .close-menu {
    width: 24px;
    height: 24px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .mobile-menu-content {
    padding: 24px 20px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .mobile-menu-footer {
    padding: 20px;
    background: white;
  }

  .mobile-profile-close {
    width: 100%;
    padding-left: 12px;
    padding-right: 12px;
    padding-top: 4px;
    padding-bottom: 4px;
    background: #fcfcfc;
    border-radius: 12px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .mobile-menu-label {
    padding-left: 4px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .mobile-menu-items {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .mobile-menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .mobile-menu-item:hover {
    background-color: #f8fafb;
  }

  .mobile-menu-item.active {
    background-color: #eef6ff;
  }

  .mobile-menu-icon {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @media (min-width: 801px) {
    .mobile-menu-overlay {
      display: none;
    }
  }

  .ellipse-1415 {
    width: 248px;
    height: 114px;
    left: -49px;
    top: 20px;
    position: absolute;
    background: radial-gradient(
      ellipse 42.11% 42.11% at 50% 52.94%,
      white 0%,
      rgba(255, 255, 255, 0) 100%
    );
    border-radius: 9999px;
  }

  .caretdown {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }


  .fstorycreditsleft_span {
    color: #438bff;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 500;
    word-wrap: break-word;
  }

  .books {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
  }

  .frame-2147227644 {
    padding: 8px;
    background: white;
    border-radius: 4px;
    outline: 1px #438bff solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .chips {
    width: 100%;
    height: 100%;
    padding-top: 4px;
    padding-bottom: 4px;
    padding-left: 4px;
    padding-right: 10px;
    background: #eef6ff;
    border-radius: 8px;
    outline: 1px #438bff solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: inline-flex;
  }

  /* Reading Stats Component Styles */
  .reading-stats-title-text {
    color: black;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 33.60px;
    word-wrap: break-word;
  }

  .reading-stats-title {
    text-align: center;
  }

  .reading-stats-divider {
    align-self: stretch;
    height: 1px;
    background: #EDEDED;
  }

  .reading-stats-book-icon {
    width: 32px;
    height: 32px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .reading-stats-book-icon img {
    width: 100%;
    filter: brightness(0) invert(1);
  }

  .reading-stats-icon-glow {
    width: 248px;
    height: 114px;
    left: -96px;
    top: 15px;
    position: absolute;
    background: radial-gradient(ellipse 42.11% 42.11% at 50.00% 52.94%, white 0%, rgba(255, 255, 255, 0) 100%);
    border-radius: 9999px;
    pointer-events: none;
  }

  .reading-stats-card-label-text {
    color: #727272;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .reading-stats-card-label {
    align-self: stretch;
  }

  .reading-stats-card-value-text {
    color: #141414;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.60px;
    word-wrap: break-word;
  }

  .reading-stats-card-value {
    align-self: stretch;
  }

  .reading-stats-card-divider {
    align-self: stretch;
    height: 1px;
    background: #EDEDED;
  }

  .reading-stats-stat-icon {
    width: 32px;
    height: 32px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .reading-stats-stat-icon img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  /* BookOpen icon should be gray */
  .reading-stats-stat-item .reading-stats-stat-icon img[alt="Book Open"] {
    width: 28px;
    height: 24px;
    filter: brightness(0) saturate(100%) invert(43%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(90%) contrast(89%);
  }

  /* Speaker icon should be gray */
  .reading-stats-stat-item .reading-stats-stat-icon img[alt="Audio"] {
    width: 26px;
    height: 28px;
    filter: brightness(0) saturate(100%) invert(43%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(90%) contrast(89%);
  }

  /* Star icon should be gray */
  .reading-stats-stat-item .reading-stats-stat-icon img[alt="Star"] {
    width: 28px;
    height: 27px;
    filter: brightness(0) saturate(100%) invert(43%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(90%) contrast(89%);
  }

  .reading-stats-stat-label {
    color: #727272;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 33.60px;
    word-wrap: break-word;
  }

  .reading-stats-stat-value {
    color: #141414;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 33.60px;
    word-wrap: break-word;
  }

  .reading-stats-stat-text {
    text-align: center;
  }

  .reading-stats-card-title-group {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    display: inline-flex;
  }

  .reading-stats-icon-wrapper {
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .reading-stats-icon-bg {
    width: 56px;
    height: 56px;
    padding: 7px;
    position: relative;
    background: #438BFF;
    overflow: hidden;
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .reading-stats-stat-item {
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .reading-stats-title-section {
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
  }

  .reading-stats-header-wrapper {
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 24px;
    display: inline-flex;
  }

  .reading-stats-header-section {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: flex;
  }

  .reading-stats-card-header {
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .reading-stats-card-story {
    flex: 1 1 0;
    height: 231px;
    padding: 12px;
    border-radius: 12px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
  }

  .reading-stats-card-search {
    flex: 1 1 0;
    padding: 12px;
    border-radius: 12px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
  }

  .reading-stats-cards {
    align-self: stretch;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
  }

  .reading-stats-container {
    width: 100%;
    height: 100%;
    padding: 32px;
    background: white;
    border-radius: 8px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 24px;
    display: inline-flex;
  }

</style>
