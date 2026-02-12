/**
 * Story Generation Helper Functions
 * Provides utilities for generating complete story books with templates
 */

import prompt2Data from './prompt1.json';
import type { BookTemplate } from './database/bookTemplates';

/**
 * Replace placeholders in text with actual values
 */
export function replacePlaceholders(text: string, replacements: { [key: string]: string }): string {
  let result = text;
  for (const [placeholder, value] of Object.entries(replacements)) {
    const regex = new RegExp(`\\[${placeholder}\\]`, 'g');
    result = result.replace(regex, value);
  }
  return result;
}

/**
 * Build copyright page prompt with child and character names
 */
export function buildCopyrightPagePrompt(childName: string, characterName: string): string {
  const mainText = replacePlaceholders(prompt2Data.generateStoryScene.copyrightPage.mainText, {
    CHILD_NAME: childName,
    CHARACTER_NAME: characterName
  });
  
  const footerText = prompt2Data.generateStoryScene.copyrightPage.footerText;
  
  return prompt2Data.generateStoryScene.copyrightPage.basePrompt
    .replace('{mainText}', mainText)
    .replace('{footerText}', footerText);
}

/**
 * Build dedication page prompt with dedication message
 */
export function buildDedicationPagePrompt(dedicationMessage: string): string {
  return prompt2Data.generateStoryScene.dedicationPage.basePrompt
    .replace('{dedicationMessage}', dedicationMessage);
}

/**
 * Build story page prompt with story text, character action, and scene description
 */
export function buildStoryPagePrompt(
  pageNumber: number,
  storyText: string,
  characterAction: string,
  sceneDescription: string
): string {
  return prompt2Data.generateStoryScene.basePrompt
    .replace('{pageNumber}', pageNumber.toString())
    .replace('{storyText}', storyText)
    .replace('{characterAction}', characterAction)
    .replace('{sceneDescription}', sceneDescription);
}

/**
 * Build last word page prompt with child name
 */
export function buildLastWordPagePrompt(childName: string): string {
  const message = replacePlaceholders(prompt2Data.generateStoryScene.lastWordPage.message, {
    CHILD_NAME: childName
  });
  
  return prompt2Data.generateStoryScene.lastWordPage.basePrompt + '\n\nReplace [CHILD_NAME] with: ' + childName;
}

/**
 * Build back cover prompt
 */
export function buildBackCoverPrompt(): string {
  return prompt2Data.generateStoryScene.backCover.basePrompt;
}

/**
 * Generate action descriptions based on page number and story context
 */
export function generateCharacterAction(pageNumber: number, storyWorld: string): string {
  const actions: { [key: number]: string } = {
    1: "Character is discovering or entering a new world, looking curious and excited",
    2: "Character is exploring and observing the environment, engaged and attentive",
    3: "Character is actively involved in the adventure, showing determination",
    4: "Character is using their special ability or solving the main challenge, confident and heroic",
    5: "Character is celebrating success or reflecting on their journey, happy and fulfilled"
  };
  
  return actions[pageNumber] || "Character is actively participating in the scene";
}

/**
 * Generate scene descriptions based on page number and story world
 */
export function generateSceneDescription(pageNumber: number, storyWorld: string, storyText?: string): string {
  const worldDescriptions: { [key: string]: { [key: number]: string } } = {
    'forest': {
      1: prompt2Data.generateStoryScene.worldSpecific.enchantedForest.page1,
      2: prompt2Data.generateStoryScene.worldSpecific.enchantedForest.page2,
      3: prompt2Data.generateStoryScene.worldSpecific.enchantedForest.page3,
      4: prompt2Data.generateStoryScene.worldSpecific.enchantedForest.page4,
      5: prompt2Data.generateStoryScene.worldSpecific.enchantedForest.page5
    },
    'underwater': {
      1: prompt2Data.generateStoryScene.worldSpecific.underwaterKingdom.page1,
      2: prompt2Data.generateStoryScene.worldSpecific.underwaterKingdom.page2,
      3: prompt2Data.generateStoryScene.worldSpecific.underwaterKingdom.page3,
      4: prompt2Data.generateStoryScene.worldSpecific.underwaterKingdom.page4,
      5: prompt2Data.generateStoryScene.worldSpecific.underwaterKingdom.page5
    },
    'outerspace': {
      1: "A space station or planet entrance with stars and cosmic elements",
      2: "Deep space with planets, asteroids, and cosmic wonders",
      3: prompt2Data.generateStoryScene.worldSpecific.outerSpace.page3,
      4: prompt2Data.generateStoryScene.worldSpecific.outerSpace.page4,
      5: prompt2Data.generateStoryScene.worldSpecific.outerSpace.page5
    }
  };
  
  const descriptions = worldDescriptions[storyWorld] || worldDescriptions['forest'];
  const baseDescription = descriptions[pageNumber] || `Scene ${pageNumber} in ${storyWorld}`;
  
  // Add story text excerpt if available
  if (storyText && storyText.trim().length > 0) {
    const excerpt = storyText.length > 100 ? storyText.substring(0, 100) + '...' : storyText;
    return `${baseDescription}. Story context: ${excerpt}`;
  }
  
  return baseDescription;
}

