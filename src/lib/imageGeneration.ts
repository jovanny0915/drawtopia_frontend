import { browser } from "$app/environment";
import { env } from "$lib/env";
import { getPrompt1Data, loadRuntimePromptDocuments } from "./promptRuntime";
import {
  buildEnhancementPrompt,
  buildIntersearchCoverPrompt,
  buildStoryAdventureCoverPrompt,
  buildTemplateCompositeCoverPrompt,
  type StoryAdventureCoverPromptOptions
} from "./promptBuilder";

function renderImageTemplate(template: string, replacements: Record<string, string>): string {
  return Object.entries(replacements).reduce((result, [key, value]) => {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return result.replace(new RegExp(`\\{${escapedKey}\\}`, 'g'), value ?? '');
  }, template);
}

function getImageGenerationPrompts(): Record<string, any> {
  return (getPrompt1Data().imageGeneration || {}) as Record<string, any>;
}

function getImageGenerationTemplate(key: string, replacements: Record<string, string> = {}): string {
  const template = getImageGenerationPrompts()[key];
  if (typeof template !== 'string' || template.trim().length === 0) {
    throw new Error(`imageGeneration.${key} not found in prompt1.json`);
  }
  return renderImageTemplate(template, replacements);
}

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
  characterName?: string;
  characterType?: 'person' | 'animal' | 'magical';
  specialAbility?: string;
  ageGroup?: string;
}

