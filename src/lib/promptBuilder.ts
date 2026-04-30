import { getPrompt1Data } from './promptRuntime';

function getPromptBuilderTemplates(): Record<string, any> {
  return (getPrompt1Data().promptBuilderTemplates || {}) as Record<string, any>;
}

function renderPromptBuilderTemplate(key: string, replacements: Record<string, string>): string {
  const template = getPromptBuilderTemplates()[key];
  if (typeof template !== 'string' || template.trim().length === 0) {
    throw new Error(`promptBuilderTemplates.${key} not found in prompt1.json`);
  }
  return replaceTemplateVariables(template, replacements);
}

function renderPromptBuilderNestedTemplate(
  key: string,
  nestedKey: string,
  replacements: Record<string, string>
): string {
  const group = getPromptBuilderTemplates()[key];
  const template = group?.[nestedKey];
  if (typeof template !== 'string' || template.trim().length === 0) {
    throw new Error(`promptBuilderTemplates.${key}.${nestedKey} not found in prompt1.json`);
  }
  return replaceTemplateVariables(template, replacements);
}

interface PromptBuilderOptions {
  characterName: string;
  characterType: 'person' | 'animal' | 'magical';
  characterStyle: '3d' | 'cartoon' | 'anime';
  specialAbility: string;
  enhancementLevel: 'minimal' | 'normal' | 'high';
  ageGroup?: string;
  uploadedImageUrl?: string;
  originalColors?: string;
  distinctiveFeatures?: string;
  facialExpression?: string;
  proportions?: string;
}

interface EnhanceCharacterPromptConfig {
  characterType?: Record<'person' | 'animal' | 'magical', string>;
  characterStyle?: Record<'3d' | 'cartoon' | 'anime', string>;
  specialAbility?: Record<string, string>;
  enhancementLevel?: Record<'initial' | 'minimal' | 'normal' | 'high', string>;
  referencePreservation?: Record<'originalColors' | 'distinctiveFeatures' | 'facialExpression' | 'proportions', string>;
  additionalGuidance?: Record<'colorEnhancement' | 'featurePreservation' | 'expressionFidelity' | 'noReplacement' | 'sceneComplexity', string>;
  additionalEnhancement?: Record<
    'normal' | 'high',
    {
      characterType?: Record<'person' | 'animal' | 'magical', string>;
      characterStyle?: Record<'3d' | 'cartoon' | 'anime', string>;
      specialAbility?: Record<string, string>;
    }
  >;
}

function mapSpecialAbilityKey(specialAbility: string): string {
  const mapping: { [key: string]: string } = {
    'healing-powers': 'healingPower',
    'flying': 'flying',
    'super-strength': 'superStrength',
    'invisibility': 'invisibility',
    'animal-communication': 'animalCommunication',
    'time-control': 'timeControl',
    'shape-shifting': 'shapeShifting',
    'magic-casting': 'magicCasting',
    'magic casting': 'magicCasting',
    'none': 'none',
    'custom': 'custom'
  };
  
  return mapping[specialAbility.toLowerCase().trim()] || 'custom';
}

