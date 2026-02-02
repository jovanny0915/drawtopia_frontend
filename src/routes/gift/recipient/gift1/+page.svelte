<script lang="ts">
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import { onMount } from "svelte";
  import { page } from "$app/stores";

  import logo from "../../../../assets/logo.png";
  import CalendarBlank from "../../../../assets/CalendarBlank.svg";

  import { giftCreation } from "../../../../lib/stores/giftCreation";
  import { getGiftById, type Gift } from "../../../../lib/database/gifts";
  import { getStoryById, createStory, type Story } from "../../../../lib/database/stories";
  import {
    user,
    authLoading,
    isAuthenticated,
  } from "../../../../lib/stores/auth";

  let giftState: any = {};
  let giftData: Gift | any = null; // Use any to access gift_type and story_id from Supabase
  let gifterName = "Grandma"; // Default or get from store/params
  let recipientName = "";
  let recipientAge = "";
  let occasion = "";
  let giftMessage = "";
  let loadingGift = false;
  let giftType: string | null = null;
  let storyId: string | null = null;

  // Reactive statements for auth state
  $: currentUser = $user;
  $: loading = $authLoading;
  $: authenticated = $isAuthenticated;
  $: safeToRedirect = browser && !loading && currentUser !== undefined;
  
  // Get giftId from URL query params
  $: giftId = $page.url.searchParams.get('giftId');

  // Load gift data from database if giftId is provided
  onMount(() => {
    // First try to load from URL parameter (from notification click)
    if (giftId) {
      const currentGiftId = giftId; // Store in const to satisfy TypeScript
      async function loadGift() {
        loadingGift = true;
        try {
          const result = await getGiftById(currentGiftId);
          if (result.success && result.data) {
            giftData = result.data;
            // Populate fields from gift data
            recipientName = giftData.child_name || "Emma";
            recipientAge = giftData.age_group ? getAgeFromRange(giftData.age_group) : "7";
            occasion = giftData.occasion || "Birthday";
            giftMessage = giftData.special_msg || "";
            
            // Extract gift_type and story_id from Supabase data
            giftType = giftData.gift_type || null;
            storyId = giftData.story_id || null;
            
            // TODO: Fetch sender's name from user profile using giftData.from_user_id
            // For now, use relationship or default
            gifterName = giftData.relationship || "Someone";
          }
        } catch (err) {
          console.error('Error loading gift:', err);
        } finally {
          loadingGift = false;
        }
      }
      loadGift();
    } else {
      // Fallback to store if no giftId
      const unsubscribe = giftCreation.subscribe((state) => {
        giftState = state;
        recipientName = state.childName || "Emma";
        recipientAge = state.ageGroup ? getAgeFromRange(state.ageGroup) : "7";
        occasion = state.occasion || "Birthday";
        giftMessage = state.specialMsg || "";
      });

      return unsubscribe;
    }
  });

  // Helper to convert age range to a single age for display
  function getAgeFromRange(ageRange: string): string {
    // Extract middle age from range like "3-6" -> "4" or "7-10" -> "8"
    const match = ageRange.match(/(\d+)-(\d+)/);
    if (match) {
      const min = parseInt(match[1]);
      const max = parseInt(match[2]);
      return Math.floor((min + max) / 2).toString();
    }
    // Handle single ages like "11-12" -> "11"
    return ageRange.split("-")[0] || "7";
  }

  // Reactive button text based on gift_type
  $: buttonText = giftType === "story" ? "View The Gift Story" : "Start Creating The Gift";

  const handleStartCreating = async () => {
    if (giftType === "story" && storyId) {
      // Handle story gift: copy story for current user and navigate
      try {
        if (!currentUser?.id) {
          alert("Please log in to view the story");
          return;
        }

        // Get the story from database
        const storyResult = await getStoryById(storyId);
        if (!storyResult.success || !storyResult.data) {
          alert("Story not found");
          return;
        }

        const originalStory = Array.isArray(storyResult.data) ? storyResult.data[0] : storyResult.data;
        const storyType = originalStory.story_type || "story";

        // Handle audio_urls - database stores as audio_url (array)
        let audioUrls: (string | null)[] = [];
        if (originalStory.audio_url) {
          if (Array.isArray(originalStory.audio_url)) {
            audioUrls = originalStory.audio_url;
          } else if (typeof originalStory.audio_url === 'string') {
            try {
              audioUrls = JSON.parse(originalStory.audio_url);
            } catch {
              audioUrls = [];
            }
          }
        }

        // Copy story for current user
        // We need to get or use a child_profile_id for the current user
        // For now, we'll use the original child_profile_id or create a new one
        // In a real scenario, you might want to create a child profile or use an existing one
        const newStoryData: Story = {
          user_id: currentUser.id,
          child_profile_id: originalStory.child_profile_id, // Use original or create new
          character_id: originalStory.character_id,
          character_name: originalStory.character_name,
          character_type: originalStory.character_type,
          special_ability: originalStory.special_ability,
          character_style: originalStory.character_style,
          story_world: originalStory.story_world,
          adventure_type: originalStory.adventure_type,
          original_image_url: originalStory.original_image_url,
          enhanced_images: originalStory.enhanced_images || [],
          story_title: originalStory.story_title,
          story_cover: originalStory.story_cover,
          cover_design: originalStory.cover_design,
          story_content: originalStory.story_content,
          scene_images: originalStory.scene_images || [],
          audio_urls: audioUrls,
          dedication_text: originalStory.dedication_text,
          dedication_image: originalStory.dedication_image,
          status: originalStory.status || "completed",
          story_type: originalStory.story_type,
          hints: originalStory.hints,
          gift_id: giftId || undefined // Store the gift_id with the story
        };

        const createResult = await createStory(newStoryData);
        if (!createResult.success || !createResult.data) {
          alert("Failed to save story");
          return;
        }

        const newStoryId = createResult.data.uid || createResult.data.id;

        // Navigate based on story type
        if (storyType === "search") {
          goto(`/intersearch/1?storyId=${newStoryId}`);
        } else {
          goto(`/preview/default?storyId=${newStoryId}`);
        }
      } catch (error) {
        console.error("Error handling story gift:", error);
        alert("An error occurred while loading the story");
      }
    } else if (giftType === "link") {
      // Handle link gift: navigate to character creation with gift_mode so story is marked as purchased
      if (browser) sessionStorage.setItem('gift_mode', 'create');
      goto("/create-character/1");
    } else {
      // Default behavior (fallback)
      if (browser) sessionStorage.setItem('gift_mode', 'create');
      goto("/create-character/1");
    }
  };
