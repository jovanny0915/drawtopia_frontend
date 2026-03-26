import promptStory from './prompt_story.json';

type AgeGroupKey = '3-6' | '7-10' | '11-12';

type PlaceholderValues = Record<string, string>;

interface PromptBuilderInput {
  ageGroup: AgeGroupKey;
  placeholderValues: PlaceholderValues;
}

interface StoryTemplate {
  master_story_architecture: {
    acts: Array<{
      act: number;
      pages: string;
      beat_name: string;
      core_story_function: string;
      learning_theme_influence: string;
    }>;
  };
  age_groups: Record<
    AgeGroupKey,
    {
      label: string;
      story_constraints: Record<string, string>;
      poetic_structure: {
        required: boolean;
        description: string;
      };
      development_notes?: string[];
      prompt_placeholders: string[];
      acts: Array<{
        act: number;
        pages: string;
        title: string;
        objective: Record<string, string>;
        key_dialogue_lines: string[];
        humor_or_magic_moments: string[];
        poetic_sample_template?: string[];
        prose_sample_template?: string[];
        lullaby_close_template?: string[];
        breath_mirror_close_template?: string[];
      }>;
      generation_prompt_template: {
        instructions: string[];
      };
    }
  >;
}

function toTokenKey(rawKey: string): string {
  const key = rawKey.trim();
  return key.startsWith('[') && key.endsWith(']') ? key : `[${key}]`;
}

function replacePlaceholdersInText(text: string, values: PlaceholderValues): string {
  return Object.entries(values).reduce((result, [rawKey, rawValue]) => {
    const token = toTokenKey(rawKey);
    return result.split(token).join(rawValue);
  }, text);
}

function replacePlaceholdersDeep<T>(value: T, values: PlaceholderValues): T {
  if (typeof value === 'string') {
    return replacePlaceholdersInText(value, values) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => replacePlaceholdersDeep(item, values)) as T;
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).map(([k, v]) => [
      k,
      replacePlaceholdersDeep(v, values)
    ]);
    return Object.fromEntries(entries) as T;
  }

  return value;
}

function formatMap(title: string, map: Record<string, string>): string {
  const lines = Object.entries(map).map(([k, v]) => `- ${k}: ${v}`);
  return `${title}\n${lines.join('\n')}`;
}

export function buildStoryGenerationPrompt(input: PromptBuilderInput): string {
  const storyTemplate = promptStory as StoryTemplate;
  const selectedAgeGroup = storyTemplate.age_groups[input.ageGroup];

  if (!selectedAgeGroup) {
    throw new Error(`Unsupported age group "${input.ageGroup}".`);
  }

  const architecture = replacePlaceholdersDeep(
    storyTemplate.master_story_architecture,
    input.placeholderValues
  );
  const ageGroupTemplate = replacePlaceholdersDeep(selectedAgeGroup, input.placeholderValues);

  const architectureSection = architecture.acts
    .map(
      (act) =>
        `Act ${act.act} (Pages ${act.pages}) - ${act.beat_name}\n` +
        `- Core story function: ${act.core_story_function}\n` +
        `- Learning theme influence: ${act.learning_theme_influence}`
    )
    .join('\n\n');

  const actsSection = ageGroupTemplate.acts
    .map((act) => {
      const objective = Object.entries(act.objective)
        .map(([k, v]) => `  - ${k}: ${v}`)
        .join('\n');
      const keyDialogue = act.key_dialogue_lines.map((line) => `  - ${line}`).join('\n');
      const magicMoments = act.humor_or_magic_moments.map((line) => `  - ${line}`).join('\n');
      const sampleTemplate =
        act.poetic_sample_template ||
        act.prose_sample_template ||
        act.lullaby_close_template ||
        act.breath_mirror_close_template ||
        [];
      const sample = sampleTemplate.map((line) => `  - ${line}`).join('\n');

      return (
        `Act ${act.act} (Pages ${act.pages}) - ${act.title}\n` +
        `- Objective:\n${objective}\n` +
        `- Key dialogue lines:\n${keyDialogue}\n` +
        `- Humor or magic moments:\n${magicMoments}\n` +
        `- Sample template:\n${sample}`
      );
    })
    .join('\n\n');

  const constraintsSection = formatMap('Story constraints:', ageGroupTemplate.story_constraints);
  const poeticStructureSection =
    `Poetic structure required: ${ageGroupTemplate.poetic_structure.required}\n` +
    `Poetic structure notes: ${ageGroupTemplate.poetic_structure.description}`;
  const generationInstructions = ageGroupTemplate.generation_prompt_template.instructions
    .map((instruction) => `- ${instruction}`)
    .join('\n');

  return [
    'You are writing the final story text for pages 4-13.',
    'Do not include prefixes like "Page X", "Pages X-X", or any similar page/range labels in the output text.',
    `Age group: ${input.ageGroup} (${ageGroupTemplate.label})`,
    '',
    'Resolved placeholders:',
    `- CHARACTER_NAME: ${input.placeholderValues.CHARACTER_NAME ?? ''}`,
    `- WORLD_NAME: ${input.placeholderValues.WORLD_NAME ?? ''}`,
    `- ALLY_NAME: ${input.placeholderValues.ALLY_NAME ?? ''}`,
    `- ALLY_TYPE: ${input.placeholderValues.ALLY_TYPE ?? ''}`,
    `- SPECIAL_ABILITY: ${input.placeholderValues.SPECIAL_ABILITY ?? ''}`,
    `- LEARNING_THEME: ${input.placeholderValues.LEARNING_THEME ?? ''}`,
    '',
    'Master story architecture:',
    architectureSection,
    '',
    constraintsSection,
    poeticStructureSection,
    '',
    ageGroupTemplate.development_notes?.length
      ? `Development notes:\n${ageGroupTemplate.development_notes.map((note) => `- ${note}`).join('\n')}`
      : '',
    '',
    'Act-by-act guidance:',
    actsSection,
    '',
    'Generation instructions:',
    generationInstructions,
    '',
    'Now generate only pages 4-13 as the final story output.'
  ]
    .filter(Boolean)
    .join('\n');
}