function getCharacterTypeKey(characterType: string): 'person' | 'animal' | 'magical' {
  const normalized = characterType.toLowerCase();
  if (normalized === 'magical' || normalized === 'magical_creature') {
    return 'magical';
  }
  return normalized as 'person' | 'animal';
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceTemplateVariables(template: string, replacements: Record<string, string>): string {
  let result = template;

  for (const [rawKey, rawValue] of Object.entries(replacements)) {
    const value = rawValue ?? '';
    const keyVariants = new Set([
      rawKey,
      rawKey.toLowerCase(),
      rawKey.toUpperCase(),
      rawKey.replace(/([a-z])([A-Z])/g, '$1_$2'),
      rawKey.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase(),
      rawKey.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase()
    ]);

    for (const key of keyVariants) {
      const escapedKey = escapeRegExp(key);
      result = result.replace(new RegExp(`\\{${escapedKey}\\}`, 'g'), value);
      result = result.replace(new RegExp(`\\[${escapedKey}\\]`, 'g'), value);
    }
  }

  return result;
}

function replacePlaceholders(
  template: string,
  options: PromptBuilderOptions
): string {
  return replaceTemplateVariables(template, {
    characterName: options.characterName,
    characterType: options.characterType,
    specialAbility: options.specialAbility,
    characterStyle: options.characterStyle,
    ageGroup: options.ageGroup || '7-10',
    targetAgeGroup: options.ageGroup || '7-10',
    uploadedChildDrawing: options.uploadedImageUrl || '[REFERENCE IMAGE]',
    originalColors: options.originalColors || 'Infer the exact original colors directly from the reference image and preserve every one of them.',
    distinctiveFeatures: options.distinctiveFeatures || 'Infer every distinctive identifying feature directly from the reference image and preserve all of them.',
    facialExpression: options.facialExpression || 'Infer the facial expression directly from the reference image and preserve it clearly.',
    proportions: options.proportions || 'Infer the original proportions directly from the reference image and preserve them.'
  });
}

function buildReferencePreservationSummary(options: PromptBuilderOptions): Record<'originalColors' | 'distinctiveFeatures' | 'facialExpression' | 'proportions', string> {
  return {
    originalColors: options.originalColors || 'Infer the exact original colors from the reference image and preserve them exactly.',
    distinctiveFeatures: options.distinctiveFeatures || 'Infer all distinctive identifying features from the reference image and preserve every one of them.',
    facialExpression: options.facialExpression || 'Infer the original facial expression from the reference image and preserve it in the final result.',
    proportions: options.proportions || 'Infer the original body and feature proportions from the reference image and preserve them.'
  };
}

function buildExactReferencePreservationSection(
  referencePreservation: NonNullable<EnhanceCharacterPromptConfig['referencePreservation']>,
  options: PromptBuilderOptions
): string {
  const summary = buildReferencePreservationSummary(options);

  return renderPromptBuilderTemplate('referencePreservationSection', {
    original_colors_prompt: referencePreservation.originalColors,
    original_colors_resolved: summary.originalColors,
    distinctive_features_prompt: referencePreservation.distinctiveFeatures,
    distinctive_features_resolved: summary.distinctiveFeatures,
    facial_expression_prompt: referencePreservation.facialExpression,
    facial_expression_resolved: summary.facialExpression,
    proportions_prompt: referencePreservation.proportions,
    proportions_resolved: summary.proportions
  });
}

function buildExactAdditionalGuidanceSection(
  guidance: NonNullable<EnhanceCharacterPromptConfig['additionalGuidance']>,
  enhancementLevel: PromptBuilderOptions['enhancementLevel']
): string {
  return renderPromptBuilderTemplate('additionalGuidanceSection', {
    color_enhancement: guidance.colorEnhancement,
    feature_preservation: guidance.featurePreservation,
    expression_fidelity: guidance.expressionFidelity,
    no_replacement: guidance.noReplacement,
    scene_complexity: guidance.sceneComplexity,
    enhancement_level: enhancementLevel.toUpperCase()
  });
}

export function buildEnhancementPrompt(options: PromptBuilderOptions): string {
  const { characterType, characterStyle, specialAbility, enhancementLevel } = options;
  const enhanceCharacter = (getPrompt1Data().enhanceCharacter || {}) as EnhanceCharacterPromptConfig;
  
  const basePrompt = enhanceCharacter.enhancementLevel?.[enhancementLevel] || '';
  
  const characterTypeKey = getCharacterTypeKey(characterType);
  const characterTypeSpecs = enhanceCharacter.characterType?.[characterTypeKey] || '';
  const characterStyleSpecs = enhanceCharacter.characterStyle?.[characterStyle] || '';
  
  const additionalEnhancement = enhanceCharacter.additionalEnhancement?.[enhancementLevel as 'normal' | 'high'];
  
  const additionalCharacterTypeSpecs = additionalEnhancement?.characterType?.[characterTypeKey];
  const hasAdditionalCharacterTypeSpecs = additionalCharacterTypeSpecs && additionalCharacterTypeSpecs.trim().length > 0;
  
  const styleSpecs = additionalEnhancement?.characterStyle?.[characterStyle];
  const hasStyleSpecs = styleSpecs && styleSpecs.trim().length > 0;
  const additionalAbilitySpecs = additionalEnhancement?.specialAbility?.[mapSpecialAbilityKey(specialAbility)];
  const hasAdditionalAbilitySpecs = additionalAbilitySpecs && additionalAbilitySpecs.trim().length > 0;
  
  const abilityKey = mapSpecialAbilityKey(specialAbility);
  let specialAbilitySpecs = enhanceCharacter.specialAbility?.[abilityKey] || '';
  
  if (abilityKey === 'custom' && !specialAbilitySpecs && specialAbility && specialAbility.trim()) {
    specialAbilitySpecs = renderPromptBuilderTemplate('customSpecialAbility', {
      special_ability: specialAbility
    });
  }
  
  const promptParts: string[] = [];
  
  if (basePrompt && basePrompt.trim().length > 0) {
    promptParts.push(replacePlaceholders(basePrompt, options));
  }
  
  if (characterTypeSpecs && characterTypeSpecs.trim().length > 0) {
    promptParts.push(`\n\n${renderPromptBuilderTemplate('characterTypeSpecificationsSection', {
      section_content: characterTypeSpecs
    })}`);
  }

  if (characterStyleSpecs && characterStyleSpecs.trim().length > 0) {
    promptParts.push(`\n\n${renderPromptBuilderTemplate('characterStyleSpecificationsSection', {
      section_content: replacePlaceholders(characterStyleSpecs, options)
    })}`);
  }

  if (specialAbilitySpecs && specialAbilitySpecs.trim().length > 0) {
    promptParts.push(`\n\n${renderPromptBuilderTemplate('specialAbilitySpecificationsSection', {
      section_content: replacePlaceholders(specialAbilitySpecs, options)
    })}`);
  }
  
  if (hasAdditionalCharacterTypeSpecs) {
    promptParts.push(`\n\n${renderPromptBuilderTemplate('additionalCharacterTypeEnhancementSection', {
      section_content: replacePlaceholders(additionalCharacterTypeSpecs, options)
    })}`);
  }
  
  if (hasStyleSpecs) {
    promptParts.push(`\n\n${renderPromptBuilderTemplate('additionalStyleEnhancementSection', {
      section_content: replacePlaceholders(styleSpecs, options)
    })}`);
  }

  if (hasAdditionalAbilitySpecs) {
    promptParts.push(`\n\n${renderPromptBuilderTemplate('additionalSpecialAbilityEnhancementSection', {
      section_content: replacePlaceholders(additionalAbilitySpecs, options)
    })}`);
  }
  
  if (enhanceCharacter.referencePreservation) {
    promptParts.push(`\n\n${buildExactReferencePreservationSection(enhanceCharacter.referencePreservation, options)}`);
  }

  if (enhanceCharacter.additionalGuidance) {
    promptParts.push(`\n\n${buildExactAdditionalGuidanceSection(enhanceCharacter.additionalGuidance, enhancementLevel)}`);
  }

  promptParts.push(`\n\n${renderPromptBuilderTemplate('finalEnhancementEnforcement', {})}`);
  
  const finalPrompt = promptParts.join('');
  
  return finalPrompt;
}

export function getPromptSummary(options: PromptBuilderOptions): string {
  return `Enhance ${options.characterName} (${options.characterType}) with ${options.specialAbility} ability in ${options.characterStyle} style at ${options.enhancementLevel} level`;
}

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

export function getAllyNameForStoryWorld(storyWorld: string): string {
  const lower = (storyWorld || '').toLowerCase();
  if (lower.includes('underwater') || lower.includes('kingdom')) return 'Coral';
  if (lower.includes('space') || lower.includes('outer')) return 'Nova';
  return 'Fern';
}

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

  compacted = compacted
    .replace(/^VARIABLES:\s*$/gim, '')
    .replace(/^(?:\[[A-Z_]+\]|\{[A-Z_]+\})\s*=\s*.*$/gim, '');

  compacted = compacted.replace(/^\s*Generate the story text now\.?\s*$/gim, '');

  compacted = compacted.replace(
    /^PAGE\s+\d+\s+PROMPT\s*\([^)]*\):\s*$/im,
    `PAGE ${pageNum}:`
  );

  compacted = compacted.replace(/\n{3,}/g, '\n\n').trim();

  return compacted;
}