</script>

<div class="gift-redemption-page">
  <div class="header">
    <div class="logo">
      <div class="logo-img"></div>
    </div>
  </div>

  <div class="main-content">
    <h1 class="title">You Have a Gift from {gifterName}!</h1>

    <p class="subtitle">
      A little surprise is waiting for you. Click the link below to create their
      magical adventure together!
    </p>

    <!-- Gift Card Preview -->
    <div class="card-container">
      <div class="gift-card-container">
        <div class="gift-card-bg">
          <div class="gift-card-message">
            {giftMessage ||
              "This is Present Give\nto you, i hope you like\nit, thank you emma.\n\n- Love, Grandma"}
          </div>
        </div>
      </div>

      <!-- Gift Details -->
      <div class="gift-details">
        <div class="details-label">Create a personalized storybook for:</div>
        <div class="recipient-info">
          <span class="recipient-name">{recipientName}, age {recipientAge}</span
          >
        </div>
        <div class="occasion-info">
          Occasion: <span class="occasion-value">{occasion}</span>
        </div>
      </div>

      <!-- Call to Action -->
      <button class="start-button" on:click={handleStartCreating}>
        <svg
          class="heart-icon"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            fill="white"
          />
        </svg>
        {buttonText}
      </button>

      <!-- Expiration Notice -->
      <div class="expiration-notice">
        <img src={CalendarBlank} alt="calendar" class="calendar-icon" />
        <span>This gift link expires in 30 days.</span>
      </div>
    </div>
  </div>
