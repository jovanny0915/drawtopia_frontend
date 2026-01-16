<script lang="ts">
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { get } from 'svelte/store';
  import { auth } from '../../../lib/stores/auth';
  import { getStoryById } from '../../../lib/database/stories';
  import logo from "../../../assets/logo.png";
  import timeIcon from "../../../assets/redtimeicon.svg";
  import favorblueicon from "../../../assets/favorblueicon.svg";
  import hintpurpleicon from "../../../assets/hintpurpleicon.svg";
  import cupgreenicon from "../../../assets/cupgreenicon.svg";
  import arrowclockwise from "../../../assets/WhiteArrowClockwise.svg";
  import downloadSimple from "../../../assets/DownloadSimple.svg"
  import shareIcon from "../../../assets/Share.svg";
  
  // Fallback images
  import magicalforest from "../../../assets/magicalforest.png";
  import enchantedcastle from "../../../assets/enchantedcastle.png";
  import crystalcave from "../../../assets/crystalcave.png";
  import rainbowmeadow from "../../../assets/rainbowmeadow.png";

  type Scene = {
    id: number;
    title: string;
    subtitle: string;
    time: string;
    hints: number;
    stars: number; // 0..3
    image: string;
  };

  let totalTime = "0:48";
  let hintsUsedTotal = 0;
  let avgStars = 3.0;
  let bestScene = "Scene 1";
  let isLoading = true;
  let loadError = "";
  let storyId: string | null = null;
  let storyTitle = "Adventure Complete!";
  let characterName = "Luna";
  let isDownloading = false;
  let downloadError = "";

  // API Base URL
  const API_BASE_URL = "https://image-edit-five.vercel.app";

  $: if (browser) {
    storyId = $page.url.searchParams.get('storyId');
  }

  // Scene titles based on world (matching intersearch/1)
  const sceneTitles: { [key: string]: string[] } = {
    "enchanted-forest": [
      "The Magical Forest",
      "The Enchanted Castle",
      "The Crystal Cave",
      "The Rainbow Meadow",
    ],
    "outer-space": [
      "The Cosmic Station",
      "The Alien Planet",
      "The Asteroid Field",
      "The Nebula Garden",
    ],
    "underwater-kingdom": [
      "The Coral Reef",
      "The Sunken Palace",
      "The Pearl Cave",
      "The Kelp Forest",
    ],
  };

  let scenes: Scene[] = [
    {
      id: 1,
      title: "Scene 1",
      subtitle: "The Magical Forest",
      time: "0:00",
      hints: 0,
      stars: 0,
      image: magicalforest
    },
    {
      id: 2,
      title: "Scene 2",
      subtitle: "The Enchanted Castle",
      time: "0:00",
      hints: 0,
      stars: 0,
      image: enchantedcastle
    },
    {
      id: 3,
      title: "Scene 3",
      subtitle: "The Crystal Cave",
      time: "0:00",
      hints: 0,
      stars: 0,
      image: crystalcave
    },
    {
      id: 4,
      title: "Scene 4",
      subtitle: "The Rainbow Meadow",
      time: "0:00",
      hints: 0,
      stars: 0,
      image: rainbowmeadow
    },
  ];

  // Load scene results from sessionStorage
  function loadSceneResults(storyId: string | null): Map<number, any> {
    const resultsMap = new Map();
    try {
      const resultsKey = `intersearch_results_${storyId || 'temp'}`;
      const storedResults = sessionStorage.getItem(resultsKey);
      
      if (storedResults) {
        const resultsData = JSON.parse(storedResults);
        console.log('[intersearch/3] Loaded scene results:', resultsData);
        
        // Map results by sceneIndex for easy lookup
        if (resultsData.results && Array.isArray(resultsData.results)) {
          resultsData.results.forEach((result: any) => {
            resultsMap.set(result.sceneIndex, result);
          });
        }
        
        // Load totals from sessionStorage (these are the authoritative values)
        if (resultsData.totalTime !== undefined && resultsData.totalTime !== null) {
          // totalTime is stored in seconds, convert to "M:SS" format
          const totalSeconds = typeof resultsData.totalTime === 'number' 
            ? resultsData.totalTime 
            : parseInt(resultsData.totalTime);
          const totalMinutes = Math.floor(totalSeconds / 60);
          const totalSecs = totalSeconds % 60;
          totalTime = `${totalMinutes}:${totalSecs.toString().padStart(2, '0')}`;
          console.log(`[intersearch/3] Loaded totalTime from sessionStorage: ${totalSeconds}s = ${totalTime}`);
        }
        
        if (resultsData.totalHints !== undefined && resultsData.totalHints !== null) {
          hintsUsedTotal = typeof resultsData.totalHints === 'number' 
            ? resultsData.totalHints 
            : parseInt(resultsData.totalHints);
          console.log(`[intersearch/3] Loaded totalHints from sessionStorage: ${hintsUsedTotal}`);
        }
        
        if (resultsData.avgStars !== undefined && resultsData.avgStars !== null) {
          avgStars = typeof resultsData.avgStars === 'string' 
            ? parseFloat(resultsData.avgStars) 
            : typeof resultsData.avgStars === 'number' 
              ? resultsData.avgStars 
              : 0;
          console.log(`[intersearch/3] Loaded avgStars from sessionStorage: ${avgStars}`);
        }
        
        // If totals are missing or zero, try to calculate from individual scene results
        if ((!resultsData.totalTime && resultsMap.size > 0) || 
            (resultsData.totalHints === undefined && resultsMap.size > 0) ||
            (resultsData.avgStars === undefined && resultsMap.size > 0)) {
          
          console.log('[intersearch/3] Calculating totals from individual scene results...');
          
          // Calculate total time from scene results if not provided
          if (!resultsData.totalTime || resultsData.totalTime === 0) {
            let calculatedTotalSeconds = 0;
            resultsMap.forEach((result: any) => {
              if (result.timeSeconds) {
                calculatedTotalSeconds += result.timeSeconds;
              } else if (result.time) {
                // Parse time string "M:SS" to seconds
                const [minutes, seconds] = result.time.split(':').map(Number);
                calculatedTotalSeconds += (minutes * 60 + seconds);
              }
            });
            if (calculatedTotalSeconds > 0) {
              const totalMinutes = Math.floor(calculatedTotalSeconds / 60);
              const totalSecs = calculatedTotalSeconds % 60;
              totalTime = `${totalMinutes}:${totalSecs.toString().padStart(2, '0')}`;
              console.log(`[intersearch/3] Calculated totalTime from scenes: ${calculatedTotalSeconds}s = ${totalTime}`);
            }
          }
          
          // Calculate total hints from scene results if not provided
          if (resultsData.totalHints === undefined) {
            let calculatedTotalHints = 0;
            resultsMap.forEach((result: any) => {
              calculatedTotalHints += (result.hints || 0);
            });
            if (calculatedTotalHints > 0) {
              hintsUsedTotal = calculatedTotalHints;
              console.log(`[intersearch/3] Calculated totalHints from scenes: ${hintsUsedTotal}`);
            }
          }
          
          // Calculate average stars from scene results if not provided
          if (resultsData.avgStars === undefined) {
            let totalStars = 0;
            let sceneCount = 0;
            resultsMap.forEach((result: any) => {
              if (result.stars !== undefined) {
                totalStars += (result.stars || 0);
                sceneCount++;
              }
            });
            if (sceneCount > 0) {
              avgStars = parseFloat((totalStars / sceneCount).toFixed(2));
              console.log(`[intersearch/3] Calculated avgStars from scenes: ${avgStars} (${totalStars} stars / ${sceneCount} scenes)`);
            }
          }
        }
      }
    } catch (error) {
      console.error('[intersearch/3] Error loading scene results:', error);
    }
    return resultsMap;
  }

  // Load scenes from sessionStorage as fallback
  function loadScenesFromSessionStorage(): boolean {
    try {
      const storedScenes = sessionStorage.getItem('intersearch_scenes');
      if (!storedScenes) {
        console.warn('[intersearch/3] No scenes in sessionStorage');
        return false;
      }
      
      const scenesData = JSON.parse(storedScenes);
      console.log('[intersearch/3] Loading scenes from sessionStorage:', scenesData);
      
      // Set story details from sessionStorage
      storyTitle = scenesData.storyTitle || "Adventure Complete!";
      characterName = scenesData.characterName || "Character";
      
      // Determine world for fallback titles
      const world = scenesData.world || 'enchanted-forest';
      const titles = sceneTitles[world] || sceneTitles["enchanted-forest"];
      
      // Load scene results
      const sceneResults = loadSceneResults(storyId);
      
      // Build scenes array from sessionStorage data
      const loadedScenes: Scene[] = [];
      
      if (scenesData.scenes && Array.isArray(scenesData.scenes)) {
        scenesData.scenes.forEach((scene: any, index: number) => {
          const sceneImage = scene.sceneImage ? scene.sceneImage.split('?')[0] : null;
          const sceneTitle = scene.sceneTitle || titles[index] || `Scene ${index + 1}`;
          
          // Get results for this scene if available
          const result = sceneResults.get(index);
          
          loadedScenes.push({
            id: index + 1,
            title: `Scene ${index + 1}`,
            subtitle: sceneTitle,
            time: result?.time || "0:00",
            hints: result?.hints ?? 0,
            stars: result?.stars ?? 0,
            image: sceneImage || scenes[index]?.image || magicalforest
          });
        });
        
        if (loadedScenes.length > 0) {
          scenes = loadedScenes;
          console.log('[intersearch/3] Loaded scenes from sessionStorage with results:', scenes);
          
          // Calculate best scene (only if there are scenes with stars > 0)
          const scenesWithStars = scenes.filter(s => (s.stars ?? 0) > 0);
          if (scenesWithStars.length > 0) {
            const bestSceneIndex = scenes.reduce((bestIdx, scene, idx) => 
              (scene.stars ?? 0) > (scenes[bestIdx].stars ?? 0) ? idx : bestIdx, 0
            );
            bestScene = scenes[bestSceneIndex]?.title || "Scene 1";
          } else {
            bestScene = "None";
          }
          
          // Note: totalTime, hintsUsedTotal, and avgStars are already loaded from sessionStorage
          // by loadSceneResults() above (line 243). Don't recalculate as sessionStorage values are authoritative.
          
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('[intersearch/3] Error loading scenes from sessionStorage:', error);
      return false;
    }
  }

  onMount(async () => {
    if (browser) {
      // Get story ID from URL query params
      storyId = $page.url.searchParams.get('storyId');
      
      if (!storyId) {
        // No story ID provided, try to load from sessionStorage
        console.warn("No storyId provided, attempting to load from sessionStorage");
        const loadedFromSession = loadScenesFromSessionStorage();
        if (!loadedFromSession) {
          console.warn("No scenes in sessionStorage, using default fallback scenes");
        }
        isLoading = false;
        return;
      }
      
      try {
        // Load story from database
        const result = await getStoryById(storyId);
        
        if (!result.success || !result.data) {
          // Database load failed, try sessionStorage as fallback
          console.warn("Failed to load from database, trying sessionStorage");
          const loadedFromSession = loadScenesFromSessionStorage();
          if (!loadedFromSession) {
            loadError = result.error || "Failed to load story";
          }
          isLoading = false;
          return;
        }
        
        const story = result.data;
        console.log("Loaded interactive search story for results:", story);
        
        // Set story details
        storyTitle = story[0].story_title || "Adventure Complete!";
        characterName = story[0].character_name || "character";
        
        // Determine world for scene titles
        const selectedWorld = story[0].story_world === 'forest' ? 'enchanted-forest' : 
                            story[0].story_world === 'space' ? 'outer-space' : 
                            story[0].story_world === 'underwater' ? 'underwater-kingdom' : 
                            'enchanted-forest';
        const titles = sceneTitles[selectedWorld] || sceneTitles["enchanted-forest"];
        
        // Load story content to get scenes
        let scenesLoaded = false;
        if (story[0].story_content) {
          try {
            const content = typeof story[0].story_content === 'string' 
              ? JSON.parse(story[0].story_content) 
              : story[0].story_content;
            
            console.log('[intersearch/3] Parsed story content:', content);
            
            // Load scene results from sessionStorage (this also loads totals)
            const sceneResults = loadSceneResults(storyId);
            
            // Build scenes array from content
            const loadedScenes: Scene[] = [];
            
            if (content.scenes && Array.isArray(content.scenes)) {
              content.scenes.forEach((scene: any, index: number) => {
                const sceneImage = scene.sceneImage ? scene.sceneImage.split('?')[0] : null;
                const sceneTitle = scene.sceneTitle || titles[index] || `Scene ${index + 1}`;
                
                // Get results for this scene if available
                const result = sceneResults.get(index);
                
                loadedScenes.push({
                  id: index + 1,
                  title: `Scene ${index + 1}`,
                  subtitle: sceneTitle,
                  time: result?.time || "0:00",
                  hints: result?.hints ?? 0,
                  stars: result?.stars ?? 0,
                  image: sceneImage || scenes[index]?.image || magicalforest
                });
              });
              
              if (loadedScenes.length > 0) {
                scenes = loadedScenes;
                scenesLoaded = true;
                console.log('[intersearch/3] Loaded scenes from database with results:', scenes);
                
                // Calculate best scene (only if there are scenes with stars > 0)
                const scenesWithStars = scenes.filter(s => (s.stars ?? 0) > 0);
                if (scenesWithStars.length > 0) {
                  const bestSceneIndex = scenes.reduce((bestIdx, scene, idx) => 
                    (scene.stars ?? 0) > (scenes[bestIdx].stars ?? 0) ? idx : bestIdx, 0
                  );
                  bestScene = scenes[bestSceneIndex]?.title || "Scene 1";
                } else {
                  bestScene = "None";
                }
                
                // Note: totalTime, hintsUsedTotal, and avgStars are already loaded from sessionStorage
                // by loadSceneResults() above. Only recalculate if they weren't loaded.
                // Don't override values from sessionStorage as they are the authoritative source.
              }
            }
          } catch (error) {
            console.error('Error parsing story content:', error);
          }
        }
        
        // If database didn't have valid scenes, try sessionStorage
        if (!scenesLoaded) {
          console.warn('[intersearch/3] No valid scenes in database, trying sessionStorage');
          loadScenesFromSessionStorage();
        }
        
        isLoading = false;
      } catch (error) {
        console.error('Error loading story:', error);
        // Try sessionStorage as last resort
        const loadedFromSession = loadScenesFromSessionStorage();
        if (!loadedFromSession) {
          loadError = error instanceof Error ? error.message : "An unexpected error occurred";
        }
        isLoading = false;
      }
    }
  });

  function starRow(count: number) {
    const on = Array(count).fill("★").join("");
    const off = Array(3 - count)
      .fill("☆")
      .join("");
    return on + off;
  }

  function handleGoHome() {
    goto('/dashboard');
  }

  function handlePlayAgain() {
    // Navigate to intersearch/1 with current story ID to replay the adventure
    if (storyId) {
      goto(`/intersearch/1?storyId=${storyId}`);
    } else {
      // If no storyId available, go to intersearch to start new
      goto('/intersearch');
    }
  }
  
  function handleRetry() {
    if (storyId) {
      window.location.reload();
    } else {
      goto('/intersearch');
    }
  }

  async function handleDownloadPDF() {
    if (!storyId) {
      downloadError = "No story ID available for download";
      setTimeout(() => downloadError = "", 3000);
      return;
    }

    if (isDownloading) return;

    try {
      isDownloading = true;
      downloadError = "";

      // Get auth token
      const authState = get(auth);
      if (!authState.session?.access_token) {
        downloadError = "Please log in to download the PDF";
        setTimeout(() => downloadError = "", 3000);
        return;
      }

      console.log(`Generating/fetching PDF for story ${storyId}...`);

      // Step 1: Call generate-pdf endpoint to get/generate the PDF URL
      const response = await fetch(`${API_BASE_URL}/api/books/${storyId}/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.session.access_token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to generate PDF' }));
        throw new Error(errorData.detail || `Failed to generate PDF: ${response.statusText}`);
      }

      // Get the JSON response with pdf_url
      const data = await response.json();
      
      if (!data.success || !data.pdf_url) {
        throw new Error(data.message || 'PDF URL not available');
      }

      console.log(`PDF URL received: ${data.pdf_url}`);

      // Step 2: Download the PDF from the URL
      const pdfResponse = await fetch(data.pdf_url);
      if (!pdfResponse.ok) {
        throw new Error('Failed to download PDF from storage');
      }

      const blob = await pdfResponse.blob();
      
      // Create a download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${storyTitle.replace(/[^a-z0-9]/gi, '_')}_adventure.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      downloadError = error instanceof Error ? error.message : 'Failed to download PDF';
      setTimeout(() => downloadError = "", 5000);
    } finally {
      isDownloading = false;
    }
  }

  function goToDashboard() {
    goto('/dashboard');
  }
</script>

<div class="complete-outer">
  <div class="brand-container">
    <img class="brand" src={logo} alt="Drawtopia" role="button" tabindex="0" on:click={goToDashboard} on:keydown={(e) => e.key === 'Enter' && goToDashboard()} />
  </div>

  {#if isLoading}
    <div class="card">
      <div class="header-container">
        <div class="loading-spinner"></div>
        <div class="loading-text">Loading results...</div>
      </div>
    </div>
  {:else if loadError}
    <div class="card">
      <div class="header-container">
        <h2 class="title" style="color: #f44336;">Error</h2>
        <div class="subtitle">{loadError}</div>
      </div>
      <div class="actions">
        <button class="btn go-home" on:click={handleRetry}>Retry</button>
        <button class="btn go-home" on:click={handleGoHome}>Go Home</button>
      </div>
    </div>
  {:else}
    <div class="card">
      <div class="header-container">
        <h2 class="title">{storyTitle}</h2>
        <div class="subtitle">You found {characterName} in all {scenes.length} scenes!</div>
      </div>

      <hr class="divider" />

    <div class="metrics">
      <div class="metric-row">
        <div class="metric">
          <div class="metric-head">
            <img src={timeIcon} alt="Time" />
          </div>
          <div class="metric-value">
            <span>Total Time</span>
            <span class="metric-value-time">
              {totalTime}</span>
          </div>
        </div>
        <div class="metric">
          <div class="metric-head">
            <img src={hintpurpleicon} alt="Hints Used" />
          </div>
          <div class="metric-value">
            <span>Hints Used</span>
            <span class="metric-value-time">{hintsUsedTotal}</span>
          </div>
        </div>
      </div>
      <div class="metric-row">
        <div class="metric">
          <div class="metric-head">
            <img src={favorblueicon} alt="Avg Stars" />
          </div>
          <div class="metric-value">
            <span>Avg Stars</span>
            <span class="metric-value-time">{avgStars}</span>
          </div>
        </div>
        <div class="metric">
          <div class="metric-head">
            <img src={cupgreenicon} alt="Best Scene" />
          </div>
          <div class="metric-value">
            <span>Best Scene</span>
            <span class="metric-value-time">{bestScene}</span>
          </div>
        </div>
      </div>
    </div>

    <hr class="divider" />

    <div class="scene-by-scene-container">

      <div class="section-title">Scene-by-Scene Breakdown</div>
  
      <div class="grid">
        {#each scenes.slice(0, 4) as s}
          <div class="scene-card">
            <div class="thumb-wrap">
              <img src={s.image} alt={s.title} class="thumb" draggable={false} />
            </div>
            <div class="scene-info">
              <div class="scene-info-title">
                <div class="scene-title">{s.title}</div>
                <div class="scene-sub">{s.subtitle}</div>
              </div>
              <div class="scene-info-meta">
                <div class="scene-meta">
                  <span>⏱ Time: {s.time}</span>
                  <span>💡 Hint Used: {s.hints}</span>
                  <div class="scene-stars" aria-label={`Stars: ${s.stars}/3`}>
                    {starRow(s.stars)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <div class="actions">
      <div 
        class="button" 
        role="button"
        tabindex="0"
        on:click={handlePlayAgain}
        on:keydown={(e) => e.key === 'Enter' && handlePlayAgain()}
        style="cursor:pointer;"
      >
        <div class="arrowclockwise">
          <img src={arrowclockwise} alt="Arrow Clockwise" />
        </div>
        <div class="play-again"><span class="playagain_span">Play Again</span></div>
        <div class="ellipse-1415"></div>
      </div>
      <div 
        class="button download-pdf-btn" 
        class:downloading={isDownloading}
        role="button"
        tabindex="0"
        on:click={handleDownloadPDF}
        on:keydown={(e) => e.key === 'Enter' && handleDownloadPDF()}
        style="cursor:pointer; {isDownloading ? 'opacity: 0.6; pointer-events: none;' : ''}"
      >
        <img src={downloadSimple} alt="Download Simple" class="downloadsimple">
        <div class="download-pdf">
          <span class="downloadpdf_span">
            {isDownloading ? 'Downloading...' : 'Download PDF'}
          </span>
        </div>
      </div>
      <div class="notification" style="cursor:pointer;">
        <div class="sharenetwork">
          <img src={shareIcon} alt="Share" class="vector">
        </div>
        <div><span class="shareresult_span">Share Result</span></div>
      </div>
      <button class="btn go-home" on:click={handleGoHome}>Go Home</button>
    </div>
    
    {#if downloadError}
      <div class="error-message">{downloadError}</div>
    {/if}
  </div>
  {/if}
</div>

<style>
  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #438bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 20px auto;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .loading-text {
    font-family: Quicksand, sans-serif;
    font-size: 20px;
    color: #727272;
    text-align: center;
    margin-top: 20px;
  }

  .complete-outer {
    min-height: 100vh;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    align-items: center;
  padding: 24px 100px 80px 100px;
    gap: 48px;
  }
  .brand-container {
    padding: 12px 12px 12px 24px;
  }
  .brand {
    height: 38px;
    cursor: pointer;
  }
  .card {
    display: flex;
    flex-direction: column;
    background: #fff;
    padding: 22px 26px 28px 26px;
    gap: 32px;
  }
  .header-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  .title {
    font-family: Quicksand, sans-serif;
    font-weight: 700;
    font-size: 48px;
    color: #23243c;
    text-align: center;
    margin: 2px 0 4px 0;
  }
  .subtitle {
    font-family: Nunito, sans-serif;
    font-size: 24px;
    color: #121212;
    text-align: center;
  }
  .metrics {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    border-radius: 12px;
    border: 1px solid #ededed;
  }
  .metric-row {
    display: flex;
    flex-direction: row;
    gap: 8px;
  }
  .metric {
    background: #f7faff;
    border: 1px solid #e6ebf3;
    border-radius: 12px;
    padding: 4px;
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 16px;
  }
  .metric-head {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #5c6689;
    font-family: Nunito, sans-serif;
    font-size: 14px;
    margin-bottom: 6px;
  }
  .divider {
    color: #ededed;
    height: 1px;
    width: 100%;
  }
  .metric-value {
    font-family: Quicksand, sans-serif;
    font-weight: 500;
    font-size: 20px;
    color: #727272;
    display: flex;
    flex-direction: column;
    align-content: center;
  }
  .metric-value-time {
    font-family: Quicksand, sans-serif;
    font-weight: 500;
    font-size: 20px;
    color: #2b2d42;
  }
  .section-title {
    font-family: Quicksand, sans-serif;
    font-weight: 700;
    color: #000000;
    font-size: 32px;
    margin-bottom: 12px;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  .scene-card {
    height: 479px;
    background: #ffffff;
    border: 1px solid #e7ecf5;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 14px rgba(40, 60, 120, 0.06);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .thumb-wrap {
    height: 250px;
    background: #000;
  }
  .thumb {
    width: 100%;
    height: 250px;
    object-fit: cover;
    border-bottom: 1px solid #e7ecf5;
  }
  .scene-info {
    padding: 8px 12px 12px 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .scene-title {
    font-family: Quicksand, sans-serif;
    font-weight: 700;
    color: #2b2d42;
    font-size: 24px;
  }
  .scene-sub {
    font-family: Nunito, sans-serif;
    font-size: 18px;
    color: #98a0b6;
  }
  .scene-info-title {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .scene-info-meta {
    display: flex;
    flex-direction: column;
    border-top: 1px solid #e7ecf5;
    padding-top: 6px;
    gap: 4px;
  }
  .scene-meta {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-family: Nunito, sans-serif;
    font-size: 16px;
    color: #000;
    margin-bottom: 6px;
  }
  .scene-stars {
    border-top: 1px solid #e7ecf5;
    padding-top: 6px;
    color: #f5a623;
    letter-spacing: 2px;
    font-size: 30px;
  }
  .actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-top: 18px;
  }
  .btn {
    height: 57px;
    width: 194px;
    padding: 0 18px;
    border-radius: 10px;
    border: 1px solid #e6ebf3;
    font-family: Quicksand, sans-serif;
    font-weight: 700;
    font-size: 16px;
    cursor: pointer;
  }
  
  .btn.go-home {
    background: #10b981;
    color: #fff;
    width: 173px;
    height: 57px;
    font-size: 16px;
  }
  .btn.go-home:hover {
    background: #059669;
  }

  /* ---------- Responsive styles ---------- */
  @media (max-width: 1220px) {
    .card {
      width: 96vw;
    }
    .grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 900px) {
    .complete-outer {
      padding: 24px 40px 40px 40px;
    }

    .title {
      font-size: 36px;
    }

    .section-title {
      font-size: 26px;
    }

    .grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 768px) {
    .complete-outer {
      padding: 16px;
      gap: 32px;
    }

    .brand {
      height: 32px;
    }

    .card {
      width: 100%;
      padding: 18px 16px 24px 16px;
    }

    .metric-row {
      flex-direction: column;
    }

    .grid {
      grid-template-columns: 1fr;
    }

    .scene-card {
      width: 100%;
      height: auto;
    }

    .thumb-wrap,
    .thumb {
      height: 200px;
    }

    .actions {
      flex-direction: column;
      align-items: stretch;
    }

    .button,
    .download-pdf-btn,
    .btn,
    .btn.go-home {
      width: 100%;
    }
  }

  @media (max-width: 480px) {
    .title {
      font-size: 28px;
    }

    .subtitle {
      font-size: 18px;
    }

    .section-title {
      font-size: 22px;
    }

    .scene-title {
      font-size: 20px;
    }

    .scene-sub {
      font-size: 14px;
    }
  }
 
/* Play Again Button Custom Styles */
.button {
  height: 57px;
  padding-left: 24px;
  padding-right: 24px;
  padding-top: 16px;
  padding-bottom: 16px;
  position: relative;
  background: #438BFF;
  overflow: hidden;
  border-radius: 20px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  display: inline-flex;
}
.arrowclockwise {
  width: 24px;
  height: 24px;
  position: relative;
  overflow: hidden;
}

.playagain_span {
  color: white;
  font-size: 18px;
  font-family: Quicksand;
  font-weight: 600;
  line-height: 25.20px;
  word-wrap: break-word;
}
.play-again {
  text-align: center;
}
  .ellipse-1415 {
  width: 248px;
  height: 114px;
  left: -37px;
  top: 15px;
  position: absolute;
  background: radial-gradient(ellipse 42.11% 42.11% at 50.00% 52.94%, white 0%, rgba(255, 255, 255, 0) 100%);
  border-radius: 9999px;

}

  /* Download PDF Button Custom Styles */
  .download-pdf-btn {
    height: 52px;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    background: #E7FEFF;
    box-shadow: 0px 4px 0px #438BFF;
    border-radius: 12px;
    outline: 2px rgba(231, 254, 255, 0.20) solid;
    outline-offset: -2px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }
  .downloadsimple {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
    filter: brightness(0) saturate(100%) invert(45%) sepia(100%) saturate(2000%) hue-rotate(210deg) brightness(1.1) contrast(1.2);
  }
  
  .downloadpdf_span {
    color: #438BFF;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.20px;
    word-wrap: break-word;
  }
  .download-pdf {
    text-align: center;
  }

  .notification {
    /* width: 100%;
    height: 100%; */
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 18px;
    padding-right: 24px;
    background: #F8FAFB;
    box-shadow: 0px 1px 4px rgba(141.80, 141.80, 141.80, 0.25) inset;
    border-radius: 12px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    display: inline-flex;
  }

  .sharenetwork {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
  }

  .sharenetwork .vector {
    width: 15px;
    height: 17.50px;
    left: 1.87px;
    top: 1.25px;
    position: absolute;
  }

  .shareresult_span {
    color: #141414;
    font-size: 16px;
    font-family: DM Sans, sans-serif;
    font-weight: 600;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  /* Error message styles */
  .error-message {
    background: #fee;
    border: 1px solid #fcc;
    color: #c33;
    padding: 12px 16px;
    border-radius: 8px;
    font-family: Nunito, sans-serif;
    font-size: 14px;
    text-align: center;
    margin-top: 12px;
    animation: fadeIn 0.3s ease-in;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Downloading state animation */
  .download-pdf-btn.downloading .downloadsimple {
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
</style>