function replaceStoryTextPlaceholders(
  template: string,
  options: StoryTextGenerationPromptOptions
): string {
  const result = replaceTemplateVariables(template, {
    characterName: options.characterName,
    characterType: options.characterType,
    specialAbility: options.specialAbility,
    characterStyle: options.characterStyle,
    storyWorld: options.storyWorld,
    adventureType: options.adventureType,
    occasionTheme: options.occasionTheme || 'general',
    ageGroup: options.ageGroup,
    readingLevel: options.readingLevel,
    storyTitle: options.storyTitle,
    pageNumber: String(options.pageNumber),
    WORLD_NAME: getWorldDisplayName(options.storyWorld),
    "child's character name": options.characterName
  });

  const adventureDisplay = getAdventureTypeDisplayName(options.adventureType);
  return replaceTemplateVariables(result, {
    adventureObjective: adventureDisplay.toLowerCase()
  });
}

export function buildStoryTextPrompt(options: StoryTextGenerationPromptOptions): string {
  const storyText = getPrompt1Data().generateStoryText;
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

  promptParts.push(renderPromptBuilderTemplate('storyTextIntro', {}));

  promptParts.push(
    `\n\n${renderPromptBuilderTemplate('storyThemeSection', {
      theme_key: resolvedThemeKey,
      theme_name: selectedTheme.themeName || '',
      age_group: options.ageGroup
    })}`
  );

  if (sharedVariables.length > 0) {
    promptParts.push(
      `\n\n${renderPromptBuilderTemplate('sharedVariablesHeader', {})}
${sharedVariables.map(({ key, value }) => `- {${key}} = ${value}`).join('\n')}`
    );
  }

  promptParts.push(
    `\n\n${renderPromptBuilderTemplate('writeAllPagesInstruction', {})}`
  );

  for (let pageNum = 1; pageNum <= 5; pageNum++) {
    const pageKey = `page${pageNum}`;
    const template = pagePrompts[pageKey];
    if (typeof template !== 'string' || template.trim().length === 0) {
      continue;
    }

    const mergedTemplate = replaceTemplateVariables(template, {
      ALLY_NAME: allyNameForWorld,
      LEARNING_THEME: themeVariables.learningTheme || selectedTheme.themeName || '',
      OBSTACLE: themeVariables.obstacle || '',
      BUNNY_NAME: themeVariables.bunnyName || 'Little Bunny'
    });

    const compactTemplate = compactStoryTextPageTemplate(mergedTemplate, pageNum);
    promptParts.push(`\n\n${replaceStoryTextPlaceholders(compactTemplate, options)}`);
  }

  return promptParts.join('');
}

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

