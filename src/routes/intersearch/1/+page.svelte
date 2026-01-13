<script lang="ts">
  import { goto, beforeNavigate } from "$app/navigation";
  import { browser } from "$app/environment";
  import { onMount, onDestroy } from "svelte";
  import { page } from "$app/stores";
  import { supabase } from "../../../lib/supabase";
  import logo from "../../../assets/logo.png";
  import bookCover from "../../../assets/Luna1.png";
  import tempScene from "../../../assets/temp.jpg";
  import fullscreen from "../../../assets/fullscreen.svg";
  import coverIcon from "../../../assets/covericon.svg";
  import mailIcon from "../../../assets/mailicon.svg";
  import lockKeyIcon from "../../../assets/LockKey.svg";
  import timeIcon from "../../../assets/redtimeicon.svg";
  import hintIcon from "../../../assets/hintIcon.svg";
  import shareIcon from '../../../assets/Share.svg';
  import dotsThreeOutline from '../../../assets/DotsThreeOutline.svg';
  import zoomIcon from '../../../assets/zoomIcon.svg';
  import arrowleft from '../../../assets/ArrowLeft.svg';
  import dedicationLeft from "../../../assets/dedicationleft.png";
  import { enhance } from "$app/forms";
  import ShareStoryModal from "../../../components/ShareStoryModal.svelte";
  import StoryInfoModal from "../../../components/StoryInfoModal.svelte";
  import { env } from '../../../lib/env';
  import { getStoryById, updateReadingState } from '../../../lib/database/stories';
  import { user } from '../../../lib/stores/auth';

  let activePage = 1;
  const totalPages = 5; // cover + 4 scenes

  let generatedImages: string[] = [];
  let currentSceneIndex = 0;
  let selectedWorld: string | null = null;
  let selectedDifficulty: string | null = null;
  let characterImageUrl: string | null = null;
  let selectedStyle: string | null = null;
  let selectedEnhancement: string | null = null;
  let characterName: string | null = null;
  let characterType: string | null = null;
  let specialAbility: string | null = null;
  let storyTitle: string | null = null;
  let isLoading = true;
  let loadError = "";
  let storyId: string | null = null;
  
  let showStoryInfoModal = false;
  let showShareStoryModal = false;

  // Dedication data
  let dedicationText = '';
  let dedicationImage = '';
  let hasDedication = false;

  // Drag selection state
  let imageWrapperRef: HTMLDivElement | null = null;
  let imageRef: HTMLImageElement | null = null;
  let isDragging = false;
  let selectionStart = { x: 0, y: 0 };
  let selectionEnd = { x: 0, y: 0 };
  let showSelection = false;
  let showFoundModal = false;
  let croppedImageUrl: string | null = null;
  let cropError: string | null = null;
  let calculatingSimilarity = false;
  
  // Stats for modal
  let sceneTime = "10:13";
  let hintsUsed = 0;
  let hintsLeft = 3;
  let stars = 0;

  // Reading time tracking
  let readingStartTime: number = 0; // Timestamp when reading started
  let totalReadingTime: number = 0; // Total time spent reading in seconds
  let readingTimerInterval: number | null = null; // Interval ID for the timer
  let totalHintsUsed: number = 0; // Track total hints used across all scenes
  let totalStarsEarned: number = 0; // Track total stars earned
  let scenesCompleted: number = 0; // Track number of scenes completed

  // Scene titles based on world
  const sceneTitles: { [key: string]: string[] } = {
    "enchanted-forest": [
      "The Magical Forest",
      "The Enchanted Castle",
      "The Crystal Cave",
      "The Rainbow Meadow",
      "The Starlight Library",
      "The Whispering Woods",
      "The Moonlit Grove",
      "The Victory Celebration",
    ],
    "outer-space": [
      "The Cosmic Station",
      "The Alien Planet",
      "The Asteroid Field",
      "The Nebula Garden",
      "The Star Library",
      "The Galaxy Maze",
      "The Comet Trail",
      "The Victory Celebration",
    ],
    "underwater-kingdom": [
      "The Coral Reef",
      "The Sunken Palace",
      "The Pearl Cave",
      "The Kelp Forest",
      "The Treasure Library",
      "The Abyss Deep",
      "The Mermaid Garden",
      "The Victory Celebration",
    ],
  };


  // Get scene-specific information for prompts
  function getSceneInfo(world: string, sceneIndex: number): {
    sceneDescription: string;
    characterAction: string;
    characterEmotion: string;
    storyContext: string;
  } {
    const sceneInfo: { [key: string]: Array<{
      sceneDescription: string;
      characterAction: string;
      characterEmotion: string;
      storyContext: string;
    }> } = {
      "enchanted-forest": [
        {
          sceneDescription: "A magical forest filled with ancient trees, glowing mushrooms, and mystical creatures. Sunlight filters through the canopy, creating dappled patterns on the forest floor.",
          characterAction: "Waving cheerfully to other forest creatures",
          characterEmotion: "Happy and welcoming",
          storyContext: "The adventure begins as the character enters the enchanted forest, ready to explore its magical wonders."
        },
        {
          sceneDescription: "An enchanted castle with towering spires, magical windows, and floating elements. The castle is surrounded by a mystical garden with talking flowers.",
          characterAction: "Running excitedly through the castle grounds",
          characterEmotion: "Excited and curious",
          storyContext: "The character discovers the enchanted castle and begins their quest to find hidden treasures."
        },
        {
          sceneDescription: "A crystal cave with sparkling walls, glowing crystals, and magical light reflections. The cave is filled with hidden passages and mysterious artifacts.",
          characterAction: "Hiding playfully behind crystal formations",
          characterEmotion: "Playful and mischievous",
          storyContext: "Deep in the crystal cave, the character searches for clues while playing hide and seek with magical creatures."
        },
        {
          sceneDescription: "A rainbow meadow with colorful flowers, butterflies, and a magical rainbow arching overhead. The meadow is filled with celebrating creatures.",
          characterAction: "Celebrating with a victory pose",
          characterEmotion: "Triumphant and joyful",
          storyContext: "The character has completed their quest and celebrates with all the magical friends they met along the way."
        }
      ],
      "outer-space": [
        {
          sceneDescription: "A cosmic space station with floating platforms, alien technology, and stars visible through windows. Space creatures and robots move about.",
          characterAction: "Waving to friendly aliens and space creatures",
          characterEmotion: "Happy and welcoming",
          storyContext: "The character arrives at the cosmic station, beginning their space adventure among the stars."
        },
        {
          sceneDescription: "An alien planet with strange vegetation, floating rocks, and multiple moons in the sky. Colorful alien creatures explore the landscape.",
          characterAction: "Running and exploring the alien landscape",
          characterEmotion: "Excited and curious",
          storyContext: "The character lands on an alien planet and begins exploring its unique and wondrous environment."
        },
        {
          sceneDescription: "An asteroid field with floating rocks, space debris, and cosmic particles. Spaceships navigate through the dangerous but beautiful field.",
          characterAction: "Hiding behind asteroids while navigating",
          characterEmotion: "Playful and adventurous",
          storyContext: "The character navigates through the asteroid field, using their skills to avoid obstacles and find the path forward."
        },
        {
          sceneDescription: "A nebula garden with swirling cosmic colors, floating space flowers, and a beautiful starry backdrop. Space creatures gather for celebration.",
          characterAction: "Celebrating with a victory pose among the stars",
          characterEmotion: "Triumphant and joyful",
          storyContext: "The character completes their space mission and celebrates in the beautiful nebula garden with all their cosmic friends."
        }
      ],
      "underwater-kingdom": [
        {
          sceneDescription: "A vibrant coral reef with colorful fish, sea plants, and bioluminescent creatures. Sunlight filters through the water creating beautiful light patterns.",
          characterAction: "Waving to friendly sea creatures",
          characterEmotion: "Happy and welcoming",
          storyContext: "The character enters the underwater kingdom and begins their aquatic adventure among the coral reefs."
        },
        {
          sceneDescription: "A sunken palace with ancient architecture, glowing pearls, and underwater gardens. Mermaids and sea creatures swim around the magnificent structure.",
          characterAction: "Swimming excitedly through the palace corridors",
          characterEmotion: "Excited and curious",
          storyContext: "The character discovers the sunken palace and begins exploring its underwater wonders and hidden treasures."
        },
        {
          sceneDescription: "A pearl cave with glowing pearls, crystal formations, and magical underwater light. The cave is filled with hidden treasures and sea creatures.",
          characterAction: "Hiding playfully behind pearl formations",
          characterEmotion: "Playful and mischievous",
          storyContext: "Deep in the pearl cave, the character searches for the legendary pearl while playing with friendly sea creatures."
        },
        {
          sceneDescription: "A kelp forest with swaying seaweed, colorful fish, and bioluminescent plants. The forest is alive with celebrating sea creatures.",
          characterAction: "Celebrating with a victory pose underwater",
          characterEmotion: "Triumphant and joyful",
          storyContext: "The character has found the treasure and celebrates in the kelp forest with all their underwater friends."
        }
      ]
    };

    const worldScenes = sceneInfo[world] || sceneInfo["enchanted-forest"];
    return worldScenes[sceneIndex] || worldScenes[0];
  }



  // Start reading timer
  function startReadingTimer() {
    if (!browser) return;
    
    readingStartTime = Date.now();
    console.log('[intersearch-timer] Started reading timer');
    
    // Update every second
    readingTimerInterval = window.setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - readingStartTime) / 1000);
      totalReadingTime = elapsedSeconds;
    }, 1000);
  }
  
  // Stop reading timer and save to database
  async function stopReadingTimerAndSave() {
    if (!browser || !storyId) return;
    
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
      console.log('[intersearch-timer] Reading time too short, not saving');
      return;
    }
    
    console.log(`[intersearch-timer] Stopped. Total time: ${totalReadingTime} seconds`);
    
    // Calculate averages for interactive search
    const avgHint = scenesCompleted > 0 ? totalHintsUsed / scenesCompleted : 0;
    const avgStar = scenesCompleted > 0 ? totalStarsEarned / scenesCompleted : 0;
    
    // Prepare reading state for interactive search story
    const readingState = {
      reading_time: totalReadingTime,
      avg_star: parseFloat(avgStar.toFixed(2)),
      avg_hint: parseFloat(avgHint.toFixed(2))
    };
    
    try {
      const result = await updateReadingState(storyId, readingState);
      if (result.success) {
        console.log('[intersearch-timer] Successfully updated reading state:', readingState);
      } else {
        console.error('[intersearch-timer] Failed to update reading state:', result.error);
      }
    } catch (error) {
      console.error('[intersearch-timer] Error updating reading state:', error);
    }
  }

  function nextScene() {
    if (currentSceneIndex < generatedImages.length - 1) {
      currentSceneIndex++;
    }
  }

  function previousScene() {
    if (currentSceneIndex > 0) {
      currentSceneIndex--;
    }
  }

  function goToScene(index: number) {
    if (index >= 0 && index < generatedImages.length) {
      currentSceneIndex = index;
    }
  }

  onMount(async () => {
    if (browser) {
      // Get story ID from URL query params
      storyId = $page.url.searchParams.get('storyId');
      
      if (!storyId) {
        // No storyId provided, redirect to intersearch page
        loadError = "No story ID provided. Please select a story to view.";
        isLoading = false;
        goto("/intersearch");
        return;
      }
      
      // Load existing story from database
      isLoading = true;
      try {
        const result = await getStoryById(storyId);
        
        if (!result.success || !result.data) {
          loadError = result.error || "Failed to load story";
          isLoading = false;
          console.error("Failed to fetch story:", result.error);
          return;
        }
        
        const story = result.data;
        console.log("Loaded interactive search story:", story);
        
        // Set story details
        storyTitle = story[0].story_title || story[0].character_name || "Search Adventure";
        characterName = story[0].character_name;
        characterImageUrl = story[0].original_image_url || null;
        selectedWorld = story[0].story_world === 'forest' ? 'enchanted-forest' : 
                        story[0].story_world === 'space' ? 'outer-space' : 
                        story[0].story_world === 'underwater' ? 'underwater-kingdom' : 
                        'enchanted-forest';
        
        // Load story content to get scenes
        if (story[0].story_content) {
          try {
            const content = typeof story[0].story_content === 'string' 
              ? JSON.parse(story[0].story_content) 
              : story[0].story_content;
            
            console.log('[intersearch/1] Parsed story content:', content);
            
            // Build generatedImages array: [cover, dedication (optional), scene1, scene2, scene3, scene4]
            const images: string[] = [];
            
            // Add cover
            if (content.cover) {
              images.push(content.cover.split('?')[0]);
            }
            
            // Check for dedication and insert after cover if it exists
            if (story[0].dedication_text || story[0].dedication_image) {
              dedicationText = story[0].dedication_text || '';
              dedicationImage = story[0].dedication_image ? story[0].dedication_image.split("?")[0] : '';
              hasDedication = true;
              
              // Insert dedication scene after cover (at index 1)
              // We'll use a special marker for dedication
              if (images.length > 0) {
                images.splice(1, 0, 'DEDICATION_PAGE');
                console.log('[intersearch/1] Added dedication page after cover');
              }
            }
            
            // Add scenes
            if (content.scenes && Array.isArray(content.scenes)) {
              content.scenes.forEach((scene: any) => {
                if (scene.sceneImage) {
                  images.push(scene.sceneImage.split('?')[0]);
                }
              });
            }
            
            if (images.length > 0) {
              generatedImages = images;
              currentSceneIndex = 0;
              console.log('[intersearch/1] Loaded scene images:', generatedImages);
            }
            
            // Get difficulty from content
            if (content.difficulty) {
              selectedDifficulty = content.difficulty;
            }
          } catch (error) {
            console.error('Error parsing story content:', error);
          }
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

  onDestroy(() => {
    // Clean up global event listeners
    if (browser) {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    }
    // Clean up cropped image URL
    if (croppedImageUrl) {
      URL.revokeObjectURL(croppedImageUrl);
    }
    // Stop timer and save reading state
    stopReadingTimerAndSave();
  });
  
  // Save reading state before navigating away
  beforeNavigate(() => {
    stopReadingTimerAndSave();
  });

  function handleStartScene1() {
    // If on the last scene, navigate to results page
    if (currentSceneIndex === generatedImages.length - 1) {
      // Store the generated scenes in sessionStorage for /intersearch/3
      if (browser && generatedImages.length > 0) {
        // Build scenes data to pass to results page
        const scenesData = {
          cover: generatedImages[0]?.split('?')[0] || null,
          scenes: generatedImages.slice(1).map((url, index) => ({
            sceneNumber: index + 1,
            sceneImage: url.split('?')[0],
            sceneTitle: sceneTitles[selectedWorld || "enchanted-forest"]?.[index] || `Scene ${index + 1}`,
            difficulty: selectedDifficulty || 'medium'
          })),
          storyTitle: storyTitle || sessionStorage.getItem('storyTitle') || "Adventure Complete!",
          characterName: characterName || sessionStorage.getItem('characterName') || "Character",
          world: selectedWorld || sessionStorage.getItem('intersearch_world') || 'enchanted-forest'
        };
        sessionStorage.setItem('intersearch_scenes', JSON.stringify(scenesData));
      }
      
      // Pass storyId to results page if available
      if (storyId) {
        goto(`/intersearch/3?storyId=${storyId}`);
      } else {
        goto("/intersearch/3");
      }
    } else if (currentSceneIndex < generatedImages.length - 1) {
      // Show the next scene on the current page
      currentSceneIndex++;
    }
  }

  function handleMouseDown(event: MouseEvent) {
    // Disable selection for cover (index 0) and dedication page (index 1 if hasDedication) - these are not searchable
    if (!imageWrapperRef || generatedImages.length === 0 || currentSceneIndex === 0 || (hasDedication && currentSceneIndex === 1)) return;
    
    const rect = imageWrapperRef.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    isDragging = true;
    selectionStart = { x, y };
    selectionEnd = { x, y };
    showSelection = true;
    
    // Prevent default to avoid image dragging
    event.preventDefault();
    
    // Add global mouse listeners for smoother dragging
    if (browser) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }
  }

  function handleMouseMove(event: MouseEvent) {
    if (!isDragging || !imageWrapperRef) return;
    updateSelection(event);
  }

  function handleGlobalMouseMove(event: MouseEvent) {
    if (!isDragging || !imageWrapperRef) return;
    updateSelection(event);
  }

  function updateSelection(event: MouseEvent) {
    if (!imageWrapperRef) return;
    const rect = imageWrapperRef.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    
    // Clamp to image bounds
    x = Math.max(0, Math.min(rect.width, x));
    y = Math.max(0, Math.min(rect.height, y));
    
    selectionEnd = { x, y };
  }

  function handleMouseUp() {
    finishSelection();
  }

  function handleGlobalMouseUp() {
    finishSelection();
    if (browser) {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    }
  }

  async function cropImage() {
    if (!imageRef || !imageWrapperRef || generatedImages.length === 0) return null;
    
    // Skip if current scene is cover, dedication, or invalid
    if (currentSceneIndex === 0 || 
        (hasDedication && currentSceneIndex === 1) ||
        !generatedImages[currentSceneIndex] ||
        generatedImages[currentSceneIndex] === 'DEDICATION_PAGE') {
      return null;
    }
    
    const img = imageRef;
    const wrapperRect = imageWrapperRef.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();
    
    // Calculate actual image dimensions and position within wrapper
    const imgNaturalWidth = img.naturalWidth;
    const imgNaturalHeight = img.naturalHeight;
    const imgDisplayWidth = imgRect.width;
    const imgDisplayHeight = imgRect.height;
    
    // Calculate scale factors
    const scaleX = imgNaturalWidth / imgDisplayWidth;
    const scaleY = imgNaturalHeight / imgDisplayHeight;
    
    // Get selection coordinates relative to wrapper
    const startX = Math.min(selectionStart.x, selectionEnd.x);
    const startY = Math.min(selectionStart.y, selectionEnd.y);
    const endX = Math.max(selectionStart.x, selectionEnd.x);
    const endY = Math.max(selectionStart.y, selectionEnd.y);
    
    // Calculate image position within wrapper
    const imgOffsetX = (wrapperRect.width - imgDisplayWidth) / 2;
    const imgOffsetY = (wrapperRect.height - imgDisplayHeight) / 2;
    
    // Adjust selection coordinates to be relative to image
    const selectionX = Math.max(0, startX - imgOffsetX);
    const selectionY = Math.max(0, startY - imgOffsetY);
    const selectionWidth = Math.min(imgDisplayWidth, endX - imgOffsetX) - selectionX;
    const selectionHeight = Math.min(imgDisplayHeight, endY - imgOffsetY) - selectionY;
    
    // Convert to natural image coordinates
    const cropX = selectionX * scaleX;
    const cropY = selectionY * scaleY;
    let cropWidth = selectionWidth * scaleX;
    let cropHeight = selectionHeight * scaleY;
    
    // Make the crop square by using the smaller dimension
    const size = Math.min(cropWidth, cropHeight);
    cropWidth = size;
    cropHeight = size;
    
    // Center the crop area
    const centerX = cropX + (selectionWidth * scaleX) / 2;
    const centerY = cropY + (selectionHeight * scaleY) / 2;
    const adjustedCropX = Math.max(0, centerX - size / 2);
    const adjustedCropY = Math.max(0, centerY - size / 2);
    
    // Ensure we don't go outside image bounds
    const finalCropX = Math.min(adjustedCropX, imgNaturalWidth - size);
    const finalCropY = Math.min(adjustedCropY, imgNaturalHeight - size);
    
    try {
      // Fetch the image as a blob to avoid CORS issues
      const imageUrl = generatedImages[currentSceneIndex];
      if (!imageUrl || imageUrl === 'DEDICATION_PAGE') {
        return null;
      }
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      // Create a new image element and load the blob
      // Blob URLs are same-origin, so no CORS issues
      return new Promise<string | null>((resolve) => {
        const tempImg = new Image();
        
        tempImg.onload = () => {
          try {
            // Create canvas to crop the image (square)
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              URL.revokeObjectURL(blobUrl);
              resolve(null);
              return;
            }
            
            // Draw the cropped portion (square)
            ctx.drawImage(
              tempImg,
              finalCropX, finalCropY, size, size,
              0, 0, size, size
            );
            
            // Convert canvas to blob
            canvas.toBlob((croppedBlob) => {
              URL.revokeObjectURL(blobUrl);
              if (croppedBlob) {
                const url = URL.createObjectURL(croppedBlob);
                resolve(url);
              } else {
                resolve(null);
              }
            }, 'image/png');
          } catch (error) {
            console.error('Error cropping image:', error);
            URL.revokeObjectURL(blobUrl);
            resolve(null);
          }
        };
        
        tempImg.onerror = () => {
          console.error('Error loading image for cropping');
          URL.revokeObjectURL(blobUrl);
          resolve(null);
        };
        
        tempImg.src = blobUrl;
      });
    } catch (error) {
      console.error('Error fetching image for crop:', error);
      return null;
    }
  }

  // Helper function to resize image to a standard size
  async function resizeImageToSquare(blobUrl: string, targetSize: number = 512): Promise<string | null> {
    try {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = targetSize;
            canvas.height = targetSize;
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              resolve(null);
              return;
            }
            
            // Draw image resized to square
            ctx.drawImage(img, 0, 0, targetSize, targetSize);
            
            canvas.toBlob((resizedBlob) => {
              if (resizedBlob) {
                const url = URL.createObjectURL(resizedBlob);
                resolve(url);
              } else {
                resolve(null);
              }
            }, 'image/png');
          } catch (error) {
            console.error('Error resizing image:', error);
            resolve(null);
          }
        };
        
        img.onerror = () => {
          console.error('Error loading image for resizing');
          resolve(null);
        };
        
        img.src = blobUrl;
      });
    } catch (error) {
      console.error('Error resizing image:', error);
      return null;
    }
  }

  // Helper function to resize image from URL to a standard size
  async function resizeImageFromUrl(imageUrl: string, targetSize: number = 512): Promise<string | null> {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const resizedUrl = await resizeImageToSquare(blobUrl, targetSize);
      URL.revokeObjectURL(blobUrl);
      
      return resizedUrl;
    } catch (error) {
      console.error('Error resizing image from URL:', error);
      return null;
    }
  }

  async function uploadCroppedImageToSupabase(blobUrl: string): Promise<string | null> {
    try {
      // Resize the cropped image to a standard square size before uploading
      const resizedBlobUrl = await resizeImageToSquare(blobUrl, 512);
      if (!resizedBlobUrl) {
        console.error('Failed to resize cropped image');
        return null;
      }
      
      // Fetch the resized blob from the URL
      const response = await fetch(resizedBlobUrl);
      const blob = await response.blob();
      
      // Clean up the resized blob URL
      URL.revokeObjectURL(resizedBlobUrl);
      
      // Convert blob to File
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileName = `cropped_${timestamp}_${randomString}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading cropped image to Supabase:', error);
        return null;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading cropped image:', error);
      return null;
    }
  }

  async function calculateSimilarity(characterImageUrl: string, croppedImageUrl: string): Promise<number> {
    if (!characterImageUrl || !croppedImageUrl) return 0;
    
    try {
      // Resize both images to the same standard size (512x512) before comparison
      const standardSize = 512;
      
      const resizedCharacterUrl = await resizeImageFromUrl(characterImageUrl, standardSize);
      const resizedCroppedUrl = await resizeImageFromUrl(croppedImageUrl, standardSize);
      
      if (!resizedCharacterUrl || !resizedCroppedUrl) {
        console.error('Failed to resize images for comparison');
        // Fallback to original URLs if resize fails
        const response = await fetch('https://drawtopia-backend.vercel.app/compare-similarity', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image1_url: characterImageUrl,
            image2_url: croppedImageUrl
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to calculate similarity: ${response.status}`);
        }

        const data = await response.json();
        return data.similarity || data.score || data.similarity_score || data.result?.similarity || 0;
      }
      
      // Upload both resized images to Supabase for comparison
      const charResponse = await fetch(resizedCharacterUrl);
      const croppedResponse = await fetch(resizedCroppedUrl);
      
      if (!charResponse.ok || !croppedResponse.ok) {
        throw new Error('Failed to fetch resized images');
      }
      
      const charBlob = await charResponse.blob();
      const croppedBlob = await croppedResponse.blob();
      
      // Upload character image
      const timestamp = Date.now();
      const charFileName = `compare_char_${timestamp}_${Math.random().toString(36).substring(2, 15)}.png`;
      const charFile = new File([charBlob], charFileName, { type: 'image/png' });
      
      const { data: charData, error: charError } = await supabase.storage
        .from('images')
        .upload(charFileName, charFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (charError) {
        console.error('Error uploading resized character image:', charError);
        // Clean up
        URL.revokeObjectURL(resizedCharacterUrl);
        URL.revokeObjectURL(resizedCroppedUrl);
        return 0;
      }

      // Upload cropped image
      const croppedFileName = `compare_cropped_${timestamp}_${Math.random().toString(36).substring(2, 15)}.png`;
      const croppedFile = new File([croppedBlob], croppedFileName, { type: 'image/png' });
      
      const { data: croppedData, error: croppedError } = await supabase.storage
        .from('images')
        .upload(croppedFileName, croppedFile, {
          cacheControl: '3600',
          upsert: false
        });

      // Clean up blob URLs
      URL.revokeObjectURL(resizedCharacterUrl);
      URL.revokeObjectURL(resizedCroppedUrl);

      if (croppedError) {
        console.error('Error uploading resized cropped image:', croppedError);
        return 0;
      }

      // Get public URLs
      const { data: charUrlData } = supabase.storage
        .from('images')
        .getPublicUrl(charData.path);
      
      const { data: croppedUrlData } = supabase.storage
        .from('images')
        .getPublicUrl(croppedData.path);

      console.log('Comparing resized images:', charUrlData.publicUrl, croppedUrlData.publicUrl);
      
      const response = await fetch('https://drawtopia-backend.vercel.app/compare-similarity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image1_url: charUrlData.publicUrl,
          image2_url: croppedUrlData.publicUrl
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to calculate similarity: ${response.status}`);
      }

      const data = await response.json();
      // Try multiple possible response field names
      return data.similarity || data.score || data.similarity_score || data.result?.similarity || 0;
    } catch (error) {
      console.error('Error calculating similarity:', error);
      return 0;
    }
  }

  function calculateStars(similarity: number): number {
    if (similarity >= 0.75) {
      return 3;
    } else if (similarity >= 0.65 && similarity < 0.75) {
      return 2;
    } else if (similarity >= 0.5 && similarity < 0.65) {
      return 1;
    } else {
      return 0;
    }
  }

  async function finishSelection() {
    if (!isDragging) return;
    
    isDragging = false;
    
    // Only show modal if there's a meaningful selection (at least 20px)
    const width = Math.abs(selectionEnd.x - selectionStart.x);
    const height = Math.abs(selectionEnd.y - selectionStart.y);
    
    if (width > 20 && height > 20) {
      cropError = null;
      calculatingSimilarity = true;
      // Crop the image
      const croppedBlobUrl = await cropImage();
      if (croppedBlobUrl && characterImageUrl) {
        // Store cropped image in Supabase first
        const croppedSupabaseUrl = await uploadCroppedImageToSupabase(croppedBlobUrl);
        
        if (croppedSupabaseUrl) {
          // Use the blob URL for display (local)
          croppedImageUrl = croppedBlobUrl;
          
          // Calculate similarity using Supabase URLs
          try {
            const similarity = await calculateSimilarity(characterImageUrl, croppedSupabaseUrl);
            stars = calculateStars(similarity);
          } catch (error) {
            console.error('Error calculating similarity:', error);
            stars = 0;
          }
        } else {
          console.warn("Failed to upload cropped image to Supabase");
          // Still show the cropped image but without similarity calculation
          croppedImageUrl = croppedBlobUrl;
          stars = 0;
        }
        
        calculatingSimilarity = false;
        showFoundModal = true;
        
        // Track stats for reading state
        scenesCompleted++;
        totalStarsEarned += stars;
        totalHintsUsed += hintsUsed;
        console.log(`[intersearch-timer] Scene completed. Stars: ${stars}, Hints: ${hintsUsed}, Total scenes: ${scenesCompleted}`);
      } else {
        calculatingSimilarity = false;
        if (!croppedBlobUrl) {
          cropError = "Unable to crop image. This may be due to CORS restrictions.";
        }
        console.warn("Image cropping failed");
      }
    }
    
    // Hide selection after a brief delay
    setTimeout(() => {
      showSelection = false;
    }, 100);
  }

  function closeFoundModal() {
    showFoundModal = false;
    cropError = null;
    // Clean up cropped image URL after a delay
    if (croppedImageUrl) {
      setTimeout(() => {
        URL.revokeObjectURL(croppedImageUrl!);
        croppedImageUrl = null;
      }, 100);
    }
  }

  function downloadCroppedImage() {
    if (!croppedImageUrl) return;
    
    const link = document.createElement('a');
    link.href = croppedImageUrl;
    link.download = `cropped-scene-${currentSceneIndex + 1}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleModalNextScene() {
    closeFoundModal();
    if (currentSceneIndex < generatedImages.length - 1) {
      currentSceneIndex++;
    }
  }

  function starDisplay(count: number) {
    const filled = Array(count).fill("★").join("");
    const empty = Array(3 - count).fill("☆").join("");
    return filled + empty;
  }

  function handleBack() {
    goto("/intersearch");
  }
</script>

<div class="preview-outer">
  <div class="preview-logo-container">
    <img class="preview-logo" src={logo} alt="Drawtopia Logo" />
  </div>
  <div class="arrow">
    <div class="button" on:click={handleBack} role="button" tabindex="0" on:keydown={(e) => (e.key === "Enter" || e.key === " ") && handleBack()}>
      <img src={arrowleft} alt="Arrow Left" />
      <div class="back"><span class="back_span">Back</span></div>
    </div>
    <div class="frame-2147227650">
      <button 
        class="button_01" 
        aria-label="More options"
        on:click={() => (showStoryInfoModal = true)}
      >
        <img src={dotsThreeOutline} alt="More options">
      </button>
      <button 
        class="button_02" 
        aria-label="Share"
        on:click={() => (showShareStoryModal = true)}
      >
        <img src={shareIcon} alt="Share">
      </button>
    </div>
  </div>
  <div class="preview-content-container">
    <div class="preview-header-row">
      <div class="preview-header-title">
        <div class="preview-header-topic">
          {storyTitle || "Your Search Adventure"}
        </div>
        <div class="preview-header-note">
          Interactive Search Adventure
        </div>
      </div>
      <div class="preview-header-actions">
        <button 
          class="preview-header-btn" 
          aria-label="Share"
          on:click={() => (showShareStoryModal = true)}
        >
          <img src={shareIcon} alt="Share" />
        </button>
        <button 
          class="preview-header-btn" 
          aria-label="More options"
          on:click={() => (showStoryInfoModal = true)}
        >
          <img src={dotsThreeOutline} alt="More" />
        </button>
      </div>
    </div>
    <div class="rectangle"></div>
    {#if isLoading}
      <div class="generating-container">
        <div class="generating-spinner"></div>
        <div class="generating-text">
          Loading your search adventure...
        </div>
        <div class="generating-progress">Please wait</div>
      </div>
    {:else if loadError}
      <div class="generating-container">
        <div class="generating-text" style="color: #f44336;">
          Error: {loadError}
        </div>
        <button 
          class="preview-start-btn" 
          on:click={() => window.location.reload()}
          style="margin-top: 20px;"
        >
          Retry
        </button>
      </div>
    {:else if generatedImages.length > 0}
      <div class="scene-view-container">
        <div class="scene-image-container">
          <div 
            class="book-container"
            class:cover-mode={currentSceneIndex === 0}
            bind:this={imageWrapperRef}
            on:mousedown={handleMouseDown}
            on:mousemove={handleMouseMove}
            on:mouseup={handleMouseUp}
            on:mouseleave={handleMouseUp}
            role={currentSceneIndex === 0 || (hasDedication && currentSceneIndex === 1) ? "img" : "application"}
            tabindex={currentSceneIndex === 0 || (hasDedication && currentSceneIndex === 1) ? -1 : 0}
            aria-label={currentSceneIndex === 0 ? "Cover image" : (hasDedication && currentSceneIndex === 1) ? "Dedication page" : "Image selection area"}
          >
            {#if currentSceneIndex === 0}
              <!-- Cover: Single image display -->
              <div class="cover-image-container">
                <img
                  bind:this={imageRef}
                  src={generatedImages[currentSceneIndex]}
                  alt="Cover"
                  class="cover-main-image"
                  draggable="false"
                />
              </div>
            {:else if hasDedication && currentSceneIndex === 1 && generatedImages[currentSceneIndex] === 'DEDICATION_PAGE'}
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
                  </div>
                </div>
              </div>
            {:else if generatedImages[currentSceneIndex] && generatedImages[currentSceneIndex] !== 'DEDICATION_PAGE'}
              <!-- Scenes 1-4: Split into left and right halves -->
              <div class="mobile-image-split">
                <div class="mobile-image-half mobile-image-left">
                  <img
                    bind:this={imageRef}
                    src={generatedImages[currentSceneIndex]}
                    alt={sceneTitles[selectedWorld || "enchanted-forest"]?.[
                      hasDedication ? currentSceneIndex - 2 : currentSceneIndex - 1
                    ] || `Scene ${currentSceneIndex} - Left`}
                    class="scene-main-image"
                    draggable="false"
                  />
                </div>
                <div class="mobile-image-half mobile-image-right">
                  <img
                    src={generatedImages[currentSceneIndex]}
                    alt={sceneTitles[selectedWorld || "enchanted-forest"]?.[
                      hasDedication ? currentSceneIndex - 2 : currentSceneIndex - 1
                    ] || `Scene ${currentSceneIndex} - Right`}
                    class="scene-main-image"
                    draggable="false"
                  />
                </div>
              </div>
            {/if}
            <div class="scene-control-buttons">
              <button class="notification" aria-label="Full Screen Preview">
                <img src={fullscreen} alt="fullscreen" class="btn-icon-fullscreen" />
                <div><span class="fullscreenpreview_span">Full Screen Preview</span></div>
              </button>
              {#if currentSceneIndex !== 0 && !(hasDedication && currentSceneIndex === 1)}
                <button class="notification_01" aria-label="Hint">
                  <img src={hintIcon} alt="Hint" class="btn-icon-hint" />
                  <div><span class="hint3left_span">Hint ({hintsLeft} Left)</span></div>
                </button>
                <button class="notification_02" aria-label="Zoom">
                  <img src={zoomIcon} alt="Zoom" class="btn-icon-zoom" />
                  <div><span class="zoom_span">Zoom</span></div>
                </button>
              {/if}
            </div>
            {#if showSelection}
              <div
                class="selection-overlay"
                style="left: {Math.min(selectionStart.x, selectionEnd.x)}px; 
                       top: {Math.min(selectionStart.y, selectionEnd.y)}px; 
                       width: {Math.abs(selectionEnd.x - selectionStart.x)}px; 
                       height: {Math.abs(selectionEnd.y - selectionStart.y)}px;"
              ></div>
            {/if}
          </div>
        </div>
      </div>
    {:else}
      <div class="scene-view-container">
        <div class="scene-image-container">
          <!-- Mobile: Split into left and right halves -->
          <div class="mobile-image-split">
            <div class="mobile-image-half mobile-image-left">
              <img
                src={tempScene}
                alt="Preview - Where Is Luna? - Left"
                class="scene-main-image"
                draggable="false"
              />
            </div>
            <div class="mobile-image-half mobile-image-right">
              <img
                src={tempScene}
                alt="Preview - Where Is Luna? - Right"
                class="scene-main-image"
                draggable="false"
              />
            </div>
          </div>
          <div class="scene-control-buttons">
            <button class="notification" aria-label="Full Screen Preview">
              <img src={fullscreen} alt="fullscreen" class="btn-icon-fullscreen" />
              <div><span class="fullscreenpreview_span">Full Screen Preview</span></div>
            </button>
            {#if currentSceneIndex !== 0}
              <button class="notification_01" aria-label="Hint">
                <img src={hintIcon} alt="Hint" class="btn-icon-hint" />
                <div><span class="hint3left_span">Hint ({hintsLeft} Left)</span></div>
              </button>
              <button class="notification_02" aria-label="Zoom">
                <img src={zoomIcon} alt="Zoom" class="btn-icon-zoom" />
                <div><span class="zoom_span">Zoom</span></div>
              </button>
            {/if}
          </div>
        </div>
      </div>
    {/if}
    <div class="preview-footer-area">
      <button
        class="preview-nav-btn"
        on:click={previousScene}
        disabled={currentSceneIndex === 0 || isLoading}>
        <img src={arrowleft} alt="Arrow Left" />
        <span class="previousscene_span">Previous</span>
      </button>
      <div class="preview-dots">
        {#if generatedImages.length > 0}
          {#each generatedImages as _, idx}
            <button
              class="preview-dot"
              class:active={currentSceneIndex === idx}
              on:click={() => goToScene(idx)}
              aria-label={idx === 0 ? "Go to cover" : idx === 1 ? "Go to dedication" : `Go to scene ${idx - 1}`}
              disabled={isLoading}
            >
              {#if idx === 0}
                <img src={coverIcon} alt="cover icon" />
              {:else if idx === 1 && hasDedication && generatedImages[idx] === 'DEDICATION_PAGE'}
                <img src={mailIcon} alt="dedication icon" />
              {:else}
                {hasDedication ? idx - 2 : idx - 1}
              {/if}
            </button>
          {/each}
        {:else}
        <div class="preview-dots-container">

          {#each Array(totalPages) as _, idx}
            {#if idx === 0}
              <span class="preview-dot active">
                <img src={coverIcon} alt="cover icon" />
              </span>
            {:else if idx == 1}
              <span class="preview-dot">
                <img src={mailIcon} alt="mail icon" />
              </span>
            {:else if idx < 4}
              <span
                class="preview-dot"
                style="color: #fff; font-size: 24px; font-weight: 600;"
              >
                {idx - 1}
              </span>
            {:else}
              <span class="preview-dot lock">
                <img src={lockKeyIcon} alt="mail icon" />
              </span>
            {/if}
          {/each}
        </div>
        {/if}
      </div>
      <button
        class="preview-start-btn"
        on:click={handleStartScene1}
        disabled={isLoading || generatedImages.length === 0}
      >
        <div class="next-scene-btn-content">
          <span class="nextscene_span">
            {isLoading 
              ? "Loading..." 
              : currentSceneIndex === generatedImages.length - 1 
                ? "Show Results" 
                : currentSceneIndex === 0 
                  ? "Start Scene 1" 
                  : "Next Scene"}
          </span>
          <div class="ellipse-1415-btn"></div>
          <img src={arrowleft} alt="Next" class="arrowright-btn" />
        </div>
      </button>
    </div>
    <div class="frame-1410104203">
      <button 
        class="button-nav" 
        on:click={previousScene}
        disabled={currentSceneIndex === 0 || isLoading}
      >
        <img src={arrowleft} alt="Arrow Left" class="arrowleft-nav" />
        <div class="previous-scene"><span class="previousscene_span">Previous</span></div>
      </button>
      <button 
        class="button_01-nav" 
        on:click={handleStartScene1}
        disabled={isLoading || generatedImages.length === 0}
      >
        <div class="next-scene"><span class="nextscene_span">
          {currentSceneIndex === generatedImages.length - 1 ? "Results" : "Next Scene"}
        </span></div>
        <img src={arrowleft} alt="Arrow Left" class="arrowleft_01-nav" />
        <div class="ellipse-1415-nav"></div>
      </button>
    </div>
  </div>
</div>

<!-- You Found Luna Modal -->
{#if showFoundModal}
  <div 
    class="found-modal-overlay"
    on:click={closeFoundModal}
    on:keydown={(e) => e.key === 'Escape' && closeFoundModal()}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <div 
      class="found-modal-container" 
      on:click|stopPropagation
      on:keydown={(e) => e.key === 'Escape' && closeFoundModal()}
      tabindex="0"
    >
      <button class="found-modal-close" on:click={closeFoundModal} aria-label="Close">
        ×
      </button>
      
      <h2 class="found-modal-title">You Found Luna!</h2>
      
      {#if calculatingSimilarity}
        <div class="calculating-similarity">
          <div class="calculating-spinner"></div>
          <p>Calculating similarity...</p>
        </div>
      {:else if croppedImageUrl}
        <div class="cropped-image-preview">
          <img 
            src={croppedImageUrl} 
            alt="Cropped selection" 
            class="cropped-preview-image"
          />
          <button class="download-cropped-btn" on:click={downloadCroppedImage}>
            Download Cropped Image
          </button>
        </div>
      {:else if cropError}
        <div class="crop-error-message">
          <p>{cropError}</p>
        </div>
      {/if}
      
      <div class="found-modal-stats">
        <div class="stat-item">
          <img src={timeIcon} alt="Time" class="stat-icon" />
          <span class="stat-label">Time : {sceneTime}</span>
        </div>
        <div class="stat-item">
          <img src={hintIcon} alt="Hint" class="stat-icon" />
          <span class="stat-label">Hint Used: {hintsUsed}</span>
        </div>
        <div class="stat-item">
          <span class="star-display">{starDisplay(stars)}</span>
        </div>
      </div>
      
      <button class="found-modal-next-btn" on:click={handleModalNextScene}>
        Next Scene
      </button>
    </div>
  </div>
{/if}

{#if showStoryInfoModal}
  <StoryInfoModal 
    storyId={storyId || ""}
    storyTitle={storyTitle || "Your Search Adventure"}
    on:close={() => showStoryInfoModal = false}
    on:delete={(e) => {
      showStoryInfoModal = false;
      goto('/dashboard');
    }}
  />
{/if}

{#if showShareStoryModal}
  <ShareStoryModal 
    storyTitle={storyTitle || "Untitled Story"} 
    storyId={storyId || ""}
    on:close={() => showShareStoryModal = false} 
  />
{/if}

<svelte:window on:keydown={(e) => {
  if (e.key === 'Escape') {
    showStoryInfoModal = false;
    showShareStoryModal = false;
  }
}} />

<style>
  .preview-outer {
    min-height: 100vh;
    width: 100%;
    padding: 24px 100px 80px 100px;
    background: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 30px;
    gap: 24px;
    overflow: hidden;
  }
  .preview-logo-container {
    justify-content: center;
    align-items: center;
    padding: 12px 12px 12px 24px;
  }

  .preview-logo {
    height: 43px;
  }

  .back_span {
    color: black;
    font-size: 16px;
    font-family: DM Sans, sans-serif;
    font-weight: 600;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .back {
    text-align: center;
  }

  .rectangle {
    display: flex;
    height: 2px;
    width: 100%;
    background: #d9d9d9;
  }

  .button {
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 12px;
    padding-bottom: 12px;
    box-shadow: 0px 0px 0px 2px #EEF6FF;
    border-radius: 20px;
    outline: 1px #DCDCDC solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    background: white;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
  }

  .button:hover {
    background: #f5f7fa;
  }

  .button_01 {
    width: 48px;
    height: 48px;
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 8px;
    padding-bottom: 8px;
    border-radius: 8px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    background: white;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
  }

  .button_01:hover {
    background: #f5f7fa;
  }

  .button_02 {
    width: 48px;
    height: 48px;
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 8px;
    padding-bottom: 8px;
    border-radius: 8px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    background: white;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
  }

  .button_02:hover {
    background: #f5f7fa;
  }

  .frame-2147227650 {
    justify-content: flex-end;
    align-items: center;
    gap: 8px;
    display: flex;
  }

  .arrow {
    display: none;
  }

  .preview-content-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    width: 1240px;
    max-width: 100%;
    border-radius: 20px;
    outline: 1px #dcdcdc solid;
    padding: 12px;
  }

  .preview-header-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 8px;
    padding-top: 8px;
  }
  .preview-header-title {
    display: flex;
    flex-direction: column;
    font-family: Quicksand, sans-serif;
    font-weight: 700;
    font-size: 32px;
    color: #23243c;
    letter-spacing: 0.01em;
    margin-bottom: 0;
    gap: 8px;
  }
  .preview-header-note {
    font-family: Nunito, sans-serif;
    font-size: 14px;
    color: #888;
    font-weight: 400;
    margin-top: 2px;
  }
  .preview-header-actions {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    margin-top: 4px;
  }
  .preview-header-btn {
    background: #fff;
    border: 1px solid #e6e6e6;
    border-radius: 8px;
    padding: 8px 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.15s, box-shadow 0.15s;
    box-shadow: 0 1px 2px #0001;
    outline: none;
  }
  .preview-header-btn:hover {
    background: #f5f7fa;
    box-shadow: 0 2px 8px #0001;
  }
  .preview-header-btn img {
    width: 22px;
    height: 22px;
    display: block;
  }
  .preview-header-note {
    font-family: Nunito, sans-serif;
    font-size: 12px;
    color: #b8b8bb;
  }
  
  .notification {
    padding-top: 10px;
    padding-bottom: 10px;
    padding-left: 16px;
    padding-right: 20px;
    background: #F8FAFB;
    box-shadow: 0px 1px 4px rgba(141.80, 141.80, 141.80, 0.25) inset;
    border-radius: 12px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 18px;
    display: flex;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
  }

  .notification:hover {
    background: #F0F4F7;
  }

  .notification_01 {
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 18px;
    padding-right: 24px;
    position: relative;
    background: #FFBE4C;
    overflow: hidden;
    border-radius: 12px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: flex;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
  }

  .notification_01:hover {
    background: #FFB03C;
  }

  .notification_02 {
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 18px;
    padding-right: 24px;
    background: #F8FAFB;
    box-shadow: 0px 1px 4px rgba(141.80, 141.80, 141.80, 0.25) inset;
    border-radius: 12px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: flex;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
  }

  .notification_02:hover {
    background: #F0F4F7;
  }

  .fullscreenpreview_span {
    color: #141414;
    font-size: 20px;
    font-family: Quicksand, sans-serif;
    font-weight: 600;
    line-height: 28px;
    word-wrap: break-word;
  }

  .hint3left_span {
    color: #FFF6E0;
    font-size: 20px;
    font-family: Quicksand, sans-serif;
    font-weight: 600;
    line-height: 28px;
    word-wrap: break-word;
  }

  .zoom_span {
    color: #141414;
    font-size: 20px;
    font-family: Quicksand, sans-serif;
    font-weight: 600;
    line-height: 28px;
    word-wrap: break-word;
  }

  .btn-icon-fullscreen {
    width: 32px;
    height: 32px;
    display: block;
  }

  .btn-icon-hint {
    width: 28px;
    height: 28px;
    display: block;
    filter: brightness(0) invert(1);
  }

  .btn-icon-zoom {
    width: 28px;
    height: 28px;
    display: block;
  }

  .preview-footer-area {
    height: 57px;
    width: 1216px;
    max-width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 28px;
  }
  .preview-nav-btn {
    font-family: Quicksand, sans-serif;
    font-size: 18px;
    font-weight: 600;
    border: none;
    background: white;
    color: black;
    border-radius: 20px;
    padding: 16px 24px;
    height: 57px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    box-shadow: 0px 4px 4px rgba(98.89, 98.89, 98.89, 0.25);
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .preview-nav-btn:hover:not(:disabled) {
    background: #f5f7fa;
  }

  .preview-nav-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .preview-nav-btn img {
    width: 20px;
    height: 20px;
    display: block;
  }
  .preview-dots {
    display: flex;
    gap: 7px;
  }
  .preview-dot {
    width: 40px;
    height: 40px;
    border-radius: 7px;
    background: #f0f0f8;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 1px;
    border: none;
    cursor: pointer;
    font-family: Nunito, sans-serif;
    font-size: 20px;
    font-weight: 600;
    color: #727272;
    transition: all 0.2s;
  }
  
  .preview-dot.active {
    background: #144be1;
    color: white;
    box-shadow: 0 2px 12px #477de710;
  }
  .preview-dot:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .preview-dot img {
    width: 24px;
    height: 24px;
    display: block;
  }
  .preview-dot.active img {
    filter: brightness(0) invert(1);
  }
  
  .preview-start-btn {
    font-family: Quicksand, sans-serif;
    color: #fff;
    background: #438bff;
    font-weight: 600;
    border: none;
    border-radius: 12px;
    font-size: 18px;
    padding: 16px 24px;
    min-width: 159px;
    cursor: pointer;
    transition: background 0.18s;
    height: 57px;
    position: relative;
    overflow: hidden;
  }
  .preview-start-btn:hover:not(:disabled) {
    background: #2566c9;
  }
  .preview-start-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .next-scene-btn-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    position: relative;
    z-index: 2;
  }

  .nextscene_span {
    color: white;
    font-size: 18px;
    font-family: Quicksand, sans-serif;
    font-weight: 600;
    line-height: 25.20px;
    word-wrap: break-word;
    text-align: center;
  }

  .next-scene {
    text-align: center;
  }

  .ellipse-1415-btn {
    width: 248px;
    height: 114px;
    position: absolute;
    left: -46px;
    top: 0;
    background: radial-gradient(ellipse 42.11% 42.11% at 50.00% 52.94%, white 0%, rgba(255, 255, 255, 0) 100%);
    border-radius: 9999px;
    pointer-events: none;
    z-index: 1;
  }

  .arrowright-btn {
    width: 20px;
    height: 20px;
    display: block;
    transform: rotate(180deg);
    z-index: 2;
    filter: brightness(0) invert(1);
  }

  /* Generating state */
  .generating-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 24px;
    width: 100%;
    height: 100%;
    min-height: 600px;
  }

  .generating-spinner {
    width: 64px;
    height: 64px;
    border: 4px solid #e6ebf3;
    border-top-color: #438bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .generating-text {
    font-family: Quicksand, sans-serif;
    font-size: 24px;
    font-weight: 600;
    color: #23243c;
    text-align: center;
  }

  .generating-progress {
    font-family: Nunito, sans-serif;
    font-size: 16px;
    color: #727272;
    text-align: center;
  }

  /* Scene View Styles */
  .scene-view-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    width: 1216px;
    max-width: 100%;
    background-color: #f8fafb;
    border-radius: 12px;
    padding: 12px;
  }

  .scene-image-container {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #f8fafb;
    border-radius: 12px;
    overflow: visible;
    padding: 20px;
    gap: 20px;
  }

  .book-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .book-container.cover-mode {
    cursor: default;
  }

  .scene-main-image {
    display: block;
    max-width: 100%;
    max-height: 750px;
    width: auto;
    height: auto;
    object-fit: contain;
    border-radius: 8px;
    pointer-events: none;
    position: relative;
    z-index: 1;
  }

  /* Cover Image Styles */
  .cover-image-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: 0;
  }

  .cover-main-image {
    display: block;
    max-width: 100%;
    max-height: 750px;
    width: auto;
    height: auto;
    object-fit: contain;
    border-radius: 8px;
    pointer-events: none;
    position: relative;
    z-index: 1;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  /* Mobile image split container - hidden on desktop */
  .mobile-image-split {
    /* display: none; */
    display: flex;
    flex-direction: row;
    gap: 2px;
    width: 100%;
  }

  .mobile-image-half {
    position: relative;
    width: 100%;
    overflow: hidden;
    border-radius: 8px;
    height: 100%;
    position: relative;
    background: white;
    box-shadow: -2px 10px 0px black;
    border-radius: 24px;
  }

  .mobile-image-half .scene-main-image {
    width: 200%;
    max-width: 200%;
    height: auto;
    object-fit: cover;
  }

  .mobile-image-left .scene-main-image {
    object-position: left center;
    margin-left: 0;
  }

  .mobile-image-right .scene-main-image {
    object-position: right center;
    margin-left: -100%;
  }

  .book-container::after {
    content: '';
    position: absolute;
    bottom: -20px;
    left: 50%;
    transform: translateX(-50%);
    width: 85%;
    height: 20px;
    background: radial-gradient(
      ellipse at center,
      rgba(0, 0, 0, 0.1) 0%,
      rgba(0, 0, 0, 0.05) 40%,
      transparent 70%
    );
    border-radius: 0 0 50% 50% / 0 0 100% 100%;
    z-index: 0;
  }

  .selection-overlay {
    position: absolute;
    background: rgba(173, 216, 230, 0.3);
    border: 2px dashed #438bff;
    pointer-events: none;
    z-index: 5;
  }

  .scene-control-buttons {
    display: flex;
    gap: 12px;
    align-items: center;
    z-index: 10;
    pointer-events: auto;
    justify-content: center;
  }

  /* Found Luna Modal */
  .found-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 3000;
    padding: 20px;
  }

  .found-modal-container {
    background: white;
    border-radius: 20px;
    padding: 40px;
    max-width: 500px;
    width: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  }

  .found-modal-close {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 32px;
    height: 32px;
    border: none;
    background: #f6f9fd;
    border-radius: 50%;
    font-size: 24px;
    color: #727272;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    line-height: 1;
  }

  .found-modal-close:hover {
    background: #e6ebf3;
    color: #23243c;
  }

  .found-modal-title {
    font-family: Quicksand, sans-serif;
    font-size: 32px;
    font-weight: 700;
    color: #23243c;
    margin: 0;
    text-align: center;
  }

  .calculating-similarity {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 40px;
  }

  .calculating-similarity p {
    font-family: Nunito, sans-serif;
    font-size: 16px;
    color: #727272;
  }

  .calculating-spinner {
    width: 48px;
    height: 48px;
    border: 4px solid #e6ebf3;
    border-top-color: #438bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .cropped-image-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    width: 100%;
    padding: 0;
  }

  .cropped-preview-image {
    max-width: 100%;
    max-height: 300px;
    width: auto;
    height: auto;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    object-fit: contain;
  }

  .download-cropped-btn {
    padding: 12px 24px;
    background: #10b981;
    color: white;
    border: none;
    border-radius: 8px;
    font-family: Nunito, sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
  }

  .download-cropped-btn:hover {
    background: #059669;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    transform: translateY(-2px);
  }

  .crop-error-message {
    padding: 16px;
    background: #fee2e2;
    border: 1px solid #fca5a5;
    border-radius: 8px;
    color: #991b1b;
    font-family: Nunito, sans-serif;
    font-size: 14px;
    text-align: center;
  }

  .found-modal-stats {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    padding: 0 20px;
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: Nunito, sans-serif;
    font-size: 18px;
    color: #23243c;
  }

  .stat-icon {
    width: 24px;
    height: 24px;
  }

  .stat-label {
    font-weight: 600;
  }

  .star-display {
    font-size: 28px;
    letter-spacing: 4px;
    color: #FFD700;
    font-weight: 600;
  }

  .found-modal-next-btn {
    width: 100%;
    padding: 16px 32px;
    background: #438bff;
    color: white;
    border: none;
    border-radius: 12px;
    font-family: Quicksand, sans-serif;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 12px rgba(67, 139, 255, 0.3);
  }

  .found-modal-next-btn:hover {
    background: #2566c9;
    box-shadow: 0 6px 16px rgba(67, 139, 255, 0.4);
    transform: translateY(-2px);
  }

  /* Navigation Button Set Styles */
  .frame-1410104203 {
    width: 100%;
    height: 100%;
    justify-content: space-between;
    align-items: center;
    display: none;
  }

  .previousscene_span {
    color: black;
    font-size: 18px;
    font-family: Quicksand, sans-serif;
    font-weight: 600;
    line-height: 25.20px;
    word-wrap: break-word;
  }

  .previous-scene {
    text-align: center;
  }

  .nextscene_span {
    color: white;
    font-size: 18px;
    font-family: Quicksand, sans-serif;
    font-weight: 600;
    line-height: 25.20px;
    word-wrap: break-word;
  }

  .next-scene {
    text-align: center;
  }

  .ellipse-1415-nav {
    width: 248px;
    height: 114px;
    left: -46px;
    top: 25px;
    position: absolute;
    background: radial-gradient(ellipse 42.11% 42.11% at 50.00% 52.94%, white 0%, rgba(255, 255, 255, 0) 100%);
    border-radius: 9999px;
  }

  .arrowleft-nav {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .arrowleft_01-nav {
    width: 20px;
    height: 20px;
    position: relative;
    transform: rotate(-180deg);
    overflow: hidden;
  }

  .button-nav {
    flex: 1 1 0;
    height: 54px;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    box-shadow: 0px 4px 4px rgba(98.89, 98.89, 98.89, 0.25);
    border-radius: 20px;
    outline: 1px #DCDCDC solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    background: white;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
  }

  .button-nav:hover:not(:disabled) {
    background: #f5f7fa;
  }

  .button-nav:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .button_01-nav {
    flex: 1 1 0;
    height: 54px;
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 16px;
    padding-bottom: 16px;
    position: relative;
    background: #438BFF;
    overflow: hidden;
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    display: flex;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
  }

  .button_01-nav:hover:not(:disabled) {
    background: #2566c9;
  }

  .button_01-nav:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .preview-dots-container {
    display: flex;
    flex-direction: row;
    gap: 4px;
  }

  /* ---------- Responsive styles ---------- */

  @media (max-width: 1024px) {
    .preview-outer {
      padding-left: 40px;
      padding-right: 40px;
    }

    .preview-content-container {
      width: 100%;
    }

    .preview-footer-area,
    .scene-view-container {
      width: 100%;
    }

    .arrow {
      width: 100%;
      height: 100%;
      padding-top: 6px;
      padding-bottom: 6px;
      justify-content: space-between;
      align-items: center;
      display: inline-flex;
      max-width: 1240px;
      width: 100%;
    }

    .preview-header-actions {
      display: none;
    }
  }

  @media (max-width: 768px) {
    .preview-outer {
      padding: 16px;
      gap: 16px;
    }

    .preview-header-row {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }

    .preview-header-title {
      font-size: 24px;
      width: 100%;
    }

    .scene-image-container {
      min-height: 60vh;
      padding: 8px;
    }

    .book-container {
      max-width: 100%;
    }

    .cover-image-container {
      width: 100%;
      padding: 0;
    }

    .cover-main-image {
      width: 100%;
      max-width: 100%;
      height: auto;
      max-height: 70vh;
    }

    .mobile-image-split {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .mobile-image-half {
      width: 100%;
    }

    .mobile-image-half .scene-main-image {
      width: 200%;
      max-width: 200%;
      height: auto;
      max-height: none;
    }

    .mobile-image-left .scene-main-image {
      object-position: left center;
      margin-left: 0;
    }

    .mobile-image-right .scene-main-image {
      object-position: right center;
      margin-left: -100%;
    }

    .scene-control-buttons {
      flex-direction: column;
      bottom: 16px;
      width: 100%;
    }

    .preview-footer-area {
      flex-direction: column;
      align-items: stretch;
      height: auto;
      gap: 12px;
    }

    .preview-nav-btn,
    .preview-start-btn {
      width: 100%;
      display: none;
    }

    .preview-logo {
      height: 32px;
    }

    .preview-header-topic {
      width: 70%;
      text-align: center;
      margin: auto;
      font-size: 24px;
    }

    .preview-header-note {
      width: 70%;
      text-align: center;
      margin: auto;
    }

    .frame-1410104203 {
      width: 100%;
      height: 100%;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      display: flex;
    }

    .button-nav,
    .button_01-nav {
      font-size: 16px;
    }

    .previousscene_span,
    .nextscene_span {
      font-size: 16px;
      line-height: 22.40px;
    }

    .arrowleft_01-nav {
      transform: rotate(180deg);
      filter: brightness(0) invert(1);
    }

    .preview-dots-container {
      display: flex;
      flex-direction: row;
      gap: 4px;
      margin: auto;
    }

    .preview-dots {
      justify-content: center;
      align-items: center;
    }

    .notification {
      width: 100%;
    }
  }

  @media (max-width: 480px) {
    .preview-header-title {
      font-size: 20px;
    }

    .preview-start-btn {
      font-size: 14px;
    }

    .nextscene_span {
      font-size: 14px;
      line-height: 20px;
    }

    .notification,
    .notification_01,
    .notification_02 {
      width: 100%;
      height: auto;
      min-height: 50px;
      justify-content: center;
    }

    .fullscreenpreview_span,
    .hint3left_span,
    .zoom_span {
      font-size: 16px;
      line-height: 24px;
    }

    .found-modal-container {
      padding: 24px;
      max-width: 90%;
    }

    .found-modal-title {
      font-size: 24px;
    }

    .stat-item {
      font-size: 16px;
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
    margin-top: 120px;
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
