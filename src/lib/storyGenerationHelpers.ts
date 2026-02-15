/**
 * Story Generation Helper Functions
 * Provides utilities for generating complete story books with templates
 */

import prompt2Data from './prompt1.json';
import type { BookTemplate } from './database/bookTemplates';
import { env, LOGO_PATH } from './env';

/** Text block for overlay API: text, font_size, color_hex, y_position, alignment, shadow */
export interface TextBlockOverlay {
  text: string;
  font_size?: number;
  color_hex?: string;
  y_position?: number;
  alignment?: 'center' | 'left' | 'right';
  shadow?: boolean;
  shadow_color?: string;
  shadow_offset?: number;
}

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
 * Get back cover text blocks and options for overlay-back-cover API.
 * Layout: title (top), description, then bottom-left tagline/website, bottom-right ISBN/age.
 */
export function getBackCoverTextBlocks(): TextBlockOverlay[] {
  const bc = prompt2Data.generateStoryScene.backCover;
  const titleLine1 = (bc as { titleLine1?: string }).titleLine1 ?? 'Drawtopia Makes';
  const titleLine2 = (bc as { titleLine2?: string }).titleLine2 ?? 'Every Child a';
  const titleLine3 = (bc as { titleLine3?: string }).titleLine3 ?? 'Storyteller';
  const titleText = [titleLine1, titleLine2, titleLine3].join('\n');
  const description = bc.description ?? '';
  const tagline = (bc as { tagline?: string }).tagline ?? "Their imagination. Their characters. Their stories. Enhanced, not replaced.";
  const website = (bc as { website?: string }).website ?? 'drawtopia.ai';
  const isbnPlaceholder = (bc as { isbnPlaceholder?: string }).isbnPlaceholder ?? 'ISBN placeholder';
  const ageRange = (bc as { ageRange?: string }).ageRange ?? '[Age 6-12]';

  const lightColor = '#e8ecf0';
  const baseStyle = { color_hex: lightColor, alignment: 'center' as const, shadow: false };

  return [
    { text: titleText, font_size: 42, ...baseStyle, y_position: 0.12, alignment: 'center' },
    { text: description, font_size: 24, ...baseStyle, y_position: 0.34, alignment: 'center' },
    { text: tagline, font_size: 18, color_hex: lightColor, y_position: 0.78, alignment: 'left', shadow: false },
    { text: website, font_size: 16, color_hex: lightColor, y_position: 0.90, alignment: 'left', shadow: false },
    { text: isbnPlaceholder, font_size: 14, color_hex: lightColor, y_position: 0.80, alignment: 'right', shadow: false },
    { text: ageRange, font_size: 14, color_hex: lightColor, y_position: 0.94, alignment: 'right', shadow: false }
  ];
}

/**
 * Call backend overlay-back-cover API (text + optional logo + barcode).
 */
export async function overlayBackCover(
  imageUrl: string,
  textBlocks: TextBlockOverlay[],
  options: { logoUrl?: string; barcodeIsbn?: string; backendBaseUrl?: string }
): Promise<{ success: boolean; url?: string; error?: string }> {
  const base = options.backendBaseUrl ?? env.PUBLIC_BACKEND_URL;
  const url = `${base.replace(/\/$/, '')}/overlay-back-cover/`;
  try {
    const body: Record<string, unknown> = {
      image_url: imageUrl,
      text_blocks: textBlocks.map((b) => ({
        text: b.text,
        font_size: b.font_size ?? 48,
        color_hex: b.color_hex ?? '#1a1a1a',
        y_position: b.y_position ?? 0.5,
        alignment: b.alignment ?? 'center',
        shadow: b.shadow ?? false,
        shadow_color: b.shadow_color,
        shadow_offset: b.shadow_offset
      }))
    };
    if (options.logoUrl) body.logo_url = options.logoUrl;
    if (options.barcodeIsbn) body.barcode_isbn = options.barcodeIsbn;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || `Back cover API failed: ${response.status}`);
    }
    const data = await response.json();
    if (data.success && data.url) {
      return { success: true, url: data.url.split('?')[0] };
    }
    return { success: false, error: data.message || 'No URL in back cover response' };
  } catch (error) {
    console.error('Error creating back cover:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Build back cover prompt (kept for legacy use)
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
  /** When true, only generate story page images (skip copyright, dedication, last word, back cover). */
  storyPagesOnly?: boolean;
}

export interface GenerateBookPagesResult {
  success: boolean;
  storyPageImageUrls?: string[];
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
    onProgress,
    storyPagesOnly = false
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
    
    console.log(`Generating book pages for ${validPages.length} story pages${storyPagesOnly ? ' (story pages only)' : ''}`);
    if (!storyPagesOnly) {
      console.log('Book template fields:', {
        hasBackCover: !!bookTemplate.back_cover_image,
        storyPagesCount: bookTemplate.story_page_images?.length || 0
      });
    }

    const logoUrl = env.PUBLIC_APP_URL ? `${env.PUBLIC_APP_URL.replace(/\/$/, '')}${LOGO_PATH}` : undefined;
    
    // Generate story page images
    if (onProgress) onProgress('Generating story pages...', storyPagesOnly ? 10 : 30);
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
      
      const progress = storyPagesOnly
        ? 10 + ((i + 1) / totalPages) * 90  // 10-100%
        : 30 + ((i + 1) / totalPages) * 40; // 30-70%
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
    
    // Back cover (skipped when storyPagesOnly)
    if (!storyPagesOnly) {
      if (onProgress) onProgress('Creating back cover...', 85);
      if (bookTemplate.back_cover_image) {
        console.log('Creating back cover with text, logo and barcode:', bookTemplate.back_cover_image);
        const backCoverBlocks = getBackCoverTextBlocks();
        const backCoverResult = await overlayBackCover(
          bookTemplate.back_cover_image,
          backCoverBlocks,
          {
            logoUrl,
            barcodeIsbn: '978012345678'
          }
        );
        if (backCoverResult.success && backCoverResult.url) {
          result.backCoverImageUrl = backCoverResult.url;
          console.log('✅ Back cover created:', backCoverResult.url);
        } else {
          console.error('❌ Failed to create back cover:', backCoverResult.error);
        }
      } else {
        console.warn('⚠️ Back cover template image not found in book template');
      }
    }
    
    if (onProgress) onProgress('Complete!', 100);
    result.success = true;
    
  } catch (error) {
    console.error('Error generating book pages:', error);
    result.error = error instanceof Error ? error.message : 'Unknown error';
  }
  
  return result;
}
