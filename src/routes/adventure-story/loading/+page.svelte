<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { get } from 'svelte/store';
    import { goto } from '$app/navigation';
    import { browser } from '$app/environment';
    import { storyCreation } from '../../../lib/stores/storyCreation';
    import { env } from '../../../lib/env';
    import { supabase } from '../../../lib/supabase';
    import type { ChildProfile } from '../../../lib/database/childProfiles';
    import { createStory } from '../../../lib/database/stories';
    import { user } from '../../../lib/stores/auth';
    import { buildStoryTextPrompt, buildStoryScenePrompt, buildDedicationScenePrompt, buildIntersearchScenePrompt, buildIntersearchSearchAdventurePrompt, buildIntersearchCoverPrompt } from '../../../lib/promptBuilder';
    import drawtopia from "../../../assets/logo.png";
    import shieldstar from "../../../assets/ShieldStar.svg";
    import arrowleft from "../../../assets/ArrowLeft.svg";
    import magicalwand from "../../../assets/magic-wand.gif"; 
    import magicalwand1 from "../../../assets/magic-wand1.gif"; 
    import magicalwand2 from "../../../assets/magic-wand2.gif"; 
    import shootingstar from "../../../assets/ShootingStar.svg"
    import ProgressBar from "../../../components/ProgressBar.svelte";
    import MobileStepProgressBar from "../../../components/MobileStepProgressBar.svelte";

    const TOTAL_TIME = 60; // 60 seconds (fallback timer)
    let timeRemaining = TOTAL_TIME;
    let completionPercent = 0;
    let intervalId: number | null = null;
    let hasNavigated = false;
    let storyGenerated = false;
    let storyTextProgress = 0; // 0-50% for story text
    let sceneImageProgress = 0; // 0-50% for scene images (50-100% total)
    let totalSceneImages = 5; // Expected number of scene images
    let isCancelled = false; // Cancellation flag
    let previewImage1: string | null = null; // Preview image 1
    let previewImage2: string | null = null; // Preview image 2
    let previewImage3: string | null = null; // Preview image 3 (first scene preview)

    // Determine which magical wand GIF to show based on completion percentage
    $: currentMagicalWand = completionPercent < 25 
        ? magicalwand 
        : completionPercent < 50 
        ? magicalwand1 
        : magicalwand2;

    // Calculate total completion percent from story and image progress
    $: completionPercent = Math.min(100, storyTextProgress + sceneImageProgress);

    // Track story type (interactive or story)
    $: storyType = sessionStorage.getItem('selectedFormat') || 'story';

    // Navigate to appropriate page when completion reaches 100%
    $: if (completionPercent >= 100 && !hasNavigated && storyGenerated) {
        hasNavigated = true;
        // Small delay to ensure UI updates before navigation
        setTimeout(() => {
            if (storyType === 'interactive') {
                // Navigate to intersearch page with story ID
                const storyId = browser ? sessionStorage.getItem('currentStoryId') : null;
                if (storyId) {
                    goto(`/intersearch/1?storyId=${storyId}`);
                } else {
                    goto('/intersearch/1');
                }
            } else {
                // Navigate to adventure story final page
                goto('/adventure-story/final');
            }
        }, 500);
    }

    // Helper function to map character type enum to descriptive string
    function mapCharacterType(type: string | undefined): string {
        if (!type) return 'person';
        const typeMap: { [key: string]: string } = {
            'person': 'a person',
            'animal': 'an animal',
            'magical_creature': 'a magical creature'
        };
        return typeMap[type.toLowerCase()] || 'a person';
    }

    // Helper function to map story world enum to prompt builder format
    // The prompt builder expects: 'enchanted-forest', 'outer-space', or 'underwater-kingdom'
    function mapStoryWorld(world: string | undefined): string {
        if (!world) return 'enchanted-forest';
        const worldMap: { [key: string]: string } = {
            'forest': 'enchanted-forest',
            'enchanted-forest': 'enchanted-forest',
            'enchanted_forest': 'enchanted-forest',
            'space': 'outer-space',
            'outer-space': 'outer-space',
            'outer_space': 'outer-space',
            'outerspace': 'outer-space',
            'underwater': 'underwater-kingdom',
            'underwater-kingdom': 'underwater-kingdom',
            'underwater_kingdom': 'underwater-kingdom'
        };
        return worldMap[world.toLowerCase()] || 'enchanted-forest';
    }

    // Helper function to map adventure type enum to prompt builder format
    // The prompt builder expects: 'Treasure Hunt' or 'Helping a Friend'
    function mapAdventureType(adventure: string | undefined): string {
        if (!adventure) return 'Treasure Hunt';
        const adventureMap: { [key: string]: string } = {
            'treasure_hunt': 'Treasure Hunt',
            'treasure-hunt': 'Treasure Hunt',
            'treasure': 'Treasure Hunt',
            'helping_friend': 'Helping a Friend',
            'helping-a-friend': 'Helping a Friend',
            'helping': 'Helping a Friend',
            'helpfriend': 'Helping a Friend'
        };
        return adventureMap[adventure.toLowerCase()] || 'Treasure Hunt';
    }

    // Helper function to normalize age group to backend format
    function normalizeAgeGroup(ageGroup: string | undefined): string {
        if (!ageGroup) return '7-10'; // Default age group
        // Backend expects "3-6", "7-10", or "11-12"
        // Map common variations
        const normalized = ageGroup.trim();
        if (normalized === '3-5' || normalized === '3-6') return '3-6';
        if (normalized === '6-7' || normalized === '7-10' || normalized === '8-10') return '7-10';
        if (normalized === '11-12') return '11-12';
        // If already in correct format, return as is
        if (['3-6', '7-10', '11-12'].includes(normalized)) return normalized;
        // Default fallback
        return '7-10';
    }

    // Scene titles for interactive stories
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

    // Cancel generation and navigate back
    function handleCancel() {
        isCancelled = true;
        if (intervalId !== null) {
            clearInterval(intervalId);
            intervalId = null;
        }
        goto('/adventure-story/story-preview');
    }

    // Generate interactive intersearch story
    async function generateIntersearchStory() {
        if (isCancelled) return;
        
        try {
            // Initialize story creation store
            storyCreation.init();
            const storyState = get(storyCreation);
            
            // Get character data
            const characterName = storyState.characterName || sessionStorage.getItem('characterName') || 'Character';
            const characterType = storyState.characterType || sessionStorage.getItem('selectedCharacterType') || 'person';
            const specialAbility = storyState.specialAbility || sessionStorage.getItem('specialAbility') || '';
            const characterStyle = storyState.characterStyle || sessionStorage.getItem('selectedStyle') || 'cartoon';
            const storyTitle = storyState.storyTitle || sessionStorage.getItem('storyTitle') || `${characterName}'s Search Adventure`;
            
            // Get world and difficulty from sessionStorage
            const selectedWorld = browser ? (sessionStorage.getItem('intersearch_world') || sessionStorage.getItem('selectedWorld') || 'enchanted-forest') : 'enchanted-forest';
            const selectedDifficulty = browser ? (sessionStorage.getItem('intersearch_difficulty') || 'medium') : 'medium';
            
            // Get age group
            let ageGroup = '7-10';
            if (selectedDifficulty === 'easy') {
                ageGroup = '3-6';
            } else if (selectedDifficulty === 'medium') {
                ageGroup = '7-10';
            } else if (selectedDifficulty === 'hard') {
                ageGroup = '11-12';
            }
            
            // Get character image URL
            let characterImageUrl: string | null = null;
            if (browser) {
                characterImageUrl = sessionStorage.getItem('selectedCharacterEnhancedImage') ||
                                   sessionStorage.getItem('characterImageUrl') ||
                                   storyState.originalImageUrl || null;
                if (characterImageUrl) {
                    characterImageUrl = characterImageUrl.split('?')[0]; // Clean URL
                }
            }
            
            if (!characterImageUrl) {
                throw new Error('Character image URL is required for interactive story generation');
            }
            
            // Set preview images
            if (browser && characterImageUrl) {
                previewImage1 = characterImageUrl;
                previewImage2 = characterImageUrl;
            }
            
            // Update progress: Starting generation (5%)
            storyTextProgress = 5;
            
            // Map world to prompt builder format
            const worldMap: { [key: string]: string } = {
                'forest': 'enchanted-forest',
                'enchanted-forest': 'forest',
                'enchanted_forest': 'forest',
                'space': 'outer-space',
                'outer-space': 'outer-space',
                'outer_space': 'outer-space',
                'outerspace': 'outer-space',
                'underwater': 'underwater-kingdom',
                'underwater-kingdom': 'underwater-kingdom',
                'underwater_kingdom': 'underwater-kingdom'
            };
            const storyWorld = sessionStorage.getItem('intersearch_world') || worldMap[selectedWorld] || 'enchanted-forest';
            
            // Check if cover already exists (from step 6/7)
            let existingCoverUrl: string | null = null;
            if (browser) {
                existingCoverUrl = sessionStorage.getItem('selectedImage_step6') || 
                                  storyState.storyCover || 
                                  null;
                if (existingCoverUrl) {
                    existingCoverUrl = existingCoverUrl.split('?')[0]; // Clean URL
                    console.log('Using existing cover:', existingCoverUrl);
                }
            }
            
            // Build prompts for scenes 1-4 only (cover already generated)
            const scenePrompts: string[] = [];
            
            // Generate scenes 1-4 (skip cover generation)
            for (let sceneNum = 1; sceneNum <= 4; sceneNum++) {
                if (isCancelled) return;
                
                const sceneIndex = sceneNum - 1;
                const sceneInfo = getSceneInfo(storyWorld, sceneIndex);
                const sceneTitle = sceneTitles[storyWorld]?.[sceneIndex] || `Scene ${sceneNum}`;
                
                const scenePrompt = buildIntersearchScenePrompt({
                    sceneNumber: sceneNum,
                    storyTitle,
                    storyWorld,
                    characterName,
                    characterType,
                    characterStyle: characterStyle as '3d' | 'cartoon' | 'anime',
                    specialAbility,
                    ageGroup,
                    sceneTitle,
                    sceneDescription: sceneInfo.sceneDescription,
                    characterActionForScene: sceneInfo.characterAction,
                    characterEmotionForScene: sceneInfo.characterEmotion,
                    storyContinuationForThisScene: sceneInfo.storyContext
                });
                
                const searchAdventurePrompt = buildIntersearchSearchAdventurePrompt({
                    characterName,
                    characterType,
                    characterDescription: specialAbility || `${characterName} is ${characterType}`,
                    characterStyle: characterStyle as '3d' | 'cartoon' | 'anime',
                    specialAbility,
                    storyWorld,
                    ageGroup,
                    storyTitle,
                    characterReferenceImage: characterImageUrl || undefined,
                    difficulty: selectedDifficulty,
                    sceneNumber: sceneNum
                });
                
                const combinedPrompt = `${scenePrompt}\n\n${searchAdventurePrompt}`;
                scenePrompts.push(combinedPrompt);
            }
            
            // Update progress: Prompts ready (15%)
            storyTextProgress = 15;
            
            // Start with existing cover (if available) or empty array
            const generatedImages: string[] = [];
            if (existingCoverUrl) {
                generatedImages.push(existingCoverUrl);
                // Update preview with existing cover
                if (browser) {
                    previewImage3 = existingCoverUrl;
                }
                // Update progress for cover (15% -> 20%)
                storyTextProgress = 20;
            } else {
                console.warn('No existing cover found, but continuing with scene generation');
            }
            
            // Generate scene images using edit-image endpoint (scenes 1-4 only)
            const imageGenerationEndpoint = 'https://drawtopia-backend.vercel.app/edit-image';
            
            for (let index = 0; index < scenePrompts.length; index++) {
                if (isCancelled) return;
                
                try {
                    const response = await fetch(imageGenerationEndpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            image_url: characterImageUrl,
                            prompt: scenePrompts[index],
                        }),
                    });
                    
                    if (!response.ok) {
                        throw new Error(`Failed to generate scene image ${index + 1}: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    
                    if (data.storage_info?.uploaded && data.storage_info?.url) {
                        const cleanUrl = data.storage_info.url.split('?')[0];
                        generatedImages.push(cleanUrl);
                        
                        // Update preview images as they're generated
                        if (index === 0 && browser && !previewImage3) {
                            previewImage3 = cleanUrl; // First scene
                        }
                        
                        // Update progress: 20% (cover) + (index + 1) / 4 * 80% (scenes)
                        storyTextProgress = 20 + ((index + 1) / scenePrompts.length) * 80;
                    } else {
                        throw new Error(`No image URL received for scene ${index + 1}`);
                    }
                } catch (error) {
                    console.error(`Error generating scene image ${index + 1}:`, error);
                    // Continue with other images even if one fails
                }
            }
            
            if (isCancelled) return;
            
            // Verify we have at least the cover (if existing) or some scenes
            if (generatedImages.length === 0) {
                throw new Error('Failed to generate any images');
            }
            
            // Generate dedication image if dedication text exists
            let dedicationImageUrl: string | null = null;
            let dedicationText: string | null = null;
            if (browser) {
                dedicationText = sessionStorage.getItem('dedication_text');
                if (dedicationText) {
                    try {
                        // Build dedication scene prompt based on story world
                        const dedicationScenePrompt = buildDedicationScenePrompt(storyWorld);
                        
                        // Generate dedication image using edit-image endpoint
                        const response = await fetch(imageGenerationEndpoint, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                image_url: characterImageUrl,
                                prompt: dedicationScenePrompt,
                            }),
                        });
                        
                        if (response.ok) {
                            const data = await response.json();
                            if (data.storage_info?.uploaded && data.storage_info?.url) {
                                const cleanUrl = data.storage_info.url.split('?')[0];
                                dedicationImageUrl = cleanUrl;
                                sessionStorage.setItem('dedication_image', cleanUrl);
                                console.log('Dedication image generated:', cleanUrl);
                            }
                        } else {
                            console.warn('Failed to generate dedication image:', response.status);
                        }
                    } catch (error) {
                        console.error('Error generating dedication image:', error);
                        // Continue even if dedication image generation fails
                    }
                }
            }
            
            // Update progress: All images generated (100%)
            storyTextProgress = 100;
            sceneImageProgress = 0; // Not used for interactive stories
            
            // Save to database
            await saveIntersearchStoryToDatabase(generatedImages, storyWorld, selectedDifficulty, characterImageUrl, dedicationText, dedicationImageUrl);
            
            storyGenerated = true;
        } catch (error) {
            console.error('Error generating interactive story:', error);
            // Set error flag in sessionStorage
            if (browser) {
                sessionStorage.setItem('storyGenerationError', 'true');
            }
            // Set progress to 100% to allow navigation even on error
            storyTextProgress = 100;
            sceneImageProgress = 0;
            storyGenerated = true;
        }
    }

    // Save interactive story to database
    async function saveIntersearchStoryToDatabase(
        sceneImages: string[],
        world: string,
        difficulty: string,
        originalImageUrl: string,
        dedicationText?: string | null,
        dedicationImage?: string | null
    ) {
        try {
            const storyState = get(storyCreation);
            
            if (!storyState.selectedChildProfileId || storyState.selectedChildProfileId === 'undefined') {
                console.warn('Cannot save interactive story: No child profile selected');
                return;
            }
            
            const characterName = storyState.characterName || sessionStorage.getItem('characterName') || 'Character';
            const characterType = storyState.characterType || sessionStorage.getItem('selectedCharacterType') || 'person';
            const specialAbility = storyState.specialAbility || sessionStorage.getItem('specialAbility') || '';
            const characterStyle = storyState.characterStyle || sessionStorage.getItem('selectedStyle') || 'cartoon';
            const storyTitle = storyState.storyTitle || sessionStorage.getItem('storyTitle') || `${characterName}'s Search Adventure`;
            
            // Map world names to database format
            const worldMap: { [key: string]: 'forest' | 'space' | 'underwater' } = {
                'enchanted-forest': 'forest',
                'outer-space': 'space',
                'underwater-kingdom': 'underwater',
                'forest': 'forest',
                'space': 'space',
                'underwater': 'underwater'
            };
            const dbWorld = worldMap[world] || 'forest';
            
            // Map character type to database format
            const typeMap: { [key: string]: 'person' | 'animal' | 'magical_creature' } = {
                'person': 'person',
                'animal': 'animal',
                'magical': 'magical_creature',
                'magical_creature': 'magical_creature'
            };
            const dbType = typeMap[characterType] || 'person';
            
            // Prepare story content for search adventure
            const storyContent = {
                type: 'search_adventure',
                cover: sceneImages[0]?.split('?')[0] || undefined,
                scenes: sceneImages.slice(1).map((url, index) => ({
                    sceneNumber: index + 1,
                    sceneImage: url.split('?')[0],
                    sceneTitle: sceneTitles[world]?.[index] || `Scene ${index + 1}`,
                    difficulty: difficulty
                })),
                world: world,
                difficulty: difficulty
            };
            
            // Get character_id from sessionStorage
            const characterIdStr = browser ? sessionStorage.getItem('characterId') : null;
            const characterId = characterIdStr ? parseInt(characterIdStr) : undefined;
            
            // Prepare story data
            const storyData = {
                user_id: $user?.id,
                child_profile_id: storyState.selectedChildProfileId,
                character_id: characterId,
                character_name: characterName,
                character_type: dbType,
                special_ability: specialAbility || '',
                character_style: characterStyle as '3d' | 'cartoon' | 'anime',
                story_world: dbWorld,
                adventure_type: 'treasure_hunt' as const,
                original_image_url: originalImageUrl.split('?')[0],
                enhanced_images: storyState.enhancedImages || [],
                story_title: storyTitle,
                story_cover: sceneImages[0]?.split('?')[0] || undefined,
                cover_design: undefined,
                story_content: JSON.stringify(storyContent),
                scene_images: sceneImages.slice(1).map(url => url.split('?')[0]),
                dedication_text: dedicationText || undefined,
                dedication_image: dedicationImage ? dedicationImage.split('?')[0] : undefined,
                status: 'completed' as const,
                story_type: 'search' as const
            };
            
            console.log('Saving interactive story to database:', storyData);
            
            const result = await createStory(storyData);
            
            if (result.success && result.data) {
                console.log('Interactive story saved successfully:', result.data);
                if (browser && result.data.uid) {
                    sessionStorage.setItem('currentStoryId', result.data.uid.toString());
                    // Clear any error flag since story was saved successfully
                    sessionStorage.removeItem('storyGenerationError');
                    storyCreation.update(state => ({
                        ...state,
                        storyId: result.data.uid.toString()
                    }));
                }
            } else {
                console.error('Failed to save interactive story:', result.error);
                // Set error flag if story save fails
                if (browser) {
                    sessionStorage.setItem('storyGenerationError', 'true');
                }
            }
        } catch (error) {
            console.error('Error saving interactive story to database:', error);
            // Set error flag if story save fails
            if (browser) {
                sessionStorage.setItem('storyGenerationError', 'true');
            }
        }
    }

    // Save story to Supabase database
    async function saveStoryToDatabase(
        storyPages: Array<{ pageNumber: number; text: string; scene?: string }>,
        sceneImages: string[],
        audioUrls?: (string | null)[]
    ) {
        try {
            const storyState = get(storyCreation);
            console.log('storyState', storyState);
            
            // Validate required data
            if (!storyState.selectedChildProfileId || storyState.selectedChildProfileId === 'undefined') {
                console.warn('Cannot save story: No child profile selected');
                return;
            }

            if (!storyState.characterName || !storyState.characterType || !storyState.characterStyle) {
                console.warn('Cannot save story: Missing required character data');
                return;
            }

            // Get original image URL from session storage or story state
            let originalImageUrl = storyState.originalImageUrl;
            if (!originalImageUrl && browser) {
                originalImageUrl = sessionStorage.getItem('characterImageUrl') || 
                                 sessionStorage.getItem('uploadedImageUrl') || '';
            }

            if (!originalImageUrl) {
                console.warn('Cannot save story: No original image URL found');
                return;
            }

            // Format story_content as JSON
            // Store story pages with their text, associated scene images, and audio URLs
            const storyContent = {
                pages: storyPages.map((page, index) => ({
                    pageNumber: page.pageNumber || index + 1,
                    text: page.text,
                    sceneImage: page.scene || sceneImages[index] || null
                }))
            };

            // Get character_id from sessionStorage
            const characterIdStr = browser ? sessionStorage.getItem('characterId') : null;
            const characterId = characterIdStr ? parseInt(characterIdStr) : undefined;

            // Get dedication text and image from sessionStorage
            const dedicationText = browser ? sessionStorage.getItem('dedication_text') : null;
            const dedicationImage = browser ? sessionStorage.getItem('dedication_image') : null;

            // Prepare story data
            const storyData = {
                user_id: $user?.id,
                child_profile_id: storyState.selectedChildProfileId,
                character_id: characterId,
                character_name: storyState.characterName,
                character_type: storyState.characterType,
                special_ability: storyState.specialAbility || '',
                character_style: storyState.characterStyle,
                story_world: storyState.storyWorld || 'forest',
                adventure_type: storyState.adventureType || 'treasure_hunt',
                original_image_url: originalImageUrl,
                enhanced_images: storyState.enhancedImages || [],
                story_title: storyState.storyTitle || undefined,
                cover_design: storyState.coverDesign || sessionStorage.getItem('') || undefined,
                story_cover: storyState.storyCover || sessionStorage.getItem('selectedImage_step6') || undefined,
                story_content: JSON.stringify(storyContent),
                scene_images: sceneImages.length > 0 ? sceneImages.map(url => url.split('?')[0]) : [],
                audio_urls: audioUrls && audioUrls.length > 0 ? audioUrls.map(url => url ? url.split('?')[0] : null) : [],
                dedication_text: dedicationText || undefined,
                dedication_image: dedicationImage ? dedicationImage.split('?')[0] : undefined,
                status: 'completed' as const
            };

            console.log('Saving story to database:', storyData);

            const result = await createStory(storyData);

            if (result.success && result.data) {
                console.log('Story saved successfully:', result.data);
                // Store story ID in session storage and story creation store
                if (browser && result.data.uid) {
                    sessionStorage.setItem('currentStoryId', result.data.uid.toString());
                    // Clear any error flag since story was saved successfully
                    sessionStorage.removeItem('storyGenerationError');
                    storyCreation.update(state => ({
                        ...state,
                        storyId: result.data.uid.toString()
                    }));
                }
            } else {
                console.error('Failed to save story:', result.error);
                // Set error flag if story save fails
                if (browser) {
                    sessionStorage.setItem('storyGenerationError', 'true');
                }
            }
        } catch (error) {
            console.error('Error saving story to database:', error);
            // Set error flag if story save fails
            if (browser) {
                sessionStorage.setItem('storyGenerationError', 'true');
            }
        }
    }
    
    async function generateStory() {
        // if (storyGenerated) return;
        
        try {
            // Initialize story creation store to get latest data
            storyCreation.init();
            const storyState = get(storyCreation);
            
            // Fetch child profile to get age_group
            let ageGroup = '7-10'; // Default age group
            if (storyState.selectedChildProfileId && storyState.selectedChildProfileId !== 'undefined') {
                try {
                    const { data: childProfile, error: profileError } = await supabase
                    .from('child_profiles')
                    .select('age_group')
                    .eq('id', parseInt(storyState.selectedChildProfileId))
                    .single();
                    
                    if (!profileError && childProfile?.age_group) {
                        ageGroup = normalizeAgeGroup(childProfile.age_group);
                    }
                } catch (error) {
                    console.warn('Could not fetch child profile age group, using default:', error);
                }
            }
            
            // Get selected character enhanced image from session storage
            let selectedCharacterEnhancedImage: string | null = null;
            if (browser) {
                const storedEnhancedImage = sessionStorage.getItem('selectedCharacterEnhancedImage');
                if (storedEnhancedImage) {
                    selectedCharacterEnhancedImage = storedEnhancedImage.split('?')[0]; // Clean URL
                    console.log('Using selected character enhanced image:', selectedCharacterEnhancedImage);
                } else {
                    console.log('Selected character enhanced image not found in session storage');
                }
            }
            
            // Get all required data for prompt building
            const characterName = storyState.characterName || '';
            const characterType = storyState.characterType || sessionStorage.getItem('selectedCharacterType') || 'person';
            const specialAbility = storyState.specialAbility || '';
            const characterStyle = storyState.characterStyle || sessionStorage.getItem('selectedStyle') || 'cartoon';
            // Map to prompt builder format (e.g., 'enchanted-forest' instead of 'the Enchanted Forest')
            const storyWorld = mapStoryWorld(storyState.storyWorld) || mapStoryWorld(sessionStorage.getItem('selectedWorld') || undefined) || 'enchanted-forest';
            const adventureType = mapAdventureType(storyState.adventureType) || mapAdventureType(sessionStorage.getItem('selectedAdventure') || undefined) || 'Treasure Hunt';
            const storyTitle = storyState.storyTitle || sessionStorage.getItem('selectedTitle') || 'The Great Adventure';
            // Get occasion theme from sessionStorage (not in StoryCreationState)
            const occasionTheme = browser ? (sessionStorage.getItem('occasionTheme') || 'general') : 'general';
            
            // Get reading level (default to developing_reader if not available)
            let readingLevel = 'developing_reader';
            if (ageGroup === '3-6') {
                readingLevel = 'early_reader';
            } else if (ageGroup === '7-10') {
                readingLevel = 'developing_reader';
            } else if (ageGroup === '11-12') {
                readingLevel = 'independent_reader';
            }
            
            // Validate required fields
            if (!characterName || !characterType || !specialAbility) {
                throw new Error('Missing required character data');
            }
            
            // Build story text prompt using prompt builder
            const storyTextPrompt = buildStoryTextPrompt({
                characterName,
                characterType: characterType === 'magical_creature' ? 'magical_creature' : characterType,
                specialAbility,
                characterStyle: characterStyle as '3d' | 'cartoon' | 'anime',
                storyWorld,
                adventureType,
                occasionTheme,
                ageGroup,
                readingLevel,
                storyTitle,
                pageNumber: 1 // Main prompt for the whole story
            });
            
            // Build scene prompts for each of the 5 pages
            // Note: The backend will replace the placeholder text with actual story text after generation
            const scenePrompts: string[] = [];
            for (let pageNum = 1; pageNum <= 5; pageNum++) {
                const scenePrompt = buildStoryScenePrompt({
                    characterName,
                    characterType: characterType === 'magical_creature' ? 'magical_creature' : characterType,
                    specialAbility,
                    characterStyle: characterStyle as '3d' | 'cartoon' | 'anime',
                    storyWorld,
                    adventureType,
                    ageGroup,
                    storyTitle,
                    pageNumber: pageNum,
                    // Placeholder text - backend will replace with actual story text after generation
                    pageText: `[Story text for page ${pageNum} will be inserted here by the backend after story generation]`,
                    characterImageUrl: selectedCharacterEnhancedImage || undefined
                });
                scenePrompts.push(scenePrompt);
            }
            
            // Get current user ID for email notification
            const { data: { user } } = await supabase.auth.getUser();
            const userId = user?.id;
            
            // Get dedication text and build dedication scene prompt
            let dedicationText: string | null = null;
            let dedicationScenePrompt: string | null = null;
            if (browser) {
                dedicationText = sessionStorage.getItem('dedication_text');
                if (dedicationText) {
                    // Build dedication scene prompt based on story world
                    dedicationScenePrompt = buildDedicationScenePrompt(storyWorld);
                }
            }
            
            // Prepare request body matching backend StoryRequest model
            const requestBody: any = {
                character_name: characterName,
                character_type: mapCharacterType(characterType),
                special_ability: specialAbility,
                age_group: ageGroup,
                story_world: storyWorld,
                adventure_type: adventureType,
                occasion_theme: occasionTheme,
                character_image_url: selectedCharacterEnhancedImage,
                story_text_prompt: storyTextPrompt,
                scene_prompts: scenePrompts,
                reading_level: readingLevel,
                story_title: storyTitle,
                user_id: userId, // For book completion email
                child_profile_id: storyState.selectedChildProfileId, // For database record
                character_style: storyState.characterStyle,
                enhanced_images: storyState.enhancedImages,
                dedication_text: dedicationText || undefined,
                dedication_scene_prompt: dedicationScenePrompt || undefined
            };
            
            // Update progress: Starting story generation (5%)
            storyTextProgress = 5;

            
            // Send request to generate-story endpoint
            const storyGenerationEndpoint = 'https://drawtopia-backend.vercel.app';
            const response = await fetch(`${storyGenerationEndpoint}/generate-story/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            
            if (!response.ok) {
                throw new Error(`Failed to generate story: ${response.status} ${response.statusText}`);
            }
            
            // Update progress: Story generation in progress (25%)
            storyTextProgress = 25;
            
            const result = await response.json();
            console.log('result =========================> ', result);
            
            // Update progress: Story text received (50%)
            storyTextProgress = 50;
            
            // Extract story pages with text and scene images
            // Expected format: { pages: [{ text: "...", scene: "https://..." }, ...] }
            let storyPages: Array<{ pageNumber: number; text: string; scene?: string }> = [];
            let sceneImages: string[] = [];
            
            if (result.pages && Array.isArray(result.pages)) {
                // Primary format: pages array with text and scene properties
                storyPages = result.pages.slice(0, 5).map((page: any, index: number) => {
                    if (typeof page === 'string') {
                        // Handle string-only format (legacy)
                        return { pageNumber: index + 1, text: page };
                    } else if (page.text) {
                        // Handle object format with text and scene
                        return { 
                            pageNumber: page.pageNumber || index + 1, 
                            text: page.text,
                            scene: page.scene || page.imageUrl || page.image || page.sceneUrl
                        };
                    } else {
                        return { pageNumber: index + 1, text: String(page) };
                    }
                });
                
                // Extract scene images from pages array (scene property)
                sceneImages = storyPages
                    .map(page => page.scene)
                    .filter((url): url is string => !!url);
            } else if (result.storyPages && Array.isArray(result.storyPages)) {
                // Alternative format: storyPages
                storyPages = result.storyPages.slice(0, 5).map((page: any, index: number) => {
                    if (typeof page === 'string') {
                        return { pageNumber: index + 1, text: page };
                    } else if (page.text) {
                        return { 
                            pageNumber: page.pageNumber || index + 1, 
                            text: page.text,
                            scene: page.scene || page.imageUrl || page.image || page.sceneUrl
                        };
                    } else {
                        return { pageNumber: index + 1, text: String(page) };
                    }
                });
                sceneImages = storyPages
                    .map(page => page.scene)
                    .filter((url): url is string => !!url);
            } else if (result.story && Array.isArray(result.story)) {
                // Alternative format: story array
                storyPages = result.story.slice(0, 5).map((page: any, index: number) => {
                    if (typeof page === 'string') {
                        return { pageNumber: index + 1, text: page };
                    } else if (page.text) {
                        return { 
                            pageNumber: page.pageNumber || index + 1, 
                            text: page.text,
                            scene: page.scene || page.imageUrl || page.image || page.sceneUrl
                        };
                    } else {
                        return { pageNumber: index + 1, text: String(page) };
                    }
                });
                sceneImages = storyPages
                    .map(page => page.scene)
                    .filter((url): url is string => !!url);
            } else if (Array.isArray(result)) {
                // Direct array format
                storyPages = result.slice(0, 5).map((page: any, index: number) => {
                    if (typeof page === 'string') {
                        return { pageNumber: index + 1, text: page };
                    } else if (page.text) {
                        return { 
                            pageNumber: page.pageNumber || index + 1, 
                            text: page.text,
                            scene: page.scene || page.imageUrl || page.image || page.sceneUrl
                        };
                    } else {
                        return { pageNumber: index + 1, text: String(page) };
                    }
                });
                sceneImages = storyPages
                    .map(page => page.scene)
                    .filter((url): url is string => !!url);
            } else {
                // Fallback: try to extract from other response formats
                console.warn('Unexpected response structure:', result);
                for (let i = 1; i <= 5; i++) {
                    const pageData = result[`page${i}`] || result[`page_${i}`] || result[i];
                    if (pageData) {
                        if (typeof pageData === 'string') {
                            storyPages.push({ pageNumber: i, text: String(pageData) });
                        } else if (pageData.text) {
                            storyPages.push({ 
                                pageNumber: i, 
                                text: pageData.text,
                                scene: pageData.scene || pageData.imageUrl || pageData.image || pageData.sceneUrl
                            });
                        } else {
                            storyPages.push({ pageNumber: i, text: String(pageData) });
                        }
                    }
                }
                sceneImages = storyPages
                    .map(page => page.scene)
                    .filter((url): url is string => !!url);
            }
            
            // Also check for separate scene arrays (fallback)
            if (sceneImages.length === 0) {
                if (result.sceneImages && Array.isArray(result.sceneImages)) {
                    sceneImages = result.sceneImages.slice(0, 5);
                } else if (result.scenes && Array.isArray(result.scenes)) {
                    sceneImages = result.scenes.slice(0, 5).map((scene: any) => 
                        typeof scene === 'string' ? scene : (scene.url || scene.imageUrl || scene.image || scene.scene)
                    );
                } else if (result.images && Array.isArray(result.images)) {
                    sceneImages = result.images.slice(0, 5);
                }
            }
            
            // Ensure scene images are extracted from storyPages if not already extracted
            // This ensures scenes match the order of pages
            if (sceneImages.length === 0 && storyPages.length > 0) {
                sceneImages = storyPages
                    .map(page => page.scene)
                    .filter((url): url is string => !!url);
            }
            
            // Save story pages with text and scenes to session storage
            if (browser && storyPages.length > 0) {
                sessionStorage.setItem('storyPages', JSON.stringify(storyPages));
                
                // Also save individual pages for easier access
                storyPages.forEach((page, index) => {
                    sessionStorage.setItem(`storyPage${index + 1}`, page.text);
                });
                
                console.log('Story pages saved to session storage:', storyPages.length);
                console.log('Story pages with scenes:', storyPages.map(p => ({ text: p.text.substring(0, 30) + '...', hasScene: !!p.scene })));
            }
            
            // Scene images should be included in the /generate-story response
            // Update progress based on number of images received
            if (sceneImages.length > 0) {
                const validImages = sceneImages.filter(img => img).length;
                // Each valid image contributes to progress
                // Since images come all at once, we can set progress to 50% (complete)
                sceneImageProgress = 50;
            } else {
                // No images received, set to 50% (images complete)
                sceneImageProgress = 50;
            }
            
            // Save scene images to session storage
            // Store scenes in the same order as pages (by page number/index)
            const cleanSceneImages: string[] = [];
            if (browser && sceneImages.length > 0) {
                sceneImages.forEach((imageUrl, index) => {
                    if (imageUrl) {
                        // Store with multiple key patterns for compatibility
                        // Clean URL by removing query parameters for consistency
                        const cleanUrl = imageUrl.split('?')[0];
                        sessionStorage.setItem(`storyScene_${index + 1}`, cleanUrl);
                        sessionStorage.setItem(`adventureScene_${index + 1}`, cleanUrl);
                        cleanSceneImages.push(cleanUrl);
                    }
                });
                
                // Also store as an array for easier access (with clean URLs)
                if (cleanSceneImages.length > 0) {
                    sessionStorage.setItem('storyScenes', JSON.stringify(cleanSceneImages));
                }
                
                console.log('Scene images saved to session storage:', sceneImages.length);
                console.log('Scene URLs:', sceneImages.map(url => url.split('?')[0]));
            } else if (browser) {
                console.warn('No scene images found in response');
            }
            
            // Extract audio URLs from result
            let audioUrls: (string | null)[] = [];
            if (result.audio_urls && Array.isArray(result.audio_urls)) {
                audioUrls = result.audio_urls;
                console.log('Audio URLs extracted from result:', audioUrls);
            } else {
                console.log('No audio_urls found in result');
            }
            
            // Extract dedication image URL from result
            let dedicationImageUrl: string | null = null;
            if (result.dedication_image_url) {
                const cleanDedicationUrl = String(result.dedication_image_url).split('?')[0]; // Clean URL
                dedicationImageUrl = cleanDedicationUrl;
                if (browser) {
                    sessionStorage.setItem('dedication_image', cleanDedicationUrl);
                    console.log('Dedication image URL saved to session storage:', cleanDedicationUrl);
                }
            } else {
                console.log('No dedication_image_url found in result');
            }
            
            // Save story to Supabase database
            await saveStoryToDatabase(storyPages, cleanSceneImages, audioUrls);
            
            storyGenerated = true;
        } catch (error) {
            console.error('Error generating story:', error);
            // Set error flag in sessionStorage
            if (browser) {
                sessionStorage.setItem('storyGenerationError', 'true');
            }
            // Set progress to 100% to allow navigation even on error
            storyTextProgress = 50;
            sceneImageProgress = 50;
            storyGenerated = true;
            // Don't block navigation if story generation fails
            // The user can still proceed, but story pages won't be available
        }
    }


    onMount(() => {
        // Initialize story creation store
        if (browser) {
            storyCreation.init();
            // Check story type from sessionStorage
            storyType = sessionStorage.getItem('selectedFormat') || 'story';
        }

        
        // Initialize preview images from sessionStorage
        if (browser) {
            const characterImage = sessionStorage.getItem('selectedCharacterEnhancedImage') ||
                                  sessionStorage.getItem('characterImageUrl') || null;
            if (characterImage) {
                previewImage1 = characterImage.split('?')[0];
                previewImage2 = characterImage.split('?')[0];
            }
        }
        
        // Generate story immediately when page loads based on story type
        if (storyType === 'interactive') {
            generateIntersearchStory();
        } else {
            generateStory();
        }
        
        // Fallback timer - only used if generation takes too long
        intervalId = window.setInterval(() => {
            if (timeRemaining > 0) {
                timeRemaining--;
                // Only update from timer if actual progress hasn't reached 100%
                // This ensures the timer doesn't override real progress
                if (completionPercent < 100) {
                    const timerProgress = ((TOTAL_TIME - timeRemaining) / TOTAL_TIME) * 100;
                    // Use timer progress only if it's higher than actual progress
                    // This prevents the timer from slowing down real progress
                    if (timerProgress > completionPercent) {
                        // Don't override if we have real progress
                        if (storyTextProgress === 0 && sceneImageProgress === 0) {
                            storyTextProgress = timerProgress * 0.5;
                            sceneImageProgress = timerProgress * 0.5;
                        }
                    }
                }
            } else {
                timeRemaining = 0;
                // Only set to 100% if generation hasn't completed
                if (completionPercent < 100 && !storyGenerated) {
                    storyTextProgress = 50;
                    sceneImageProgress = 50;
                }
                if (intervalId !== null) {
                    clearInterval(intervalId);
                    intervalId = null;
                }
            }
        }, 1000);
    });

    onDestroy(() => {
        if (intervalId !== null) {
            clearInterval(intervalId);
        }
    });
</script>

<div class="loading-option-3-1">
    <div class="navbar">
        <div class="logo-text-full">
            <img src={drawtopia} alt="Drawtopia Logo" class="logo-img" />
        </div>
    </div>
    <div class="arrow">
        <button type="button" class="button" on:click={() => {goto('/adventure-story/story-preview')}}>
            <div class="arrowleft">
                <img
                    src={arrowleft}
                    alt=""
                    class="img-arrowleft"
                />
            </div>
            <div class="back">
                <span class="back_span">Back</span>
            </div>
        </button>
    </div>
    <div class="frame-1410103818">
        <div class="heading">
            <div class="creating-your-story">
                <span class="creatingyourstory_span">Creating Your Story</span>
            </div>
            <div class="your-preview-will-be-ready-in-about-47-seconds">
                <span class="yourpreviewwillbereadyinabout47seconds_span_01"
                    >Your preview will be ready in about
                </span>&nbsp;<span
                    class="yourpreviewwillbereadyinabout47seconds_span_02"
                    >{timeRemaining} {timeRemaining === 1 ? 'second' : 'seconds'}</span
                >
            </div>
            <div class="tag">
                <img
                    src={shieldstar}
                    alt="Shield Star"
                    class="img-shieldstar"
                />
                <div>
                    <span class="ffreepagepreview_span"
                        >2 Free Page Preview</span
                    >
                </div>
            </div>
        </div>
        <MobileStepProgressBar currentStep={6} />
        <ProgressBar currentStep={5} />
        <div class="frame-13">
            <div class="frame-1410103853">
                <div class="frame">
                    <div class="frame-2147227347">
                        <div class="frame-2147227507">
                            <img
                                class="magic-wand_12404075-1"
                                src={currentMagicalWand}
                                alt="Magical Wand"
                            />
                            <div class="content">
                                <div class="enhancing-your-character">
                                    <span class="enhancingyourcharacter_span"
                                        >Enhancing your character…</span
                                    >
                                </div>
                            </div>
                        </div>
                        <div class="frame-2147227505">
                            <div class="frame-1410103855">
                                <div class="bar_05"></div>
                                <div class="bar_06" style="width: {completionPercent}%"></div>
                            </div>
                            <div class="text-25-complete">
                                <span class="f5complete_span">{Math.round(completionPercent)}% Complete</span
                                >
                            </div>
                        </div>
                    </div>
                    <div class="frame-2147227509">
                        <div class="frame-1410104037">
                            <div class="shootingstar">
                                <img src={shootingstar} alt="Shooting Star" class="img-shootingstar">
                            </div>
                            <div class="frame-2147227506">
                                <div class="fun-fact">
                                    <span class="funfact_span">Fun Fact</span>
                                </div>
                                <div
                                    class="your-characters-special-ability-will-help-solve-a-big-problem"
                                >
                                    <span
                                        class="yourcharactersspecialabilitywillhelpsolveabigproblem_span"
                                        >Your character's special ability will
                                        help solve a big problem</span
                                    >
                                </div>
                            </div>
                        </div>
                        <div class="frame-2147227510">
                            <div class="frame-2147227508">
                                <div class="tag_01">
                                    <div>
                                        <span class="sketch_span">Sketch</span>
                                    </div>
                                </div>
                            </div>
                            <img
                                class="frame-2147227509_01"
                                src={"https://placehold.co/171x218"}
                                alt=""
                            />
                            <img
                                class="frame-2147227510_01"
                                src={"https://placehold.co/171x218"}
                                alt=""
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div class="frame-13_01">
                <div class="button">
                    <div class="cancel">
                        <span class="cancel_span">Cancel</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .creatingyourstory_span {
        color: #141414;
        font-size: 48px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 57.6px;
        word-wrap: break-word;
    }

    .creating-your-story {
        align-self: stretch;
        text-align: center;
    }

    .yourpreviewwillbereadyinabout47seconds_span_01 {
        color: #727272;
        font-size: 18px;
        font-family: DM Sans;
        font-weight: 400;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .yourpreviewwillbereadyinabout47seconds_span_02 {
        color: #141414;
        font-size: 18px;
        font-family: DM Sans;
        font-weight: 400;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .your-preview-will-be-ready-in-about-47-seconds {
        align-self: stretch;
        text-align: center;
    }

    .img-shieldstar {
        margin: auto;
        width: 20px;
        height: 20px;
    }

    .shootingstar {
        width: 32px;
        height: 32px;
        position: relative;
        overflow: hidden;
    }

    .ffreepagepreview_span {
        color: #438bff;
        font-size: 14px;
        font-family: Quicksand;
        font-weight: 600;
        word-wrap: break-word;
    }


    .magic-wand_12404075-1 {
        width: 60px;
        height: 60px;
    }

    .enhancingyourcharacter_span {
        color: #438bff;
        font-size: 24px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 33.6px;
        word-wrap: break-word;
    }

    .enhancing-your-character {
        align-self: stretch;
        text-align: center;
    }

    .bar_05 {
        align-self: stretch;
        height: 13px;
        position: relative;
        background: #eef6ff;
        border-radius: 12px;
    }

    .bar_06 {
        height: 13px;
        left: 0px;
        top: 0px;
        position: absolute;
        background: #438bff;
        border-radius: 12px;
        transition: width 0.3s ease;
    }

    .f5complete_span {
        color: #438bff;
        font-size: 18px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 21.6px;
        word-wrap: break-word;
    }

    .text-25-complete {
        align-self: stretch;
        text-align: center;
    }

    .funfact_span {
        color: #6912c5;
        font-size: 20px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 28px;
        word-wrap: break-word;
    }

    .fun-fact {
        align-self: stretch;
    }

    .yourcharactersspecialabilitywillhelpsolveabigproblem_span {
        color: black;
        font-size: 16px;
        font-family: Quicksand;
        font-weight: 400;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .your-characters-special-ability-will-help-solve-a-big-problem {
        align-self: stretch;
    }

    .sketch_span {
        color: #141414;
        font-size: 12px;
        font-family: Quicksand;
        font-weight: 600;
        word-wrap: break-word;
    }

    .frame-2147227509_01 {
        flex: 1 1 0;
        height: 218px;
        position: relative;
        box-shadow: 0px 0px 18px rgba(67, 139, 255, 0.1);
        border-radius: 12px;
        border: 1px #ededed solid;
    }

    .frame-2147227510_01 {
        flex: 1 1 0;
        height: 218px;
        position: relative;
        box-shadow: 0px 0px 18px rgba(67, 139, 255, 0.1);
        border-radius: 12px;
        border: 1px #ededed solid;
    }

    .cancel_span {
        color: black;
        font-size: 18px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .cancel {
        text-align: center;
    }


    .content {
        align-self: stretch;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 4px;
        display: flex;
    }

    .frame-2147227506 {
        flex: 1 1 0;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        gap: 4px;
        display: inline-flex;
    }

    .tag_01 {
        padding-left: 12px;
        padding-right: 12px;
        padding-top: 2px;
        padding-bottom: 2px;
        left: 54px;
        top: 178px;
        position: absolute;
        background: #f8fafb;
        border-radius: 12px;
        outline: 1px #ededed solid;
        outline-offset: -1px;
        justify-content: flex-start;
        align-items: flex-end;
        gap: 4px;
        display: inline-flex;
    }

    .button {
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
        display: inline-flex;
    }

    .logo-text-full {
        width: 203.32px;
        height: 38px;
        position: relative;
        margin: auto;
    }

    .logo-img {
        width: 100%;
    }

    .frame-1410103855 {
        align-self: stretch;
        position: relative;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 8px;
        display: flex;
    }


    .frame-2147227507 {
        align-self: stretch;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        gap: 16px;
        display: flex;
    }

    .frame-13_01 {
        align-self: stretch;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 24px;
        display: flex;
    }

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
    }

    .tag {
        padding-top: 8px;
        padding-bottom: 8px;
        padding-left: 8px;
        padding-right: 12px;
        background: #eef6ff;
        border-radius: 99px;
        outline: 1px #438bff solid;
        outline-offset: -1px;
        justify-content: flex-start;
        align-items: flex-end;
        gap: 4px;
        display: inline-flex;
    }

    .frame-2147227505 {
        align-self: stretch;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: flex;
    }

    .frame-1410104037 {
        align-self: stretch;
        padding: 12px;
        background: #f5f2ff;
        border-radius: 10px;
        outline: 1px #964dff solid;
        outline-offset: -1px;
        justify-content: center;
        align-items: center;
        gap: 16px;
        display: inline-flex;
    }

    .frame-2147227508 {
        flex: 1 1 0;
        height: 218px;
        position: relative;
        background: linear-gradient(
            0deg,
            rgba(0, 0, 0, 0.25) 0%,
            rgba(0, 0, 0, 0.25) 100%
        );
        box-shadow: 0px 0px 18px rgba(67, 139, 255, 0.1);
        overflow: hidden;
        border-radius: 12px;
        background-image: url(https://placehold.co/171x218);
    }

    .heading {
        align-self: stretch;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        gap: 16px;
        display: flex;
    }

    .frame-2147227347 {
        align-self: stretch;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 32px;
        display: flex;
    }

    .frame-2147227510 {
        align-self: stretch;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 12px;
        display: inline-flex;
    }

    .frame-2147227509 {
        align-self: stretch;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 12px;
        display: flex;
    }

    .frame {
        width: 576px;
        padding: 20px;
        background: white;
        box-shadow: 0px 0px 18px rgba(67, 139, 255, 0.1);
        border-radius: 10px;
        outline: 1px #f8f8f8 solid;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 32px;
        display: flex;
    }

    .frame-1410103853 {
        align-self: stretch;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
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

    .loading-option-3-1 {
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

    .arrow {
        display: none;
    }

    .back_span {
        color: black;
        font-size: 16px;
        font-family: DM Sans;
        font-weight: 600;
        line-height: 22.40px;
        word-wrap: break-word;
    }

    .back {
        text-align: center;
    }

    .arrowleft {
        width: 20px;
        height: 20px;
        position: relative;
        overflow: hidden;
    }

    .img-arrowleft {
        width: 100%;
        height: 100%;
    }

    .img-shootingstar {
        width: 100%;
        height: 100%;
    }

    /* Mobile Responsive Styles */
    @media (max-width: 768px) {
        .loading-option-3-1 {
            padding-top: 24px;
            padding-bottom: 32px;
            padding-left: 16px;
            padding-right: 16px;
            gap: 32px;
        }

        .arrow {
            width: 100%;
            padding-left: 20px;
            padding-right: 20px;
            padding-top: 6px;
            padding-bottom: 6px;
            justify-content: flex-start;
            align-items: center;
            gap: 12px;
            display: inline-flex;
        }

        .arrow .button {
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
            cursor: pointer;
            width: auto;
        }

        .arrow .arrowleft {
            width: 20px;
            height: 20px;
        }

        .navbar {
            padding-left: 24px;
            padding-right: 12px;
        }

        .logo-text-full {
            width: 170.15px;
            height: 31.80px;
        }

        .frame-1410103818 {
            width: 100%;
            align-self: stretch;
            flex-direction: column;
            justify-content: flex-end;
            align-items: center;
            gap: 24px;
        }

        .creatingyourstory_span {
            font-size: 32px;
            line-height: 38.40px;
        }

        .creating-your-story {
            text-align: left;
        }

        .yourpreviewwillbereadyinabout47seconds_span_01,
        .yourpreviewwillbereadyinabout47seconds_span_02 {
            font-size: 16px;
            line-height: 22.40px;
        }

        .your-preview-will-be-ready-in-about-47-seconds {
            text-align: left;
        }

        .ffreepagepreview_span {
            font-size: 16px;
        }

        .heading {
            align-items: flex-start;
        }


        .frame-13 {
            width: 100%;
            align-self: stretch;
        }

        .frame-1410103853 {
            width: 100%;
            align-self: stretch;
        }

        .frame {
            width: 100%;
            align-self: stretch;
            padding: 10px;
            gap: 24px;
        }

        .frame-2147227347 {
            gap: 24px;
        }

        .magic-wand_12404075-1 {
            width: 48px;
            height: 48px;
        }

        .enhancingyourcharacter_span {
            font-size: 20px;
            line-height: 24px;
        }

        .bar_05 {
            height: 10px;
        }

        .bar_06 {
            height: 10px;
        }

        .f5complete_span {
            font-size: 16px;
            line-height: 22.40px;
        }

        .frame-2147227509 {
            gap: 16px;
        }

        .frame-1410104037 {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
        }

        .img-shootingstar {
            width: 28px;
            height: 28px;
        }

        .funfact_span {
            font-size: 18px;
            line-height: 21.60px;
        }

        .yourcharactersspecialabilitywillhelpsolveabigproblem_span {
            font-size: 14px;
            line-height: 19.60px;
        }

        .frame-2147227510 {
            /* flex-direction: column; */
            gap: 12px;
        }

        .frame-2147227508 {
            width: 100%;
            height: 146px;
        }

        .tag_01 {
            left: 21px;
            top: 114.70px;
        }

        .frame-2147227509_01,
        .frame-2147227510_01 {
            width: 100%;
            height: 146px;
        }

        .frame-13_01 {
            width: 100%;
            align-self: stretch;
        }

        .button {
            width: 100%;
            align-self: stretch;
            padding-left: 24px;
            padding-right: 24px;
            padding-top: 12px;
            padding-bottom: 12px;
        }

        .cancel_span {
            font-size: 16px;
            line-height: 22.40px;
        }
    }
</style>