export function buildIntersearchScenePrompt(options: IntersearchScenePromptOptions): string {
  const worldDisplay = getWorldDisplayName(options.storyWorld);

  return renderPromptBuilderTemplate('intersearchScenePrompt', {
    scene_number: String(options.sceneNumber),
    story_title: options.storyTitle,
    world_display: worldDisplay,
    character_name: options.characterName,
    character_type: options.characterType,
    character_style: options.characterStyle,
    special_ability: options.specialAbility,
    age_group: options.ageGroup,
    scene_title: options.sceneTitle,
    scene_description: options.sceneDescription,
    character_action_for_scene: options.characterActionForScene,
    character_emotion_for_scene: options.characterEmotionForScene,
    story_continuation_for_this_scene: options.storyContinuationForThisScene
  });
}

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

function getWorldKey(world: string): string {
  const worldMapping: { [key: string]: string } = {
    "enchanted-forest": "enchantedForest",
    "outer-space": "outerSpace",
    "underwater-kingdom": "underwaterKingdom"
  };
  return worldMapping[world.toLowerCase()] || "enchantedForest";
}

function getDifficultyKey(difficulty: string): string {
  const normalized = difficulty.toLowerCase();
  if (normalized === 'easy') return 'easy';
  if (normalized === 'medium') return 'medium';
  if (normalized === 'hard') return 'hard';
  return 'easy';
}

