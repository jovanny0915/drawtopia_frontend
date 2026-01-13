import { browser } from "$app/environment";
import prompt1Data from "./prompt1.json";
import { buildEnhancementPrompt, buildIntersearchCoverPrompt } from "./promptBuilder";

export interface ImageGenerationResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface ImageGenerationOptions {
  imageUrl: string;
  style: string;
  quality?: 'initial' | 'minimal' | 'normal' | 'high' | 'forest' | 'underwater' | 'outerspace' | string;
  saveToStorage?: boolean;
  storageKey?: string;
  // Optional character details for enhancement prompts
  characterName?: string;
  characterType?: 'person' | 'animal' | 'magical';
  specialAbility?: string;
}

/**
 * Generate a styled image using the image editing API
 */
export async function generateStyledImage(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
  const { 
    imageUrl, 
    style, 
    quality = 'normal', 
    saveToStorage = true, 
    storageKey,
    characterName,
    characterType,
    specialAbility
  } = options;
  
  if (!imageUrl) {
    return { success: false, error: 'No image URL provided' };
  }

  try {
    let prompt: string;
    
    // Check if this is a character enhancement (minimal/normal/high with 3d/cartoon/anime style)
    const isCharacterEnhancement = 
      (quality === 'minimal' || quality === 'normal' || quality === 'high') &&
      (style === '3d' || style === 'cartoon' || style === 'anime');
    
    if (isCharacterEnhancement) {
      // Use prompt1.json for character enhancements
      // Get character details from options or sessionStorage
      let charName = characterName;
      let charType = characterType;
      let ability = specialAbility;
      
      if (browser && (!charName || !charType || !ability)) {
        // Try to load from sessionStorage if not provided
        charName = charName || sessionStorage.getItem('characterName') || 'Character';
        const storedType = characterType || sessionStorage.getItem('selectedCharacterType') || 'person';
        // Map stored type to prompt1.json format (handle both 'magical' and 'magical_creature')
        if (storedType === 'magical_creature' || storedType === 'magical') {
          charType = 'magical';
        } else if (storedType === 'animal') {
          charType = 'animal';
        } else {
          charType = 'person';
        }
        ability = ability || sessionStorage.getItem('specialAbility') || '';
      }
      
      // Build prompt using prompt1.json
      prompt = buildEnhancementPrompt({
        characterName: charName || 'Character',
        characterType: charType || 'person',
        characterStyle: style as '3d' | 'cartoon' | 'anime',
        specialAbility: ability || '',
        enhancementLevel: quality as 'minimal' | 'normal' | 'high',
        uploadedImageUrl: imageUrl
      });
    } else if (style === 'environment') {
      // Handle environment prompts - create simple prompts based on world
      const world = quality as string;
      const worldMapping: { [key: string]: string } = {
        'forest': 'Enhance the sketch into a colorful illustration set in an enchanted forest. Keep the character\'s original style and quality intact while placing them in a magical woodland filled with glowing plants, talking animals, and hidden treasures. Preserve the hand-drawn charm and enhanced level of the character while making the background vibrant and storybook-like.',
        'underwater': 'Enhance the sketch into a lively underwater kingdom setting. Keep the character\'s original style and enhancement level while surrounding them with coral reefs, shimmering fish, and mysterious underwater ruins. Maintain the character\'s look while enriching the background with magical aquatic details.',
        'outerspace': 'Enhance the sketch into a vibrant illustration set in outer space. Keep the character\'s style and quality unchanged while placing them among distant planets, glowing stars, and friendly alien creatures. The character should retain its enhanced level while the environment is expanded with cosmic colors and a sense of exploration.'
      };
      prompt = worldMapping[world] || worldMapping.forest;
    } else if (style === 'adventure') {
      // Use the story adventure book cover prompt from prompt1.json
      const generateStoryScene = (prompt1Data as any).generateStoryScene;
      const coverSection = generateStoryScene?.cover;
      const basePrompt = coverSection?.basePrompt;
      
      if (!basePrompt) {
        throw new Error('Story adventure book cover basePrompt not found in prompt1.json');
      }
      
      // Get character details from options or sessionStorage
      let charName = characterName;
      let charStyle = '';
      let storyWorld = '';
      let charType = '';
      let storyTitle = '';
      let adventureType = '';
      let ageGroup = '';
      
      if (browser) {
        // Get character name
        if (!charName) {
          charName = sessionStorage.getItem('characterName') || 'Character';
        }
        
        // Get character type
        const storedCharType = sessionStorage.getItem('selectedCharacterType') || 'person';
        // Map to prompt format
        if (storedCharType === 'magical_creature' || storedCharType === 'magical') {
          charType = 'magical';
        } else if (storedCharType === 'animal') {
          charType = 'animal';
        } else {
          charType = 'person';
        }
        
        // Get character style (3d, cartoon, or anime)
        const storedStyle = sessionStorage.getItem('selectedStyle') || '';
        if (storedStyle === '3d' || storedStyle === 'cartoon' || storedStyle === 'anime') {
          charStyle = storedStyle;
        } else {
          // Default to cartoon if not found
          charStyle = 'cartoon';
        }
        
        // Get story title
        storyTitle = sessionStorage.getItem('storyTitle') || 'Adventure Story';
        
        // Get story world from quality parameter (format: "world_adventureType") or sessionStorage
        const [world, adventureTypeKey] = (quality as string).split('_');
        const storedWorld = sessionStorage.getItem('selectedWorld') || world;
        
        // Map world names to prompt1.json format
        const worldMapping: { [key: string]: string } = {
          'forest': 'enchantedForest',
          'outerspace': 'outerSpace',
          'underwater': 'underwaterKingdom'
        };
        
        storyWorld = worldMapping[storedWorld] || worldMapping[world] || 'enchantedForest';
        
        // Get adventure type and map to display format
        const storedAdventure = sessionStorage.getItem('selectedAdventure') || adventureTypeKey || 'treasure';
        const adventureMapping: { [key: string]: string } = {
          'treasure': 'Treasure Hunt',
          'treasurehunt': 'Treasure Hunt',
          'helping': 'Helping a Friend',
          'helpfriend': 'Helping a Friend'
        };
        adventureType = adventureMapping[storedAdventure] || adventureMapping[adventureTypeKey] || 'Treasure Hunt';
        
        // Get age group
        ageGroup = sessionStorage.getItem('ageGroup') || '7-10';
      } else {
        // Fallback values for SSR
        charName = characterName || 'Character';
        charType = 'person';
        charStyle = 'cartoon';
        storyWorld = 'enchantedForest';
        storyTitle = 'Adventure Story';
        adventureType = 'Treasure Hunt';
        ageGroup = '7-10';
      }
      
      // Map story world to display format
      const worldDisplayMapping: { [key: string]: string } = {
        'enchantedForest': 'Enchanted Forest',
        'outerSpace': 'Outer Space',
        'underwaterKingdom': 'Underwater Kingdom'
      };
      const storyWorldDisplay = worldDisplayMapping[storyWorld] || 'Enchanted Forest';
      
      // Build BOOK INFORMATION section
      const bookInfo = `BOOK INFORMATION:
- Book Title: "${storyTitle}"
- Format: Story Adventure Book (5-page narrative)
- Character: ${charName}, a ${charType}
- World: ${storyWorldDisplay} (Enchanted Forest / Outer Space / Underwater Kingdom)
- Adventure: ${adventureType} (Treasure Hunt / Helping a Friend)
- Art Style: ${charStyle}
- Target Age Group: ${ageGroup}`;
      
      // Get style specifications
      const styleSpecs = coverSection?.characterStyleSpecifications?.[charStyle] || '';
      
      // Get environment specifications
      const environmentSpecs = coverSection?.coverEnvironment?.[storyWorld] || '';
      
      // Replace placeholders in the base prompt
      let processedBasePrompt = basePrompt
        .replace(/\{character_name\}/g, charName)
        .replace(/\{character_style\}/g, charStyle)
        .replace(/\{story_world\}/g, storyWorld);
      
      // Combine all prompts: basePrompt + style + environment
      const promptParts: string[] = [processedBasePrompt];
      
      if (styleSpecs) {
        promptParts.push(styleSpecs);
      }
      
      if (environmentSpecs) {
        promptParts.push(environmentSpecs);
      }
      
      const combinedPrompt = promptParts.join('\n\n');
      
      // Combine BOOK INFORMATION with the combined cover prompt
      prompt = `${bookInfo}\n\n${combinedPrompt}`;
    } else if (style === 'intersearch') {
      // Use the interactive search book cover prompt from prompt1.json
      // Get character details from options or sessionStorage
      let charName = characterName;
      let charStyle = '';
      let storyWorld = '';
      let charType = '';
      let storyTitle = '';
      let ageGroup = '';
      let ability = specialAbility || '';
      
      if (browser) {
        // Get character name
        if (!charName) {
          charName = sessionStorage.getItem('characterName') || 'Character';
        }
        
        // Get character type
        const storedCharType = sessionStorage.getItem('selectedCharacterType') || 'person';
        // Map to prompt format
        if (storedCharType === 'magical_creature' || storedCharType === 'magical') {
          charType = 'magical';
        } else if (storedCharType === 'animal') {
          charType = 'animal';
        } else {
          charType = 'person';
        }
        
        // Get character style (3d, cartoon, or anime)
        const storedStyle = sessionStorage.getItem('selectedStyle') || '';
        if (storedStyle === '3d' || storedStyle === 'cartoon' || storedStyle === 'anime') {
          charStyle = storedStyle;
        } else {
          // Default to cartoon if not found
          charStyle = 'cartoon';
        }
        
        // Get story title
        storyTitle = sessionStorage.getItem('storyTitle') || 'Adventure Story';
        
        // Get story world from quality parameter or sessionStorage
        const world = (quality as string) || sessionStorage.getItem('selectedWorld') || 'forest';
        
        // Map world names to prompt1.json format
        const worldMapping: { [key: string]: string } = {
          'forest': 'enchanted-forest',
          'outerspace': 'outer-space',
          'underwater': 'underwater-kingdom'
        };
        
        storyWorld = worldMapping[world] || 'enchanted-forest';
        
        // Get age group
        ageGroup = sessionStorage.getItem('ageGroup') || '7-10';
        
        // Get special ability
        if (!ability) {
          ability = sessionStorage.getItem('specialAbility') || '';
        }
      } else {
        // Fallback values for SSR
        charName = characterName || 'Character';
        charType = 'person';
        charStyle = 'cartoon';
        storyWorld = 'enchanted-forest';
        storyTitle = 'Adventure Story';
        ageGroup = '7-10';
      }
      
      // Build the interactive search cover prompt
      prompt = buildIntersearchCoverPrompt({
        characterName: charName,
        characterType: charType,
        characterDescription: ability || 'special abilities',
        characterStyle: charStyle as '3d' | 'cartoon' | 'anime',
        storyWorld: storyWorld,
        storyTitle: storyTitle,
        ageGroup: ageGroup,
        specialAbility: ability,
        characterReferenceImage: imageUrl
      });
    } else {
      // Handle other style prompts - use enhancement prompt builder if applicable
      // For styles that aren't character enhancements, create a simple fallback
      prompt = `Enhance this character image with a ${style} style at ${quality} quality level. Keep the character's original features and personality intact while applying the requested style.`;
    }

    const response = await fetch('https://drawtopia-backend.vercel.app/edit-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ image_url: imageUrl, prompt: prompt })
    });

    if (!response.ok) {
      throw new Error(`Failed to generate image: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.storage_info.uploaded) {
      const cleanUrl = data.storage_info.url.split('?')[0];
      
      // Save to sessionStorage if requested
      if (saveToStorage && browser) {
        const key = storageKey || `generatedImage_${style}`;
        sessionStorage.setItem(key, data.storage_info.url);
      }
      
      return { success: true, url: cleanUrl };
    } else {
      throw new Error('No image URL received from the API');
    }
  } catch (err) {
    console.error(`Error generating ${style} image:`, err);
    const errorMessage = err instanceof Error ? err.message : `Failed to generate ${style} image. Please try again.`;
    return { success: false, error: errorMessage };
  }
}

/**
 * Generate multiple styled images simultaneously
 */
export async function generateMultipleStyledImages(
  imageUrl: string, 
  styles: string[], 
  quality: 'initial' | 'minimal' | 'normal' | 'high' = 'normal'
): Promise<{ [style: string]: ImageGenerationResult }> {
  const promises = styles.map(async (style) => {
    const result = await generateStyledImage({
      imageUrl,
      style,
      quality,
      saveToStorage: true
    });
    return { style, result };
  });

  const results = await Promise.allSettled(promises);
  const output: { [style: string]: ImageGenerationResult } = {};

  results.forEach((result, index) => {
    const style = styles[index];
    if (result.status === 'fulfilled') {
      output[style] = result.value.result;
    } else {
      output[style] = { success: false, error: 'Promise rejected' };
    }
  });

  return output;
}

/**
 * Load previously generated images from sessionStorage
 */
export function loadGeneratedImages(styles: string[]): { [style: string]: string } {
  if (!browser) return {};
  
  const generatedImages: { [style: string]: string } = {};
  
  styles.forEach(style => {
    const storedImage = sessionStorage.getItem(`generatedImage_${style}`);
    if (storedImage) {
      generatedImages[style] = storedImage.split('?')[0];
    }
  });
  
  return generatedImages;
}

/**
 * Clear generated images from sessionStorage
 */
export function clearGeneratedImages(styles: string[]): void {
  if (!browser) return;
  
  styles.forEach(style => {
    sessionStorage.removeItem(`generatedImage_${style}`);
  });
}

/**
 * Check if the original image URL has changed and clear cache if needed
 */
export function handleImageUrlChange(newImageUrl: string, styles: string[]): boolean {
  if (!browser) return false;
  
  const storedLastProcessedUrl = sessionStorage.getItem('lastProcessedImageUrl');
  const imageUrlChanged = storedLastProcessedUrl && storedLastProcessedUrl !== newImageUrl;
  
  if (imageUrlChanged) {
    // Clear old generated images
    clearGeneratedImages(styles);
    
    // Update the last processed image URL
    sessionStorage.setItem('lastProcessedImageUrl', newImageUrl);
    return true;
  } else if (!storedLastProcessedUrl) {
    // First time processing this image
    sessionStorage.setItem('lastProcessedImageUrl', newImageUrl);
    return false;
  }
  
  return false;
}

/**
 * Save selected image URL for a specific step
 */
export function saveSelectedImageUrl(step: string, imageUrl: string): void {
  if (!browser) return;
  sessionStorage.setItem(`selectedImage_step${step}`, imageUrl);
}

/**
 * Get selected image URL for a specific step
 */
export function getSelectedImageUrl(step: string): string | null {
  if (!browser) return null;
  return sessionStorage.getItem(`selectedImage_step${step}`);
}

/**
 * Check if selected image from previous step has changed
 */
export function hasSelectedImageChanged(step: string, currentImageUrl: string): boolean {
  if (!browser) return false;
  
  const previousImageUrl = getSelectedImageUrl(step);
  return previousImageUrl !== null && previousImageUrl !== currentImageUrl;
}

/**
 * Generate character image with special ability
 * This generates the base character image before enhancement
 */
export interface CharacterGenerationOptions {
  imageUrl: string;
  characterType?: string;
  specialAbility?: string;
  description?: string;
  style: '3d' | 'cartoon' | 'anime';
  saveToStorage?: boolean;
}

export async function generateCharacterWithSpecialAbility(
  options: CharacterGenerationOptions
): Promise<ImageGenerationResult> {
  const { 
    imageUrl, 
    characterType, 
    specialAbility, 
    description, 
    style,
    saveToStorage = true 
  } = options;

  if (!imageUrl) {
    return { success: false, error: 'No image URL provided' };
  }

  try {
    // Map character type to readable format
    const characterTypeMapping: { [key: string]: string } = {
      'person': 'a person',
      'animal': 'an animal',
      'magical_creature': 'a magical creature'
    };

    // Map special ability values to prompt1.json keys
    const specialAbilityMapping: { [key: string]: string } = {
      'healing-powers': 'healingPower',
      'flying': 'flying',
      'super-strength': 'superStrength',
      'invisibility': 'invisibility',
      'animal-communication': 'animalCommunication',
      'time-control': 'timeControl',
      'shape-shifting': 'shapeShifting',
      'magic-casting': 'magicCasting',
      'custom': 'custom'
    };

    let characterTypeText = '';
    if (characterType) {
      const mappedType = characterTypeMapping[characterType.toLowerCase()];
      characterTypeText = mappedType || characterType;
    }

    let specialAbilityPrompt = '';
    
    // Get special ability prompt from prompt1.json if it's a predefined one
    if (specialAbility) {
      const mappedKey = specialAbilityMapping[specialAbility.toLowerCase()] || 'custom';
      const enhanceCharacter = (prompt1Data as any).enhanceCharacter;
      if (enhanceCharacter && enhanceCharacter.specialAbility && enhanceCharacter.specialAbility[mappedKey]) {
        specialAbilityPrompt = enhanceCharacter.specialAbility[mappedKey];
      } else {
        // Use custom special ability text
        specialAbilityPrompt = specialAbility;
      }
    }

    // Combine prompts: character type + special ability + description
    let combinedPrompt = '';
    
    // Add character type context if available
    if (characterTypeText) {
      combinedPrompt = `The character is ${characterTypeText}. `;
    }
    
    // Add special ability prompt
    if (specialAbilityPrompt) {
      combinedPrompt += specialAbilityPrompt;
    }
    
    // Add description if it exists
    if (description && description.trim()) {
      if (combinedPrompt) {
        combinedPrompt += ' ' + description.trim();
      } else {
        combinedPrompt = description.trim();
      }
    }
    
    // Trim any extra whitespace
    combinedPrompt = combinedPrompt.trim();

    // Add negative prompts/instructions to preserve character features
    const negativePrompts = [
      'Don\'t add any other character except the input character.',
      'Keep the appearance features of the input character.'
    ];
    
    // Append negative prompts to the main prompt
    if (combinedPrompt) {
      combinedPrompt += ' ' + negativePrompts.join(' ');
    } else {
      combinedPrompt = negativePrompts.join(' ');
    }

    const response = await fetch('https://drawtopia-backend.vercel.app/edit-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        image_url: imageUrl, 
        prompt: combinedPrompt.trim(),
        negative_prompt: negativePrompts.join(' ')
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to generate character image: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.storage_info.uploaded) {
      const cleanUrl = data.storage_info.url.split('?')[0];
      
      // Save to sessionStorage if requested
      if (saveToStorage && browser) {
        sessionStorage.setItem(`characterWithAbility_${style}`, data.storage_info.url);
      }
      
      return { success: true, url: cleanUrl };
    } else {
      throw new Error('No image URL received from the API');
    }
  } catch (err) {
    console.error('Error generating character with special ability:', err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to generate character image. Please try again.';
    return { success: false, error: errorMessage };
  }
}

/**
 * Clear all cached images for regeneration
 */
export function clearAllCachedImages(): void {
  if (!browser) return;
  
  // Clear style images
  ['3d', 'cartoon', 'anime'].forEach(style => {
    sessionStorage.removeItem(`generatedImage_${style}`);
  });
  
  // Clear character with ability images
  ['3d', 'cartoon', 'anime'].forEach(style => {
    sessionStorage.removeItem(`characterWithAbility_${style}`);
  });
  
  // Clear enhancement images
  ['3d', 'cartoon', 'anime'].forEach(style => {
    ['minimal', 'normal', 'high'].forEach(enhancement => {
      sessionStorage.removeItem(`enhancementImage_${style}_${enhancement}`);
    });
  });
  
  // Clear environment images
  ['3d', 'cartoon', 'anime'].forEach(style => {
    ['minimal', 'normal', 'high'].forEach(enhancement => {
      ['forest', 'underwater', 'outerspace'].forEach(env => {
        sessionStorage.removeItem(`environmentImage_${style}_${enhancement}_${env}`);
      });
    });
  });
  
  // Clear adventure images
  ['forest', 'underwater', 'outerspace'].forEach(world => {
    ['treasure', 'helping'].forEach(adventure => {
      sessionStorage.removeItem(`adventureImage_${world}_${adventure}`);
    });
  });
}

/**
 * Generate interactive search story cover image
 * Uses the selectedCharacterEnhancedImage from sessionStorage and builds a prompt
 * using the intersearchCoverPromptBuilder function
 */
export async function generateIntersearchCover(): Promise<ImageGenerationResult> {
  if (!browser) {
    return { success: false, error: 'Browser environment required' };
  }

  try {
    // Get selectedCharacterEnhancedImage from sessionStorage
    const selectedCharacterEnhancedImage = sessionStorage.getItem('selectedCharacterEnhancedImage');
    if (!selectedCharacterEnhancedImage) {
      return { success: false, error: 'No selected character enhanced image found in sessionStorage' };
    }

    // Get character details from sessionStorage
    const characterName = sessionStorage.getItem('characterName') || 'Character';
    const storedCharType = sessionStorage.getItem('selectedCharacterType') || 'person';
    const storedStyle = sessionStorage.getItem('selectedStyle') || 'cartoon';
    const storyTitle = sessionStorage.getItem('storyTitle') || 'Adventure Story';
    const selectedWorld = sessionStorage.getItem('selectedWorld') || 'forest';
    const ageGroup = sessionStorage.getItem('ageGroup') || '7-10';
    const specialAbility = sessionStorage.getItem('specialAbility') || '';

    // Map character type
    let charType: 'person' | 'animal' | 'magical' = 'person';
    if (storedCharType === 'magical_creature' || storedCharType === 'magical') {
      charType = 'magical';
    } else if (storedCharType === 'animal') {
      charType = 'animal';
    }

    // Map character style
    let charStyle: '3d' | 'cartoon' | 'anime' = 'cartoon';
    if (storedStyle === '3d' || storedStyle === 'cartoon' || storedStyle === 'anime') {
      charStyle = storedStyle as '3d' | 'cartoon' | 'anime';
    }

    // Map world names to prompt1.json format
    const worldMapping: { [key: string]: string } = {
      'forest': 'enchanted-forest',
      'outerspace': 'outer-space',
      'underwater': 'underwater-kingdom'
    };
    const storyWorld = worldMapping[selectedWorld] || 'enchanted-forest';

    // Build the interactive search cover prompt using promptBuilder
    const prompt = buildIntersearchCoverPrompt({
      characterName: characterName,
      characterType: charType,
      characterDescription: specialAbility || 'special abilities',
      characterStyle: charStyle,
      storyWorld: storyWorld,
      storyTitle: storyTitle,
      ageGroup: ageGroup,
      specialAbility: specialAbility,
      characterReferenceImage: selectedCharacterEnhancedImage.split('?')[0]
    });

    // Call the /edit-image/ endpoint
    const response = await fetch('https://drawtopia-backend.vercel.app/edit-image/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        image_url: selectedCharacterEnhancedImage.split('?')[0], 
        prompt: prompt 
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to generate cover image: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.storage_info?.uploaded && data.storage_info?.url) {
      const cleanUrl = data.storage_info.url.split('?')[0];
      
      // Save to sessionStorage
      sessionStorage.setItem('intersearchCover', cleanUrl);
      
      return { success: true, url: cleanUrl };
    } else {
      throw new Error('No image URL received from the API');
    }
  } catch (err) {
    console.error('Error generating intersearch cover:', err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to generate intersearch cover. Please try again.';
    return { success: false, error: errorMessage };
  }
}