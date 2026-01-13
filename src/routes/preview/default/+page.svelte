<script lang="ts">
  import { goto, beforeNavigate } from "$app/navigation";
  import { browser } from "$app/environment";
  import { onMount, onDestroy } from "svelte";
  import { page } from "$app/stores";
  import share from "../../../assets/Share.svg";
  import DotsThreeOutline from "../../../assets/DotsThreeOutline.svg";
  import CornersOut from "../../../assets/CornersOut.svg";
  import Book from "../../../assets/Book.svg";
  import EnvelopeSimple from "../../../assets/EnvelopeSimple.svg";
  import LockKey from "../../../assets/LockKey.svg";
  import ArrowLeft from "../../../assets/ArrowLeft.svg";
  import ArrowRight from "../../../assets/ArrowRight-white.svg";
  import SpeakerSimpleHigh from "../../../assets/SpeakerSimpleHigh.svg";
  import Play from "../../../assets/Play.svg";
  import CaretDown from "../../../assets/CaretDown.svg";
  import dedicationLeft from "../../../assets/dedicationleft.png";
  import MobileBackBtn from "../../../components/MobileBackBtn.svelte";
  import ShareStoryModal from "../../../components/ShareStoryModal.svelte";
  import StoryInfoModal from "../../../components/StoryInfoModal.svelte";
  import StoryPreviewEnd from "../../../components/StoryPreviewEnd.svelte";
  import PreviewLockModal from "../../../components/PreviewLockModal.svelte";
  import { user } from "../../../lib/stores/auth";
  import { getUserProfile } from "../../../lib/auth";
  import { getStoryById, updateReadingState } from "../../../lib/database/stories";

  let showStoryInfoModal = false;
  let showShareStoryModal = false;
  let showStoryPreviewEndModal = false;
  let showPreviewLockModal = false;
  
  let storyScenes: string | any[] = [];
  let storyPages: Array<{ pageNumber: number; text: string }> = [];
  let currentSceneIndex = 0;
  const totalScenes = 5;
  let viewMode: 'one-page' | 'two-page' = 'two-page'; // Default to two-page view
  let isFullscreen = false;
  let currentSubPage: 'left' | 'right' = 'left'; // Track which sub-page to show in one-page mode
  
  let storyTitle = "Luna's Adventure";
  let pagesRead = 0;
  let readingTime = "0:00";
  let audioListened = "0 min";
  let isFreePlan = true; // Default to free plan for safety
  let isPurchased = false; // Whether the current story has been purchased
  let currentStoryId: string | null = null; // Current story ID
  let isLoading = true;
  let loadError = "";
  let pageCounterText = ""; // Page counter display text
  let currentPageText = ""; // Current page text content

  // Dedication data
  let dedicationText = '';
  let dedicationImage = '';
  let hasDedication = false;

  // Audio playback state
  let audioUrls: string[] = []; // Array of audio URLs from database
  let currentAudio: HTMLAudioElement | null = null;
  let isPlaying = false;
  let audioProgress = 0; // 0-100 percentage
  let currentTime = 0; // Current time in seconds
  let duration = 0; // Total duration in seconds
  let audioSpeed = 1; // Playback speed
  let isAudioAvailable = false; // Whether audio exists for current page

  // Reading time tracking
  let readingStartTime: number = 0; // Timestamp when reading started
  let totalReadingTime: number = 0; // Total time spent reading in seconds
  let readingTimerInterval: number | null = null; // Interval ID for the timer
  let hasAudioBeenPlayed: boolean = false; // Track if audio has been played

  // Reactive statement to check subscription status when user changes
  $: if (browser && $user) {
    checkSubscriptionStatus();
  }

  // Function to check if user is on free plan
  const checkSubscriptionStatus = async () => {
    if (!browser) return;
    
    const currentUser = $user;
    if (!currentUser) {
      // If no user, default to free plan (show lock modal)
      isFreePlan = true;
      return;
    }

    try {
      const result = await getUserProfile(currentUser.id);
      if (result.success && result.profile) {
        const profile = Array.isArray(result.profile) ? result.profile[0] : result.profile;
        const subscriptionStatus = profile?.subscription_status;
        
        // Normalize subscription status to check if it's free plan
        if (!subscriptionStatus) {
          isFreePlan = true;
        } else {
          const normalizedStatus = subscriptionStatus.toLowerCase().trim();
          // Check if it's free plan (could be 'free', 'free plan', null, etc.)
          isFreePlan = normalizedStatus === 'free' || normalizedStatus === 'free plan' || normalizedStatus === '';
        }
      } else {
        // If we can't fetch profile, default to free plan
        isFreePlan = true;
      }
    } catch (error) {
      console.error("Error fetching subscription status:", error);
      // On error, default to free plan (safer to show lock modal)
      isFreePlan = true;
    }
  };

  // Load story data from database
  onMount(async () => {
    if (browser) {
      // Check subscription status first
      checkSubscriptionStatus();
      
      // Get story ID from URL query params
      const storyId = $page.url.searchParams.get('storyId');
      
      if (!storyId) {
        loadError = "No story ID provided";
        isLoading = false;
        console.error("No story ID found in URL");
        return;
      }
      
      try {
        // Store current story ID
        currentStoryId = storyId;
        
        // Fetch story from database
        const result = await getStoryById(storyId);
        
        if (!result.success || !result.data) {
          loadError = result.error || "Failed to load story";
          isLoading = false;
          console.error("Failed to fetch story:", result.error);
          return;
        }
        
        const story = result.data;
        console.log("Loaded story:", story);
        
        // Set story title
        storyTitle = story[0].story_title;
        
        // Check if story has been purchased
        // Ensure we properly check the purchased field from the database
        const storyData = Array.isArray(story) ? story[0] : story;
        isPurchased = storyData?.purchased === true;
        console.log("[preview] Story purchased status:", isPurchased);
        console.log("[preview] Story ID:", currentStoryId);
        console.log("[preview] Story data purchased field:", storyData?.purchased);
        
        // Load audio URLs from database (audio_url field)
        if (storyData?.audio_url) {
          if (Array.isArray(storyData.audio_url)) {
            audioUrls = storyData.audio_url;
          } else if (typeof storyData.audio_url === 'string') {
            try {
              audioUrls = JSON.parse(storyData.audio_url);
            } catch {
              audioUrls = [];
            }
          }
          console.log("[preview] Loaded audio URLs:", audioUrls.length);
        }
        
        // Build storyScenes array: [cover, scene1, scene2, ...]
        const loadedScenes: string[] = [];
        
        // Load story content/pages and extract scene images
        if (story[0].story_content) {
          try {
            // Parse story_content if it's a string
            const content = typeof story[0].story_content === 'string' 
              ? JSON.parse(story[0].story_content) 
              : story[0].story_content;
            
            console.log('[preview] Parsed story content:', content);
            
            // First, add the story cover if available
            const coverUrl = story[0].story_cover || content.cover;
            if (coverUrl) {
              loadedScenes.push(coverUrl.split("?")[0]);
              console.log('[preview] Added story cover:', coverUrl);
            }
            
            // Check for dedication and insert after cover if it exists
            if (story[0].dedication_text || story[0].dedication_image) {
              dedicationText = story[0].dedication_text || '';
              dedicationImage = story[0].dedication_image ? story[0].dedication_image.split("?")[0] : '';
              hasDedication = true;
              
              // Insert dedication scene after cover (at index 1)
              // We'll use a special marker for dedication
              if (loadedScenes.length > 0) {
                loadedScenes.splice(1, 0, 'DEDICATION_PAGE');
                console.log('[preview] Added dedication page after cover');
              }
            }
            
            // Handle different content formats
            if (Array.isArray(content)) {
              // If it's an array of pages
              storyPages = content.map((page: any, index: number) => ({
                pageNumber: page.pageNumber || index + 1,
                text: page.text || page.content || ""
              }));
              
              // Extract scene images from pages
              const scenesFromPages = content
                .map((page: any) => page.sceneImage || page.scene || page.imageUrl || page.image_url || page.image)
                .filter((url: string | undefined): url is string => !!url);
              
              if (scenesFromPages.length > 0) {
                loadedScenes.push(...scenesFromPages.map((url: string) => url.split("?")[0]));
                console.log('[preview] Loaded scene images from pages:', scenesFromPages);
              }
            } else if (content.pages && Array.isArray(content.pages)) {
              // If it has a pages property (this is your case)
              storyPages = content.pages.map((page: any, index: number) => ({
                pageNumber: page.pageNumber || index + 1,
                text: page.text || page.content || ""
              }));
              
              // Extract scene images from pages
              const scenesFromPages = content.pages
                .map((page: any) => page.sceneImage || page.scene || page.imageUrl || page.image_url || page.image)
                .filter((url: string | undefined): url is string => !!url);
              
              if (scenesFromPages.length > 0) {
                loadedScenes.push(...scenesFromPages.map((url: string) => url.split("?")[0]));
                console.log('[preview] Loaded scene images from content.pages:', scenesFromPages);
              }
            } else if (typeof content === 'string') {
              // If it's a single string, create one page
              storyPages = [{ pageNumber: 1, text: content }];
            }
            
            if (storyPages.length > 0) {
              pagesRead = storyPages.length;
            }
          } catch (error) {
            console.error('Error parsing story content:', error);
          }
        }
        
        // Set the scenes array (cover + scenes)
        if (loadedScenes.length > 0) {
          storyScenes = loadedScenes;
          currentSceneIndex = 0;
          console.log('[preview] Total scenes (including cover):', storyScenes.length);
        }
        
        isLoading = false;
      } catch (error) {
        console.error('Error loading story:', error);
        loadError = error instanceof Error ? error.message : "An unexpected error occurred";
        isLoading = false;
      }
      
      // Start reading time tracker
      startReadingTimer();
    }
  });

  // Start reading timer
  function startReadingTimer() {
    if (!browser) return;
    
    readingStartTime = Date.now();
    console.log('[reading-timer] Started reading timer');
    
    // Update every second
    readingTimerInterval = window.setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - readingStartTime) / 1000);
      totalReadingTime = elapsedSeconds;
    }, 1000);
  }
  
  // Stop reading timer and save to database
  async function stopReadingTimerAndSave() {
    if (!browser || !currentStoryId) return;
    
    // Clear interval
    if (readingTimerInterval !== null) {
      clearInterval(readingTimerInterval);
      readingTimerInterval = null;
    }
    
    // Calculate final reading time
    if (readingStartTime > 0) {
      const elapsedSeconds = Math.floor((Date.now() - readingStartTime) / 1000);
      totalReadingTime = elapsedSeconds;
    }
    
    // Only save if user spent at least 1 second
    if (totalReadingTime < 1) {
      console.log('[reading-timer] Reading time too short, not saving');
      return;
    }
    
    console.log(`[reading-timer] Stopped. Total time: ${totalReadingTime} seconds`);
    
    // Prepare reading state based on story type (we'll assume 'story' type for now)
    const readingState = {
      reading_time: totalReadingTime,
      audio_listened: hasAudioBeenPlayed
    };
    
    try {
      const result = await updateReadingState(currentStoryId, readingState);
      if (result.success) {
        console.log('[reading-timer] Successfully updated reading state');
      } else {
        console.error('[reading-timer] Failed to update reading state:', result.error);
      }
    } catch (error) {
      console.error('[reading-timer] Error updating reading state:', error);
    }
  }

  function previousScene() {
    // In one-page mode, handle sub-pages
    if (viewMode === 'one-page' && currentSceneIndex > 0) {
      // Calculate story page index
      const getStoryPageIndex = (sceneIndex: number) => {
        if (sceneIndex === 0) return -1; // Cover
        if (hasDedication && sceneIndex === 1) return -1; // Dedication
        return hasDedication ? sceneIndex - 2 : sceneIndex - 1;
      };
      const currentStoryPageIndex = getStoryPageIndex(currentSceneIndex);
      
      // If we're on the right page, go back to left page of same scene
      if (currentSubPage === 'right' && currentStoryPageIndex >= 0) {
        currentSubPage = 'left';
        return;
      }
      // If we're on left page, go to previous scene's right page
      if (currentSceneIndex > 1) {
        currentSceneIndex--;
        // If previous scene is a story page (not cover/dedication), go to its right page
        const prevStoryPageIndex = getStoryPageIndex(currentSceneIndex);
        if (prevStoryPageIndex >= 0) {
          currentSubPage = 'right';
        } else {
          currentSubPage = 'left';
        }
      } else if (currentSceneIndex === 1) {
        // Go back to cover
        currentSceneIndex = 0;
        currentSubPage = 'left';
      }
    } else {
      // Two-page mode or on cover/dedication - just go back one scene
      if (currentSceneIndex > 0) {
        currentSceneIndex--;
        currentSubPage = 'left';
      }
    }
  }

  function nextScene() {
    // Calculate the actual story page index (excluding cover and dedication)
    const getStoryPageIndex = (sceneIndex: number) => {
      if (sceneIndex === 0) return -1; // Cover
      if (hasDedication && sceneIndex === 1) return -1; // Dedication
      return hasDedication ? sceneIndex - 2 : sceneIndex - 1;
    };
    
    const currentStoryPageIndex = getStoryPageIndex(currentSceneIndex);
    const nextSceneIndex = currentSceneIndex + 1;
    const nextStoryPageIndex = getStoryPageIndex(nextSceneIndex);
    
    // Check if trying to go beyond page 2 for free plan users who haven't purchased
    // Story page index 1 = page 2 (0-indexed: page 1 = index 0, page 2 = index 1)
    if (nextStoryPageIndex > 1 && isFreePlan && !isPurchased) {
      showPreviewLockModal = true;
      return;
    }
    
    // In one-page mode, advance through sub-pages
    if (viewMode === 'one-page' && currentSceneIndex > 0 && currentStoryPageIndex >= 0) {
      // If on left page, advance to right page
      if (currentSubPage === 'left') {
        currentSubPage = 'right';
        return;
      }
      // If on right page, advance to next scene's left page
      if (currentSceneIndex < storyScenes.length - 1) {
        currentSceneIndex++;
        currentSubPage = 'left';
      }
    } else {
      // Two-page mode or on cover/dedication - just advance one scene
      if (currentSceneIndex < storyScenes.length - 1) {
        currentSceneIndex++;
        currentSubPage = 'left';
      } else if (currentSceneIndex === 0) {
        // Moving from cover to next page (dedication or first scene)
        currentSceneIndex = 1;
        currentSubPage = 'left';
      }
    }
  }
  
  function handleCloseStoryPreviewEnd() {
    showStoryPreviewEndModal = false;
  }
  
  function handleReadAgain() {
    showStoryPreviewEndModal = false;
    currentSceneIndex = 0;
  }
  
  function handleDownloadPDF() {
    // TODO: Implement PDF download functionality
    console.log('Download PDF clicked');
  }
  
  function handleCreateNewBook() {
    showStoryPreviewEndModal = false;
    goto('/create-character/1');
  }

  function goToScene(index: number) {
    // Allow navigation to cover (index 0) and dedication (index 1 if hasDedication) for everyone
    if (index === 0 || (hasDedication && index === 1)) {
      if (index >= 0 && index < storyScenes.length) {
        currentSceneIndex = index;
        currentSubPage = 'left';
      }
      return;
    }
    
    // Calculate the actual story page index (excluding cover and dedication)
    const storyPageIndex = hasDedication ? index - 2 : index - 1;
    
    // Prevent navigation to pages beyond page 2 for free plan users who haven't purchased
    // Story page index 1 = page 2, so we allow index 0 (page 1) and index 1 (page 2)
    if (storyPageIndex > 1 && isFreePlan && !isPurchased) {
      console.log("[preview] Showing lock modal via goToScene - index:", index, "storyPageIndex:", storyPageIndex, "isFreePlan:", isFreePlan, "isPurchased:", isPurchased);
      showPreviewLockModal = true;
      return;
    }
    
    // Allow navigation for paid users or to pages 1-2 for free users
    if (index >= 0 && index < storyScenes.length) {
      currentSceneIndex = index;
      currentSubPage = 'left'; // Reset to left page when jumping to a scene
    }
  }
  
  function handleClosePreviewLockModal() {
    showPreviewLockModal = false;
  }
  
  function handleUnlockPreview(event: CustomEvent) {
    // Navigate to pricing page with story ID when unlock button is clicked
    showPreviewLockModal = false;
    const storyId = event.detail?.storyId || currentStoryId;
    
    // Pass story ID as URL parameter to pricing page
    if (storyId) {
      goto(`/pricing?storyId=${storyId}`);
    } else {
      goto('/pricing');
    }
  }

  // ==================== AUDIO PLAYBACK FUNCTIONS ====================
  
  function loadAudio(sceneIndex: number) {
    // Clean up previous audio
    cleanupAudio();
    
    // Reset audio state
    isPlaying = false;
    audioProgress = 0;
    currentTime = 0;
    duration = 0;
    isAudioAvailable = false;
    
    // Cover page (index 0) and dedication pages (index 1 if hasDedication) don't have audio
    if (sceneIndex === 0 || (hasDedication && sceneIndex === 1)) {
      console.log("[audio] Cover or dedication page - no audio");
      return;
    }
    
    // Calculate audio index: account for cover and dedication
    // If hasDedication: scene index 2 = audio[0], scene index 3 = audio[1], etc.
    // If no dedication: scene index 1 = audio[0], scene index 2 = audio[1], etc.
    const audioIndex = sceneIndex - (hasDedication ? 2 : 1);
    
    // Check if audio exists for this scene
    if (audioIndex < 0 || audioIndex >= audioUrls.length || !audioUrls[audioIndex]) {
      console.log("[audio] No audio available for scene index:", sceneIndex);
      return;
    }
    
    const audioUrl = audioUrls[audioIndex];
    console.log("[audio] Loading audio for scene", sceneIndex, ":", audioUrl);
    
    // Create new audio element
    currentAudio = new Audio(audioUrl);
    currentAudio.playbackRate = audioSpeed;
    
    // Add event listeners
    currentAudio.addEventListener('timeupdate', handleTimeUpdate);
    currentAudio.addEventListener('ended', handleAudioEnded);
    currentAudio.addEventListener('error', handleAudioError);
    currentAudio.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    isAudioAvailable = true;
    
    // Load the audio
    currentAudio.load();
  }
  
  function handleTimeUpdate() {
    if (currentAudio) {
      currentTime = currentAudio.currentTime;
      duration = currentAudio.duration || 0;
      audioProgress = duration > 0 ? (currentTime / duration) * 100 : 0;
    }
  }
  
  function handleLoadedMetadata() {
    if (currentAudio) {
      duration = currentAudio.duration;
      console.log("[audio] Audio loaded, duration:", formatTime(duration));
    }
  }
  
  function handleAudioEnded() {
    isPlaying = false;
    audioProgress = 100;
    console.log("[audio] Audio playback ended");
  }
  
  function handleAudioError(event: Event) {
    console.error("[audio] Audio load error:", event);
    isPlaying = false;
    isAudioAvailable = false;
  }
  
  function togglePlayPause() {
    if (!isAudioAvailable || !currentAudio) {
      console.log("[audio] No audio available");
      return;
    }
    
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  }
  
  function playAudio() {
    if (currentAudio && isAudioAvailable) {
      const playPromise = currentAudio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            isPlaying = true;
            hasAudioBeenPlayed = true; // Track that audio has been played
            console.log("[audio] Playing audio");
          })
          .catch((error) => {
            console.error("[audio] Play error:", error);
            isPlaying = false;
          });
      }
    }
  }
  
  function pauseAudio() {
    if (currentAudio) {
      currentAudio.pause();
      isPlaying = false;
      console.log("[audio] Audio paused");
    }
  }
  
  function seekAudio(event: MouseEvent) {
    if (!currentAudio || !isAudioAvailable || duration <= 0) return;
    
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const percentage = ((event.clientX - rect.left) / rect.width) * 100;
    const newTime = (percentage / 100) * duration;
    
    currentAudio.currentTime = newTime;
    audioProgress = percentage;
  }
  
  function changePlaybackSpeed(speed: number) {
    audioSpeed = speed;
    if (currentAudio) {
      currentAudio.playbackRate = speed;
      console.log("[audio] Speed changed to:", speed + "x");
    }
  }
  
  function cyclePlaybackSpeed() {
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(audioSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    changePlaybackSpeed(nextSpeed);
  }
  
  function formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds) || !isFinite(seconds)) return "0:00";
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  
  function cleanupAudio() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.removeEventListener('timeupdate', handleTimeUpdate);
      currentAudio.removeEventListener('ended', handleAudioEnded);
      currentAudio.removeEventListener('error', handleAudioError);
      currentAudio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      currentAudio = null;
    }
  }
  
  // Load audio when scene changes (skip cover and dedication)
  $: if (browser && currentSceneIndex !== undefined) {
    // Skip audio for cover (index 0) and dedication (index 1 if hasDedication)
    if (currentSceneIndex > 0 && !(hasDedication && currentSceneIndex === 1)) {
      loadAudio(currentSceneIndex);
    }
  }
  
  // Reset to left page when switching to one-page mode
  $: if (viewMode === 'one-page' && currentSceneIndex > 0) {
    currentSubPage = 'left';
  }
  
  // Cleanup on component destroy
  onDestroy(() => {
    cleanupAudio();
    stopReadingTimerAndSave();
  });
  
  // Save reading state before navigating away
  beforeNavigate(() => {
    stopReadingTimerAndSave();
  });

  // Update page counter text
  $: {
    if (storyScenes.length === 0) {
      pageCounterText = "Page 1 of 2 (FREE PREVIEW) • Pages 3-5 available after purchase";
    } else if (currentSceneIndex === 0) {
      pageCounterText = `Cover (FREE PREVIEW)`;
    } else if (hasDedication && currentSceneIndex === 1) {
      pageCounterText = `Dedication Page (FREE PREVIEW)`;
    } else if (viewMode === 'one-page') {
      // In one-page mode, show which half of the page we're viewing
      // Account for dedication page
      const adjustedIndex = hasDedication ? currentSceneIndex - 2 : currentSceneIndex - 1;
      const pageNum = adjustedIndex * 2 + (currentSubPage === 'left' ? 1 : 2);
      const totalStoryPages = storyScenes.length - (hasDedication ? 2 : 1);
      const totalPages = totalStoryPages * 2;
      pageCounterText = `Page ${pageNum} of ${totalPages} (FREE PREVIEW)`;
    } else {
      // Two-page mode
      const adjustedIndex = hasDedication ? currentSceneIndex - 1 : currentSceneIndex;
      const totalStoryPages = storyScenes.length - (hasDedication ? 2 : 1);
      pageCounterText = `Page ${adjustedIndex} of ${totalStoryPages} (FREE PREVIEW)`;
    }
  }
  
  // Get current page text
  // Adjust index for story pages since cover is index 0 and dedication (if exists) is index 1
  $: currentPageText = (currentSceneIndex === 0 || (hasDedication && currentSceneIndex === 1))
    ? ''
    : (() => {
        const pageIndex = currentSceneIndex - (hasDedication ? 2 : 1);
        return storyPages.length > 0 && pageIndex >= 0 && pageIndex < storyPages.length
          ? storyPages[pageIndex].text
          : '';
      })();
  
  // Toggle fullscreen mode
  function toggleFullscreen() {
    if (!browser) return;
    
    const elem = document.documentElement;
    
    if (!document.fullscreenElement) {
      // Enter fullscreen
      if (elem.requestFullscreen) {
        elem.requestFullscreen().then(() => {
          isFullscreen = true;
          console.log('[fullscreen] Entered fullscreen mode');
        }).catch(err => {
          console.error('[fullscreen] Error entering fullscreen:', err);
        });
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          isFullscreen = false;
          console.log('[fullscreen] Exited fullscreen mode');
        }).catch(err => {
          console.error('[fullscreen] Error exiting fullscreen:', err);
        });
      }
    }
  }
  
  // Listen for fullscreen changes (user pressing ESC, etc.)
  onMount(() => {
    if (browser) {
      const handleFullscreenChange = () => {
        isFullscreen = !!document.fullscreenElement;
      };
      
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      
      return () => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
      };
    }
  });
