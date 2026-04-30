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
  import { formatDate } from "$lib/dateUtils";

  let libraryView: "all" | "characters" | "children" = "all";
  const setLibraryView = (v: "all" | "characters" | "children") =>
    (libraryView = v);

  let activeMenu: "home" | "story-library" | "characters" | "child-profiles" | "gift-tracking" = "home";

  function handleMenuClick(menu: "home" | "story-library" | "characters" | "child-profiles" | "gift-tracking") {
    activeMenu = menu;
  }

  let showMobileMenu = false;
  let sidebarCollapsed = false;
  const toggleSidebarCollapsed = () => {
    sidebarCollapsed = !sidebarCollapsed;
  };
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
  let showGiftSelectModal = false;
  let homeCategory: string | null = "AllBooks";
  let showCharacterModal = false;
  let selectedCharacter: any = null;
  let characterBooks: any[] = [];
  let subscriptionStatus: string = "Premium Plan";
  let storyCredits: number | null = null;
  
  let adventureStoriesCount: number = 0;
  let searchStoriesCount: number = 0;
  let adventureReadingTime: number = 0;
  let searchReadingTime: number = 0;
  let audioListenedCount: number = 0;
  let averageStars: number = 0;
  let averageHints: number = 0;
  
  let isMobile = false;
  
  const checkScreenSize = () => {
    if (browser) {
      isMobile = window.innerWidth <= 800;
    }
  };

  let selectedFormat: string = "all";
  let selectedChild: string = "all";
  let selectedStatus: string = "all";

  $: formatOptions = [
    { value: "all", label: "All Formats" },
    { value: "story_adventure", label: "Story Adventure Mode" },
    { value: "interactive_search", label: "Interactive Search Mode" },
  ];

  $: childrenOptions = [
    { value: "all", label: "All Children" },
    ...childProfiles.map((child) => ({
      value: child.id,
      label: child.name || child.first_name,
    })),
  ];

  $: statusOptions = [
    { value: "all", label: "All Status" },
    { value: "completed", label: "Completed" },
    { value: "drafting", label: "Drafting" },
    { value: "generating", label: "Generating" },
    { value: "failed", label: "Failed" },
  ];

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

  const getRandomStoryTheme = () => {
    return storyThemes[Math.floor(Math.random() * storyThemes.length)];
  };

  const formatAgeLabel = (ageGroup: string) => {
    return `${ageGroup} Years Old`;
  };

  const formatSubscriptionStatus = (status: string | null | undefined): string => {
    if (!status) return "Free Plan";
    
    const statusMap: { [key: string]: string } = {
      'premium': 'Premium Plan',
      'free': 'Free Plan',
      'trial': 'Trial Plan',
      'basic': 'Basic Plan'
    };
    
    const normalizedStatus = status.toLowerCase();
    return statusMap[normalizedStatus] || status.charAt(0).toUpperCase() + status.slice(1) + ' Plan';
  };

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
        
        if (profile?.credit !== undefined && profile?.credit !== null) {
          const creditValue = typeof profile.credit === 'string' 
            ? parseInt(profile.credit, 10) 
            : profile.credit;
          storyCredits = isNaN(creditValue) ? 0 : creditValue;
        } else {
          storyCredits = 0;
        }
      }
    } catch (error) {
      console.error("Error fetching subscription status:", error);
      subscriptionStatus = "Free Plan";
      storyCredits = 0;
    }
  };

  const formatStoriesCreatedText = (firstName: string, ageGroup: string) => {
    return `${firstName} (Age ${ageGroup})`;
  };

  const fetchStoriesDirectly = async (userId: string) => {
    try {
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
      
      const { data: storiesData, error: storiesError } = await supabase
        .from('stories')
        .select('*')
        .in('child_profile_id', childProfileIds)
        .eq('user_id', userId)
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

  const fetchStories = async (userId: string) => {
    try {
      if (!userId || typeof userId !== 'string' || userId.trim() === '' || userId === 'undefined' || userId === 'null') {
        console.error('[Dashboard] Invalid userId:', userId);
        storiesError = 'Invalid user ID';
        loadingStories = false;
        return;
      }
      
      loadingStories = true;
      storiesError = "";
      
      stories = [];
      rawStories = [];
      characters = [];

      console.log('[Dashboard] Fetching stories from Supabase for user:', userId);
      
      const directStories = await fetchStoriesDirectly(userId);
      console.log('[Dashboard] Direct query returned:', directStories.length, 'stories');
      
      const result = await getAllStoriesForParent(userId);
      
      console.log('[Dashboard] getAllStoriesForParent response:', {
        success: result.success,
        dataCount: result.data,
        error: result.error
      });

      if (result.success && result.data) {
        const storiesData = Array.isArray(result.data) ? result.data : [];
        
        console.log('[Dashboard] Stories from Supabase:', storiesData.length, 'stories');
        console.log('[Dashboard] Stories data:', storiesData);
        
        rawStories = storiesData;
        
        stories = storiesData
          .map(
            (story: Story & { child_profiles?: any, user_name?: string, uid?: string }, index: number) => ({
              id: story.id || `temp_story_${index}_${Date.now()}`,
              title: story.story_title || `${story.character_name}'s Adventure`,
              author: story.child_profiles?.first_name || "Unknown",
              status: story.status || "completed",
              story_cover: story.story_cover,
              createdDate: formatDate(story.created_at) || "Unknown",
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
              child_profile_id: story.child_profile_id,
              child_profiles: story.child_profiles,
              adventure_type: story.adventure_type,
              scene_images: story.scene_images,
              story_content: story.story_content,
              story_type: story.story_type,
              uid: story.uid,
              purchased: story.purchased === true
            }),
          )
          .filter((story) => story.id);

        console.log('[Dashboard] Transformed stories for display:', stories.length, 'stories');

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

  const extractCharacters = (storiesData: any[]) => {
    const characterMap = new Map();
    const characterBookCounts = new Map();
    let characterIdCounter = 1;
    
    storiesData.forEach((story: Story & { child_profiles?: any }) => {
      if (story.character_name) {
        const key = story.character_name.toLowerCase();
        
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
            booksCount: 0,
          });
        }
      }
    });

    characters = Array.from(characterMap.values())
      .map((char) => ({
        ...char,
        booksCount: characterBookCounts.get(char.character_name.toLowerCase()) || 0,
      }))
      .filter((char) => char.id);
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
          ageGroup: gift.age_group,
          status: gift.status,
          giftFrom: gift.relationship,
          occasion: gift.occasion,
          expectedDelivery: formatDate(gift.delivery_time) || "Unknown",
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

  const handleCharacterPreview = (event: CustomEvent) => {
    const character = event.detail;
    selectedCharacter = character;
    
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

  const handleCharacterModalClose = () => {
    showCharacterModal = false;
    selectedCharacter = null;
    characterBooks = [];
  };

  const handleUseInNewBook = (event: CustomEvent) => {
    const character = event.detail;
    handleCharacterModalClose();
    console.log("Use in new book:", character);
  };

  const handleEditCharacter = (event: CustomEvent) => {
    const character = event.detail;
    handleCharacterModalClose();
    console.log("Edit character:", character);
  };

  const handleDeleteCharacter = async (event: CustomEvent) => {
    const character = event.detail;
    
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
    console.log("Book clicked:", book);
  };

  

  let lastFetchedUserId: string | null = null;

  $: if (browser && $user && $user.id && $user.id !== lastFetchedUserId) {
    lastFetchedUserId = $user.id;
    fetchSubscriptionStatus($user.id);
  }

  onMount(() => {
    if (browser) {
      sessionStorage.clear();
    }
    
    checkScreenSize();
    
    if ($user && $user.id) {
      fetchSubscriptionStatus($user.id);
    }

    return () => {
      if (browser) {
        window.removeEventListener('resize', checkScreenSize);
      }
    };
  });

  const handleAddChildren = () => {
    goto("/create-child-profile");
  };

  const handleNewStory = (event: CustomEvent) => {
    const childName = event.detail.name;
    const childItem = event.detail.item;

    const selectedChild = childProfiles.find(
      (child) => (child.name === childName || child.first_name === childName),
    ) || childItem;

    if (selectedChild && browser) {
      const childId = selectedChild.id?.toString() || '';
      const childDisplayName = selectedChild.first_name || selectedChild.name || childName;
      
      sessionStorage.setItem("selectedChildProfileId", childId);
      sessionStorage.setItem("selectedChildProfileName", childDisplayName);
      
      storyCreation.setSelectedChild(childId, childDisplayName);
    }
    
    goto("/create-character/1");
  };


    async function sendTestEmail(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement; }) {
      const response = await fetch('https://image-edit-five.vercel.app/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        to: "noahigh293@gmail.com",
        subject: "Test Email",
        body: "Go!!!!"
      })
    });
    }