export async function generateStyledImage(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
  const { 
    imageUrl, 
    style, 
    quality = 'normal', 
    saveToStorage = true, 
    storageKey,
    characterName,
    characterType,
    specialAbility,
    ageGroup
  } = options;
  
  if (!imageUrl) {
    return { success: false, error: 'No image URL provided' };
  }

  try {
    await loadRuntimePromptDocuments();
    let prompt: string;
    
    const isCharacterEnhancement = 
      (quality === 'minimal' || quality === 'normal' || quality === 'high') &&
      (style === '3d' || style === 'cartoon' || style === 'anime');
    
    if (isCharacterEnhancement) {
      let charName = characterName;
      let charType = characterType;
      let ability = specialAbility;
      let targetAgeGroup = ageGroup;
      
      if (browser && (!charName || !charType || !ability || !targetAgeGroup)) {
        charName = charName || sessionStorage.getItem('characterName') || 'Character';
        const storedType = characterType || sessionStorage.getItem('selectedCharacterType') || 'person';
        if (storedType === 'magical_creature' || storedType === 'magical') {
          charType = 'magical';
        } else if (storedType === 'animal') {
          charType = 'animal';
        } else {
          charType = 'person';
        }
        ability = ability || sessionStorage.getItem('specialAbility') || '';
        targetAgeGroup = targetAgeGroup || sessionStorage.getItem('ageGroup') || '7-10';
      }
      
      prompt = buildEnhancementPrompt({
        characterName: charName || 'Character',
        characterType: charType || 'person',
        characterStyle: style as '3d' | 'cartoon' | 'anime',
        specialAbility: ability || '',
        enhancementLevel: quality as 'minimal' | 'normal' | 'high',
        uploadedImageUrl: imageUrl,
        ageGroup: targetAgeGroup || '7-10'
      });
    } else if (style === 'environment') {
      const world = quality as string;
      const worldMapping = getImageGenerationPrompts().environment || {};
      prompt = worldMapping[world] || worldMapping.forest;
    } else if (style === 'adventure') {
      return { success: false, error: 'Single-image adventure cover is no longer supported. Use the template composite cover flow instead.' };
    } else if (style === 'intersearch') {
      let charName = characterName;
      let charStyle = '';
      let storyWorld = '';
      let charType = '';
      let storyTitle = '';
      let ageGroup = '';
      let ability = specialAbility || '';
      
      if (browser) {
        if (!charName) {
          charName = sessionStorage.getItem('characterName') || 'Character';
        }
        
        const storedCharType = sessionStorage.getItem('selectedCharacterType') || 'person';
        if (storedCharType === 'magical_creature' || storedCharType === 'magical') {
          charType = 'magical';
        } else if (storedCharType === 'animal') {
          charType = 'animal';
        } else {
          charType = 'person';
        }
        
        const storedStyle = sessionStorage.getItem('selectedStyle') || '';
        if (storedStyle === '3d' || storedStyle === 'cartoon' || storedStyle === 'anime') {
          charStyle = storedStyle;
        } else {
          charStyle = 'cartoon';
        }
        
        storyTitle = sessionStorage.getItem('storyTitle') || 'Adventure Story';
        
        const world = (quality as string) || sessionStorage.getItem('selectedWorld') || 'forest';
        
        const worldMapping: { [key: string]: string } = {
          'forest': 'enchanted-forest',
          'outerspace': 'outer-space',
          'underwater': 'underwater-kingdom'
        };
        
        storyWorld = worldMapping[world] || 'enchanted-forest';
        
        ageGroup = sessionStorage.getItem('ageGroup') || '7-10';
        
        if (!ability) {
          ability = sessionStorage.getItem('specialAbility') || '';
        }
      } else {
        charName = characterName || 'Character';
        charType = 'person';
        charStyle = 'cartoon';
        storyWorld = 'enchanted-forest';
        storyTitle = 'Adventure Story';
        ageGroup = '7-10';
      }
      
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
      prompt = getImageGenerationTemplate('fallbackStylePrompt', {
        style,
        quality: String(quality)
      });
    }

    const response = await fetch('https://image-edit-five.vercel.app/edit-image', {
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

export function clearGeneratedImages(styles: string[]): void {
  if (!browser) return;
  
  styles.forEach(style => {
    sessionStorage.removeItem(`generatedImage_${style}`);
  });
}

export function handleImageUrlChange(newImageUrl: string, styles: string[]): boolean {
  if (!browser) return false;
  
  const storedLastProcessedUrl = sessionStorage.getItem('lastProcessedImageUrl');
  const imageUrlChanged = storedLastProcessedUrl && storedLastProcessedUrl !== newImageUrl;
  
  if (imageUrlChanged) {
    clearGeneratedImages(styles);
    sessionStorage.setItem('lastProcessedImageUrl', newImageUrl);
    return true;
  } else if (!storedLastProcessedUrl) {
    sessionStorage.setItem('lastProcessedImageUrl', newImageUrl);
    return false;
  }
  
  return false;
}

export function saveSelectedImageUrl(step: string, imageUrl: string): void {
  if (!browser) return;
  sessionStorage.setItem(`selectedImage_step${step}`, imageUrl);
}

export function getSelectedImageUrl(step: string): string | null {
  if (!browser) return null;
  return sessionStorage.getItem(`selectedImage_step${step}`);
}

export function hasSelectedImageChanged(step: string, currentImageUrl: string): boolean {
  if (!browser) return false;
  
  const previousImageUrl = getSelectedImageUrl(step);
  return previousImageUrl !== null && previousImageUrl !== currentImageUrl;
}

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
    await loadRuntimePromptDocuments();
    const characterTypeMapping: { [key: string]: string } = {
      'person': 'a person',
      'animal': 'an animal',
      'magical_creature': 'a magical creature'
    };

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
    
    if (specialAbility) {
      const mappedKey = specialAbilityMapping[specialAbility.toLowerCase()] || 'custom';
      const enhanceCharacter = getPrompt1Data().enhanceCharacter;
      if (enhanceCharacter && enhanceCharacter.specialAbility && enhanceCharacter.specialAbility[mappedKey]) {
        specialAbilityPrompt = enhanceCharacter.specialAbility[mappedKey];
      } else {
        specialAbilityPrompt = specialAbility;
      }
    }

    let combinedPrompt = '';
    
    if (characterTypeText) {
      combinedPrompt = `${getImageGenerationTemplate('characterTypeContext', {
        character_type: characterTypeText
      })} `;
    }
    
    if (specialAbilityPrompt) {
      combinedPrompt += specialAbilityPrompt;
    }
    
    if (description && description.trim()) {
      if (combinedPrompt) {
        combinedPrompt += ' ' + description.trim();
      } else {
        combinedPrompt = description.trim();
      }
    }
    
    combinedPrompt = combinedPrompt.trim();

    const negativePrompts = getImageGenerationPrompts().characterGenerationNegativePrompts || [];
    
    if (combinedPrompt) {
      combinedPrompt += ' ' + negativePrompts.join(' ');
    } else {
      combinedPrompt = negativePrompts.join(' ');
    }

    const response = await fetch('https://image-edit-five.vercel.app/edit-image', {
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

export function clearAllCachedImages(): void {
  if (!browser) return;
  
  ['3d', 'cartoon', 'anime'].forEach(style => {
    sessionStorage.removeItem(`generatedImage_${style}`);
  });
  
  ['3d', 'cartoon', 'anime'].forEach(style => {
    sessionStorage.removeItem(`characterWithAbility_${style}`);
  });
  
  ['3d', 'cartoon', 'anime'].forEach(style => {
    ['minimal', 'normal', 'high'].forEach(enhancement => {
      sessionStorage.removeItem(`enhancementImage_${style}_${enhancement}`);
    });
  });
  
  ['3d', 'cartoon', 'anime'].forEach(style => {
    ['minimal', 'normal', 'high'].forEach(enhancement => {
      ['forest', 'underwater', 'outerspace'].forEach(env => {
        sessionStorage.removeItem(`environmentImage_${style}_${enhancement}_${env}`);
      });
    });
  });
  
  ['forest', 'underwater', 'outerspace'].forEach(world => {
    ['treasure', 'helping'].forEach(adventure => {
      sessionStorage.removeItem(`adventureImage_${world}_${adventure}`);
    });
  });
}

export interface StoryAdventureCoverOptions {
  characterImageUrl: string
  characterName?: string
  characterType?: 'person' | 'animal' | 'magical'
  characterStyle?: '3d' | 'cartoon' | 'anime'
  storyWorld?: string
  adventureType?: string
  ageGroup?: string
  storyTitle?: string
  saveToStorage?: boolean
  storageKey?: string
}

export async function generateStoryAdventureCover(
  options: StoryAdventureCoverOptions
): Promise<ImageGenerationResult> {
  if (!browser) {
    return { success: false, error: 'Browser environment required' };
  }

  try {
    await loadRuntimePromptDocuments();
    const {
      characterImageUrl,
      characterName,
      characterType,
      characterStyle,
      storyWorld,
      adventureType,
      ageGroup,
      storyTitle,
      saveToStorage = true,
      storageKey
    } = options;

    if (!characterImageUrl) {
      return { success: false, error: 'No character image URL provided' };
    }

    let charName = characterName;
    let charType: 'person' | 'animal' | 'magical' = 'person';
    let charStyle: '3d' | 'cartoon' | 'anime' = 'cartoon';
    let world = storyWorld || '';
    let adventure = adventureType || '';
    let age = ageGroup || '';
    let title = storyTitle || '';

    if (!charName) {
      charName = sessionStorage.getItem('characterName') || 'Character';
    }

    if (characterType) {
      if (characterType === 'magical') {
        charType = 'magical';
      } else if (characterType === 'animal') {
        charType = 'animal';
      } else {
        charType = 'person';
      }
    } else {
      const storedType = sessionStorage.getItem('selectedCharacterType') || 'person';
      if (storedType === 'magical_creature' || storedType === 'magical') {
        charType = 'magical';
      } else if (storedType === 'animal') {
        charType = 'animal';
      } else {
        charType = 'person';
      }
    }

    if (characterStyle) {
      charStyle = characterStyle;
    } else {
      const storedStyle = sessionStorage.getItem('selectedStyle') || 'cartoon';
      if (storedStyle === '3d' || storedStyle === 'cartoon' || storedStyle === 'anime') {
        charStyle = storedStyle as '3d' | 'cartoon' | 'anime';
      }
    }

    if (!world) {
      world = sessionStorage.getItem('selectedWorld') || 'forest';
    }

    const worldMapping: { [key: string]: 'forest' | 'underwater' | 'outerspace' } = {
      'forest': 'forest',
      'outerspace': 'outerspace',
      'underwater': 'underwater'
    };
    const mappedWorld = worldMapping[world.toLowerCase()] || 'forest';

    if (!adventure) {
      adventure = sessionStorage.getItem('selectedAdventure') || 'treasure';
    }

    if (!age) {
      age = sessionStorage.getItem('ageGroup') || '7-10';
    }

    if (!title) {
      title = sessionStorage.getItem('storyTitle') || 'Adventure Story';
    }

    const { getRandomTemplateByStoryWorld } = await import('./database/bookTemplates');
    const templateResult = await getRandomTemplateByStoryWorld(mappedWorld);
    
    if (templateResult.error || !templateResult.data?.cover_image) {
      console.warn(`No template found for ${mappedWorld}, falling back to direct generation`);
      
      const worldMappingPrompt: { [key: string]: string } = {
        'forest': 'enchantedForest',
        'outerspace': 'outerSpace',
        'underwater': 'underwaterKingdom'
      };
      const mappedWorldPrompt = worldMappingPrompt[world.toLowerCase()] || 'enchantedForest';

      const prompt = buildStoryAdventureCoverPrompt({
        characterName: charName,
        characterType: charType === 'magical' ? 'magical' : charType === 'animal' ? 'animal' : 'person',
        characterStyle: charStyle,
        storyWorld: mappedWorldPrompt,
        adventureType: adventure,
        ageGroup: age,
        storyTitle: title,
        characterImageUrl: characterImageUrl
      });

      const response = await fetch('https://image-edit-five.vercel.app/edit-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image_url: characterImageUrl,
          prompt: prompt
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to generate cover image: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.storage_info?.uploaded && data.storage_info?.url) {
        const cleanUrl = data.storage_info.url.split('?')[0];

        if (saveToStorage) {
          const key = storageKey || 'storyCover';
          sessionStorage.setItem(key, data.storage_info.url);
        }

        return { success: true, url: cleanUrl };
      } else {
        throw new Error('No image URL received from the API');
      }
    }

    const templateCoverUrl = templateResult.data.cover_image;
    
    const baseInsertCharacterPrompt = getImageGenerationTemplate('coverTemplateBasePrompt');
    const shouldAddPersonSuitPrompt = charType === 'person';
    const personSuitPrompt = getImageGenerationTemplate('personSuitPrompt');
    const insertCharacterPrompt = shouldAddPersonSuitPrompt
      ? `${baseInsertCharacterPrompt} ${personSuitPrompt}`
      : baseInsertCharacterPrompt;

    const response = await fetch('https://image-edit-five.vercel.app/edit-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image_url: templateCoverUrl,
        prompt: insertCharacterPrompt,
        reference_image_url: characterImageUrl
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to generate cover image: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.storage_info?.uploaded && data.storage_info?.url) {
      const cleanUrl = data.storage_info.url.split('?')[0];

      if (saveToStorage) {
        const key = storageKey || 'storyCover';
        sessionStorage.setItem(key, data.storage_info.url);
      }

      return { success: true, url: cleanUrl };
    } else {
      throw new Error('No image URL received from the API');
    }
  } catch (err) {
    console.error('Error generating story adventure cover:', err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to generate story adventure cover. Please try again.';
    return { success: false, error: errorMessage };
  }
}

export async function generateCoverImageWithTemplate(options: {
  templateCoverUrl: string;
  characterImageUrl: string;
  storyWorld: string;
  storyFormat?: string;
  characterName?: string;
  characterType?: string;
  characterStyle?: string;
  ageGroup?: string;
  storyTitle?: string;
  includeTitleInPrompt?: boolean;
  saveToStorage?: boolean;
  storageKey?: string;
}): Promise<ImageGenerationResult> {
  if (!browser) {
    return { success: false, error: 'Browser environment required' };
  }

  try {
    await loadRuntimePromptDocuments();
    const {
      templateCoverUrl,
      characterImageUrl,
      storyWorld,
      characterName,
      characterType,
      characterStyle,
      ageGroup,
      storyTitle,
      includeTitleInPrompt = true,
      saveToStorage = true,
      storageKey
    } = options;

    const charName = characterName || sessionStorage.getItem('characterName') || 'Character';
    const charType = characterType || sessionStorage.getItem('selectedCharacterType') || 'person';
    const charStyle = characterStyle || sessionStorage.getItem('selectedStyle') || 'cartoon';
    const age = ageGroup || sessionStorage.getItem('ageGroup') || '7-10';
    const title = storyTitle ?? sessionStorage.getItem('storyTitle') ?? 'Adventure Story';

    const sanitizedStyle = (charStyle === '3d' || charStyle === 'cartoon' || charStyle === 'anime') ? charStyle : 'cartoon';
    const normalizedTitle = title.trim();
    const shouldAddPersonSuitPrompt = charType.trim().toLowerCase() === 'person';
    const personSuitPrompt = getImageGenerationTemplate('personSuitPrompt');

    const templateCompositePrompt = buildTemplateCompositeCoverPrompt({
      characterName: charName,
      characterType: charType,
      characterStyle: sanitizedStyle,
      storyWorld: storyWorld,
      adventureType: '',
      ageGroup: age,
      storyTitle: normalizedTitle || 'Adventure Story'
    });

    const baseCoverPrompt = (includeTitleInPrompt && normalizedTitle.length > 0)
      ? templateCompositePrompt
      : getImageGenerationTemplate('coverTemplateBasePrompt');
    const coverPrompt = shouldAddPersonSuitPrompt
      ? `${baseCoverPrompt} ${personSuitPrompt}`
      : baseCoverPrompt;

    const response = await fetch('https://image-edit-five.vercel.app/generate-cover-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: coverPrompt,
        character_image_url: characterImageUrl,
        template_cover_url: templateCoverUrl
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to generate cover image: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.success && data.url) {
      const cleanUrl = data.url.split('?')[0];

      if (saveToStorage) {
        const key = storageKey || 'storyCover';
        sessionStorage.setItem(key, data.url);
      }

      return { success: true, url: cleanUrl };
    } else {
      throw new Error(data.message || 'Failed to generate cover image');
    }
  } catch (err) {
    console.error('Error generating cover image with template:', err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to generate cover image. Please try again.';
    return { success: false, error: errorMessage };
  }
}

export async function overlayCoverTitleOnImage(options: {
  coverImageUrl: string;
  title: string;
  saveToStorage?: boolean;
  storageKey?: string;
}): Promise<ImageGenerationResult> {
  if (!browser) {
    return { success: false, error: 'Browser environment required' };
  }

  try {
    const {
      coverImageUrl,
      title,
      saveToStorage = true,
      storageKey
    } = options;

    const trimmedTitle = title.trim();
    if (!coverImageUrl || !trimmedTitle) {
      return { success: false, error: 'Cover image URL and title are required' };
    }

    const baseUrl = (env.PUBLIC_BACKEND_URL || '').replace(/\/api\/?$/, '').replace(/\/$/, '') || 'https://image-edit-five.vercel.app';
    const response = await fetch(`${baseUrl}/overlay-cover-title/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image_url: coverImageUrl,
        title: trimmedTitle,
        subtitle: 'A Read-Aloud Adventure'
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to overlay cover title: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (data.success && data.url) {
      const cleanUrl = data.url.split('?')[0];

      if (saveToStorage) {
        const key = storageKey || 'storyCover';
        sessionStorage.setItem(key, cleanUrl);
      }

      return { success: true, url: cleanUrl };
    }

    throw new Error(data.message || 'Failed to overlay title on cover image');
  } catch (err) {
    console.error('Error overlaying title on cover image:', err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to overlay title on cover image.';
    return { success: false, error: errorMessage };
  }
}

export async function generateIntersearchCover(): Promise<ImageGenerationResult> {
  if (!browser) {
    return { success: false, error: 'Browser environment required' };
  }

  try {
    const selectedCharacterEnhancedImage = sessionStorage.getItem('selectedCharacterEnhancedImage');
    if (!selectedCharacterEnhancedImage) {
      return { success: false, error: 'No selected character enhanced image found in sessionStorage' };
    }

    const characterName = sessionStorage.getItem('characterName') || 'Character';
    const storedCharType = sessionStorage.getItem('selectedCharacterType') || 'person';
    const storedStyle = sessionStorage.getItem('selectedStyle') || 'cartoon';
    const storyTitle = sessionStorage.getItem('storyTitle') || 'Adventure Story';
    const selectedWorld = sessionStorage.getItem('selectedWorld') || 'forest';
    const ageGroup = sessionStorage.getItem('ageGroup') || '7-10';
    const specialAbility = sessionStorage.getItem('specialAbility') || '';

    let charType: 'person' | 'animal' | 'magical' = 'person';
    if (storedCharType === 'magical_creature' || storedCharType === 'magical') {
      charType = 'magical';
    } else if (storedCharType === 'animal') {
      charType = 'animal';
    }

    let charStyle: '3d' | 'cartoon' | 'anime' = 'cartoon';
    if (storedStyle === '3d' || storedStyle === 'cartoon' || storedStyle === 'anime') {
      charStyle = storedStyle as '3d' | 'cartoon' | 'anime';
    }

    const worldMapping: { [key: string]: string } = {
      'forest': 'enchanted-forest',
      'outerspace': 'outer-space',
      'underwater': 'underwater-kingdom'
    };
    const storyWorld = worldMapping[selectedWorld] || 'enchanted-forest';

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

    const response = await fetch('https://image-edit-five.vercel.app/edit-image/', {
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