</script>

<svelte:window on:keydown={(e) => {
  if (e.key === 'Escape') {
    showStoryInfoModal = false;
    showShareStoryModal = false;
  }
}} />

<div class="preview-story-cover">
  <div class="navbar">
    <div class="logo-text-full">
      <div class="logo-img"></div>
    </div>
  </div>
  <MobileBackBtn backRoute="/dashboard" />
  {#if !showStoryPreviewEndModal}
  <div class="frame-1410103818">
    <div class="frame-13">
      <div class="frame-1410103946">
        <div class="frame-8">
          <div class="frame-1410104191">
            <div class="frame-1410104190">
              <div class="emmas-magical-forest-adventure">
                <span class="emmasmagicalforestadventure_span"
                  >Emma's Magical Forest Adventure</span
                >
              </div>
              <div
                class="page-1-of-2-free-preview-pages-3-5-available-after-purchase"
              >
                <span
                  class="page1of2freepreviewpages3-5availableafterpurchase_span"
                  >{pageCounterText}</span
                >
              </div>
              <div class="share-dots-button-group">
                <div
                  class="button"
                  role="button"
                  tabindex="0"
                  on:click={() => (showStoryInfoModal = true)}
                  on:keydown={(e) =>
                    (e.key === 'Enter' || e.key === ' ') &&
                    (showStoryInfoModal = true)}
                >
                  <img src={DotsThreeOutline} alt="dots" />
                </div>
                <div
                  class="button_01"
                  role="button"
                  tabindex="0"
                  on:click={() => (showShareStoryModal = true)}
                  on:keydown={(e) =>
                    (e.key === 'Enter' || e.key === ' ') &&
                    (showShareStoryModal = true)}
                >
                  <img src={share} alt="share" />
                </div>
              </div>
            </div>
          </div>
          <div class="mobile-share-dots-button-group">
            <div
              class="button"
              role="button"
              tabindex="0"
              on:click={() => (showStoryInfoModal = true)}
              on:keydown={(e) =>
                (e.key === 'Enter' || e.key === ' ') &&
                (showStoryInfoModal = true)}
            >
              <img src={DotsThreeOutline} alt="dots" />
            </div>
            <div
              class="button_01"
              role="button"
              tabindex="0"
              on:click={() => (showShareStoryModal = true)}
              on:keydown={(e) =>
                (e.key === 'Enter' || e.key === ' ') &&
                (showShareStoryModal = true)}
            >
              <img src={share} alt="share" />
            </div>
          </div>
          <div class="rectangle-35"></div>
          <div class="frame-1410104054">
            <div class="view-option">
              <div 
                class="button_view"
                class:active={viewMode === 'one-page'}
                role="button"
                tabindex="0"
                on:click={() => viewMode = 'one-page'}
                on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && (viewMode = 'one-page')}
              >
                <div class="one-page-view">
                  <span class="one-pageview_span">One-page view</span>
                </div>
              </div>
              <div 
                class="button_view_01"
                class:active={viewMode === 'two-page'}
                role="button"
                tabindex="0"
                on:click={() => viewMode = 'two-page'}
                on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && (viewMode = 'two-page')}
              >
                <div class="two-page-view">
                  <span class="two-pageview_span">Two-page view</span>
                </div>
              </div>
            </div>
            <div class="book-container-wrapper">
              <div class="frame-1410104106">
                <div class="book-container">
                  {#if isLoading}
                    <!-- Loading state -->
                    <div class="loading-container">
                      <div class="loading-spinner"></div>
                      <p>Loading story...</p>
                    </div>
                  {:else if loadError}
                    <!-- Error state -->
                    <div class="error-container">
                      <p class="error-message">Error: {loadError}</p>
                      <button class="retry-button" on:click={() => window.location.reload()}>Retry</button>
                    </div>
                  {:else if storyScenes.length > 0}
                    {#if currentSceneIndex === 0}
                      <!-- Cover: Single image display -->
                      <div class="cover-image-container">
                        <div class="image cover-image">
                          <img
                            src={storyScenes[currentSceneIndex]}
                            alt="Story Cover"
                            class="scene-main-image cover-main-image"
                            draggable="false"
                          />
                          <div class="inner-shadow"></div>
                        </div>
                      </div>
                    {:else if hasDedication && currentSceneIndex === 1 && storyScenes[currentSceneIndex] === 'DEDICATION_PAGE'}
                      <!-- Dedication Page: Left blank, Right with dedication image and text -->
                      <div class="mobile-image-split">
                        <div class="mobile-image-half mobile-image-left dedication-blank">
                          <div class="image dedication-blank-page">
                            <!-- White blank page -->
                            <img
                              src={dedicationLeft}
                              alt="Dedication"
                              class="dedication-image"
                              draggable="false"
                            />
                          </div>
                        </div>
                        <div class="mobile-image-half mobile-image-right dedication-page">
                          <div class="image dedication-content">
                            {#if dedicationImage}
                              <img
                                src={dedicationImage}
                                alt="Dedication"
                                class="dedication-image"
                                draggable="false"
                              />
                            {/if}
                            {#if dedicationText}
                              <div class="dedication-text-container">
                                <p class="dedication-text">{dedicationText}</p>
                              </div>
                            {/if}
                            <div class="inner-shadow"></div>
                          </div>
                        </div>
                      </div>
                    {:else if viewMode === 'one-page' && storyScenes[currentSceneIndex] && storyScenes[currentSceneIndex] !== 'DEDICATION_PAGE'}
                      <!-- One-page mode: Show only left OR right page -->
                      <div class="mobile-image-split" class:single-page-mode={true}>
                        {#if currentSubPage === 'left'}
                          <div class="mobile-image-half mobile-image-left single-page-full">
                            <div class="image">
                              <img
                                src={storyScenes[currentSceneIndex]}
                                alt={`Scene ${currentSceneIndex} - Left`}
                                class="scene-main-image scene-image-left"
                                draggable="false"
                              />
                              <div class="frame-1410104055">
                                <div class="tag">
                                  <div>
                                    <span class="freepreviewpages_span"
                                      >Free preview Pages</span
                                    >
                                  </div>
                                </div>
                              </div>
                              <div class="inner-shadow"></div>
                            </div>
                          </div>
                        {:else}
                          <div class="mobile-image-half mobile-image-right single-page-full">
                            <div class="image_01">
                              <img
                                src={storyScenes[currentSceneIndex] && storyScenes[currentSceneIndex] !== 'DEDICATION_PAGE' ? storyScenes[currentSceneIndex] : ''}
                                alt={`Scene ${currentSceneIndex} - Right`}
                                class="scene-main-image scene-image-right"
                                draggable="false"
                              />
                              <div class="frame-1410104055_01">
                                <div class="tag_01">
                                  <div>
                                    <span class="freepreviewpages_01_span"
                                      >Free preview Pages</span
                                    >
                                  </div>
                                </div>
                              </div>
                              <div class="inner-shadow"></div>
                            </div>
                          </div>
                        {/if}
                      </div>
                    {:else if storyScenes[currentSceneIndex] && storyScenes[currentSceneIndex] !== 'DEDICATION_PAGE'}
                      <!-- Two-page mode: Split into left and right halves -->
                      <div class="mobile-image-split">
                        <div class="mobile-image-half mobile-image-left">
                          <div class="image">
                            <img
                              src={storyScenes[currentSceneIndex]}
                              alt={`Scene ${currentSceneIndex} - Left`}
                              class="scene-main-image scene-image-left"
                              draggable="false"
                            />
                            <div class="frame-1410104055">
                              <div class="tag">
                                <div>
                                  <span class="freepreviewpages_span"
                                    >Free preview Pages</span
                                  >
                                </div>
                              </div>
                            </div>
                            <div class="inner-shadow"></div>
                          </div>
                        </div>
                        <div class="mobile-image-half mobile-image-right">
                          <div class="image_01">
                            <img
                              src={storyScenes[currentSceneIndex]}
                              alt={`Scene ${currentSceneIndex} - Right`}
                              class="scene-main-image scene-image-right"
                              draggable="false"
                            />
                            <div class="frame-1410104055_01">
                              <div class="tag_01">
                                <div>
                                  <span class="freepreviewpages_01_span"
                                    >Free preview Pages</span
                                  >
                                </div>
                              </div>
                            </div>
                            <div class="inner-shadow"></div>
                          </div>
                        </div>
                      </div>
                    {/if}
                  {:else}
                    <!-- No scenes available -->
                    <div class="no-content-container">
                      <p>No story scenes available</p>
                    </div>
                  {/if}
                </div>
              </div>
              <div class="notification-wrapper">
                <div 
                  class="notification"
                  role="button"
                  tabindex="0"
                  on:click={toggleFullscreen}
                  on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleFullscreen()}
                >
                  <img src={CornersOut} alt="corners" />
                  <div>
                    <span class="fullscreenpreview_span">
                      {isFullscreen ? 'Exit Full Screen' : 'Full Screen Preview'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div class="frame-1410104061">
              <div class="frame-1410104060">
                <div>
                  <span class="audionaration_span">Audio Narration</span>
                </div>
                <div>
                  <span class="pages1-2_span">
                    {#if !isAudioAvailable}
                      {currentSceneIndex === 0 ? 'Cover - No Audio' : 'No Audio'}
                    {:else if duration > 0}
                      {formatTime(currentTime)} / {formatTime(duration)}
                    {:else}
                      Page {currentSceneIndex}
                    {/if}
                  </span>
                </div>
              </div>
              <div class="frame-1410104059">
                <!-- Play/Pause Button -->
                <div 
                  class="frame-1410104056 audio-btn"
                  class:disabled={!isAudioAvailable}
                  role="button"
                  tabindex={isAudioAvailable ? 0 : -1}
                  on:click={togglePlayPause}
                  on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && togglePlayPause()}
                  title={!isAudioAvailable ? "No audio available" : (isPlaying ? "Pause" : "Play")}
                >
                  {#if isPlaying}
                    <!-- Pause Icon -->
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                      <rect x="7" y="5" width="3" height="14" rx="1"/>
                      <rect x="14" y="5" width="3" height="14" rx="1"/>
                    </svg>
                  {:else}
                    <img src={Play} alt="play" />
                  {/if}
                </div>
                
                <!-- Audio Progress Bar -->
                <div class="audio">
                  <img src={SpeakerSimpleHigh} alt="speaker" />

                  <div class="frame-1410104058">
                    <div 
                      class="rectangle-36-bg"
                      class:clickable={isAudioAvailable && duration > 0}
                      role="progressbar"
                      aria-valuenow={audioProgress}
                      aria-valuemin="0"
                      aria-valuemax="100"
                      on:click={seekAudio}
                    >
                      <div class="rectangle-36" style="width: {audioProgress}%"></div>
                    </div>
                  </div>
                </div>
                
                <!-- Speed Control -->
                <div class="frame-1410104063">
                  <div><span class="speed_span">Speed</span></div>
                  <div 
                    class="frame-1410104062 speed-btn"
                    class:disabled={!isAudioAvailable}
                    role="button"
                    tabindex={isAudioAvailable ? 0 : -1}
                    on:click={cyclePlaybackSpeed}
                    on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && cyclePlaybackSpeed()}
                    title="Change playback speed"
                  >
                    <div><span class="fx_span">{audioSpeed}x</span></div>
                    <div class="caretdown">
                      <img src={CaretDown} alt="caret" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="frame-1410103860">
            <div class="button_02" on:click={previousScene} class:disabled={currentSceneIndex === 0 || storyScenes.length === 0}>
              <div class="arrowleft">
                <img src={ArrowLeft} alt="arrow" />
              </div>
              <div class="previous">
                <span class="previous_span">Previous</span>
              </div>
            </div>
            <div class="frame-1410104065">
              {#if storyScenes.length > 0}
                {#each storyScenes as _, idx}
                  {#if idx === 0}
                    <div 
                      class="number" 
                      class:active={currentSceneIndex === idx} 
                      on:click={() => goToScene(idx)} 
                      on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && goToScene(idx)}
                      role="button" 
                      tabindex="0"
                    >
                      <img src={Book} alt="Cover" />
                    </div>
                  {:else if idx === 1 && hasDedication && storyScenes[idx] === 'DEDICATION_PAGE'}
                    <div 
                      class="number_01" 
                      class:active={currentSceneIndex === idx} 
                      on:click={() => goToScene(idx)} 
                      on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && goToScene(idx)}
                      role="button" 
                      tabindex="0"
                    >
                      <img src={EnvelopeSimple} alt="Dedication Page" />
                    </div>
                  {:else if idx === 1 && !hasDedication}
                    <div 
                      class="number_01" 
                      class:active={currentSceneIndex === idx} 
                      on:click={() => goToScene(idx)} 
                      on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && goToScene(idx)}
                      role="button" 
                      tabindex="0"
                    >
                      <img src={EnvelopeSimple} alt="Page 1" />
                    </div>
                  {:else}
                    <div 
                      class="number_02" 
                      class:active={currentSceneIndex === idx}
                      on:click={() => goToScene(idx)}
                      on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && goToScene(idx)}
                      class:locked={idx > 1 && isFreePlan && !isPurchased}
                      role="button" 
                      tabindex="0"
                    >
                      <div class="text-1"><span class="f_span">{idx-1}</span></div>
                    </div>
                  {/if}
                {/each}
              {:else}
                <!-- Default static display when no scenes -->
                <div class="number">
                  <img src={Book} alt="book" />
                </div>
                <div class="number_01">
                  <img src={EnvelopeSimple} alt="envelope" />
                </div>
                <div class="number_02">
                  <div class="text-1"><span class="f_span">1</span></div>
                </div>
                <div class="number_03">
                  <div class="text-2"><span class="f_span_01">2</span></div>
                </div>
                <div class="number_04">
                  <img src={LockKey} alt="lock" />
                </div>
                <div class="number_05">
                  <img src={LockKey} alt="lock" />
                </div>
              {/if}
            </div>
            <div class="button_03" on:click={nextScene} class:disabled={storyScenes.length === 0}>
              <div class="next"><span class="next_span">Next</span></div>
              <div class="arrowleft_01">
                <img src={ArrowRight} alt="arrow" />
              </div>
            </div>
          </div>
          <div class="mobile-button-container">
            <div class="mobile-button_02" on:click={previousScene} class:disabled={currentSceneIndex === 0 || storyScenes.length === 0}>
              <div class="arrowleft">
                <img src={ArrowLeft} alt="arrow" />
              </div>
              <div class="previous">
                <span class="previous_span">Previous</span>
              </div>
            </div>
            <div class="mobile-button_03" on:click={nextScene} class:disabled={storyScenes.length === 0}>
              <div class="next"><span class="next_span">Next</span></div>
              <div class="arrowleft_01">
                <img src={ArrowRight} alt="arrow" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="frame-1410103860_01">
    <div class="frame-1410103870">
      <div 
        class="button_04" 
        role="button"
        tabindex="0"
        on:click={() => goto('/dashboard')}
        on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && goto('/dashboard')}
      >
        <img src={ArrowLeft} alt="arrow" />
        <div class="back"><span class="back_span">Back</span></div>
      </div>
    </div>
  </div>
  <div class="frame-1410103821">
    <div class="contact-us-hellodrawtopiacom">
      <span class="contactushellodrawtopiacom_span"
        >Contact us: hello@drawtopia.com</span
      >
    </div>
    <div class="rectangle-34"></div>
    <div class="frame-1410103820">
      <div class="privacy-policy">
        <span class="privacypolicy_span">Privacy Policy</span>
      </div>
      <div class="terms-of-service">
        <span class="termsofservice_span">Terms of Service</span>
      </div>
    </div>
  </div>
  {/if}
  {#if showStoryInfoModal}
    <StoryInfoModal 
      storyId={currentStoryId || ""}
      storyTitle={storyTitle}
      on:close={() => showStoryInfoModal = false}
      on:delete={(e) => {
        showStoryInfoModal = false;
        // Navigate back to dashboard after deletion
        goto('/dashboard');
      }}
    />
  {/if}
  {#if showShareStoryModal}
    <ShareStoryModal 
      storyTitle={storyTitle} 
      storyId={currentStoryId || ""}
      on:close={() => showShareStoryModal = false} 
    />
  {/if}
  {#if showStoryPreviewEndModal}
    <div
      class="modal-overlay"
      role="dialog"
      aria-modal="true"
      on:click|self={handleCloseStoryPreviewEnd}
      on:keydown={(e) => e.key === "Escape" && handleCloseStoryPreviewEnd()}
      tabindex="-1"
    >
      <div class="modal-container" on:click|stopPropagation>
        <StoryPreviewEnd
          {storyTitle}
          {pagesRead}
          {readingTime}
          {audioListened}
          on:close={handleCloseStoryPreviewEnd}
          on:readAgain={handleReadAgain}
          on:downloadPDF={handleDownloadPDF}
          on:createNewBook={handleCreateNewBook}
        />
      </div>
    </div>
  {/if}
  {#if showPreviewLockModal}
    <PreviewLockModal
      characterName={storyTitle.split("'")[0] || "Emma"}
      storyId={currentStoryId}
      on:close={handleClosePreviewLockModal}
      on:unlock={handleUnlockPreview}
    />
  {/if}
</div>

<style>
  .navbar {
    align-self: stretch;
    height: 79px;
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 24px;
    padding-right: 12px;
    border-radius: 20px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
    justify-content: center;
  }
  .logo-text-full {
    width: 203.32px;
    height: 38px;
    min-height: 38px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .logo-img {
    background-image: url("../../../assets/logo.png");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    width: 100%;
    height: 100%;
  }

  .emmasmagicalforestadventure_span {
    color: #121212;
    font-size: 32px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 44.8px;
    word-wrap: break-word;
  }

  .emmas-magical-forest-adventure {
    text-align: center;
  }

  .page1of2freepreviewpages3-5availableafterpurchase_span {
    color: #666d80;
    font-size: 16px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .page-1-of-2-free-preview-pages-3-5-available-after-purchase {
    text-align: center;
  }

  .rectangle-35 {
    align-self: stretch;
    height: 1px;
    background: #dcdcdc;
  }

  .frame-1410104055 {
    flex: 1 1 0;
    align-self: stretch;
    padding: 24px;
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0.25) 100%
    );
    border-radius: 8px;
  }

  .fullscreenpreview_span {
    color: #141414;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28px;
    word-wrap: break-word;
  }

  .previous_span {
    color: black;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .previous {
    text-align: center;
  }

  .f_span {
    color: white;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .text-1 {
    align-self: stretch;
    text-align: center;
  }

  .f_span_01 {
    color: white;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .text-2 {
    align-self: stretch;
    text-align: center;
  }

  .next_span {
    color: white;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .next {
    text-align: center;
  }

  .back_span {
    color: black;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .back {
    text-align: center;
  }

  .contactushellodrawtopiacom_span {
    color: #141414;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .contact-us-hellodrawtopiacom {
    text-align: center;
  }

  .rectangle-34 {
    align-self: stretch;
    height: 1px;
    background: #ededed;
  }

  .privacypolicy_span {
    color: #141414;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .privacy-policy {
    text-align: center;
  }

  .termsofservice_span {
    color: #141414;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .terms-of-service {
    text-align: center;
  }

  .frame-1410104190 {
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .number_02 {
    width: 40px;
    height: 40px;
    padding: 2px;
    background: #c1c7d0;
    border-radius: 12px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }

  .number_03 {
    width: 40px;
    height: 40px;
    padding: 2px;
    background: #c1c7d0;
    border-radius: 12px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }

  .frame-1410103820 {
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
  }

  .logo-text-full {
    width: 203.32px;
    height: 38px;
    position: relative;
  }

  .arrowleft {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .arrowleft_01 {
    width: 24px;
    height: 24px;
    position: relative;
    transform-origin: top left;
    overflow: hidden;
  }

  .frame-1410103821 {
    align-self: stretch;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .button {
    width: 48px;
    height: 48px;
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 8px;
    padding-bottom: 8px;
    left: 1163px;
    top: 16px;
    position: absolute;
    border-radius: 8px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .button:hover {
    background: #f8fafb;
    outline-color: #438bff;
    transform: translateY(-1px);
  }

  .button:active {
    transform: translateY(0);
  }

  .button_01 {
    width: 48px;
    height: 48px;
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 8px;
    padding-bottom: 8px;
    left: 1107px;
    top: 16px;
    position: absolute;
    border-radius: 8px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .button_01:hover {
    background: #f8fafb;
    outline-color: #438bff;
    transform: translateY(-1px);
  }

  .button_01:active {
    transform: translateY(0);
  }

  .notification {
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 16px;
    padding-right: 20px;
    background: #f8fafb;
    box-shadow: 0px 1px 4px rgba(141.8, 141.8, 141.8, 0.25) inset;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 18px;
    display: flex;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .notification:hover {
    background: #e7f3ff;
    outline-color: #438bff;
    transform: translateY(-1px);
  }
  
  .notification:active {
    transform: translateY(0);
  }

  .button_02 {
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    box-shadow: 0px 4px 4px rgba(98.89, 98.89, 98.89, 0.25);
    border-radius: 20px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .button_02:hover:not(.disabled) {
    background: #f5f5f5;
  }

  .number {
    width: 40px;
    height: 40px;
    padding: 2px;
    background: #144be1;
    border-radius: 12px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }

  .number_01 {
    width: 40px;
    height: 40px;
    padding: 2px;
    background: #c1c7d0;
    border-radius: 12px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }

  .number_04 {
    width: 40px;
    height: 40px;
    padding: 2px;
    background: #c1c7d0;
    border-radius: 12px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }

  .number_05 {
    width: 40px;
    height: 40px;
    padding: 2px;
    background: #c1c7d0;
    border-radius: 12px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }

  /* Scene image styles */
  .scene-main-image {
    display: block;
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    object-fit: contain;
    border-radius: 8px;
    pointer-events: none;
    position: relative;
    z-index: 1;
  }

  /* Active state for navigation dots */
  .number.active,
  .number_01.active,
  .number_02.active {
    background: #144be1 !important;
  }

  /* Disabled state for buttons */
  .button_02.disabled,
  .button_03.disabled,
  .mobile-button_02.disabled,
  .mobile-button_03.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  /* Make navigation dots clickable */
  .number,
  .number_01,
  .number_02 {
    cursor: pointer;
    transition: background 0.2s;
  }

  .number:hover:not(.active),
  .number_01:hover:not(.active),
  .number_02:hover:not(.active):not(.locked) {
    background: #a8b5d0;
  }
  
  /* Locked pages should show cursor not-allowed */
  .number_02.locked {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .button_03 {
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    background: #438bff;
    border-radius: 20px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .button_03:hover:not(.disabled) {
    background: #3a7ae8;
  }

  .mobile-button_03 {
    display: none;
  }

  .button_04 {
    width: 200px;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    box-shadow: 0px 4px 4px rgba(98.89, 98.89, 98.89, 0.25);
    border-radius: 20px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .button_04:hover {
    background: #f5f5f5;
  }

  .frame-1410104191 {
    align-self: stretch;
    position: relative;
    justify-content: center;
    align-items: center;
    gap: 32px;
    display: inline-flex;
  }

  .frame-1410104065 {
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .frame-1410103870 {
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .frame-1410103860 {
    align-self: stretch;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .frame-1410103860_01 {
    align-self: stretch;
    justify-content: center;
    align-items: center;
    display: inline-flex;
  }

  .frame-1410104054 {
    align-self: stretch;
    padding: 12px;
    background: #f8fafb;
    border-radius: 12px;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    gap: 24px;
    display: flex;
  }

  .frame-8 {
    align-self: stretch;
    padding: 12px;
    background: white;
    border-radius: 20px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .frame-1410103946 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: flex;
  }

  .frame-13 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 24px;
    display: flex;
  }

  .frame-1410103818 {
    width: 1240px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 24px;
    display: flex;
  }

  .preview-story-cover {
    width: 100%;
    height: 100%;
    padding-top: 24px;
    padding-bottom: 80px;
    padding-left: 100px;
    padding-right: 100px;
    background: white;
    overflow: hidden;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 48px;
    display: inline-flex;
  }
  .one-pageview_span {
    color: #666d80;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
    transition: color 0.2s ease;
  }
  
  .button_view.active .one-pageview_span {
    color: white;
  }

  .one-page-view {
    text-align: center;
  }

  .two-pageview_span {
    color: #666d80;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
    transition: color 0.2s ease;
  }
  
  .button_view_01.active .two-pageview_span {
    color: white;
  }

  .two-page-view {
    text-align: center;
  }

  .freepreviewpages_span {
    color: #141414;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    word-wrap: break-word;
  }

  .freepreviewpages_01_span {
    color: #141414;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    word-wrap: break-word;
  }

  .fullscreenpreview_span {
    color: #141414;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28px;
    word-wrap: break-word;
  }

  .audionaration_span {
    color: #438bff;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28px;
    word-wrap: break-word;
  }

  .pages1-2_span {
    color: #438bff;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28px;
    word-wrap: break-word;
  }

  .rectangle-36-bg {
    width: 100%;
    height: 6px;
    position: relative;
    background: #e0e0e0;
    border-radius: 3px;
    overflow: hidden;
  }
  
  .rectangle-36-bg.clickable {
    cursor: pointer;
  }
  
  .rectangle-36-bg.clickable:hover {
    background: #d0d0d0;
  }
  
  .rectangle-36 {
    height: 100%;
    background: #438bff;
    transition: width 0.1s linear;
    border-radius: 3px;
    pointer-events: none;
  }

  .speed_span {
    color: #141414;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .fx_span {
    color: #141414;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .button_view {
    width: 177px;
    height: 57px;
    padding: 2px;
    background: #c1c7d0;
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .button_view:hover:not(.active) {
    background: #a8b5d0;
  }
  
  .button_view.active {
    background: #438bff;
  }

  .button_view_01 {
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    background: #c1c7d0;
    border-radius: 20px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .button_view_01:hover:not(.active) {
    background: #a8b5d0;
  }
  
  .button_view_01.active {
    background: #438bff;
  }

  .tag {
    padding: 8px 12px;
    background: #f8fafb;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: flex-end;
    gap: 4px;
    display: inline-flex;
    margin: auto;
  }

  .tag_01 {
    padding: 8px 12px;
    background: #f8fafb;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: flex-end;
    gap: 4px;
    display: inline-flex;
    margin: auto;
  }

  .frame-1410104060 {
    align-self: stretch;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .frame-1410104058 {
    flex: 1 1 0;
    height: 3px;
    position: relative;
    background: white;
    border-radius: 12px;
  }

  .view-option {
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
  }

  .frame-1410104055 {
    flex: 1 1 0;
    height: 668px;
    padding: 12px;
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0.25) 100%
    );
    overflow: hidden;
    border-radius: 8px;
    background-image: url(https://placehold.co/558x668);
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-end;
    gap: 10px;
    display: inline-flex;
    position: relative;
  }

  .frame-1410104055_01 {
    flex: 1 1 0;
    height: 668px;
    padding: 12px;
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0.25) 100%
    );
    overflow: hidden;
    border-radius: 8px;
    background-image: url(https://placehold.co/558x668);
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-end;
    gap: 10px;
    display: inline-flex;
    position: relative;
  }

  .frame-1410104056 {
    width: 48px;
    height: 48px;
    padding: 12px;
    background: #438bff;
    border-radius: 9999px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    min-width: 48px;
    min-height: 48px;
  }
  
  .frame-1410104056.audio-btn {
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .frame-1410104056.audio-btn:hover:not(.disabled) {
    background: #3578e5;
    transform: scale(1.05);
  }
  
  .frame-1410104056.audio-btn:active:not(.disabled) {
    transform: scale(0.95);
  }
  
  .frame-1410104056.disabled {
    opacity: 0.4;
    cursor: not-allowed;
    background: #9ca3af;
  }
  
  .frame-1410104056 svg,
  .frame-1410104056 img {
    width: 24px;
    height: 24px;
  }

  .audio {
    flex: 1 1 0;
    justify-content: flex-start;
    align-items: center;
    gap: 9px;
    display: flex;
  }

  .frame-1410104062 {
    padding-left: 12px;
    padding-right: 12px;
    padding-top: 4px;
    padding-bottom: 4px;
    background: #f8fafb;
    border-radius: 12px;
    outline: 1px #438bff solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: flex;
  }

  .image,
  .image_01 {
    flex: 1 1 0;
    background: white;
    overflow: hidden;
    border-radius: 16px;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 10px;
    display: flex;
    width: 100%;
    position: relative;
  }
  
  /* Ensure images inside the wrapper divs respect the split view */
  .mobile-image-half .image,
  .mobile-image-half .image_01 {
    padding: 0;
    overflow: hidden;
    border-radius: 0;
    position: relative;
    width: 100%;
  }
  
  /* Make images 200% width to enable split view */
  .mobile-image-half .image .scene-main-image,
  .mobile-image-half .image_01 .scene-main-image {
    width: 200%;
    max-width: 200%;
    height: auto; 
    object-fit: cover;
    display: block;
    position: relative;
    z-index: 1;
  }
  
  /* Left half: show left 50% of the image */
  .mobile-image-left .image .scene-main-image {
    object-position: left center;
    margin-left: 0;
  }
  
  /* Right half: show right 50% of the image */
  .mobile-image-right .image_01 .scene-main-image {
    object-position: right center;
    margin-left: -100%;
  }
  
  /* Ensure overlays are positioned correctly above the image */
  .mobile-image-half .frame-1410104055,
  .mobile-image-half .frame-1410104055_01 {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 2;
    height: auto;
    background-image: none;
  }

  .frame-1410104063 {
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }
  
  .speed-btn {
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .speed-btn:hover:not(.disabled) {
    background: #e7f3ff;
    outline-color: #3578e5;
  }
  
  .speed-btn.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
  
  .frame-1410104058 {
    flex: 1;
    position: relative;
    height: 20px;
    display: flex;
    align-items: center;
  }
  
  .caretdown {
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .frame-1410104059 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .book-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
  }

  .book-container-wrapper {
    display: flex;
    flex-direction: column;
    gap: 50px;
  }

  .notification-wrapper {
    margin: auto;
  }

  .frame-1410104106 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
  }

  .book-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
  }

  /* Cover Image Styles */
  .cover-image-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: 0;
  }

  .cover-image {
    display: flex;
    justify-content: center;
    align-items: center;
    background: white;
    border-radius: 24px;
    box-shadow: -2px 10px 0px black;
    overflow: hidden;
    max-width: 600px;
    width: 100%;
  }

  .cover-main-image {
    display: block;
    max-width: 100%;
    width: 100%;
    height: auto;
    object-fit: contain;
    border-radius: 0;
    pointer-events: none;
    position: relative;
    z-index: 1;
  }

  /* Mobile image split container - book style */
  .mobile-image-split {
    display: flex;
    flex-direction: row;
    gap: 2px;
    width: 100%;
  }
  
  /* Single page mode: center the single page */
  .mobile-image-split.single-page-mode {
    justify-content: center;
  }

  .mobile-image-half {
    position: relative;
    width: 100%;
    overflow: hidden;
    border-radius: 24px;
    background: white;
    box-shadow: -2px 10px 0px black;
    display: flex;
    align-items: stretch;
  }
  
  /* When showing only one page, limit its width */
  .mobile-image-half.single-page-full {
    max-width: 600px;
  }


  /* Base styles for split view images - must be applied to all halves */
  .mobile-image-half .scene-main-image {
    width: 200%;
    max-width: 200%;
    height: auto;
    object-fit: cover;
  }

  /* Split view image positioning - left half shows left 50% */
  .mobile-image-left .scene-main-image {
    object-position: left center;
    margin-left: 0;
  }

  /* Split view image positioning - right half shows right 50% */
  .mobile-image-right .scene-main-image {
    object-position: right center;
    margin-left: -100%;
  }

  .frame-1410104061 {
    align-self: stretch;
    padding: 16px;
    background: #eef6ff;
    border-radius: 12px;
    outline: 1px #438bff solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .frame-1410104054 {
    width: 100%;
    height: 100%;
    padding: 12px;
    background: #f8fafb;
    border-radius: 12px;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }
  .mobile-share-dots-button-group {
    display: none;
  }
  .mobile-button-container {
    display: none;
  }

  .inner-shadow{
    width: 100%;
    height: 100%;
    box-shadow: inset 0 -20px 10px 0 rgba(255, 255, 255);
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 2;
  }

  /* Loading, Error, and No Content States */
  .loading-container,
  .error-container,
  .no-content-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 400px;
    padding: 40px;
    text-align: center;
  }

  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #438bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .loading-container p,
  .no-content-container p {
    color: #666d80;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
  }

  .error-container {
    gap: 20px;
  }

  .error-message {
    color: #f44336;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
  }

  .retry-button {
    padding: 12px 24px;
    background: #438bff;
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }

  .retry-button:hover {
    background: #3a7de8;
  }

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
    max-width: min(95vw, 800px);
    max-height: min(95vh, 900px);
    width: 100%;
    overflow: auto;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    position: relative;
    background: white;
  }

  @media (max-width: 800px) {
    .modal-overlay {
      padding: 10px;
    }

    .modal-container {
      min-width: 100vw;
      min-height: 100vh;
      border-radius: 0;
    }

    .mobile-share-dots-button-group {
      display: flex;
      width: 100%;
      justify-content: center;
      gap: 10px;
    }
    .preview-story-cover {
      padding-left: 20px;
      padding-right: 20px;
    }
    .frame-1410103818 {
      width: 100%;
    }
    .notification {
      justify-content: center;
    }
    .mobile-button-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      gap: 10px;
    }
    .frame-8 {
      outline: none;
    }
    .mobile-button_03 {
      padding-left: 24px;
      padding-right: 24px;
      padding-top: 16px;
      padding-bottom: 16px;
      background: #438bff;
      border-radius: 20px;
      justify-content: center;
      align-items: center;
      gap: 10px;
      display: flex;
      width: 50%;
      cursor: pointer;
      transition: background 0.2s;
    }
    
    .mobile-button_03:hover:not(.disabled) {
      background: #3a7ae8;
    }
    .mobile-button_02 {
      width: 50%;
      padding-left: 24px;
      padding-right: 24px;
      padding-top: 16px;
      padding-bottom: 16px;
      box-shadow: 0px 4px 4px rgba(98.89, 98.89, 98.89, 0.25);
      border-radius: 20px;
      outline: 1px #ededed solid;
      outline-offset: -1px;
      justify-content: center;
      align-items: center;
      gap: 10px;
      display: flex;
      cursor: pointer;
      transition: background 0.2s;
    }
    
    .mobile-button_02:hover:not(.disabled) {
      background: #f5f5f5;
    }
    .button_03 {
      display: none;
    }
    .button_02 {
      display: none;
    }
    .frame-1410103860 {
      justify-content: center;
    }
    .frame-1410103860_01 {
      display: none;
    }
    .button {
      position: inherit;
    }
    .button_01 {
      position: inherit;
    }
    .frame-1410104060 {
      display: none;
    }
    .frame-1410104106 {
      flex-direction: column;
    }
    
    .mobile-image-split {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .mobile-image-half {
      width: 100%;
    }
    
    /* Cover image mobile styles */
    .cover-image-container {
      width: 100%;
      padding: 0;
    }
    
    .cover-image {
      max-width: 100%;
      width: 100%;
    }
    
    .cover-main-image {
      max-height: 70vh;
      width: 100%;
    }
    
    .two-pageview_span {
      font-size: 14px;
    }
    .one-pageview_span {
      font-size: 14px;
    }
    .button_view_01 {
      width: 50%;
    }
    .button_view {
      width: 50%;
    }
    .view-option {
      width: 100%;
    }
    .share-dots-button-group {
      display: none;
    }
  }

  /* Dedication Page Styles */
  .dedication-blank {
    background: white;
  }

  .dedication-blank-page {
    background: white;
    min-height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .dedication-page {
    background: white;
  }

  .dedication-content {
    background: white;
    min-height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 30px;
    position: relative;
    padding: 20px;
  }

  .dedication-image {
    max-width: 100%;
    width: auto;
    height: auto;
    object-fit: contain;
    border-radius: 12px;
    flex-shrink: 0;
  }

  .dedication-text-container {
    width: 70%;
    justify-content: center;
    margin-top: 20px;
    padding: 20px;
    flex-shrink: 0;
    position: absolute;
  }

  .dedication-text {
    font-size: 32px;
    line-height: 1.8;
    color: #333;
    margin: 0;
    font-family: 'Quicksand', sans-serif;
    font-weight: 500;
    text-align: center;
    max-width: 100%;
    word-wrap: break-word;
  }
</style>