function replaceIntersearchPlaceholders(
  template: string,
  options: IntersearchSearchAdventurePromptOptions
): string {
  return replaceTemplateVariables(template, {
    characterName: options.characterName,
    characterType: options.characterType,
    characterDescription: options.characterDescription,
    characterStyle: options.characterStyle,
    storyWorld: options.storyWorld,
    storyTitle: options.storyTitle,
    ageGroup: options.ageGroup,
    characterReferenceImage: options.characterReferenceImage || '[REFERENCE IMAGE]'
  });
}

export function buildIntersearchCoverPrompt(
  options: IntersearchSearchAdventurePromptOptions
): string {
  const searchAdventure = getPrompt1Data().generateSearchAdventure;
  if (!searchAdventure) {
    throw new Error('generateSearchAdventure not found in prompt1.json');
  }

  const cover = searchAdventure.cover;
  if (!cover) {
    throw new Error('cover not found in generateSearchAdventure');
  }

  const promptParts: string[] = [];

  const worldDisplay = getWorldDisplayName(options.storyWorld);
  const bookInfo = renderPromptBuilderTemplate('interactiveCoverBookInfo', {
    story_title: options.storyTitle || 'Adventure Story',
    character_name: options.characterName,
    character_type: options.characterType,
    world_display: worldDisplay,
    character_style: options.characterStyle,
    age_group: options.ageGroup
  });
  promptParts.push(bookInfo);

  const basePrompt = cover.basePrompt || '';
  if (basePrompt && basePrompt.trim().length > 0) {
    let processedPrompt = replaceIntersearchPlaceholders(basePrompt, options);
    processedPrompt = processedPrompt.replace(/\{character_description\}/g, options.specialAbility || 'special abilities');
    promptParts.push(`\n\n${processedPrompt}`);
  }

  const worldKey = getWorldKey(options.storyWorld);
  const coverEnvironment = cover.coverEnvironment?.[worldKey];
  if (coverEnvironment && coverEnvironment.trim().length > 0) {
    promptParts.push(`\n\n${replaceIntersearchPlaceholders(coverEnvironment, options)}`);
  }

  const styleKey = options.characterStyle === '3d'
    ? '3d'
    : options.characterStyle === 'cartoon'
    ? 'cartoon'
    : 'anime';
  const styleSpecs = cover.characterStyleSpecifications?.[styleKey];
  if (styleSpecs && styleSpecs.trim().length > 0) {
    promptParts.push(`\n\n${replaceIntersearchPlaceholders(styleSpecs, options)}`);
  }

  const finalPrompt = promptParts.join('');

  return finalPrompt;
}

