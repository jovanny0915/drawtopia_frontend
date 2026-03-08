/**
 * Story Generation Helper Functions
 * Provides utilities for generating complete story books with templates
 */

import prompt2Data from './prompt1.json';
import type { BookTemplate } from './database/bookTemplates';
import { env, LOGO_PATH } from './env';
import { buildStoryScenePrompt } from './promptBuilder';

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
/** Temporary fixed prompt for main story page (page 1) on /adventure-story/loading. Set to null to use prompt builder again. */
const TEMP_MAIN_STORY_PAGE_PROMPT: string | null =
  "The girl main character image should be replaced and removed from the attached template image with the reference image character. Replace the main character of attached template image with the main character of template background image keeping the appearance of the reference image character. The replaced character should precisely match the pose, action, and emotions of the original main character in the template background image. All other characters and elements from the template background image must be kept and integrated seamlessly. Integrate the new main character into the magical forest setting, ensuring lighting and style are perfectly blended. Generate the final image in stunning 4K resolution with an aspect ratio of 3:2 (width:height).";
const TEMP_MAIN_STORY_PAGE_ALLY_CHARACTER_PROMPT: string | null =
  "The fox ally character of template background image should be replaced with [ally_name] character. Replace the fox ally character of attached templage image with [ally_name] character keeping the original fox ally character. The replaced character should precisely match the pose, action, and emotions of the original fox ally character in the template background image. All other characters and elements from the template background image must be kept and integrated seamlessly. Integrate the new main character into the magical forest setting, ensuring lighting and style are perfectly blended. Generate the final image in stunning 4K resolution with an aspect ratio of 3:2 (width:height).";

const PAGE_ALLY_CHARACTER_PROMPTS: { [key: number]: string } = {
  1: "Ally character - ally character should be not in this image.",
  2: "Ally character - ally character should be not removed in this image. Ally character of template background image must be replaced with [ally_name] character",
  3: "Ally character - ally character should be not removed in this image. Ally character of template background image must be replaced with [ally_name] character",
  4: "Ally character - ally character should be not removed in this image. Ally character of template background image must be replaced with [ally_name] character",
  5: "Ally character - ally character should be not removed in this image. Ally character of template background image must be replaced with [ally_name] character"
};

const PAGE_MAIN_CHARACTER_POSE_ACTION_EMOTION_PROMPTS: { [key: number]: string } = {
  1: "The character stands in a magical treehouse dwelling. The character's hands gently cupped as if holding or observing something delicate. And he/she seems to look at us. The placement of character stands in the a slightly left from center.",
  2: "A bright-eyed, the adventurous character stands smiling at the stone entrance to a magical, glowing forest path. The character's ready for the journey, accompanied by a friendly ally character.",
  3: "The character and fox ally companion character pause on a mossy stone path in a deeply enchanted, twilight forest. The character looks on with wide-eyed curiosity and a touch of awe, one hand slightly raised.",
  4: "The character stands in a powerful, slightly crouched pose on a mystical forest path, actively casting a swirling, blue-green magic from he/her outstretched hand. The character's gaze is intensely focused forward. The character stands in the left of fox companion character.",
  5: "The warm and welcoming character stands confidently on a cobblestone path before the open, ornate gates of a magnificent, brightly lit castle at night. With a radiant smile and open hands, the character gestures invitingly, accompanied by the character's happy fox companion. The character should stand on the left to the fox on my perspective."
};

function appendPageSpecificStoryRules(basePrompt: string, pageNumber: number): string {
  const allyPrompt = PAGE_ALLY_CHARACTER_PROMPTS[pageNumber];
  const posePrompt = PAGE_MAIN_CHARACTER_POSE_ACTION_EMOTION_PROMPTS[pageNumber];
  const sections: string[] = [basePrompt];

  if (allyPrompt) {
    sections.push(`PAGE-SPECIFIC ALLY CHARACTER RULE:\n- ${allyPrompt}`);
  }
  if (posePrompt) {
    sections.push(`PAGE-SPECIFIC MAIN CHARACTER POSE/ACTION/EMOTION RULE:\n- ${posePrompt}`);
  }

  return sections.join('\n\n');
}

function normalizeThemeKey(theme: string): string {
  return theme.replace(/[^a-z0-9]/gi, '').toLowerCase();
}