export function sampleCompositedPrompt(): string {
  return buildStoryGenerationPrompt({
    ageGroup: '7-10',
    placeholderValues: {
      CHARACTER_NAME: 'Milo',
      WORLD_NAME: 'Moonreef',
      ALLY_NAME: 'Nova',
      ALLY_TYPE: 'star otter',
      SPECIAL_ABILITY: 'Echo Glow',
      LEARNING_THEME: 'Courage'
    }
  });
}
import prompt1Data from './prompt1.json';

interface PromptBuilderOptions {
  characterName: string;
  characterType: 'person' | 'animal' | 'magical';
  characterStyle: '3d' | 'cartoon' | 'anime';
  specialAbility: string;
  enhancementLevel: 'minimal' | 'normal' | 'high';
  ageGroup?: string;
  uploadedImageUrl?: string;
}

/**
 * Maps special ability values from the form to prompt1.json keys
 */
function mapSpecialAbilityKey(specialAbility: string): string {
  const mapping: { [key: string]: string } = {
    'healing-powers': 'healingPower',
    'flying': 'flying',
    'super-strength': 'superStrength',
    'invisibility': 'invisibility',
    'animal-communication': 'animalCommunication',
    'time-control': 'timeControl',
    'shape-shifting': 'shapeShifting',
    'custom': 'custom'
  };
  
  return mapping[specialAbility.toLowerCase()] || 'custom';
}

/**
 * Gets character type key for prompt1.json
 */
function getCharacterTypeKey(characterType: string): 'person' | 'animal' | 'magical' {
  const normalized = characterType.toLowerCase();
  if (normalized === 'magical' || normalized === 'magical_creature') {
    return 'magical';
  }
  return normalized as 'person' | 'animal';
}

/**
 * Replaces placeholders in a prompt template
 */
function replacePlaceholders(
  template: string,
  options: PromptBuilderOptions
): string {
  let result = template;
  
  result = result.replace(/\{character_name\}/g, options.characterName);
  result = result.replace(/\{character_type\}/g, options.characterType);
  result = result.replace(/\{special_ability\}/g, options.specialAbility);
  result = result.replace(/\{character_style\}/g, options.characterStyle);
  result = result.replace(/\{age_group\}/g, options.ageGroup || '7-10');
  result = result.replace(/\{uploaded_child_drawing\}/g, options.uploadedImageUrl || '[REFERENCE IMAGE]');
  
  return result;
}

/**
 * Builds a comprehensive enhancement prompt from prompt1.json
 * 
 * The prompt is built by combining:
 * 1. Base enhancement level prompt (minimal/normal/high)
 * 2. Base character type specifications
 * 3. Additional enhancement specifications (from additionalEnhancement) based on:
 *    - Enhancement level (normal/high only - minimal doesn't have additional specs)
 *    - Character type
 *    - Character style (3d/cartoon/anime)
 * 4. Base special ability specifications (from enhanceCharacter.specialAbility)
 * 
 * Note: Special ability prompts from additionalEnhancement are intentionally excluded
 * for character enhancement functionality.
 */
export function buildEnhancementPrompt(options: PromptBuilderOptions): string {
  const { characterType, characterStyle, specialAbility, enhancementLevel } = options;
  
  // Get base enhancement level prompt (minimal/normal/high)
  const basePrompt = (prompt1Data as any).enhanceCharacter?.enhancementLevel?.[enhancementLevel] || '';
  
  // Get character type specifications (base specs, always included)
  const characterTypeKey = getCharacterTypeKey(characterType);
  const characterTypeSpecs = (prompt1Data as any).enhanceCharacter?.characterType?.[characterTypeKey] || '';
  
  // Get additional enhancement specs based on enhancement level (normal/high)
  // Note: minimal level doesn't have additionalEnhancement, which is fine
  const additionalEnhancement = (prompt1Data as any).enhanceCharacter?.additionalEnhancement?.[enhancementLevel];
  
  // Get additional character type specs from additionalEnhancement (if exists and has content)
  const additionalCharacterTypeSpecs = additionalEnhancement?.characterType?.[characterTypeKey];
  const hasAdditionalCharacterTypeSpecs = additionalCharacterTypeSpecs && additionalCharacterTypeSpecs.trim().length > 0;
  
  // Get style specifications from additionalEnhancement (if exists and has content)
  const styleSpecs = additionalEnhancement?.characterStyle?.[characterStyle];
  const hasStyleSpecs = styleSpecs && styleSpecs.trim().length > 0;
  
  // Map and get special ability specifications from base enhanceCharacter.specialAbility
  // Note: Special ability prompts from additionalEnhancement are intentionally excluded
  const abilityKey = mapSpecialAbilityKey(specialAbility);
  let specialAbilitySpecs = (prompt1Data as any).enhanceCharacter?.specialAbility?.[abilityKey] || '';
  
  // If it's a custom ability and no predefined specs exist, create a custom description
  if (abilityKey === 'custom' && !specialAbilitySpecs && specialAbility && specialAbility.trim()) {
    specialAbilitySpecs = `CUSTOM SPECIAL ABILITY: ${specialAbility}\n\nApply this custom ability visually to the character, making it clear and appropriate for the character type and style.`;
  }
  
  // Build the combined prompt
  const promptParts: string[] = [];
  
  // 1. Base enhancement level prompt (with placeholders replaced)
  if (basePrompt && basePrompt.trim().length > 0) {
    promptParts.push(replacePlaceholders(basePrompt, options));
  }
  
  // 2. Base character type specifications (always included if exists)
  if (characterTypeSpecs && characterTypeSpecs.trim().length > 0) {
    promptParts.push(`\n\nCHARACTER TYPE SPECIFICATIONS:\n${characterTypeSpecs}`);
  }
  
  // 3. Additional character type specifications from additionalEnhancement (based on enhancement level)
  if (hasAdditionalCharacterTypeSpecs) {
    promptParts.push(`\n\n${replacePlaceholders(additionalCharacterTypeSpecs, options)}`);
  }
  
  // 4. Style specifications from additionalEnhancement (based on enhancement level and character style)
  if (hasStyleSpecs) {
    promptParts.push(`\n\n${replacePlaceholders(styleSpecs, options)}`);
  }
  
  // 5. Base special ability specifications (always included if exists)
  // Note: Special ability prompts from additionalEnhancement are intentionally excluded
  // if (specialAbilitySpecs && specialAbilitySpecs.trim().length > 0) {
  //   promptParts.push(`\n\n${specialAbilitySpecs}`);
  // }
  
  // Combine all parts
  const finalPrompt = promptParts.join('');
  
  return finalPrompt;
}