</script>

{#if !isMobile}
<div class="parent-dashboard">
  <div class="navigation">
    <div class="sidebarheader" class:collapsed={sidebarCollapsed}>
      <div class="logo-text-full">
        <div class="logo-img"></div>
      </div>
      <div
        data-weight="Regular"
        class="icon-list"
        on:click={toggleSidebarCollapsed}
        on:keydown={(e) => e.key === "Enter" && toggleSidebarCollapsed()}
        role="button"
        tabindex="0"
        title={sidebarCollapsed ? "Expand sidebar" : "Minimize sidebar"}
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Minimize sidebar"}
      >
        <img
          src={list}
          alt={sidebarCollapsed ? "Expand sidebar" : "Minimize sidebar"}
          class="list"
        />
      </div>
    </div>
    <div class="content" class:collapsed={sidebarCollapsed}>
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
          <AccountDropdown />
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
              <span class="fstorycreditsleft_span">
                {storyCredits !== null ? `${storyCredits} story credit${storyCredits !== 1 ? 's' : ''} left` : 'Loading...'}
              </span>
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
      on:keydown={() => {}}
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
    background-image: url("../../assets/logo.webp");
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
    transition: width 0.2s ease, padding 0.2s ease;
  }

  .sidebarheader.collapsed {
    width: 72px;
    padding-left: 12px;
    padding-right: 12px;
    justify-content: center;
  }

  .sidebarheader.collapsed .logo-text-full {
    display: none;
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
    transition: width 0.2s ease, padding 0.2s ease;
  }

  .content.collapsed {
    width: 72px;
    padding-left: 12px;
    padding-right: 12px;
    align-items: center;
  }

  .content.collapsed .sidebargrouping-label {
    display: none;
  }

  .content.collapsed .menu {
    width: 100%;
    align-items: center;
    padding: 0;
  }

  .content.collapsed .parent-menu-dropdown,
  .content.collapsed .parent-menu-dropdown_01,
  .content.collapsed .parent-menu-dropdown_02,
  .content.collapsed .parent-menu-dropdown_03 {
    width: 48px;
    min-width: 48px;
    justify-content: center;
    align-items: center;
  }

  .content.collapsed .sidebar-menu-parent,
  .content.collapsed .sidebar-menu-parent_01,
  .content.collapsed .sidebar-menu-parent_02,
  .content.collapsed .sidebar-menu-parent_03 {
    justify-content: center;
    padding: 12px;
  }

  .content.collapsed .title-icon,
  .content.collapsed .title-icon_01,
  .content.collapsed .title-icon_02,
  .content.collapsed .title-icon_03 {
    justify-content: center;
    gap: 0;
  }

  .content.collapsed .home_span,
  .content.collapsed .storylibrary_span,
  .content.collapsed .childprofiles_span,
  .content.collapsed .gifttracking_span {
    display: none;
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

    .icon-list {
      cursor: pointer;
    }
  }

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

  .reading-stats-stat-item .reading-stats-stat-icon img[alt="Book Open"] {
    width: 28px;
    height: 24px;
    filter: brightness(0) saturate(100%) invert(43%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(90%) contrast(89%);
  }

  .reading-stats-stat-item .reading-stats-stat-icon img[alt="Audio"] {
    width: 26px;
    height: 28px;
    filter: brightness(0) saturate(100%) invert(43%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(90%) contrast(89%);
  }

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