export function buildIntersearchSearchAdventurePrompt(
  options: IntersearchSearchAdventurePromptOptions & { sceneNumber: number; difficulty: string }
): string {
  const searchAdventure = getPrompt1Data().generateSearchAdventure;
  if (!searchAdventure) {
    throw new Error('generateSearchAdventure not found in prompt1.json');
  }

  const promptParts: string[] = [];

  const worldDisplay = getWorldDisplayName(options.storyWorld);
  const bookInfo = renderPromptBuilderTemplate('interactiveSearchBookInfo', {
    story_title: options.storyTitle || 'Adventure Story',
    character_name: options.characterName,
    character_type: options.characterType,
    world_display: worldDisplay,
    character_style: options.characterStyle,
    age_group: options.ageGroup,
    scene_number: String(options.sceneNumber),
    difficulty: options.difficulty
  });
  promptParts.push(bookInfo);

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

  const difficultyKey = getDifficultyKey(options.difficulty);
  const complexityReq = searchAdventure.complexityRequirements?.[difficultyKey];
  if (complexityReq && complexityReq.trim().length > 0) {
    promptParts.push(`\n\n${replaceIntersearchPlaceholders(complexityReq, options)}`);
  }

  const characterActions = searchAdventure.characterActions;
  const sceneKey = `scene${options.sceneNumber}` as keyof typeof characterActions;
  const characterAction = characterActions?.[sceneKey];
  if (characterAction && characterAction.trim().length > 0) {
    promptParts.push(`\n\n${replaceIntersearchPlaceholders(characterAction, options)}`);
  }

  const worldKey = getWorldKey(options.storyWorld);
  const worldSpecific = searchAdventure.worldSpecific?.[worldKey];
  if (worldSpecific) {
    const sceneKey = `scene${options.sceneNumber}` as keyof typeof worldSpecific;
    const worldSceneDesc = worldSpecific[sceneKey];
    if (worldSceneDesc && worldSceneDesc.trim().length > 0) {
      promptParts.push(`\n\n${renderPromptBuilderTemplate('worldSpecificScenePrefix', {
        world_scene_description: worldSceneDesc
      })}`);
    }
  }

  const finalPrompt = promptParts.join('');

  return finalPrompt;
}

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

function replaceStoryScenePlaceholders(
  template: string,
  options: StoryScenePromptOptions
): string {
  const resolvedSceneDescription = options.pageSceneDescription || '';
  const resolvedCharacterAction = options.pageCharacterAction || '';
  const resolvedCompanionCharacters = options.companionCharacters?.trim() || 'Fox';

  return replaceTemplateVariables(template, {
    characterName: options.characterName,
    characterType: options.characterType,
    specialAbility: options.specialAbility,
    characterStyle: options.characterStyle,
    storyWorld: options.storyWorld,
    adventureType: options.adventureType,
    ageGroup: options.ageGroup,
    storyTitle: options.storyTitle,
    pageNumber: String(options.pageNumber),
    storyPageText: options.pageText,
    storyText: options.pageText,
    sceneDescription: resolvedSceneDescription,
    characterAction: resolvedCharacterAction,
    companionCharacters: resolvedCompanionCharacters,
    pageEmotion: options.pageEmotion || 'warm and engaging'
  });
}