/**
 * Gets a simplified prompt for quick reference
 */
export function getPromptSummary(options: PromptBuilderOptions): string {
  return `Enhance ${options.characterName} (${options.characterType}) with ${options.specialAbility} ability in ${options.characterStyle} style at ${options.enhancementLevel} level`;
}

/**
 * Maps world values to display names
 */
function getWorldDisplayName(world: string): string {
  const worldMapping: { [key: string]: string } = {
    "forest": "Enchanted Forest",
    "enchanted-forest": "Enchanted Forest",
    "enchanted_forest": "Enchanted Forest",
    "outerspace": "Outer Space",
    "outer-space": "Outer Space",
    "outer_space": "Outer Space",
    "underwater": "Underwater Kingdom",
    "underwater-kingdom": "Underwater Kingdom",
    "underwater_kingdom": "Underwater Kingdom"
  };
  return worldMapping[world.toLowerCase()] || world;
}

/**
 * Fixed ally name for the chosen story world only (not learning theme or art style).
 * Forest → Fern, underwater → Coral, outer space → Nova.
 */
export function getAllyNameForStoryWorld(storyWorld: string): string {
  const lower = (storyWorld || '').toLowerCase();
  if (lower.includes('underwater') || lower.includes('kingdom')) return 'Coral';
  if (lower.includes('space') || lower.includes('outer')) return 'Nova';
  return 'Fern';
}

/**
 * Maps world values to prompt1.json keys for story text
 */
function getStoryWorldKey(world: string): string {
  const worldMapping: { [key: string]: string } = {
    "forest": "enchantedForest",
    "enchanted-forest": "enchantedForest",
    "enchanted_forest": "enchantedForest",
    "outerspace": "outerSpace",
    "outer-space": "outerSpace",
    "outer_space": "outerSpace",
    "underwater": "underwaterKingdom",
    "underwater-kingdom": "underwaterKingdom",
    "underwater_kingdom": "underwaterKingdom"
  };
  return worldMapping[world.toLowerCase()] || "enchantedForest";
}

function normalizeStoryThemeKey(storyTheme?: string): string {
  if (!storyTheme) return 'kindnessEmpathy';
  const normalized = storyTheme.trim().toLowerCase();

  if (
    normalized === 'kindnessempathy' ||
    normalized === 'kindness_empathy' ||
    normalized === 'kindness-empathy'
  ) {
    return 'kindnessEmpathy';
  }

  if (
    normalized === 'bedtimeroutinesleephygiene' ||
    normalized === 'bedtime_routine_sleep_hygiene' ||
    normalized === 'bedtime-routine-sleep-hygiene'
  ) {
    return 'bedtimeRoutineSleepHygiene';
  }

  return storyTheme;
}

function compactStoryTextPageTemplate(template: string, pageNum: number): string {
  let compacted = template.replace(/\r\n/g, '\n');

  // Remove repeated variable sections from each page; variables are added once globally.
  compacted = compacted
    .replace(/^VARIABLES:\s*$/gim, '')
    .replace(/^\[[A-Z_]+\]\s*=\s*.*$/gim, '');

  // Remove repeated per-page generation cue and keep one global cue.
  compacted = compacted.replace(/^\s*Generate the story text now\.?\s*$/gim, '');

  // Shorten long page heading variants while preserving page index context.
  compacted = compacted.replace(
    /^PAGE\s+\d+\s+PROMPT\s*\([^)]*\):\s*$/im,
    `PAGE ${pageNum}:`
  );

  // Normalize excessive blank lines introduced by cleanup.
  compacted = compacted.replace(/\n{3,}/g, '\n\n').trim();

  return compacted;
}

/**
 * Replaces placeholders in story text prompts
 */