</div>

<style>
  .gift-redemption-page {
    margin: auto;
    width: 1240px;
    min-height: 100vh;
    padding: 24px 100px 80px;
    background: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 32px;
  }

  .header {
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 20px 0;
  }

  .logo {
    width: 203.32px;
    height: 38px;
    position: relative;
  }

  .logo-img {
    background-image: url("../../../../assets/logo.png");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    width: 100%;
    height: 100%;
  }

  .main-content {
    width: 100%;
    min-height: 1194.728515625px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    text-align: center;
  }

  .title {
    font-family: Quicksand;
    font-weight: 700;
    font-size: 42px;
    line-height: 56px;
    margin: 0;
    color: #121212;
  }

  .subtitle {
    font-family: Nunito;
    font-size: 18px;
    line-height: 26px;
    color: #666d80;
    margin: 0;
  }

  .card-container {
    width: 730px;
    min-height: 1194.728515625px;
    outline: 1px #dfd8d8 solid;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .gift-card-container {
    width: 100%;
    max-width: 698px;
    max-height: 1046.728515625px;
    border-radius: 20px;
    border: 1px #dfd8d8 solid;
    padding: 8px;
    margin-top: 12px;
  }

  .gift-card-bg {
    position: relative;
    padding: 70px 40px 40px;
    border-radius: 20px;
    max-height: 880.7284545898438px;
    max-width: 682px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #d4ede8;
    background-image: url("../../../../assets/giftpackage1.png");
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }

  .gift-card-message {
    font-family: "Comic Sans MS", "Marker Felt", "Kalam", cursive;
    font-size: 32px;
    font-weight: 700;
    line-height: 1.8;
    color: #722603;
    text-align: center;
    white-space: pre-wrap;
    align-content: center;
    width: 100%;
    height: 880.7284545898438px;
  }

  .gift-details {
    background: white;
    border-radius: 20px;
    outline: 1px #dcdcdc solid;
    padding: 24px;
    width: 100%;
    max-width: 698px;
    text-align: left;
  }

  .details-label {
    font-family: Nunito;
    font-size: 14px;
    color: #666d80;
    margin-bottom: 8px;
  }

  .recipient-info {
    margin-bottom: 8px;
  }

  .recipient-name {
    font-family: Quicksand;
    font-weight: 600;
    font-size: 24px;
    color: #121212;
  }

  .occasion-info {
    font-family: Nunito;
    font-size: 16px;
    color: #666d80;
  }

  .occasion-value {
    font-weight: 600;
    color: #121212;
  }

  .start-button {
    width: 698px;
    height: 64px;
    padding: 16px 32px;
    background: #438bff;
    border: none;
    border-radius: 20px;
    color: white;
    font-family: Quicksand;
    font-weight: 600;
    font-size: 18px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(67, 139, 255, 0.3);
  }

  .start-button:hover {
    background: #3a7ae4;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(67, 139, 255, 0.4);
  }

  .heart-icon {
    width: 20px;
    height: 20px;
  }

  .expiration-notice {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-family: Nunito;
    font-size: 14px;
    color: #666d80;
    margin-top: 8px;
  }

  .calendar-icon {
    width: 16px;
    height: 16px;
  }

  @media (max-width: 800px) {
    .gift-redemption-page {
      padding: 16px;
      gap: 24px;
    }

    .title {
      font-size: 32px;
      line-height: 44px;
    }

    .subtitle {
      font-size: 16px;
    }

    .gift-card-container {
      max-width: 100%;
    }

    .gift-card-bg {
      padding: 60px 30px 30px;
      min-height: 400px;
    }

    .gift-card-message {
      font-size: 20px;
    }

    .gift-details {
      padding: 20px;
    }

    .recipient-name {
      font-size: 20px;
    }

    .start-button {
      width: 100%;
      padding: 14px 24px;
      font-size: 16px;
    }
  }
</style>