export function buildStoryScenePrompt(options: StoryScenePromptOptions): string {
  const storyScene = getPrompt1Data().generateStoryScene;
  if (!storyScene) {
    throw new Error('generateStoryScene not found in prompt1.json');
  }

  const promptParts: string[] = [];

  const basePrompt = storyScene.basePrompt || '';
  if (basePrompt && basePrompt.trim().length > 0) {
    promptParts.push(replaceStoryScenePlaceholders(basePrompt, options));
  }

  const consistencyEnforcement = storyScene.characterConsistencyEnforcement;
  if (consistencyEnforcement && consistencyEnforcement.trim().length > 0) {
    promptParts.push(`\n\n${replaceStoryScenePlaceholders(consistencyEnforcement, options)}`);
  }

  const templatePreservationPriority = storyScene.templatePreservationPriority;
  if (templatePreservationPriority && templatePreservationPriority.trim().length > 0) {
    promptParts.push(`\n\n${replaceStoryScenePlaceholders(templatePreservationPriority, options)}`);
  }

  const styleKey = options.characterStyle === '3d' ? '3d' : 
                   options.characterStyle === 'cartoon' ? 'cartoon' : 
                   options.characterStyle === 'anime' ? 'anime' : 'cartoon';
  const styleSpecs = storyScene.characterStyleSpecifications?.[styleKey];
  if (styleSpecs && styleSpecs.trim().length > 0) {
    promptParts.push(`\n\n${replaceStoryScenePlaceholders(styleSpecs, options)}`);
  }

  const worldKey = getStoryWorldKey(options.storyWorld);
  const worldSpecific = storyScene.worldSpecific?.[worldKey];
  if (worldSpecific) {
    const pageKey = `page${options.pageNumber}` as keyof typeof worldSpecific;
    const worldPageDesc = worldSpecific?.[pageKey];
    if (worldPageDesc && worldPageDesc.trim().length > 0) {
      promptParts.push(`\n\n${replaceStoryScenePlaceholders(worldPageDesc, options)}`);
    }
  }

  const pageSpecificReq = storyScene.pageSpecificRequirements;
  if (pageSpecificReq && pageSpecificReq.trim().length > 0) {
    promptParts.push(`\n\n${replaceStoryScenePlaceholders(pageSpecificReq, options)}`);
  }

  const companionReq = storyScene.companionRequirements;
  if (companionReq && companionReq.trim().length > 0) {
    promptParts.push(`\n\n${replaceStoryScenePlaceholders(companionReq, options)}`);
  }

  if (options.pageSceneDescription) {
    promptParts.push(`\n\n${renderPromptBuilderTemplate('storySceneAdditionalSceneDescription', {
      scene_description: options.pageSceneDescription
    })}`);
  }
  
  if (options.pageCharacterAction) {
    promptParts.push(`\n\n${renderPromptBuilderTemplate('storySceneCharacterAction', {
      character_action: options.pageCharacterAction
    })}`);
  }
  
  if (options.pageEmotion) {
    promptParts.push(`\n\n${renderPromptBuilderTemplate('storySceneCharacterEmotion', {
      page_emotion: options.pageEmotion
    })}`);
  }
  
  const defaultCompanion = (storyScene.defaultCompanion || 'Fox').trim();
  const resolvedCompanion = options.companionCharacters?.trim() || defaultCompanion;
  promptParts.push(`\n\n${renderPromptBuilderTemplate('storySceneCompanionCharacters', {
    companion_characters: resolvedCompanion
  })}`);

  if (options.characterImageUrl) {
    promptParts.push(`\n\n${renderPromptBuilderTemplate('storySceneCharacterReference', {
      character_name: options.characterName
    })}`);
  }

  const placement = options.characterPlacement || 'left-half';
  promptParts.push(`\n\n${renderPromptBuilderNestedTemplate(
    'storyScenePlacement',
    placement,
    {}
  )}`);

  const negativePrompts = storyScene.negativePrompts;
  if (negativePrompts && negativePrompts.trim().length > 0) {
    promptParts.push(`\n\n${replaceStoryScenePlaceholders(negativePrompts, options)}`);
  }

  const finalPrompt = promptParts.join('');

  return finalPrompt;
}

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
  return 'forest';
}

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

function getStoryWorldKeyForCover(storyWorld: string): string {
  const worldLower = storyWorld.toLowerCase();
  if (worldLower.includes('outer') || worldLower.includes('space')) {
    return 'outerSpace';
  }
  if (worldLower.includes('underwater') || worldLower.includes('ocean') || worldLower.includes('sea')) {
    return 'underwaterKingdom';
  }
  return 'enchantedForest';
}

