<script lang="ts">
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import ArrowLeft from "../../assets/ArrowLeft.svg";
  import ArrowRight from "../../assets/ArrowRight-white.svg";
  import SpeakerSimpleHigh from "../../assets/SpeakerSimpleHigh.svg";
  import Play from "../../assets/Play.svg";
  import CornersOut from "../../assets/CornersOut.svg";
  import forestBackground from "../../assets/forest_share_back.png";
  import waterBackground from "../../assets/water_share_back.png";
  import spaceBackground from "../../assets/space_share_back.png";
  import dedicationLeft from "../../assets/dedicationleft.png";
  import { getStoryById } from "../../lib/database/stories";

  let storyScenes: string[] = [];
  let storyPages: Array<{ pageNumber: number; text: string }> = [];
  let currentSceneIndex = 0;
  let storyTitle = "Loading...";
  let isLoading = true;
  let loadError = "";
  let isFullscreen = false;
  let storyWorld: 'forest' | 'underwater' | 'space' | '' = '';
  let backgroundImage = '';
  
  // Dedication data
  let dedicationText = '';
  let dedicationImage = '';
  let hasDedication = false;

  // Audio playback state
  let audioUrls: (string | null)[] = [];
  let currentAudio: HTMLAudioElement | null = null;
  let isPlaying = false;
  let audioProgress = 0;
  let audioDuration = 0;
  let audioCurrentTime = 0;

  // Load story data from database
  onMount(async () => {
    if (browser) {
      // Get story UID from URL query string (format: /share?{uid})
      const queryString = $page.url.search;
      const uid = queryString ? queryString.substring(1) : ''; // Remove the '?' prefix
      
      if (!uid) {
        loadError = "No story UID provided. Please check the share link.";
        isLoading = false;
        console.error("No UID found in URL");
        return;
      }
      
      try {
        // Fetch story from database
        const result = await getStoryById(uid);
        
        if (!result.success || !result.data) {
          loadError = result.error || "Story not found. The story may have been deleted.";
          isLoading = false;
          console.error("Failed to fetch story:", result.error);
          return;
        }
        
        const story = result.data;
        console.log("Loaded shared story:", story);
        
        // Set story title and world
        const storyData = Array.isArray(story) ? story[0] : story;
        storyTitle = storyData.story_title || "Untitled Story";
        storyWorld = storyData.story_world || '';
        
        // Set background image based on story world
        if (storyWorld === 'forest') {
          backgroundImage = forestBackground;
        } else if (storyWorld === 'underwater') {
          backgroundImage = waterBackground;
        } else if (storyWorld === 'space') {
          backgroundImage = spaceBackground;
        } else {
          // Default gradient background if story world is not set
          backgroundImage = '';
        }
        
        console.log("[share] Story world:", storyWorld, "Background:", backgroundImage);
        
        // Load audio URLs from database
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
          console.log("[share] Loaded audio URLs:", audioUrls.length);
        }
        
        // Build storyScenes array: [cover, scene1, scene2, ...]
        const loadedScenes: string[] = [];
        
        // Check if this is a search story type
        const isSearchStory = storyData.story_type === 'search';
        
        // Load story content/pages and extract scene images
        if (storyData.story_content) {
          try {
            // Parse story_content if it's a string
            const content = typeof storyData.story_content === 'string' 
              ? JSON.parse(storyData.story_content) 
              : storyData.story_content;
            
            console.log('[share] Parsed story content:', content);
            console.log('[share] Story type:', storyData.story_type, 'isSearchStory:', isSearchStory);
            
            // Handle search story type with specific structure: { cover, scenes: [{ sceneImage, sceneTitle, ... }] }
            if (isSearchStory && content.cover !== undefined && content.scenes && Array.isArray(content.scenes)) {
              // Add cover first
              const coverUrl = content.cover || storyData.story_cover;
              if (coverUrl) {
                loadedScenes.push(coverUrl.split("?")[0]);
                console.log('[share] Added search story cover:', coverUrl);
              }
              
              // Add scenes from the scenes array
              const scenesFromContent = content.scenes
                .map((scene: any) => scene.sceneImage || scene.image || scene.imageUrl || scene.image_url)
                .filter((url: string | undefined): url is string => !!url);
              
              if (scenesFromContent.length > 0) {
                loadedScenes.push(...scenesFromContent.map((url: string) => url.split("?")[0]));
                console.log('[share] Loaded search story scenes:', scenesFromContent);
              }
              
              // For search stories, we can optionally create pages from scene titles
              if (content.scenes && Array.isArray(content.scenes)) {
                storyPages = content.scenes.map((scene: any, index: number) => ({
                  pageNumber: index + 1,
                  text: scene.sceneTitle || scene.title || `Scene ${index + 1}`
                }));
              }
            } else {
              // Handle regular story types (existing logic)
              // First, add the story cover if available
              const coverUrl = storyData.story_cover || content.cover;
              if (coverUrl) {
                loadedScenes.push(coverUrl.split("?")[0]);
                console.log('[share] Added story cover:', coverUrl);
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
                  console.log('[share] Loaded scene images from pages:', scenesFromPages);
                }
              } else if (content.pages && Array.isArray(content.pages)) {
                // If it has a pages property
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
                  console.log('[share] Loaded scene images from content.pages:', scenesFromPages);
                }
              } else if (typeof content === 'string') {
                // If it's a single string, create one page
                storyPages = [{ pageNumber: 1, text: content }];
              }
              
              // Fallback: use scene_images if available and no scenes loaded yet
              if (loadedScenes.length <= 1 && storyData.scene_images && Array.isArray(storyData.scene_images)) {
                loadedScenes.push(...storyData.scene_images.map((url: string) => url.split("?")[0]));
                console.log('[share] Loaded scenes from scene_images fallback:', storyData.scene_images.length);
              }
            }
            
            console.log('[share] Loaded scenes:', loadedScenes.length, loadedScenes);
            console.log('[share] Loaded pages:', storyPages.length, storyPages);
            
          } catch (error) {
            console.error('[share] Error parsing story content:', error);
            loadError = "Error loading story content.";
          }
        }
        
        // Check for dedication and insert after cover if it exists
        if (storyData.dedication_text || storyData.dedication_image) {
          dedicationText = storyData.dedication_text || '';
          dedicationImage = storyData.dedication_image ? storyData.dedication_image.split("?")[0] : '';
          hasDedication = true;
          
          // Insert dedication scene after cover (at index 1)
          // We'll use a special marker for dedication
          if (loadedScenes.length > 0) {
            loadedScenes.splice(1, 0, 'DEDICATION_PAGE');
            console.log('[share] Added dedication page after cover');
          }
        }
        
        storyScenes = loadedScenes;
        
        if (storyScenes.length === 0) {
          loadError = "Story has no images to display.";
        }
        
        isLoading = false;
        
      } catch (error) {
        console.error("Error loading story:", error);
        loadError = "An unexpected error occurred while loading the story.";
        isLoading = false;
      }
    }
  });

  function previousScene() {
    if (currentSceneIndex > 0) {
      currentSceneIndex--;
      stopAudio();
    }
  }

  function nextScene() {
    if (currentSceneIndex < storyScenes.length - 1) {
      currentSceneIndex++;
      stopAudio();
    }
  }

  function goToScene(index: number) {
    if (index >= 0 && index < storyScenes.length) {
      currentSceneIndex = index;
      stopAudio();
    }
  }

  // Audio playback functions
  function toggleAudio() {
    // Skip audio for cover (index 0) and dedication (index 1 if hasDedication)
    if (currentSceneIndex === 0 || (hasDedication && currentSceneIndex === 1)) {
      console.log("[share] No audio available for this page");
      return;
    }
    
    // Audio index: account for cover and dedication
    const audioIndex = currentSceneIndex - (hasDedication ? 2 : 1);
    
    if (audioIndex < 0 || audioIndex >= audioUrls.length || !audioUrls[audioIndex]) {
      console.log("[share] No audio available for this page");
      return;
    }

    if (isPlaying && currentAudio) {
      pauseAudio();
    } else {
      playAudio(audioIndex);
    }
  }

  function playAudio(audioIndex: number) {
    const audioUrl = audioUrls[audioIndex];
    if (!audioUrl) return;

    // If we're resuming the same audio
    if (currentAudio && currentAudio.src === audioUrl) {
      currentAudio.play();
      isPlaying = true;
      return;
    }

    // Stop current audio and play new one
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }

    currentAudio = new Audio(audioUrl);
    
    currentAudio.addEventListener('loadedmetadata', () => {
      audioDuration = currentAudio?.duration || 0;
    });
    
    currentAudio.addEventListener('timeupdate', () => {
      if (currentAudio) {
        audioCurrentTime = currentAudio.currentTime;
        audioProgress = (currentAudio.currentTime / currentAudio.duration) * 100;
      }
    });
    
    currentAudio.addEventListener('ended', () => {
      isPlaying = false;
      audioProgress = 0;
      audioCurrentTime = 0;
    });
    
    currentAudio.play();
    isPlaying = true;
  }

  function pauseAudio() {
    if (currentAudio) {
      currentAudio.pause();
      isPlaying = false;
    }
  }

  function stopAudio() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
      isPlaying = false;
      audioProgress = 0;
      audioCurrentTime = 0;
    }
  }

  function seekAudio(event: MouseEvent) {
    if (!currentAudio || !audioDuration) return;
    
    const progressBar = event.currentTarget as HTMLElement;
    const rect = progressBar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * audioDuration;
    
    currentAudio.currentTime = newTime;
    audioCurrentTime = newTime;
    audioProgress = percentage * 100;
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function handleBackToDashboard() {
    goto('/dashboard');
  }

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

<svelte:head>
  <title>{storyTitle} - Shared Story</title>
</svelte:head>

<div 
  class="story-preview-container"
  class:has-background-image={!!backgroundImage}
  style={backgroundImage ? `background-image: url(${backgroundImage}); background-size: cover; background-position: center; background-attachment: fixed;` : ''}
>
  {#if isLoading}
    <div class="loading-container">
      <div class="spinner"></div>
      <p>Loading story...</p>
    </div>
  {:else if loadError}
    <div class="error-container">
      <h2>Unable to Load Story</h2>
      <p>{loadError}</p>
      <button class="btn-primary" on:click={() => goto('/')}>Go to Home</button>
    </div>
  {:else}
    <!-- Header -->
    <div class="story-header">
      <div class="header-left">
        <button class="btn-back" on:click={handleBackToDashboard}>
          <img src={ArrowLeft} alt="Back" />
          <span>Back</span>
        </button>
      </div>
      <div class="header-center">
        <h1 class="story-title">{storyTitle}</h1>
      </div>
      <div class="header-right"></div>
    </div>

    <!-- Main Story Viewer -->
    <div class="story-viewer">
      <!-- Book Container -->
      <div class="book-container">
        {#if currentSceneIndex === 0}
          <!-- Cover: Single image display -->
          <div class="cover-image-container">
            <div class="cover-image">
              <img
                src={storyScenes[currentSceneIndex]}
                alt="Story Cover"
                class="cover-main-image"
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
        {:else}
          <!-- Story Pages: Split into left and right halves -->
          <div class="mobile-image-split">
            <div class="mobile-image-half mobile-image-left">
              <div class="image">
                {#if storyScenes[currentSceneIndex] && storyScenes[currentSceneIndex] !== 'DEDICATION_PAGE'}
                  <img
                    src={storyScenes[currentSceneIndex]}
                    alt={`Scene ${currentSceneIndex} - Left`}
                    class="scene-main-image scene-image-left"
                    draggable="false"
                  />
                {/if}
                <div class="inner-shadow"></div>
              </div>
            </div>
            <div class="mobile-image-half mobile-image-right">
              <div class="image">
                {#if storyScenes[currentSceneIndex] && storyScenes[currentSceneIndex] !== 'DEDICATION_PAGE'}
                  <img
                    src={storyScenes[currentSceneIndex]}
                    alt={`Scene ${currentSceneIndex} - Right`}
                    class="scene-main-image scene-image-right"
                    draggable="false"
                  />
                {/if}
                <div class="inner-shadow"></div>
              </div>
            </div>
          </div>
        {/if}
        
        <!-- Full Screen Preview Button -->
        <div class="fullscreen-button-container">
          <button 
            class="fullscreen-button"
            on:click={toggleFullscreen}
          >
            <img src={CornersOut} alt="Fullscreen" />
            <span>{isFullscreen ? 'Exit Full Screen' : 'Full Screen Preview'}</span>
          </button>
        </div>
      </div>

      <!-- Story Text (if available and not cover or dedication) -->
      {#if currentSceneIndex > 0 && !(hasDedication && currentSceneIndex === 1) && storyPages[currentSceneIndex - (hasDedication ? 2 : 1)]}
        <div class="story-text-container">
          <p class="story-text">{storyPages[currentSceneIndex - (hasDedication ? 2 : 1)].text}</p>
        </div>
      {/if}

      <!-- Audio Controls (only show if not cover page, not dedication, and audio exists) -->
      {#if currentSceneIndex > 0 && !(hasDedication && currentSceneIndex === 1) && audioUrls[currentSceneIndex - (hasDedication ? 2 : 1)]}
        <div class="audio-controls">
          <div class="audio-header">
            <span class="audio-label">Audio Narration</span>
            <span class="audio-time-display">
              {formatTime(audioCurrentTime)} / {formatTime(audioDuration)}
            </span>
          </div>
          <div class="audio-controls-row">
            <button class="audio-play-btn" on:click={toggleAudio}>
              {#if isPlaying}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <rect x="7" y="5" width="3" height="14" rx="1"/>
                  <rect x="14" y="5" width="3" height="14" rx="1"/>
                </svg>
              {:else}
                <img src={Play} alt="Play" />
              {/if}
            </button>
            
            <div class="audio-progress-wrapper">
              <img src={SpeakerSimpleHigh} alt="speaker" class="speaker-icon" />
              <button 
                class="audio-progress-bar" 
                on:click={seekAudio}
                aria-label="Seek audio to position"
              >
                <div class="audio-progress-fill" style="width: {audioProgress}%"></div>
              </button>
            </div>
          </div>
        </div>
      {/if}

      <!-- Navigation Controls -->
      <div class="navigation-controls">
        <button 
          class="button-prev" 
          on:click={previousScene}
          disabled={currentSceneIndex === 0 || storyScenes.length === 0}
          class:disabled={currentSceneIndex === 0 || storyScenes.length === 0}
        >
          <div class="arrowleft">
            <img src={ArrowLeft} alt="arrow" />
          </div>
          <div class="previous">
            <span class="previous_span">Previous</span>
          </div>
        </button>

        <div class="page-indicators">
          {#if storyScenes.length > 0}
            {#each storyScenes as _, idx}
              <button 
                class="page-number" 
                class:active={idx === currentSceneIndex}
                on:click={() => goToScene(idx)}
              >
                <span>{idx + 1}</span>
              </button>
            {/each}
          {/if}
        </div>

        <button 
          class="button-next" 
          on:click={nextScene}
          disabled={storyScenes.length === 0 || currentSceneIndex >= storyScenes.length - 1}
          class:disabled={storyScenes.length === 0 || currentSceneIndex >= storyScenes.length - 1}
        >
          <div class="next"><span class="next_span">Next</span></div>
          <div class="arrowleft">
            <img src={ArrowRight} alt="arrow" />
          </div>
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .story-preview-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    flex-direction: column;
    padding: 20px;
    position: relative;
  }

  /* Add overlay for better readability when using background images */
  .story-preview-container.has-background-image::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.15);
    z-index: 0;
    pointer-events: none;
  }

  .story-preview-container > * {
    position: relative;
    z-index: 1;
  }

  .loading-container,
  .error-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    text-align: center;
    gap: 20px;
  }

  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .error-container h2 {
    font-size: 28px;
    margin-bottom: 10px;
  }

  .error-container p {
    font-size: 16px;
    opacity: 0.9;
    max-width: 500px;
  }

  .btn-primary {
    padding: 12px 32px;
    background: white;
    color: #667eea;
    border: none;
    border-radius: 25px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 20px;
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  }

  /* Header */
  .story-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 30px;
    max-width: 1200px;
    width: 100%;
    margin-left: auto;
    margin-right: auto;
  }

  .header-left,
  .header-right {
    flex: 1;
  }

  .header-center {
    flex: 2;
    text-align: center;
  }

  .btn-back {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: rgba(255, 255, 255, 0.2);
    border: 2px solid white;
    border-radius: 20px;
    color: white;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
  }

  .btn-back:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }

  .btn-back img {
    width: 20px;
    height: 20px;
    filter: brightness(0) invert(1);
  }

  .story-title {
    color: white;
    font-size: 32px;
    font-weight: 700;
    margin: 0;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  }

  /* Story Viewer */
  .story-viewer {
    flex: 1;
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 30px;
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
    position: relative;
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

  /* Two-Page Spread Styles */
  .mobile-image-split {
    display: flex;
    flex-direction: row;
    gap: 2px;
    width: 100%;
    justify-content: center;
  }

  .mobile-image-half {
    position: relative;
    width: 50%;
    max-width: 500px;
    overflow: hidden;
    border-radius: 24px;
    background: white;
    box-shadow: -2px 10px 0px black;
    display: flex;
    align-items: stretch;
  }

  .image {
    position: relative;
    width: 100%;
    overflow: hidden;
    display: flex;
    align-items: center;
  }

  /* Base styles for split view images - must be applied to all halves */
  .mobile-image-half .scene-main-image {
    width: 200%;
    max-width: 200%;
    height: auto;
    object-fit: cover;
    display: block;
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

  .scene-main-image {
    pointer-events: none;
    position: relative;
    z-index: 1;
  }

  .inner-shadow {
    width: 100%;
    height: 100%;
    box-shadow: inset 0 -20px 10px 0 rgba(255, 255, 255);
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 2;
    pointer-events: none;
  }

  /* Dedication Page Styles */
  .dedication-blank {
    background: white;
  }

  .dedication-blank-page {
    background: white;
    min-height: 100%;
    width: 100%;
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
    display: flex;
    justify-content: center;
    margin-top: 100px;
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

  /* Story Text */
  .story-text-container {
    padding: 30px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }

  .story-text {
    font-size: 18px;
    line-height: 1.8;
    color: #333;
    margin: 0;
    font-family: 'Quicksand', sans-serif;
  }

  /* Fullscreen Button */
  .fullscreen-button-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }

  .fullscreen-button {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 28px;
    background: white;
    border: none;
    border-radius: 20px;
    font-size: 18px;
    font-weight: 600;
    font-family: 'Quicksand', sans-serif;
    color: #141414;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }

  .fullscreen-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }

  .fullscreen-button img {
    width: 24px;
    height: 24px;
  }

  /* Navigation Controls */
  .navigation-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    margin-top: 20px;
  }

  .button-prev,
  .button-next {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 24px;
    background: white;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    font-family: 'Quicksand', sans-serif;
  }

  .button-prev:hover:not(.disabled),
  .button-next:hover:not(.disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }

  .button-prev.disabled,
  .button-next.disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .arrowleft img {
    width: 24px;
    height: 24px;
  }

  .previous_span,
  .next_span {
    color: #141414;
    font-size: 18px;
    font-weight: 600;
    line-height: 25.2px;
  }

  .page-indicators {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: center;
    flex: 1;
  }

  .page-number {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: white;
    border: 2px solid transparent;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Quicksand', sans-serif;
    font-size: 18px;
    font-weight: 600;
    color: #141414;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .page-number:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .page-number.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-color: white;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.5);
  }

  /* Audio Controls */
  .audio-controls {
    padding: 20px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }

  .audio-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .audio-label {
    color: #141414;
    font-size: 16px;
    font-family: 'Quicksand', sans-serif;
    font-weight: 600;
  }

  .audio-time-display {
    color: #666d80;
    font-size: 14px;
    font-family: 'Quicksand', sans-serif;
    font-weight: 600;
  }

  .audio-controls-row {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .audio-play-btn {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #438bff;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    flex-shrink: 0;
  }

  .audio-play-btn:hover {
    background: #3a7ae4;
    transform: scale(1.05);
  }

  .audio-play-btn img,
  .audio-play-btn svg {
    width: 24px;
    height: 24px;
  }

  .audio-progress-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .speaker-icon {
    width: 24px;
    height: 24px;
  }

  .audio-progress-bar {
    flex: 1;
    height: 8px;
    background: #e0e0e0;
    border-radius: 4px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    border: none;
    padding: 0;
    outline: none;
  }

  .audio-progress-bar:focus {
    outline: 2px solid #438bff;
    outline-offset: 2px;
  }

  .audio-progress-fill {
    height: 100%;
    background: #438bff;
    border-radius: 4px;
    transition: width 0.1s ease;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .story-preview-container {
      padding: 10px;
    }

    .story-header {
      flex-direction: column;
      gap: 15px;
      margin-bottom: 20px;
    }

    .header-left,
    .header-center,
    .header-right {
      flex: none;
      width: 100%;
    }

    .btn-back {
      width: fit-content;
    }

    .story-title {
      font-size: 24px;
    }

    .story-text {
      font-size: 16px;
      line-height: 1.6;
    }

    .story-text-container {
      padding: 20px;
    }

    .navigation-controls {
      flex-direction: column;
      gap: 15px;
    }

    .button-prev,
    .button-next {
      width: 100%;
      justify-content: center;
    }

    .page-indicators {
      order: -1;
      width: 100%;
    }

    .page-number {
      width: 40px;
      height: 40px;
      font-size: 16px;
    }

    .audio-controls-row {
      flex-direction: column;
      gap: 12px;
    }

    .audio-progress-wrapper {
      width: 100%;
    }

    /* Mobile: Stack pages vertically */
    .mobile-image-split {
      flex-direction: column;
      gap: 20px;
    }

    .mobile-image-half {
      width: 100%;
      max-width: 100%;
    }

    .fullscreen-button {
      font-size: 16px;
      padding: 12px 24px;
    }

    .fullscreen-button img {
      width: 20px;
      height: 20px;
    }

    .previous_span,
    .next_span {
      font-size: 16px;
    }
  }

  /* Fullscreen mode adjustments */
  :global(body:fullscreen) .story-preview-container,
  :global(body:-webkit-full-screen) .story-preview-container,
  :global(body:-moz-full-screen) .story-preview-container {
    padding: 40px;
  }

  @media (max-width: 1024px) {
    .mobile-image-half {
      max-width: 450px;
    }

    .navigation-controls {
      gap: 15px;
    }

    .page-indicators {
      gap: 8px;
    }
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    .button-prev,
    .button-next {
      padding: 12px 20px;
    }

    .previous_span,
    .next_span {
      font-size: 16px;
    }
  }
</style>


