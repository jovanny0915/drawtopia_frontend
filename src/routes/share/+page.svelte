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
  import forestBackground from "../../assets/forest_share_back.webp";
  import waterBackground from "../../assets/water_share_back.webp";
  import spaceBackground from "../../assets/space_share_back.webp";
  import Link from "../../assets/Link.svg";
  import logo from "../../assets/white-logo.webp";
  import ISBNBarcode from "../../assets/ISBNBarcode.svg";
  import { getStoryById } from "../../lib/database/stories";
  import { supabase } from "../../lib/supabase";
  import BookShareFooter from "../../components/BookShareFooter.svelte";

  export let data: {
    story?: any;
    uid?: string;
    shareCanonicalUrl?: string;
    meta?: { title: string; description: string; imageUrl: string } | null;
  } = {} as any;

  let storyScenes: string[] = [];
  let storyPages: Array<{ pageNumber: number; text: string }> = [];
  let currentSceneIndex = 0;
  let storyTitle = "Loading...";
  let isLoading = true;
  let loadError = "";
  let isFullscreen = false;
  let storyWorld: 'forest' | 'underwater' | 'space' | '' = '';
  let backgroundImage = '';
  
  // Dedication and copyright data
  let dedicationText = '';
  let dedicationImage = '';
  let copyrightImage = '';
  let hasDedication = false;
  let copyrightChildName = 'your child';
  let copyrightCharacterName = 'your character';
  
  let lastWordPageImage = '';
  let lastAdminPageImage = '';
  let backCoverImage = '';
  let hasLastWordsAdmin = false;
  let currentPageText = '';
  let currentStoryPageNumber = -1;
  let showStoryTextOverlay = false;
  let backCoverAgeText = 'Ages 6-12';

  function formatAgeGroupLabel(ageGroup: string | null | undefined): string {
    const normalized = (ageGroup || '').trim();
    return normalized ? `Ages ${normalized}` : 'Ages 6-12';
  }

  $: dedicationParsed = (() => {
    const raw = (dedicationText || '').trim();
    if (!raw) return { body: '', signature: '' };
    const dashMatch = raw.match(/\s+[—–-]\s+(.+)$/);
    if (dashMatch) {
      return {
        body: raw.slice(0, dashMatch.index).trim(),
        signature: (dashMatch[1] || '').trim() ? `— ${dashMatch[1].trim()}` : ''
      };
    }
    return { body: raw, signature: '' };
  })();

  // Audio playback state
  let audioUrls: (string | null)[] = [];
  let currentAudio: HTMLAudioElement | null = null;
  let isPlaying = false;
  let audioProgress = 0;
  let audioDuration = 0;
  let audioCurrentTime = 0;
  let shareAudioIndex = -1;

  // Load story data from load() when available, otherwise fetch in onMount
  onMount(async () => {
    if (!browser) return;
    const uid = data?.uid ?? ($page.url.search ? $page.url.search.substring(1) : '');
    if (!uid) {
      loadError = "No story UID provided. Please check the share link.";
      isLoading = false;
      return;
    }
    let story = data?.story;
    if (!story) {
      try {
        const result = await getStoryById(uid);
        if (!result.success || !result.data) {
          loadError = result.error || "Story not found. The story may have been deleted.";
          isLoading = false;
          return;
        }
        story = result.data;
      } catch (error) {
        console.error("Error loading story:", error);
        loadError = "An unexpected error occurred while loading the story.";
        isLoading = false;
        return;
      }
    }
    try {
        console.log("Loaded shared story:", story);
        
        // Set story title and world
        const storyData = Array.isArray(story) ? story[0] : story;
        storyTitle = storyData.story_title || "Untitled Story";
        storyWorld = storyData.story_world || '';
        backCoverAgeText = formatAgeGroupLabel(storyData.age_group);
        copyrightChildName = storyData.child_name || storyData.child_first_name || 'your child';
        if (storyData.child_profile_id) {
          const { data: childProfile, error: childProfileError } = await supabase
            .from('child_profiles')
            .select('first_name, age_group')
            .eq('id', storyData.child_profile_id)
            .maybeSingle();

          if (childProfileError) {
            console.warn('[share] Failed to fetch child profile first_name:', childProfileError);
          } else if (childProfile?.first_name?.trim()) {
            copyrightChildName = childProfile.first_name.trim();
          }
          if (!storyData.age_group && childProfile?.age_group) {
            backCoverAgeText = formatAgeGroupLabel(childProfile.age_group);
          }
        }
        copyrightCharacterName = storyData.character_name || 'your character';
        
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
        
        // Check for copyright and dedication images, and insert after cover if they exist
        copyrightImage = storyData.copyright_image ? storyData.copyright_image.split("?")[0] : '';
        dedicationText = storyData.dedication_text || '';
        dedicationImage = storyData.dedication_image ? storyData.dedication_image.split("?")[0] : '';
        
        // If we have copyright or dedication, add the copyright/dedication page
        if (copyrightImage || dedicationImage || dedicationText) {
          hasDedication = true;
          
          // Insert copyright/dedication scene after cover (at index 1)
          // We'll use a special marker for this combined page
          if (loadedScenes.length > 0) {
            loadedScenes.splice(1, 0, 'COPYRIGHT_DEDICATION_PAGE');
            console.log('[share] Added copyright/dedication page after cover');
          }
        }
        
        if (storyData.last_word_page_image)
          lastWordPageImage = storyData.last_word_page_image.split("?")[0];
        if (storyData.last_admin_page_image)
          lastAdminPageImage = storyData.last_admin_page_image.split("?")[0];
        if (lastWordPageImage || lastAdminPageImage) {
          hasLastWordsAdmin = true;
          loadedScenes.push('LAST_WORDS_ADMIN_PAGE');
        }
        if (storyData.back_cover_image) {
          backCoverImage = storyData.back_cover_image.split("?")[0];
          loadedScenes.push(backCoverImage);
        }
        
        storyScenes = loadedScenes;
        if (storyScenes.length === 0) {
          loadError = "Story has no images to display.";
        }
    } catch (error) {
      console.error("[share] Error loading story:", error);
      loadError = "An unexpected error occurred while loading the story.";
    }
    isLoading = false;
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

  function isSpecialSceneIndex(idx: number): boolean {
    if (idx < 0 || !Array.isArray(storyScenes) || idx >= storyScenes.length) return true;
    if (idx === 0) return true;
    if (hasDedication && idx === 1) return true;
    if (storyScenes[idx] === 'LAST_WORDS_ADMIN_PAGE') return true;
    if (backCoverImage && idx === storyScenes.length - 1) return true;
    return false;
  }

  function getStoryPageIndex(sceneIndex: number): number {
    if (isSpecialSceneIndex(sceneIndex)) return -1;
    return sceneIndex - (hasDedication ? 2 : 1);
  }

  // Keep audio index in sync with scene and story structure changes.
  $: {
    currentSceneIndex;
    storyScenes;
    hasDedication;
    backCoverImage;
    shareAudioIndex = getStoryPageIndex(currentSceneIndex);
  }

  $: currentPageText = (() => {
    if (isSpecialSceneIndex(currentSceneIndex)) return '';
    const pageIndex = getStoryPageIndex(currentSceneIndex);
    return storyPages.length > 0 && pageIndex >= 0 && pageIndex < storyPages.length
      ? storyPages[pageIndex].text
      : '';
  })();

  $: currentStoryPageNumber = (() => {
    const pageIndex = getStoryPageIndex(currentSceneIndex);
    return pageIndex >= 0 ? pageIndex + 1 : -1;
  })();

  $: showStoryTextOverlay =
    !isSpecialSceneIndex(currentSceneIndex) &&
    currentStoryPageNumber >= 1 &&
    !!currentPageText?.trim();

  function toggleAudio() {
    if (isSpecialSceneIndex(currentSceneIndex)) {
      console.log("[share] No audio available for this page");
      return;
    }
    const audioIndex = getStoryPageIndex(currentSceneIndex);
    
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
  <title>{data?.meta?.title ?? storyTitle} - Shared Story</title>
  {#if data?.meta && data?.shareCanonicalUrl}
    <!-- Open Graph (Facebook / Meta) -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content={data.shareCanonicalUrl} />
    <meta property="og:title" content={data.meta.title} />
    <meta property="og:description" content={data.meta.description} />
    {#if data.meta.imageUrl}
      <meta property="og:image" content={data.meta.imageUrl} />
      <meta property="og:image:secure_url" content={data.meta.imageUrl} />
    {/if}
    <meta property="og:site_name" content="Drawtopia" />
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={data.meta.title} />
    <meta name="twitter:description" content={data.meta.description} />
    {#if data.meta.imageUrl}
      <meta name="twitter:image" content={data.meta.imageUrl} />
    {/if}
  {/if}
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
              <img src={logo} alt="Drawtopia logo" class="cover-bottom-logo" />
              <div class="inner-shadow"></div>
            </div>
          </div>
        {:else if hasDedication && currentSceneIndex === 1 && storyScenes[currentSceneIndex] === 'COPYRIGHT_DEDICATION_PAGE'}
          <div class="mobile-image-split">
            <div class="mobile-image-half mobile-image-left dedication-blank copyright-page-wrapper" style="position: relative;">
              <div class="copyright-page-bg" style={copyrightImage ? `background-image: url(${copyrightImage});` : ''}></div>
              <div class="center-blur-decoration" aria-hidden="true"></div>
              <div class="copyright-page-right-blur" aria-hidden="true"></div>
              <div class="copyright-page-content">
                <div class="copyright-page-text-container">
                  <p class="copyright-page-p">This one-of-a-kind adventure story<br />was created just for <b style="font-weight: 800; font-size: 1.2rem;">{copyrightChildName}</b>.</p>
                  <p class="copyright-page-p">Beyond these pages lies a magical world<br />filled with wonder, mystery, and brave moments.<br />Every scene unfolds a new chapter in the journey.</p>
                  <p class="copyright-page-p">Follow {copyrightCharacterName} through lands of shadow<br />and light, where courage is tested and imagination<br />guides the way forward.</p>
                  <p class="copyright-page-p">This story celebrates <b style="font-weight: 800; font-size: 1.2rem;">{copyrightChildName}</b>'s creativity<br />and courage. Turn the page and begin your adventure<br />into the unknown-where magic awaits.</p>
                </div>
                <p class="copyright-page-footer">© 2026 Drawtopia. All rights reserved.<br />Published by Drawtopia | drawtopia.ai</p>
              </div>
            </div>
            <div class="mobile-image-half mobile-image-right dedication-page dedication-page-wrapper">
              <div class="dedication-page-bg" style={dedicationImage ? `background-image: url(${dedicationImage});` : ''}></div>
              <div class="dedication-page-left-blur" aria-hidden="true"></div>
              <div class="dedication-page-content">
                <h2 class="dedication-greeting">Dear {copyrightChildName}</h2>
                {#if dedicationParsed.body}
                  <p class="dedication-body">{dedicationParsed.body}</p>
                {:else}
                  <p class="dedication-body">In every tiny thing you do each day, never forget that you are loved enormously</p>
                {/if}
                {#if dedicationParsed.signature}
                  <p class="dedication-signature">{dedicationParsed.signature}</p>
                {/if}
              </div>
            </div>
          </div>
        {:else if hasLastWordsAdmin && storyScenes[currentSceneIndex] === 'LAST_WORDS_ADMIN_PAGE'}
          <div class="mobile-image-split">
            <div class="mobile-image-half mobile-image-left last-words-page-wrapper">
              <div class="image">
                <div class="last-words-page-bg" style={lastWordPageImage ? `background-image: url(${lastWordPageImage});` : ''}></div>
                <div class="center-blur-decoration" aria-hidden="true"></div>
                <div class="last-words-page-content">
                  <h2 class="last-words-page-title">A Special Thank You</h2>
                  <p class="last-words-page-body">This magical adventure wouldn't exist without the incredible imagination of {copyrightChildName}. Thank you for sharing your creativity with the world!</p>
                  <p class="last-words-page-tagline">Every drawing tells a story. Yours told this one.</p>
                </div>
                <div class="inner-shadow"></div>
              </div>
            </div>
            <div class="mobile-image-half mobile-image-right last-admin-page-wrapper">
              <div class="image_01" style="position: relative;">
                <div class="last-admin-page-bg" style={lastAdminPageImage ? `background-image: url(${lastAdminPageImage});` : ''}></div>
                <div class="last-admin-page-left-blur" aria-hidden="true"></div>
                <div style="z-index: 1; display: flex; justify-content: center;">
                  <img src={logo} alt="Drawtopia" class="last-admin-page-logo" style="position: absolute; justify-self: anchor-center;" />
                  <div class="last-admin-page-content">
                    <h2 class="last-admin-page-title">Where Every Child Becomes a Storyteller</h2>
                    <p class="last-admin-page-tagline">Their imagination. Their characters. Their stories. Enhanced, not replaced.</p>
                    <p class="last-admin-page-body">At Drawtopia, we believe every child's drawing holds a story waiting to be told. We use the magic of AI to enhance - never replace - your child's authentic artwork, turning their imagination into adventures they'll treasure forever.</p>
                  </div>
                </div>
                <div class="inner-shadow"></div>
                <a href="https://drawtopia.ai" target="_blank" rel="noopener noreferrer" class="last-admin-page-cta last-admin-page-cta-clickable">
                  <img src={Link} alt="" class="last-admin-page-cta-icon" />
                  <span>Drawtopia.ai</span>
                </a>
              </div>
            </div>
          </div>
        {:else if backCoverImage && currentSceneIndex === storyScenes.length - 1}
          <div class="cover-image-container">
            <div class="image cover-image back-cover-wrapper">
              <div class="back-cover-bg" style={backCoverImage ? `background-image: url(${backCoverImage});` : ''}></div>
              <div class="back-cover-content">
                <div class="back-cover-title-blur" aria-hidden="true"></div>
                <div class="back-cover-bottom-blur" aria-hidden="true"></div>
                <h1 class="back-cover-title">Drawtopia Makes<br />Every Child a<br />Storyteller</h1>
                <p class="back-cover-description">At Drawtopia, we believe every child's drawing holds a story waiting to be told. We use the magic of AI to enhance - never replace - your child's authentic artwork, turning their imagination into adventures they'll treasure forever.</p>
                <div class="back-cover-bottom-left">
                  <img src={logo} alt="Drawtopia" class="back-cover-logo" />
                  <p class="back-cover-tagline">Their imagination. Their characters.<br /> Their stories. Enhanced, not replaced.</p>
                  <p class="back-cover-website">drawtopia.ai</p>
                </div>
                <div class="back-cover-bottom-right">
                  <p class="back-cover-isbn">ISBN placeholder</p>
                  <img src={ISBNBarcode} alt="ISBN barcode" class="back-cover-isbn-barcode" />
                  <p class="back-cover-age">{backCoverAgeText}</p>
                </div>
              </div>
              <div class="inner-shadow"></div>
            </div>
          </div>
        {:else}
          <div class="mobile-image-split">
            <div class="mobile-image-half mobile-image-left">
              <div class="image">
                {#if storyScenes[currentSceneIndex] && storyScenes[currentSceneIndex] !== 'COPYRIGHT_DEDICATION_PAGE' && storyScenes[currentSceneIndex] !== 'LAST_WORDS_ADMIN_PAGE'}
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
                {#if storyScenes[currentSceneIndex] && storyScenes[currentSceneIndex] !== 'COPYRIGHT_DEDICATION_PAGE' && storyScenes[currentSceneIndex] !== 'LAST_WORDS_ADMIN_PAGE'}
                  <img
                    src={storyScenes[currentSceneIndex]}
                    alt={`Scene ${currentSceneIndex} - Right`}
                    class="scene-main-image scene-image-right"
                    draggable="false"
                  />
                {/if}
                {#if showStoryTextOverlay}
                  <div class="story-main-text-overlay">
                    <div class="story-main-text-blur-layer"></div>
                    <p class="story-main-text">{currentPageText}</p>
                  </div>
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

      {#if shareAudioIndex >= 0 && audioUrls[shareAudioIndex]}
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

        <div class="navigation-buttons">
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
    </div>
  {/if}
</div>
{#if !isFullscreen}
  <BookShareFooter />
{/if}

<style>
  .story-preview-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    flex-direction: column;
    padding: 20px;
    padding-bottom: 92px;
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

  .header-left {
    flex: 1;
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

  /* Story Viewer */
  .story-viewer {
    flex: 1;
    max-width: 980px;
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
    max-width: 400px;
    width: 100%;
    height: 60dvh;
    position: relative;
  }

  .cover-main-image {
    display: block;
    max-width: 100%;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 0;
    pointer-events: none;
    position: relative;
    z-index: 1;
  }

  .cover-bottom-logo {
    position: absolute;
    left: 50%;
    bottom: 18px;
    transform: translateX(-50%);
    width: clamp(96px, 30%, 140px);
    height: auto;
    z-index: 2;
    pointer-events: none;
  }

  /* Two-Page Spread Styles */
  .mobile-image-split {
    display: flex;
    flex-direction: row;
    gap: 2px;
    width: 100%;
    justify-content: center;
    height: 60dvh;
  }

  .mobile-image-half {
    position: relative;
    width: 50%;
    max-width: 410px;
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

  /* Special pages styles (aligned with /preview/default) */
  .dedication-blank,
  .dedication-page {
    background: transparent;
  }

  .dedication-page-wrapper,
  .copyright-page-wrapper {
    position: relative;
    min-height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .dedication-page-bg,
  .copyright-page-bg,
  .last-words-page-bg,
  .last-admin-page-bg,
  .back-cover-bg {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-color: #1a2f38;
    background-image: linear-gradient(180deg, #1a3540 0%, #152f38 20%, #14323a 40%, #163a3e 60%, #152f36 80%, #1a3540 100%);
  }

  .dedication-page-content {
    position: relative;
    z-index: 1;
    text-align: center;
    padding: 2.5rem 2rem;
    max-width: 70%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.75rem;
  }

  .dedication-greeting {
    font-family: 'Quicksand', sans-serif;
    font-weight: 500;
    font-size: 1.8rem;
    line-height: 1.3;
    color: #ffffff;
    margin: 0;
  }

  .dedication-body {
    font-family: 'Quicksand', sans-serif;
    font-weight: 400;
    font-size: 1.3rem;
    line-height: 1.65;
    color: #ffffff;
    margin: 0;
  }

  .dedication-signature {
    font-family: 'Quicksand', sans-serif;
    font-weight: 400;
    font-size: 1.1rem;
    line-height: 1.4;
    color: #ffffff;
    margin: 0;
  }

  .copyright-page-text-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .copyright-page-content {
    z-index: 1;
    text-align: center;
    max-width: 85%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8rem;
  }

  .copyright-page-p,
  .copyright-page-footer {
    font-family: 'Quicksand', sans-serif;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.92);
    margin: 0;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
  }

  .copyright-page-p {
    font-size: 0.8rem;
    line-height: 1;
  }

  .copyright-page-footer {
    font-size: 0.9rem;
    line-height: 1.5;
    position: absolute;
    bottom: 50px;
  }

  .center-blur-decoration {
    position: absolute;
    width: 100%;
    height: 50%;
    background: #44789e;
    filter: blur(100px);
    pointer-events: none;
    z-index: 0;
  }

  .copyright-page-right-blur {
    position: absolute;
    width: 50%;
    height: 100%;
    right: 0;
    top: 0;
    background: linear-gradient(270deg, #44789f 0%, rgba(68, 120, 159, 0) 100%);
    pointer-events: none;
    z-index: 1;
  }

  .dedication-page-left-blur,
  .last-admin-page-left-blur {
    position: absolute;
    width: 50%;
    height: 100%;
    left: 0;
    top: 0;
    background: linear-gradient(270deg, #44789f 0%, rgba(68, 120, 159, 0) 100%);
    transform: matrix(-1, 0, 0, 1, 0, 0);
    pointer-events: none;
    z-index: 1;
  }

  .last-words-page-wrapper .image,
  .last-admin-page-wrapper .image_01 {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .last-words-page-content {
    position: relative;
    z-index: 1;
    text-align: center;
    padding: 2rem 1.75rem;
    max-width: 60%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
  }

  .last-admin-page-content {
    position: relative;
    z-index: 2;
    text-align: center;
    padding: 2rem 1.75rem;
    max-width: 85%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
  }

  .last-admin-page-logo {
    z-index: 2;
    width: 8rem;
    height: auto;
    object-fit: contain;
    margin-bottom: 0.25rem;
    top: 50px;
  }

  .last-words-page-title {
    font-family: 'DM Serif Display', serif !important;
    font-weight: 400;
    font-size: 1.2rem;
    line-height: 110%;
    text-align: center;
    color: #ffffff;
    margin: 0;
  }

  .last-admin-page-title {
    font-family: 'Quicksand', sans-serif;
    font-weight: 700;
    font-size: 1.5rem;
    line-height: 1.3;
    color: #ffffff;
    margin: 0;
  }

  .last-words-page-body,
  .last-admin-page-body,
  .last-words-page-tagline,
  .last-admin-page-tagline {
    font-family: 'Quicksand', sans-serif;
    font-weight: 400;
    font-size: 0.8rem;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.95);
    margin: 0;
  }

  .last-admin-page-cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
    padding: 0.8rem 0.8rem;
    background: #438bff;
    color: #ffffff;
    font-family: 'Quicksand', sans-serif;
    font-weight: 700;
    font-size: 0.8rem;
    line-height: 1.2;
    text-decoration: underline;
    border-radius: 15px;
    transition: background 0.2s ease;
  }

  .last-admin-page-cta:hover {
    background: #3a7ae8;
  }

  .last-admin-page-wrapper .image_01 .last-admin-page-cta-clickable {
    position: absolute;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 3;
    bottom: 50px;
  }

  .last-admin-page-cta-icon {
    width: 1rem;
    height: 1rem;
    object-fit: contain;
  }

  .back-cover-wrapper {
    position: relative;
    overflow: hidden;
    min-height: 60dvh;
    aspect-ratio: 2 / 3;
    width: 100%;
    max-width: 400px;
  }

  .back-cover-content {
    position: relative;
    z-index: 1;
    min-height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 4rem 2rem 1.5rem;
    box-sizing: border-box;
  }

  .back-cover-title-blur,
  .back-cover-bottom-blur {
    position: absolute;
    width: 100%;
    height: 40%;
    background: linear-gradient(180.18deg, #5b99af 0.15%, rgba(91, 153, 175, 0) 99.84%);
    pointer-events: none;
    z-index: -2;
  }

  .back-cover-title-blur { top: 0; }
  .back-cover-bottom-blur { bottom: 0; transform: matrix(1, 0, 0, -1, 0, 0); }

  .back-cover-title {
    font-family: 'Quicksand', sans-serif;
    font-weight: 700;
    font-size: clamp(0.65rem, 2.1vw, 2.2rem);
    line-height: 100%;
    color: #ffffff;
    text-align: center;
    margin: 0.75rem 0 1.25rem;
    -webkit-text-stroke: clamp(2.6px, 0.58vw, 10px) #1c596f;
    paint-order: stroke fill;
    text-shadow: 0 0 70px rgba(255, 255, 255, 0.9), 0 9px 0 rgba(15, 10, 59, 0.5);
  }

  .back-cover-description {
    font-family: 'Quicksand', sans-serif;
    font-weight: 400;
    font-size: clamp(0.8rem, 1.5vw, 0.9rem);
    line-height: 1.55;
    color: #ffffff;
    text-align: center;
    max-width: 88%;
    margin: 0 0 auto;
    flex: 1;
  }

  .back-cover-bottom-left {
    position: absolute;
    bottom: 1.5rem;
    left: 1.75rem;
    display: flex;
    max-width: 50%;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.35rem;
  }

  .back-cover-logo {
    width: 6rem;
    height: auto;
    object-fit: contain;
  }

  .back-cover-tagline,
  .back-cover-website,
  .back-cover-isbn {
    font-family: 'Quicksand', sans-serif;
    color: rgba(255, 255, 255, 0.95);
    margin: 0;
    font-size: clamp(0.6rem, 1.2vw, 0.8rem);
    line-height: 1.1;
  }

  .back-cover-age {
    width: 100%;

    font-family: 'Quicksand', sans-serif;
    color: rgba(255, 255, 255, 0.95);
    margin: 0;
    font-size: clamp(0.7rem, 1.2vw, 0.8rem);
    line-height: 1.2;
  }

  .back-cover-bottom-right {
    position: absolute;
    bottom: 1.5rem;
    right: 1.75rem;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    text-align: center;
    gap: 0.3rem;
  }

  .back-cover-isbn-barcode {
    width: clamp(5rem, 10vw, 6.5rem);
    height: auto;
    background: #ffffff;
    border-radius: 0.25rem;
  }

  .story-main-text-overlay {
    position: absolute;
    right: 0;
    top: 0;
    z-index: 3;
    width: 78%;
    height: 100%;
    padding: 20px;
    pointer-events: none;
  }

  .story-main-text-blur-layer {
    position: absolute;
    width: 220px;
    height: 220px;
    left: calc(50% - 110px);
    top: calc(50% - 110px);
    background: #3b778b;
    filter: blur(70px);
    z-index: 0;
  }

  .story-main-text {
    position: relative;
    z-index: 1;
    margin: 0;
    color: #fddac6;
    text-align: center;
    font-size: 15px;
    line-height: 1.5;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.45);
  }

  /* Fullscreen Button */
  .fullscreen-button-container {
    display: flex;
    justify-content: center;
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
    position: relative;
  }

  .navigation-buttons{
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    width: 100%;
    position: absolute;
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
      padding-bottom: calc(80px + env(safe-area-inset-bottom));
    }

    .story-header {
      flex-direction: column;
      gap: 15px;
      margin-bottom: 20px;
    }

    .header-left {
      flex: none;
      width: 100%;
    }

    .btn-back {
      width: fit-content;
    }

    .navigation-controls {
      flex-direction: row;
      flex-wrap: wrap;
      gap: 12px;
    }

    .navigation-buttons {
      position: relative;
    }

    .button-prev,
    .button-next {
      width: calc(50% - 6px);
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
      height: auto;
    }

    .mobile-image-half {
      width: 100%;
      max-width: 100%;
      min-height: 60dvh;
    }

    .cover-bottom-logo {
      bottom: 12px;
      width: clamp(84px, 34%, 120px);
    }

    .back-cover-title {
      font-size: clamp(1.35rem, 6.8vw, 1.9rem);
      -webkit-text-stroke: clamp(1.8px, 0.8vw, 3.6px) #1c596f;
      line-height: 1.05;
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
      max-width: 380px;
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