function getStoryWorldDisplayName(storyWorld: string): string {
  const worldKey = getStoryWorldKeyForCover(storyWorld);
  const displayMapping: { [key: string]: string } = {
    'enchantedForest': 'Enchanted Forest',
    'outerSpace': 'Outer Space',
    'underwaterKingdom': 'Underwater Kingdom'
  };
  return displayMapping[worldKey] || 'Enchanted Forest';
}

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

function replaceStoryCoverPlaceholders(
  template: string,
  options: StoryAdventureCoverPromptOptions
): string {
  return replaceTemplateVariables(template, {
    characterName: options.characterName,
    characterStyle: options.characterStyle,
    storyWorld: options.storyWorld
  });
}

export function buildTemplateCompositeCoverPrompt(
  options: StoryAdventureCoverPromptOptions
): string {
  const storyScene = getPrompt1Data().generateStoryScene;
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

  return replaceTemplateVariables(templateCompositePrompt, {
    characterName: options.characterName,
    characterType: options.characterType,
    characterStyle: options.characterStyle,
    storyWorld: options.storyWorld,
    ageGroup: options.ageGroup,
    storyTitle: options.storyTitle || 'Adventure Story'
  });
}

export function buildStoryAdventureCoverPrompt(
  options: StoryAdventureCoverPromptOptions
): string {
  const storyScene = getPrompt1Data().generateStoryScene;
  if (!storyScene) {
    throw new Error('generateStoryScene not found in prompt1.json');
  }

  const cover = storyScene.cover;
  if (!cover) {
    throw new Error('cover not found in generateStoryScene');
  }

  const promptParts: string[] = [];

  const worldDisplay = getStoryWorldDisplayName(options.storyWorld);
  const adventureDisplay = getAdventureTypeDisplayName(options.adventureType);
  const bookInfo = renderPromptBuilderTemplate('storyAdventureCoverBookInfo', {
    story_title: options.storyTitle || 'Adventure Story',
    character_name: options.characterName,
    character_type: options.characterType,
    world_display: worldDisplay,
    adventure_display: adventureDisplay,
    character_style: options.characterStyle,
    age_group: options.ageGroup
  });
  promptParts.push(bookInfo);

  const basePrompt = cover.basePrompt || '';
  if (basePrompt && basePrompt.trim().length > 0) {
    let processedPrompt = replaceStoryCoverPlaceholders(basePrompt, options);
    promptParts.push(`\n\n${processedPrompt}`);
  }

  const worldKey = getStoryWorldKeyForCover(options.storyWorld);
  const coverEnvironment = cover.coverEnvironment?.[worldKey];
  if (coverEnvironment && coverEnvironment.trim().length > 0) {
    promptParts.push(`\n\n${replaceStoryCoverPlaceholders(coverEnvironment, options)}`);
  }

  const styleKey = options.characterStyle === '3d' ? '3d' : 
                   options.characterStyle === 'cartoon' ? 'cartoon' : 
                   options.characterStyle === 'anime' ? 'anime' : 'cartoon';
  const styleSpecs = cover.characterStyleSpecifications?.[styleKey];
  if (styleSpecs && styleSpecs.trim().length > 0) {
    promptParts.push(`\n\n${styleSpecs}`);
  }

  if (options.characterImageUrl) {
    promptParts.push(`\n\n${renderPromptBuilderTemplate('coverCharacterReference', {
      character_name: options.characterName
    })}`);
  }

  const finalPrompt = promptParts.join('');

  return finalPrompt;
}

export function buildDedicationScenePrompt(storyWorld: string): string {
  const dedication = getPrompt1Data().dedication;
  if (!dedication) {
    throw new Error('dedication not found in prompt1.json');
  }

  const worldKey = getDedicationWorldKey(storyWorld);
  const dedicationPrompt = dedication[worldKey];
  
  if (!dedicationPrompt || dedicationPrompt.trim().length === 0) {
    return dedication.forest || '';
  }

  return dedicationPrompt;
}