/**
 * Call edit-image endpoint with one image and prompt
 */
export async function generateImageWithSingleTemplate(
  templateImageUrl: string,
  prompt: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const response = await fetch('https://image-edit-five.vercel.app/edit-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: templateImageUrl,
        prompt: prompt,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to generate image: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.storage_info?.uploaded && data.storage_info?.url) {
      return {
        success: true,
        url: data.storage_info.url.split('?')[0]
      };
    } else {
      return {
        success: false,
        error: 'No image URL received from API'
      };
    }
  } catch (error) {
    console.error('Error generating image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Call generate-cover-image endpoint with two images and prompt
 */
export async function generateImageWithTwoTemplates(
  templateImageUrl: string,
  characterImageUrl: string,
  prompt: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const response = await fetch('https://image-edit-five.vercel.app/generate-cover-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        template_cover_url: templateImageUrl,
        character_image_url: characterImageUrl,
        prompt: prompt,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to generate image: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.url) {
      return {
        success: true,
        url: data.url.split('?')[0]
      };
    } else {
      return {
        success: false,
        error: data.message || 'No image URL received from API'
      };
    }
  } catch (error) {
    console.error('Error generating image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Generate all book pages in sequence
 */
export interface GenerateBookPagesOptions {
  bookTemplate: BookTemplate;
  characterImageUrl: string;
  childName: string;
  characterName: string;
  dedicationMessage: string;
  storyPages: Array<{ pageNumber: number; text: string }>;
  storyWorld: string;
  onProgress?: (step: string, progress: number) => void;
}

export interface GenerateBookPagesResult {
  success: boolean;
  copyrightImageUrl?: string;
  dedicationImageUrl?: string;
  storyPageImageUrls?: string[];
  lastWordImageUrl?: string;
  backCoverImageUrl?: string;
  error?: string;
}

export async function generateAllBookPages(
  options: GenerateBookPagesOptions
): Promise<GenerateBookPagesResult> {
  const {
    bookTemplate,
    characterImageUrl,
    childName,
    characterName,
    dedicationMessage,
    storyPages,
    storyWorld,
    onProgress
  } = options;
  
  const result: GenerateBookPagesResult = {
    success: false,
    storyPageImageUrls: []
  };
  
  try {
    // Validate required inputs
    if (!bookTemplate) {
      throw new Error('Book template is required');
    }
    
    if (!characterImageUrl) {
      throw new Error('Character image URL is required');
    }
    
    if (!storyPages || storyPages.length === 0) {
      throw new Error('Story pages are required');
    }
    
    // Validate story pages have text
    const validPages = storyPages.filter(p => p && p.text && p.text.trim().length > 0);
    if (validPages.length === 0) {
      throw new Error('Story pages must have text content');
    }
    
    console.log(`Generating book pages for ${validPages.length} story pages`);
    console.log('Book template fields:', {
      hasCopyrightPage: !!bookTemplate.copyright_page_image,
      hasDedicationPage: !!bookTemplate.dedication_page_image,
      hasLastWordPage: !!bookTemplate.last_story_page_image,
      hasBackCover: !!bookTemplate.back_cover_image,
      storyPagesCount: bookTemplate.story_page_images?.length || 0
    });
    
    // Step 1: Generate copyright page
    if (onProgress) onProgress('Generating copyright page...', 10);
    if (bookTemplate.copyright_page_image) {
      console.log('Generating copyright page with template:', bookTemplate.copyright_page_image);
      const copyrightPrompt = buildCopyrightPagePrompt(childName, characterName);
      const copyrightResult = await generateImageWithSingleTemplate(
        bookTemplate.copyright_page_image,
        copyrightPrompt
      );
      if (copyrightResult.success && copyrightResult.url) {
        result.copyrightImageUrl = copyrightResult.url;
        console.log('✅ Copyright page generated:', copyrightResult.url);
      } else {
        console.error('❌ Failed to generate copyright page:', copyrightResult.error);
      }
    } else {
      console.warn('⚠️ Copyright page template image not found in book template');
    }
    
    // Step 2: Generate dedication page
    if (onProgress) onProgress('Generating dedication page...', 20);
    if (bookTemplate.dedication_page_image && dedicationMessage) {
      console.log('Generating dedication page with template:', bookTemplate.dedication_page_image);
      const dedicationPrompt = buildDedicationPagePrompt(dedicationMessage);
      const dedicationResult = await generateImageWithSingleTemplate(
        bookTemplate.dedication_page_image,
        dedicationPrompt
      );
      if (dedicationResult.success && dedicationResult.url) {
        result.dedicationImageUrl = dedicationResult.url;
        console.log('✅ Dedication page generated:', dedicationResult.url);
      } else {
        console.error('❌ Failed to generate dedication page:', dedicationResult.error);
      }
    } else {
      if (!bookTemplate.dedication_page_image) {
        console.warn('⚠️ Dedication page template image not found in book template');
      }
      if (!dedicationMessage) {
        console.warn('⚠️ No dedication message provided');
      }
    }
    
    // Step 3: Generate story page images
    if (onProgress) onProgress('Generating story pages...', 30);
    const storyPageImages: string[] = [];
    const totalPages = validPages.length;
    
    for (let i = 0; i < totalPages; i++) {
      const page = validPages[i];
      
      if (!page || !page.text) {
        console.warn(`Skipping invalid page at index ${i}`);
        continue;
      }
      
      const pageNumber = page.pageNumber || (i + 1);
      const templateImage = bookTemplate.story_page_images?.[i];
      
      if (!templateImage) {
        console.warn(`No template image for story page ${pageNumber}`);
        continue;
      }
      
      const progress = 30 + ((i + 1) / totalPages) * 40; // 30-70%
      if (onProgress) onProgress(`Generating story page ${pageNumber}...`, progress);
      
      try {
        const characterAction = generateCharacterAction(pageNumber, storyWorld);
        const sceneDescription = generateSceneDescription(pageNumber, storyWorld, page.text);
        const storyPagePrompt = buildStoryPagePrompt(pageNumber, page.text, characterAction, sceneDescription);
        
        const storyPageResult = await generateImageWithTwoTemplates(
          templateImage,
          characterImageUrl,
          storyPagePrompt
        );
        
        if (storyPageResult.success && storyPageResult.url) {
          storyPageImages.push(storyPageResult.url);
          console.log(`✅ Story page ${pageNumber} generated successfully`);
        } else {
          console.error(`❌ Failed to generate story page ${pageNumber}:`, storyPageResult.error);
        }
      } catch (error) {
        console.error(`❌ Error generating story page ${pageNumber}:`, error);
        // Continue with next page even if one fails
      }
    }
    
    result.storyPageImageUrls = storyPageImages;
    console.log(`Generated ${storyPageImages.length} out of ${totalPages} story page images`);
    
    // Step 4: Generate last word page
    if (onProgress) onProgress('Generating final page...', 75);
    if (bookTemplate.last_story_page_image) {
      console.log('Generating last word page with template:', bookTemplate.last_story_page_image);
      const lastWordPrompt = buildLastWordPagePrompt(childName);
      const lastWordResult = await generateImageWithSingleTemplate(
        bookTemplate.last_story_page_image,
        lastWordPrompt
      );
      if (lastWordResult.success && lastWordResult.url) {
        result.lastWordImageUrl = lastWordResult.url;
        console.log('✅ Last word page generated:', lastWordResult.url);
      } else {
        console.error('❌ Failed to generate last word page:', lastWordResult.error);
      }
    } else {
      console.warn('⚠️ Last word page template image not found in book template');
    }
    
    // Step 5: Generate back cover
    if (onProgress) onProgress('Generating back cover...', 85);
    if (bookTemplate.back_cover_image) {
      console.log('Generating back cover with template:', bookTemplate.back_cover_image);
      const backCoverPrompt = buildBackCoverPrompt();
      const backCoverResult = await generateImageWithSingleTemplate(
        bookTemplate.back_cover_image,
        backCoverPrompt
      );
      if (backCoverResult.success && backCoverResult.url) {
        result.backCoverImageUrl = backCoverResult.url;
        console.log('✅ Back cover generated:', backCoverResult.url);
      } else {
        console.error('❌ Failed to generate back cover:', backCoverResult.error);
      }
    } else {
      console.warn('⚠️ Back cover template image not found in book template');
    }
    
    if (onProgress) onProgress('Complete!', 100);
    result.success = true;
    
  } catch (error) {
    console.error('Error generating book pages:', error);
    result.error = error instanceof Error ? error.message : 'Unknown error';
  }
  
  return result;
}