function resolveAllyNameFromPromptData(storyTheme: string | undefined, ageGroup: string): string {
  const promptData = prompt2Data as {
    generateStoryText?: {
      defaultTheme?: string;
      themeToAllyMapping?: Record<string, Record<string, string>>;
      storyTextGenerationPrompts?: Record<string, { storyVariablesByAgeGroup?: Record<string, { allyName?: string }> }>;
    };
  };
  const generateStoryText = promptData.generateStoryText;
  if (!generateStoryText) return 'Fox';

  const promptsByTheme = generateStoryText.storyTextGenerationPrompts ?? {};
  const allyMappingByTheme = generateStoryText.themeToAllyMapping ?? {};
  const themeCandidates = [storyTheme, generateStoryText.defaultTheme].filter((value): value is string => !!value);
  const normalizedPromptThemeEntries = Object.entries(promptsByTheme).map(([key, value]) => [normalizeThemeKey(key), value] as const);
  const normalizedAllyThemeEntries = Object.entries(allyMappingByTheme).map(([key, value]) => [normalizeThemeKey(key), value] as const);

  for (const themeCandidate of themeCandidates) {
    const promptTheme =
      promptsByTheme[themeCandidate] ??
      normalizedPromptThemeEntries.find(([normalizedKey]) => normalizedKey === normalizeThemeKey(themeCandidate))?.[1];
    const promptAllyName = promptTheme?.storyVariablesByAgeGroup?.[ageGroup]?.allyName;
    if (promptAllyName) return promptAllyName;

    const mappingTheme =
      allyMappingByTheme[themeCandidate] ??
      normalizedAllyThemeEntries.find(([normalizedKey]) => normalizedKey === normalizeThemeKey(themeCandidate))?.[1];
    const mappedAllyName = mappingTheme?.[ageGroup];
    if (mappedAllyName) return mappedAllyName;
  }

  return 'Fox';
}