function replaceStoryTextPlaceholders(
  template: string,
  options: StoryTextGenerationPromptOptions
): string {
  let result = template;
  
  result = result.replace(/\{character_name\}/g, options.characterName);
  result = result.replace(/\{character_type\}/g, options.characterType);
  result = result.replace(/\{special_ability\}/g, options.specialAbility);
  result = result.replace(/\{character_style\}/g, options.characterStyle);
  result = result.replace(/\{story_world\}/g, options.storyWorld);
  result = result.replace(/\{adventure_type\}/g, options.adventureType);
  result = result.replace(/\{occasion_theme\}/g, options.occasionTheme || 'general');
  result = result.replace(/\{age_group\}/g, options.ageGroup);
  result = result.replace(/\{reading_level\}/g, options.readingLevel);
  result = result.replace(/\{story_title\}/g, options.storyTitle);
  result = result.replace(/\{page_number\}/g, String(options.pageNumber));
  result = result.replace(/\{child's character name\}/g, options.characterName);
  result = result.replace(/\[CHARACTER_NAME\]/g, options.characterName);
  result = result.replace(/\[WORLD_NAME\]/g, getWorldDisplayName(options.storyWorld));
  
  const adventureDisplay = getAdventureTypeDisplayName(options.adventureType);
  result = result.replace(/\{adventure_objective\}/g, adventureDisplay.toLowerCase());
  
  return result;
}

/**
 * Builds a story text generation prompt from the new theme/age prompt structure.
 */
export function buildStoryTextPrompt(options: StoryTextGenerationPromptOptions): string {
  const storyText = (prompt1Data as any).generateStoryText;
  if (!storyText) {
    throw new Error('generateStoryText not found in prompt1.json');
  }

  const storyPromptConfig = storyText.storyTextGenerationPrompts;
  if (!storyPromptConfig) {
    throw new Error('storyTextGenerationPrompts not found in generateStoryText');
  }

  const defaultTheme = storyText.defaultTheme || 'kindnessEmpathy';
  const requestedTheme = normalizeStoryThemeKey(options.storyTheme);
  const resolvedThemeKey = storyPromptConfig[requestedTheme]
    ? requestedTheme
    : storyPromptConfig[defaultTheme]
    ? defaultTheme
    : Object.keys(storyPromptConfig)[0];

  if (!resolvedThemeKey) {
    throw new Error('No story text themes configured in prompt1.json');
  }

  const selectedTheme = storyPromptConfig[resolvedThemeKey];
  const ageRanges = selectedTheme?.ageRanges || {};
  const selectedAgeRange = ageRanges[options.ageGroup] || ageRanges['7-10'] || Object.values(ageRanges)[0];
  if (!selectedAgeRange) {
    throw new Error(`No prompts found for age group ${options.ageGroup} in theme ${resolvedThemeKey}`);
  }

  const themeVariables = selectedAgeRange.variables || {};
  const pagePrompts = selectedAgeRange.pages || {};
  const allyNameForWorld = getAllyNameForStoryWorld(options.storyWorld);
  const promptParts: string[] = [];
  const sharedVariables: Array<{ key: string; value: string }> = [
    { key: 'CHARACTER_NAME', value: options.characterName },
    { key: 'WORLD_NAME', value: getWorldDisplayName(options.storyWorld) },
    { key: 'LEARNING_THEME', value: themeVariables.learningTheme || selectedTheme.themeName || '' },
    { key: 'ALLY_NAME', value: allyNameForWorld },
    { key: 'OBSTACLE', value: themeVariables.obstacle || '' },
    { key: 'BUNNY_NAME', value: themeVariables.bunnyName || 'Little Bunny' }
  ].filter(({ value }) => typeof value === 'string' && value.trim().length > 0);

  promptParts.push(
    `You are an expert children's bedtime story author. Write exactly 5 pages in order, following the page prompts below.
\nOUTPUT FORMAT REQUIREMENTS:
- Return exactly 5 paragraphs, one per page, in order
- Separate each page with exactly one blank line
- Do NOT include labels like "PAGE 1", headings, or bullet points
- Do NOT include any page/range prefixes in story text (for example: "Page 1", "Pages 4-5", "Page 4-5", "pages 8-9")
- Keep continuity across all pages (same characters, tone, and story arc)`
  );

  promptParts.push(
    `\n\nSTORY THEME:
- Theme Key: ${resolvedThemeKey}
- Theme Name: ${selectedTheme.themeName || ''}
- Age Group: ${options.ageGroup}`
  );

  if (sharedVariables.length > 0) {
    promptParts.push(
      `\n\nSHARED VARIABLES (apply across all pages unless a page says otherwise):
${sharedVariables.map(({ key, value }) => `- [${key}] = ${value}`).join('\n')}`
    );
  }

  promptParts.push(
    '\n\nWrite all 5 pages now in a single response, following the page guidance below.'
  );

  for (let pageNum = 1; pageNum <= 5; pageNum++) {
    const pageKey = `page${pageNum}`;
    const template = pagePrompts[pageKey];
    if (typeof template !== 'string' || template.trim().length === 0) {
      continue;
    }

    const mergedTemplate = template
      .replace(/\[ALLY_NAME\]/g, allyNameForWorld)
      .replace(/\[LEARNING_THEME\]/g, themeVariables.learningTheme || selectedTheme.themeName || '')
      .replace(/\[OBSTACLE\]/g, themeVariables.obstacle || '')
      .replace(/\[BUNNY_NAME\]/g, themeVariables.bunnyName || 'Little Bunny');

    const compactTemplate = compactStoryTextPageTemplate(mergedTemplate, pageNum);
    promptParts.push(`\n\n${replaceStoryTextPlaceholders(compactTemplate, options)}`);
  }

  return promptParts.join('');
}

/**
 * Interface for story text generation prompt options
 */
export interface StoryTextGenerationPromptOptions {
  characterName: string
  characterType: string
  specialAbility: string
  characterStyle: '3d' | 'cartoon' | 'anime'
  storyWorld: string
  adventureType: string
  occasionTheme: string
  ageGroup: string
  readingLevel: string
  storyTitle: string
  pageNumber: number
  storyTheme?: string
}

/**
 * Interface for intersearch scene prompt options
 */
export interface IntersearchScenePromptOptions {
  sceneNumber: number
  storyTitle: string
  storyWorld: string
  characterName: string
  characterType: string
  characterStyle: '3d' | 'cartoon' | 'anime'
  specialAbility: string
  ageGroup: string
  sceneTitle: string
  sceneDescription: string
  characterActionForScene: string
  characterEmotionForScene: string
  storyContinuationForThisScene: string
}

/**
 * Builds an intersearch scene prompt based on the provided format
 */
export function buildIntersearchScenePrompt(options: IntersearchScenePromptOptions): string {
  const worldDisplay = getWorldDisplayName(options.storyWorld);

  return `SCENE INFORMATION:
- Scene Number: ${options.sceneNumber} (1-4)
- Book Title: "${options.storyTitle}"
- World: ${worldDisplay} (Enchanted Forest / Outer Space / Underwater Kingdom)
- Character to Find: ${options.characterName}, a ${options.characterType}
- Character Style: ${options.characterStyle}
- Character Special Ability: ${options.specialAbility}
- Target Age Group: ${options.ageGroup}
- Scene Title: "${options.sceneTitle}"


SCENE CONTEXT & NARRATIVE:

Scene Setting: ${options.sceneDescription}

Character's Action in This Scene: ${options.characterActionForScene}

Character's Emotional State: ${options.characterEmotionForScene}

Story Context: ${options.storyContinuationForThisScene}`;
}

/**
 * Interface for intersearch search adventure prompt options
 */
export interface IntersearchSearchAdventurePromptOptions {
  characterName: string
  characterType: string
  characterDescription: string
  characterStyle: '3d' | 'cartoon' | 'anime'
  storyWorld: string
  storyTitle: string
  ageGroup: string
  specialAbility: string
  characterReferenceImage?: string
}

/**
 * Maps world values to prompt1.json keys for intersearch
 */
function getWorldKey(world: string): string {
  const worldMapping: { [key: string]: string } = {
    "enchanted-forest": "enchantedForest",
    "outer-space": "outerSpace",
    "underwater-kingdom": "underwaterKingdom"
  };
  return worldMapping[world.toLowerCase()] || "enchantedForest";
}

/**
 * Maps difficulty to prompt1.json keys
 */
function getDifficultyKey(difficulty: string): string {
  const normalized = difficulty.toLowerCase();
  if (normalized === 'easy') return 'easy';
  if (normalized === 'medium') return 'medium';
  if (normalized === 'hard') return 'hard';
  return 'easy'; // default
}

/**
 * Replaces placeholders in intersearch prompts
 */
function replaceIntersearchPlaceholders(
  template: string,
  options: IntersearchSearchAdventurePromptOptions
): string {
  let result = template;
  
  result = result.replace(/\{character_name\}/g, options.characterName);
  result = result.replace(/\{character_type\}/g, options.characterType);
  result = result.replace(/\{character_description\}/g, options.characterDescription);
  result = result.replace(/\{character_style\}/g, options.characterStyle);
  result = result.replace(/\{story_world\}/g, options.storyWorld);
  result = result.replace(/\{story_title\}/g, options.storyTitle);
  result = result.replace(/\{age_group\}/g, options.ageGroup);
  result = result.replace(/\{character_reference_image\}/g, options.characterReferenceImage || '[REFERENCE IMAGE]');
  
  return result;
}

/**
 * Builds an intersearch cover prompt from prompt1.json
 * 
 * Combines:
 * 1. basePrompt from generateSearchAdventure.cover
 * 2. coverEnvironment based on world
 * 3. characterStyleSpecifications based on character style
 */
export function buildIntersearchCoverPrompt(
  options: IntersearchSearchAdventurePromptOptions
): string {
  const searchAdventure = (prompt1Data as any).generateSearchAdventure;
  if (!searchAdventure) {
    throw new Error('generateSearchAdventure not found in prompt1.json');
  }

  const cover = searchAdventure.cover;
  if (!cover) {
    throw new Error('cover not found in generateSearchAdventure');
  }

  const promptParts: string[] = [];

  // 0. BOOK INFORMATION (at the head)
  const worldDisplay = getWorldDisplayName(options.storyWorld);
  const bookInfo = `BOOK INFORMATION:
 - Book Title: "${options.storyTitle || 'Adventure Story'}"
 - Format: Interactive Search Book (Where's Waldo style)
 - Character: ${options.characterName}, a ${options.characterType}
 - World: ${worldDisplay} (Enchanted Forest / Outer Space / Underwater Kingdom)
 - Art Style: ${options.characterStyle}
 - Target Age Group: ${options.ageGroup}`;
  promptParts.push(bookInfo);

  // 1. Base prompt
  const basePrompt = cover.basePrompt || '';
  if (basePrompt && basePrompt.trim().length > 0) {
    // Replace {character_description} placeholder with special ability
    let processedPrompt = replaceIntersearchPlaceholders(basePrompt, options);
    processedPrompt = processedPrompt.replace(/\{character_description\}/g, options.specialAbility || 'special abilities');
    promptParts.push(`\n\n${processedPrompt}`);
  }

  // 2. Cover environment based on world
  const worldKey = getWorldKey(options.storyWorld);
  const coverEnvironment = cover.coverEnvironment?.[worldKey];
  if (coverEnvironment && coverEnvironment.trim().length > 0) {
    promptParts.push(`\n\n${replaceIntersearchPlaceholders(coverEnvironment, options)}`);
  }

  // 3. Character style specifications
  const styleKey = options.characterStyle === '3d'
    ? '3d'
    : options.characterStyle === 'cartoon'
    ? 'cartoon'
    : 'anime';
  const styleSpecs = cover.characterStyleSpecifications?.[styleKey];
  if (styleSpecs && styleSpecs.trim().length > 0) {
    promptParts.push(`\n\n${replaceIntersearchPlaceholders(styleSpecs, options)}`);
  }

  // Combine all parts
  const finalPrompt = promptParts.join('');

  return finalPrompt;
}

/**
 * Builds an intersearch search adventure prompt from prompt1.json
 */
export function buildIntersearchSearchAdventurePrompt(
  options: IntersearchSearchAdventurePromptOptions & { sceneNumber: number; difficulty: string }
): string {
  const searchAdventure = (prompt1Data as any).generateSearchAdventure;
  if (!searchAdventure) {
    throw new Error('generateSearchAdventure not found in prompt1.json');
  }

  const promptParts: string[] = [];

  // 0. BOOK INFORMATION (at the head)
  const worldDisplay = getWorldDisplayName(options.storyWorld);
  const bookInfo = `BOOK INFORMATION:
 - Book Title: "${options.storyTitle || 'Adventure Story'}"
 - Format: Interactive Search Book (Where's Waldo style)
 - Character: ${options.characterName}, a ${options.characterType}
 - World: ${worldDisplay} (Enchanted Forest / Outer Space / Underwater Kingdom)
 - Art Style: ${options.characterStyle}
 - Target Age Group: ${options.ageGroup}
 - Scene Number: ${options.sceneNumber} (1-4)
 - Difficulty: ${options.difficulty}`;
  promptParts.push(bookInfo);

  // 1. Style specifications
  const styleSpecs = searchAdventure.styleSpecifications;
  const baseStyleSpec = styleSpecs?.base || '';
  const styleKey = options.characterStyle === '3d' ? '3d' : 
                   options.characterStyle === 'cartoon' ? 'cartoon' : 
                   'anime';
  const specificStyleSpec = styleSpecs?.[styleKey] || '';
  
  if (baseStyleSpec) {
    promptParts.push(`\n\n${replaceIntersearchPlaceholders(baseStyleSpec, options)}`);
  }
  if (specificStyleSpec) {
    promptParts.push(`\n\n${replaceIntersearchPlaceholders(specificStyleSpec, options)}`);
  }

  // 2. Complexity requirements based on difficulty
  const difficultyKey = getDifficultyKey(options.difficulty);
  const complexityReq = searchAdventure.complexityRequirements?.[difficultyKey];
  if (complexityReq && complexityReq.trim().length > 0) {
    promptParts.push(`\n\n${replaceIntersearchPlaceholders(complexityReq, options)}`);
  }

  // 3. Character actions based on scene number
  const characterActions = searchAdventure.characterActions;
  const sceneKey = `scene${options.sceneNumber}` as keyof typeof characterActions;
  const characterAction = characterActions?.[sceneKey];
  if (characterAction && characterAction.trim().length > 0) {
    promptParts.push(`\n\n${replaceIntersearchPlaceholders(characterAction, options)}`);
  }

  // 4. World-specific scene descriptions
  const worldKey = getWorldKey(options.storyWorld);
  const worldSpecific = searchAdventure.worldSpecific?.[worldKey];
  if (worldSpecific) {
    const sceneKey = `scene${options.sceneNumber}` as keyof typeof worldSpecific;
    const worldSceneDesc = worldSpecific[sceneKey];
    if (worldSceneDesc && worldSceneDesc.trim().length > 0) {
      promptParts.push(`\n\nWORLD-SPECIFIC SCENE:\n${worldSceneDesc}`);
    }
  }

  // Combine all parts
  const finalPrompt = promptParts.join('');

  return finalPrompt;
}

/**
 * Interface for story scene prompt options
 */
export interface StoryScenePromptOptions {
  characterName: string
  characterType: string
  specialAbility: string
  characterStyle: '3d' | 'cartoon' | 'anime'
  storyWorld: string
  adventureType: string
  ageGroup: string
  storyTitle: string
  pageNumber: number
  pageText: string
  characterImageUrl?: string
  pageSceneDescription?: string
  pageCharacterAction?: string
  pageEmotion?: string
  companionCharacters?: string
  characterPlacement?: 'left-half' | 'center' | 'right-half'
}

/**
 * Replaces placeholders in story scene prompts
 */
function replaceStoryScenePlaceholders(
  template: string,
  options: StoryScenePromptOptions
): string {
  let result = template;
  const resolvedSceneDescription = options.pageSceneDescription || '';
  const resolvedCharacterAction = options.pageCharacterAction || '';
  const resolvedCompanionCharacters = options.companionCharacters?.trim() || 'Fox';
  
  result = result.replace(/\{character_name\}/g, options.characterName);
  result = result.replace(/\{character_type\}/g, options.characterType);
  result = result.replace(/\{special_ability\}/g, options.specialAbility);
  result = result.replace(/\{character_style\}/g, options.characterStyle);
  result = result.replace(/\{story_world\}/g, options.storyWorld);
  result = result.replace(/\{adventure_type\}/g, options.adventureType);
  result = result.replace(/\{age_group\}/g, options.ageGroup);
  result = result.replace(/\{story_title\}/g, options.storyTitle);
  // Support both snake_case and camelCase placeholders for compatibility.
  result = result.replace(/\{page_number\}/g, String(options.pageNumber));
  result = result.replace(/\{pageNumber\}/g, String(options.pageNumber));
  result = result.replace(/\{story_page_text\}/g, options.pageText);
  result = result.replace(/\{storyText\}/g, options.pageText);
  result = result.replace(/\{sceneDescription\}/g, resolvedSceneDescription);
  result = result.replace(/\{characterAction\}/g, resolvedCharacterAction);
  result = result.replace(/\{companion_characters\}/g, resolvedCompanionCharacters);
  result = result.replace(/\{companionCharacters\}/g, resolvedCompanionCharacters);

  
  return result;
}

/**
 * Builds a story scene image generation prompt using prompt1.json
 * 
 * Combines:
 * 1. basePrompt from generateStoryScene
 * 2. characterConsistencyEnforcement
 * 3. negativePrompts
 * 4. styleKeywords
 * 5. characterStyleSpecifications based on character style
 * 6. worldSpecific based on world and page number
 * 7. pageSpecificRequirements
 */
export function buildStoryScenePrompt(options: StoryScenePromptOptions): string {
  const storyScene = (prompt1Data as any).generateStoryScene;
  if (!storyScene) {
    throw new Error('generateStoryScene not found in prompt1.json');
  }

  const promptParts: string[] = [];

  // 1. Base prompt
  const basePrompt = storyScene.basePrompt || '';
  if (basePrompt && basePrompt.trim().length > 0) {
    promptParts.push(replaceStoryScenePlaceholders(basePrompt, options));
  }

  // 2. Character consistency enforcement
  const consistencyEnforcement = storyScene.characterConsistencyEnforcement;
  if (consistencyEnforcement && consistencyEnforcement.trim().length > 0) {
    promptParts.push(`\n\n${replaceStoryScenePlaceholders(consistencyEnforcement, options)}`);
  }

  // 2.5 Template preservation priority (highest-level guardrail for compositing flow)
  const templatePreservationPriority = storyScene.templatePreservationPriority;
  if (templatePreservationPriority && templatePreservationPriority.trim().length > 0) {
    promptParts.push(`\n\n${replaceStoryScenePlaceholders(templatePreservationPriority, options)}`);
  }

  // 3. Style specifications based on character style
  const styleKey = options.characterStyle === '3d' ? '3d' : 
                   options.characterStyle === 'cartoon' ? 'cartoon' : 
                   options.characterStyle === 'anime' ? 'anime' : 'cartoon';
  const styleSpecs = storyScene.characterStyleSpecifications?.[styleKey];
  if (styleSpecs && styleSpecs.trim().length > 0) {
    promptParts.push(`\n\n${replaceStoryScenePlaceholders(styleSpecs, options)}`);
  }

  // 4. World-specific environment details based on page number
  const worldKey = getStoryWorldKey(options.storyWorld);
  const worldSpecific = storyScene.worldSpecific?.[worldKey];
  if (worldSpecific) {
    const pageKey = `page${options.pageNumber}` as keyof typeof worldSpecific;
    const worldPageDesc = worldSpecific?.[pageKey];
    if (worldPageDesc && worldPageDesc.trim().length > 0) {
      promptParts.push(`\n\n${replaceStoryScenePlaceholders(worldPageDesc, options)}`);
    }
  }

  // 5. Page-specific requirements
  const pageSpecificReq = storyScene.pageSpecificRequirements;
  if (pageSpecificReq && pageSpecificReq.trim().length > 0) {
    promptParts.push(`\n\n${replaceStoryScenePlaceholders(pageSpecificReq, options)}`);
  }

  // 6. Companion requirements (default companion is Fox)
  const companionReq = storyScene.companionRequirements;
  if (companionReq && companionReq.trim().length > 0) {
    promptParts.push(`\n\n${replaceStoryScenePlaceholders(companionReq, options)}`);
  }

  // 7. Additional context if provided
  if (options.pageSceneDescription) {
    promptParts.push(`\n\nADDITIONAL SCENE DESCRIPTION: ${options.pageSceneDescription}`);
  }
  
  if (options.pageCharacterAction) {
    promptParts.push(`\n\nCHARACTER ACTION: ${options.pageCharacterAction}`);
  }
  
  if (options.pageEmotion) {
    promptParts.push(`\n\nCHARACTER EMOTION: ${options.pageEmotion}`);
  }
  
  const defaultCompanion = (storyScene.defaultCompanion || 'Fox').trim();
  const resolvedCompanion = options.companionCharacters?.trim() || defaultCompanion;
  promptParts.push(`\n\nCOMPANION CHARACTERS: ${resolvedCompanion}`);

  // 8. Character reference image instructions
  if (options.characterImageUrl) {
    promptParts.push(`\n\nCHARACTER REFERENCE IMAGE:
- A reference image of ${options.characterName} is provided
- Use this reference image to maintain consistent character appearance across all scenes
- The character in the scene must match the appearance, style, and features shown in the reference image
- Keep the character's visual identity consistent with the reference image`);
  }

  // 9. Character placement constraints (defaults to left-half for story main pages).
  const placement = options.characterPlacement || 'left-half';
  if (placement === 'left-half') {
    promptParts.push(`\n\nCHARACTER PLACEMENT REQUIREMENTS:
- Place the main character in the LEFT HALF of the template scene (x-position roughly 0-50% of canvas width)
- Keep the character's full body entirely inside the left half; do not cross the center line
- Preserve original template composition; only adjust character position/scale inside the left section
- If scene depth is needed, keep depth variation but anchor horizontal placement to the left half`);
  } else if (placement === 'right-half') {
    promptParts.push(`\n\nCHARACTER PLACEMENT REQUIREMENTS:
- Place the main character in the RIGHT HALF of the template scene (x-position roughly 50-100% of canvas width)
- Keep the character's full body entirely inside the right half; do not cross the center line`);
  } else {
    promptParts.push(`\n\nCHARACTER PLACEMENT REQUIREMENTS:
- Place the main character near the center while preserving template composition`);
  }

  // 10. Negative prompts
  const negativePrompts = storyScene.negativePrompts;
  if (negativePrompts && negativePrompts.trim().length > 0) {
    promptParts.push(`\n\n${replaceStoryScenePlaceholders(negativePrompts, options)}`);
  }

  // Combine all parts
  const finalPrompt = promptParts.join('');

  return finalPrompt;
}

/**
 * Maps story world to dedication prompt key in prompt1.json
 */
function getDedicationWorldKey(storyWorld: string): string {
  const worldLower = storyWorld.toLowerCase();
  if (worldLower.includes('outer') || worldLower.includes('space')) {
    return 'outerspace';
  }
  if (worldLower.includes('forest') || worldLower.includes('enchanted')) {
    return 'forest';
  }
  if (worldLower.includes('underwater') || worldLower.includes('ocean') || worldLower.includes('sea')) {
    return 'underwater';
  }
  return 'forest'; // default
}

/**
 * Interface for story adventure cover prompt options
 */
export interface StoryAdventureCoverPromptOptions {
  characterName: string
  characterType: string
  characterStyle: '3d' | 'cartoon' | 'anime'
  storyWorld: string
  adventureType: string
  ageGroup: string
  storyTitle: string
  characterImageUrl?: string
}

/**
 * Maps story world to cover environment key in prompt1.json
 */
function getStoryWorldKeyForCover(storyWorld: string): string {
  const worldLower = storyWorld.toLowerCase();
  if (worldLower.includes('outer') || worldLower.includes('space')) {
    return 'outerSpace';
  }
  if (worldLower.includes('forest') || worldLower.includes('enchanted')) {
    return 'enchantedForest';
  }
  if (worldLower.includes('underwater') || worldLower.includes('ocean') || worldLower.includes('sea')) {
    return 'underwaterKingdom';
  }
  return 'enchantedForest'; // default
}

/**
 * Gets display name for story world
 */
function getStoryWorldDisplayName(storyWorld: string): string {
  const worldKey = getStoryWorldKeyForCover(storyWorld);
  const displayMapping: { [key: string]: string } = {
    'enchantedForest': 'Enchanted Forest',
    'outerSpace': 'Outer Space',
    'underwaterKingdom': 'Underwater Kingdom'
  };
  return displayMapping[worldKey] || 'Enchanted Forest';
}

/**
 * Gets display name for adventure type
 */
function getAdventureTypeDisplayName(adventureType: string): string {
  const adventureLower = adventureType.toLowerCase();
  if (adventureLower.includes('treasure')) {
    return 'Treasure Hunt';
  }
  if (adventureLower.includes('help') || adventureLower.includes('friend')) {
    return 'Helping a Friend';
  }
  return 'Adventure';
}

/**
 * Replaces placeholders in story adventure cover prompts
 */
function replaceStoryCoverPlaceholders(
  template: string,
  options: StoryAdventureCoverPromptOptions
): string {
  let result = template;
  
  result = result.replace(/\{character_name\}/g, options.characterName);
  result = result.replace(/\{character_style\}/g, options.characterStyle);
  result = result.replace(/\{story_world\}/g, options.storyWorld);
  
  return result;
}

/**
 * Builds the template-based story cover compositing prompt from prompt1.json
 */
export function buildTemplateCompositeCoverPrompt(
  options: StoryAdventureCoverPromptOptions
): string {
  const storyScene = (prompt1Data as any).generateStoryScene;
  if (!storyScene) {
    throw new Error('generateStoryScene not found in prompt1.json');
  }

  const cover = storyScene.cover;
  if (!cover) {
    throw new Error('cover not found in generateStoryScene');
  }

  const templateCompositePrompt = cover.templateCompositePrompt;
  if (!templateCompositePrompt || templateCompositePrompt.trim().length === 0) {
    throw new Error('templateCompositePrompt not found in generateStoryScene.cover');
  }

  let result = templateCompositePrompt;
  result = result.replace(/\{character_name\}/g, options.characterName);
  result = result.replace(/\{character_type\}/g, options.characterType);
  result = result.replace(/\{character_style\}/g, options.characterStyle);
  result = result.replace(/\{story_world\}/g, options.storyWorld);
  result = result.replace(/\{age_group\}/g, options.ageGroup);
  result = result.replace(/\{story_title\}/g, options.storyTitle || 'Adventure Story');

  return result;
}

/**
 * Builds a story adventure cover prompt from prompt1.json
 * 
 * Combines:
 * 1. basePrompt from generateStoryScene.cover
 * 2. coverEnvironment based on world
 * 3. characterStyleSpecifications based on character style
 */
export function buildStoryAdventureCoverPrompt(
  options: StoryAdventureCoverPromptOptions
): string {
  const storyScene = (prompt1Data as any).generateStoryScene;
  if (!storyScene) {
    throw new Error('generateStoryScene not found in prompt1.json');
  }

  const cover = storyScene.cover;
  if (!cover) {
    throw new Error('cover not found in generateStoryScene');
  }

  const promptParts: string[] = [];

  // 0. BOOK INFORMATION (at the head)
  const worldDisplay = getStoryWorldDisplayName(options.storyWorld);
  const adventureDisplay = getAdventureTypeDisplayName(options.adventureType);
  const bookInfo = `BOOK INFORMATION:
- Book Title: "${options.storyTitle || 'Adventure Story'}"
- Format: Story Adventure Book (5-page narrative)
- Character: ${options.characterName}, a ${options.characterType}
- World: ${worldDisplay} (Enchanted Forest / Outer Space / Underwater Kingdom)
- Adventure: ${adventureDisplay} (Treasure Hunt / Helping a Friend)
- Art Style: ${options.characterStyle}
- Target Age Group: ${options.ageGroup}`;
  promptParts.push(bookInfo);

  // 1. Base prompt
  const basePrompt = cover.basePrompt || '';
  if (basePrompt && basePrompt.trim().length > 0) {
    let processedPrompt = replaceStoryCoverPlaceholders(basePrompt, options);
    promptParts.push(`\n\n${processedPrompt}`);
  }

  // 2. Cover environment based on world
  const worldKey = getStoryWorldKeyForCover(options.storyWorld);
  const coverEnvironment = cover.coverEnvironment?.[worldKey];
  if (coverEnvironment && coverEnvironment.trim().length > 0) {
    promptParts.push(`\n\n${replaceStoryCoverPlaceholders(coverEnvironment, options)}`);
  }

  // 3. Character style specifications
  const styleKey = options.characterStyle === '3d' ? '3d' : 
                   options.characterStyle === 'cartoon' ? 'cartoon' : 
                   options.characterStyle === 'anime' ? 'anime' : 'cartoon';
  const styleSpecs = cover.characterStyleSpecifications?.[styleKey];
  if (styleSpecs && styleSpecs.trim().length > 0) {
    promptParts.push(`\n\n${styleSpecs}`);
  }

  // 4. Character reference image instructions
  if (options.characterImageUrl) {
    promptParts.push(`\n\nCHARACTER REFERENCE IMAGE:
- A reference image of ${options.characterName} is provided
- Use this reference image to maintain consistent character appearance
- The character in the cover must match the appearance, style, and features shown in the reference image
- Keep the character's visual identity consistent with the reference image`);
  }

  // Combine all parts
  const finalPrompt = promptParts.join('');

  return finalPrompt;
}

/**
 * Builds a dedication scene prompt from prompt1.json based on story world
 * 
 * @param storyWorld - The story world (e.g., "enchanted-forest", "outer-space", "underwater-kingdom")
 * @returns The dedication scene prompt string
 */
export function buildDedicationScenePrompt(storyWorld: string): string {
  const dedication = (prompt1Data as any).dedication;
  if (!dedication) {
    throw new Error('dedication not found in prompt1.json');
  }

  const worldKey = getDedicationWorldKey(storyWorld);
  const dedicationPrompt = dedication[worldKey];
  
  if (!dedicationPrompt || dedicationPrompt.trim().length === 0) {
    // Fallback to forest if prompt not found
    return dedication.forest || '';
  }

  return dedicationPrompt;
}