export function buildStoryPagePrompt(
  pageNumber: number,
  storyText: string,
  characterAction: string,
  sceneDescription: string,
  options: {
    characterName: string;
    characterType: string;
    specialAbility: string;
    characterStyle: '3d' | 'cartoon' | 'anime';
    storyWorld: string;
    adventureType: string;
    ageGroup: string;
    storyTheme?: string;
    storyTitle: string;
    characterImageUrl: string;
  }
): string {
  const allyName = resolveAllyNameFromPromptData(options.storyTheme, options.ageGroup);
  const allyReplacementPrompt = TEMP_MAIN_STORY_PAGE_ALLY_CHARACTER_PROMPT
    ? TEMP_MAIN_STORY_PAGE_ALLY_CHARACTER_PROMPT.replace(/\[ally_name\]/g, allyName)
    : null;

  // TEMPORARY: use fixed base prompt for story page generation on /adventure-story/loading.
  // Unset TEMP_MAIN_STORY_PAGE_PROMPT (set to null) to use the prompt builder again.
  if (TEMP_MAIN_STORY_PAGE_PROMPT != null) {
    const fixedPrompt = allyReplacementPrompt
      ? `${TEMP_MAIN_STORY_PAGE_PROMPT}\n\n${allyReplacementPrompt}`
      : TEMP_MAIN_STORY_PAGE_PROMPT;
    return appendPageSpecificStoryRules(fixedPrompt, pageNumber);
  }

  const derivedEmotion = generateCharacterEmotion(pageNumber, storyText);
  const derivedAtmosphere = generateAtmosphereDescription(pageNumber, storyText);
  const enrichedSceneDescription = `${sceneDescription}. Atmosphere: ${derivedAtmosphere}`;

  const prompt = buildStoryScenePrompt({
    characterName: options.characterName,
    characterType: options.characterType,
    specialAbility: options.specialAbility,
    characterStyle: options.characterStyle,
    storyWorld: options.storyWorld,
    adventureType: options.adventureType,
    ageGroup: options.ageGroup,
    storyTitle: options.storyTitle,
    pageNumber,
    pageText: storyText,
    pageSceneDescription: enrichedSceneDescription,
    pageCharacterAction: characterAction,
    pageEmotion: derivedEmotion,
    companionCharacters: 'Fox',
    characterImageUrl: options.characterImageUrl,
    characterPlacement: 'left-half'
  });

  const basePromptWithRules = `${prompt}\n\nTEMPLATE LOCK (HIGHEST PRIORITY):\n- Keep the provided template artwork structurally unchanged.\n- Do not redesign background layout, props, perspective, camera, or composition.\n- If any instruction conflicts with template preservation, preserve the template and adapt only character integration.\n- Mood/style updates must be subtle and global (light/tone/color grading), not repainting.\n\nSTORY-TO-SCENE MAPPING (SECOND PRIORITY):\n- Use the exact page story text as the source of truth for action, emotion, and atmosphere.\n- Keep expressions, body language, and lighting aligned with this page's emotional beat.\n- If the story text implies calm or sleep, prefer gentle, natural poses over exaggerated action.\n\nPAGE STORY TEXT (SOURCE OF TRUTH):\n${storyText}\n\nSCENE SIGNALS DERIVED FROM STORY:\n- Character Action: ${characterAction}\n- Character Emotion: ${derivedEmotion}\n- Atmosphere: ${derivedAtmosphere}\n\nPOSE CONSTRAINTS:\n- Avoid static front-facing, T-pose, idle, or reference-sheet poses.\n- Use movement and posture that match the story beat (active, gentle, or sleepy as needed).\n- Body language and facial expression must reinforce the page emotion.\n\nFACIAL CONSISTENCY (CRITICAL ACROSS PAGES 1-5):\n- Keep the same core facial features from the reference in every story scene (face shape, eyes, eyebrows, nose, mouth, ears).\n- Do not add, remove, or swap facial features between pages (example: if the character has a visible nose, it must remain visible in all main story scenes).\n- Maintain recognizable facial proportions and feature placement while only changing expression for the page emotion.\n\nCOMPANION CONSTRAINTS:\n- Always include the fox companion with the main character in every story scene page (1-5).\n- The fox companion should be clearly visible and naturally interacting with the main character.\n\nLAYOUT CONSTRAINTS:\n- Always position the main character on the LEFT HALF of the page scene (for story pages 1-5).\n- Keep the character fully within the left half and preserve template composition.`;
  const promptWithAllyReplacement = allyReplacementPrompt
    ? `${basePromptWithRules}\n\n${allyReplacementPrompt}`
    : basePromptWithRules;

  return appendPageSpecificStoryRules(promptWithAllyReplacement, pageNumber);
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
export function generateCharacterAction(pageNumber: number, storyWorld: string, storyText?: string): string {
  const worldKey = (storyWorld || '').toLowerCase();
  const worldMotion = worldKey.includes('underwater') ? 'swimming' : worldKey.includes('space') ? 'floating and maneuvering' : 'running';
  const actions: { [key: number]: string } = {
    1: "Character is discovering or entering a new world with forward movement and curious body language",
    2: `Character is exploring the environment with active ${worldMotion} motion`,
    3: "Character is actively overcoming an obstacle in a dynamic mid-action pose (not static)",
    4: "Character is using their special ability to solve the main challenge in a powerful action pose",
    5: "Character is celebrating success or reflecting warmly with expressive movement"
  };

  const fallback = actions[pageNumber] || "Character is actively participating in the scene with clear movement";

  if (!storyText || storyText.trim().length === 0) {
    return fallback;
  }

  // Prefer a concrete action sentence from the page text when available.
  const actionSentence = storyText
    .split(/[.!?]/)
    .map((s) => s.trim())
    .find((s) => /(run|running|jump|jumping|climb|climbing|fly|flying|swim|swimming|use|using|open|opening|reach|reaching|rescue|help|helping|solve|solving|search|find|finding|follow|following|hold|holding|push|pull|dodge|celebrate|celebrating|breathe|breathing|settle|settling|nestle|nestled|relax|relaxing|drift|drifting|sleep|sleeping|rest|resting|whisper|whispering)/i.test(s));

  if (!actionSentence) {
    return fallback;
  }

  return `${actionSentence}. Use a storytelling pose with clear intent that matches the page mood (active when needed, gentle when sleepy).`;
}

/**
 * Derive character emotion from the generated story text.
 */
export function generateCharacterEmotion(pageNumber: number, storyText?: string): string {
  const defaultEmotions: { [key: number]: string } = {
    1: 'curious and emotionally open',
    2: 'safe and trusting',
    3: 'concerned but brave',
    4: 'peaceful pride',
    5: 'sleepy and content'
  };
  const fallback = defaultEmotions[pageNumber] || 'warm and engaged';

  if (!storyText || storyText.trim().length === 0) {
    return fallback;
  }

  const lower = storyText.toLowerCase();
  if (/(sleepy|drowsy|eyes.*(heavy|closing)|drift|dream)/.test(lower)) return 'drowsy, calm, and ready for sleep';
  if (/(peaceful|calm|settled|relaxed|safe)/.test(lower)) return 'calm, safe, and relaxed';
  if (/(sad|lonely|worried|anxious|too awake|restless)/.test(lower)) return 'tender concern with gentle reassurance';
  if (/(happy|smile|joy|proud|wonderful)/.test(lower)) return 'quiet joy and peaceful pride';
  if (/(wonder|curious|maybe|discover|learn)/.test(lower)) return 'curious and hopeful';

  return fallback;
}

/**
 * Derive atmosphere and visual mood from the generated story text.
 */
export function generateAtmosphereDescription(pageNumber: number, storyText?: string): string {
  const defaults: { [key: number]: string } = {
    1: 'soft twilight, gentle cozy lighting, inviting wonder',
    2: 'warm mentorship, calm pacing, safe and peaceful environment',
    3: 'empathetic guidance, focused calm, comforting support',
    4: 'quiet triumph, warm glow, peaceful connection',
    5: 'very soft moonlit bedtime calm, hushed and sleepy'
  };
  const fallback = defaults[pageNumber] || 'warm storybook atmosphere';

  if (!storyText || storyText.trim().length === 0) {
    return fallback;
  }

  const lower = storyText.toLowerCase();
  if (/(sleepy|drowsy|dream|whisper|moonlight|settled|nestled|eyes.*heavy)/.test(lower)) {
    return 'hushed bedtime mood, soft moonlight, slow quiet rhythm, sleep-inducing calm';
  }
  if (/(sad|lonely|worried|anxious|restless)/.test(lower)) {
    return 'gentle supportive atmosphere, tender lighting, emotionally safe and non-scary';
  }
  if (/(calm|peaceful|safe|breathe|breathing|relax)/.test(lower)) {
    return 'calming atmosphere with soft light, slow pace, and emotional safety';
  }
  if (/(smile|happy|joy|proud|wonderful|connection)/.test(lower)) {
    return 'warm, peaceful celebration with quiet joy and comforting light';
  }

  return fallback;
}

/**
 * Normalize story world to the keys used in worldDescriptions (forest, underwater, outerspace).
 */
function normalizeStoryWorldForDescriptions(storyWorld: string): string {
  const lower = (storyWorld || '').toLowerCase();
  if (lower.includes('forest') || lower === 'enchanted-forest' || lower === 'enchanted_forest') return 'forest';
  if (lower.includes('underwater') || lower.includes('kingdom')) return 'underwater';
  if (lower.includes('space') || lower.includes('outer')) return 'outerspace';
  return 'forest';
}

/**
 * Generate scene descriptions based on page number and story world
 */
export function generateSceneDescription(pageNumber: number, storyWorld: string, storyText?: string): string {
  const worldKey = normalizeStoryWorldForDescriptions(storyWorld);
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

  const descriptions = worldDescriptions[worldKey] || worldDescriptions['forest'];
  const baseDescription = descriptions[pageNumber] || `Scene ${pageNumber} in ${worldKey}`;
  
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
const getImageApiBaseUrl = (): string => {
  const base = env.PUBLIC_BACKEND_URL || '';
  return base.replace(/\/api\/?$/, '').replace(/\/$/, '') || 'https://image-edit-five.vercel.app';
};

export async function generateImageWithSingleTemplate(
  templateImageUrl: string,
  prompt: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const baseUrl = getImageApiBaseUrl();
    const response = await fetch(`${baseUrl}/edit-image`, {
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
    const baseUrl = getImageApiBaseUrl();
    const response = await fetch(`${baseUrl}/generate-cover-image`, {
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
      const errText = await response.text();
      throw new Error(`Failed to generate image: ${response.status}${errText ? ` - ${errText}` : ''}`);
    }
    
    const data = await response.json();
    // Accept both formats: GenerateCoverImageResponse (success, url) or ImageResponse (storage_info.url)
    const url = data.url ?? data.storage_info?.url;
    if (data.success && url) {
      return {
        success: true,
        url: String(url).split('?')[0]
      };
    }
    return {
      success: false,
      error: data.message || data.detail || 'No image URL received from API'
    };
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
  characterType?: string;
  specialAbility?: string;
  characterStyle?: '3d' | 'cartoon' | 'anime';
  adventureType?: string;
  ageGroup?: string;
  storyTitle?: string;
  onProgress?: (step: string, progress: number) => void;
  /** When true, only generate story page images (skip copyright, dedication, last word, back cover). */
  storyPagesOnly?: boolean;
  /** Optional: when true, abort the generation loop (e.g. user cancelled). */
  shouldAbort?: () => boolean;
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
    characterType = 'person',
    specialAbility = 'special ability',
    characterStyle = 'cartoon',
    adventureType = 'Treasure Hunt',
    ageGroup = '7-10',
    storyTitle = 'Adventure Story',
    onProgress,
    storyPagesOnly = false,
    shouldAbort
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
    const totalPages = validPages.length;
    // Keep strict page-index alignment (index 0 => page 1, ..., index 4 => page 5)
    // so a failed page generation never shifts later pages.
    const storyPageImages: string[] = new Array(totalPages).fill('');
    
    for (let i = 0; i < totalPages; i++) {
      if (shouldAbort?.()) {
        console.warn('Story page image generation aborted');
        break;
      }
      const page = validPages[i];
      
      if (!page || !page.text) {
        console.warn(`Skipping invalid page at index ${i}`);
        continue;
      }
      
      const pageNumber = page.pageNumber || (i + 1);
      const templateImage = bookTemplate.story_page_images?.[i];
      
      if (!templateImage) {
        console.warn(`No template image for story page ${pageNumber}`);
        // Fallback to character image so the page slot is never omitted.
        storyPageImages[i] = characterImageUrl;
        continue;
      }
      
      const progress = storyPagesOnly
        ? 10 + ((i + 1) / totalPages) * 90  // 10-100%
        : 30 + ((i + 1) / totalPages) * 40; // 30-70%
      if (onProgress) onProgress(`Generating story page ${pageNumber}...`, progress);
      
      try {
        const characterAction = generateCharacterAction(pageNumber, storyWorld, page.text);
        const sceneDescription = generateSceneDescription(pageNumber, storyWorld, page.text);
        const storyPagePrompt = buildStoryPagePrompt(pageNumber, page.text, characterAction, sceneDescription, {
          characterName,
          characterType,
          specialAbility,
          characterStyle,
          storyWorld,
          adventureType,
          ageGroup,
          storyTitle,
          characterImageUrl
        });
        
        let storyPageResult = await generateImageWithTwoTemplates(
          templateImage,
          characterImageUrl,
          storyPagePrompt
        );

        // Retry once for transient generation failures.
        if (!(storyPageResult.success && storyPageResult.url)) {
          console.warn(`Retrying story page ${pageNumber} generation once...`);
          storyPageResult = await generateImageWithTwoTemplates(
            templateImage,
            characterImageUrl,
            storyPagePrompt
          );
        }
        
        if (storyPageResult.success && storyPageResult.url) {
          storyPageImages[i] = storyPageResult.url;
          console.log(`✅ Story page ${pageNumber} generated successfully`);
        } else {
          console.error(`❌ Failed to generate story page ${pageNumber}:`, storyPageResult.error);
          // Keep page slot populated to avoid omission/shifting.
          storyPageImages[i] = templateImage;
        }
      } catch (error) {
        console.error(`❌ Error generating story page ${pageNumber}:`, error);
        // Keep page slot populated to avoid omission/shifting.
        storyPageImages[i] = templateImage;
        // Continue with next page even if one fails
      }
    }
    
    result.storyPageImageUrls = storyPageImages;
    const generatedCount = storyPageImages.filter((url) => !!url).length;
    console.log(`Generated ${generatedCount} out of ${totalPages} story page image slots`);
    
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
