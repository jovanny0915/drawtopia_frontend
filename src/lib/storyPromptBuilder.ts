import { getPromptStoryData } from '$lib/promptRuntime';

const NOT_MATCHED_TEXT = 'The story theme is not matched or existed';

type AgeGroup = '3-6' | '7-10' | '11-12';

type StoryWorldKey = 'enchanted_forest' | 'underwater_kingdom' | 'outer_space';

type StoryPromptAct = {
  act?: number;
  pages?: string;
  title?: string;
  beat_name?: string;
  core_story_function?: string;
  learning_theme_influence?: string;
  objective?: Record<string, string>;
  key_dialogue_lines?: string[];
  humor_or_magic_moments?: string[];
  poetic_sample_template?: string[];
  prose_sample_template?: string[];
  lullaby_close_template?: string[];
  breath_mirror_close_template?: string[];
};

type AgeGroupPromptConfig = {
  label?: string;
  story_constraints?: Record<string, string>;
  poetic_structure?: Record<string, unknown>;
  development_notes?: string[];
  prompt_placeholders?: string[];
  acts?: StoryPromptAct[];
  generation_prompt_template?: {
    instructions?: string[];
  };
};

export interface StoryTextPromptOptions {
  characterName: string;
  characterType: string;
  specialAbility: string;
  characterStyle: '3d' | 'cartoon' | 'anime';
  storyWorld: string;
  adventureType: string;
  occasionTheme: string;
  ageGroup: string;
  readingLevel: string;
  storyTitle: string;
  pageNumber: number;
  storyTheme?: string;
}

const VALID_AGE_GROUPS: AgeGroup[] = ['3-6', '7-10', '11-12'];

function parseAgeGroup(ageGroup: string): AgeGroup | null {
  const trimmed = ageGroup?.trim();
  if (!trimmed) return null;
  return VALID_AGE_GROUPS.includes(trimmed as AgeGroup) ? (trimmed as AgeGroup) : null;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replacePromptVariables(pagePrompt: string, variables: Record<string, string>): string {
  let result = pagePrompt;

  for (const [rawToken, value] of Object.entries(variables)) {
    const tokenVariants = new Set([
      rawToken,
      rawToken.toLowerCase(),
      rawToken.toUpperCase()
    ]);

    for (const token of tokenVariants) {
      const escapedToken = escapeRegExp(token);
      result = result.replace(new RegExp(`\\{${escapedToken}\\}`, 'g'), value);
      result = result.replace(new RegExp(`\\[${escapedToken}\\]`, 'g'), value);
    }
  }

  return result;
}

function normalizeWorldKey(storyWorld: string): StoryWorldKey {
  const normalized = (storyWorld || '').toLowerCase().trim();
  if (normalized.includes('underwater') || normalized.includes('kingdom')) return 'underwater_kingdom';
  if (normalized.includes('outer') || normalized.includes('space')) return 'outer_space';
  return 'enchanted_forest';
}

function getWorldDisplayName(worldKey: StoryWorldKey): string {
  if (worldKey === 'underwater_kingdom') return 'Underwater Kingdom';
  if (worldKey === 'outer_space') return 'Outer Space';
  return 'Enchanted Forest';
}

function getAllyType(worldKey: StoryWorldKey): string {
  if (worldKey === 'underwater_kingdom') return 'dolphin';
  if (worldKey === 'outer_space') return 'star fox';
  return 'fox';
}

function normalizeThemeName(storyTheme?: string): string {
  const normalized = (storyTheme || '').trim();
  const compact = normalized.toLowerCase().replace(/[\s&_/-]+/g, '');
  const themeMap: Record<string, string> = {
    kindnessempathy: 'Kindness & Empathy',
    kindness: 'Kindness & Empathy',
    bedtimeroutinesleephygiene: 'Bedtime Routine & Sleep Hygiene',
    bedtime: 'Bedtime Routine & Sleep Hygiene',
    sleep: 'Bedtime Routine & Sleep Hygiene',
    courage: 'Courage',
    connection: 'Connection',
    patienceendurance: 'Patience & Endurance',
    patience: 'Patience & Endurance'
  };
  return themeMap[compact] || normalized || 'Kindness & Empathy';
}

function formatValue(value: unknown, indent = 0): string {
  const prefix = ' '.repeat(indent);
  if (Array.isArray(value)) {
    return value.map((item) => `${prefix}- ${typeof item === 'object' ? formatValue(item, indent + 2).trim() : item}`).join('\n');
  }
  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => `${prefix}- ${key}: ${typeof item === 'object' ? `\n${formatValue(item, indent + 2)}` : item}`)
      .join('\n');
  }
  return `${prefix}${value ?? ''}`;
}

function formatAct(act: StoryPromptAct, variables: Record<string, string>): string {
  const lines: string[] = [
    `ACT ${act.act ?? ''}: ${act.title || act.beat_name || 'Story Beat'}`,
    `Pages: ${act.pages || ''}`
  ];

  if (act.core_story_function) {
    lines.push(`Core function: ${act.core_story_function}`);
  }
  if (act.learning_theme_influence) {
    lines.push(`Learning theme influence: ${act.learning_theme_influence}`);
  }
  if (act.objective) {
    lines.push(`Objective:\n${formatValue(act.objective, 2)}`);
  }
  if (act.key_dialogue_lines?.length) {
    lines.push(`Useful dialogue direction:\n${formatValue(act.key_dialogue_lines, 2)}`);
  }
  if (act.humor_or_magic_moments?.length) {
    lines.push(`Humor or magic moments:\n${formatValue(act.humor_or_magic_moments, 2)}`);
  }
  const sample =
    act.poetic_sample_template ||
    act.prose_sample_template ||
    act.lullaby_close_template ||
    act.breath_mirror_close_template;
  if (sample?.length) {
    lines.push(`Tone sample only - do not copy verbatim:\n${formatValue(sample, 2)}`);
  }

  return replacePromptVariables(lines.join('\n'), variables);
}

export function buildStoryTextPrompt(options: StoryTextPromptOptions): string {
  const validAgeGroup = parseAgeGroup(options.ageGroup);
  if (!validAgeGroup) {
    return NOT_MATCHED_TEXT;
  }

  const promptStory = getPromptStoryData();
  const ageConfig = promptStory.age_groups?.[validAgeGroup] as AgeGroupPromptConfig | undefined;
  if (!ageConfig) {
    return NOT_MATCHED_TEXT;
  }

  const worldKey = normalizeWorldKey(options.storyWorld);
  const variables: Record<string, string> = {
    CHARACTER_NAME: options.characterName || 'the child character',
    WORLD_NAME: getWorldDisplayName(worldKey),
    ALLY_NAME: promptStory.ally_name_by_story_world?.[worldKey] || 'Fern',
    ALLY_TYPE: getAllyType(worldKey),
    SPECIAL_ABILITY: options.specialAbility || 'their special ability',
    LEARNING_THEME: normalizeThemeName(options.storyTheme),
    CHARACTER_TYPE: options.characterType || 'character',
    CHARACTER_STYLE: options.characterStyle || 'cartoon',
    ADVENTURE_TYPE: options.adventureType || 'Adventure',
    STORY_TITLE: options.storyTitle || 'The Great Adventure',
    AGE_GROUP: validAgeGroup
  };

  const architecture = (promptStory.master_story_architecture?.acts || [])
    .map((act: StoryPromptAct) => formatAct(act, variables))
    .join('\n\n');
  const ageActs = (ageConfig.acts || [])
    .map((act) => formatAct(act, variables))
    .join('\n\n');
  const instructions = (ageConfig.generation_prompt_template?.instructions || [])
    .map((instruction) => `- ${replacePromptVariables(instruction, variables)}`)
    .join('\n');

  return [
    'You are writing original bedtime adventure story text for Drawtopia.',
    'Use the prompt architecture below as creative direction. Do not return the prompt, outline, samples, or template text. Generate a fresh story using the resolved variables.',
    '',
    'RESOLVED STORY VARIABLES',
    `- Character name: ${variables.CHARACTER_NAME}`,
    `- Character type: ${variables.CHARACTER_TYPE}`,
    `- Special ability: ${variables.SPECIAL_ABILITY}`,
    `- Story world: ${variables.WORLD_NAME}`,
    `- Ally name: ${variables.ALLY_NAME}`,
    `- Ally type: ${variables.ALLY_TYPE}`,
    `- Learning theme: ${variables.LEARNING_THEME}`,
    `- Story title: ${variables.STORY_TITLE}`,
    `- Age group: ${variables.AGE_GROUP}`,
    '',
    'OUTPUT REQUIREMENTS',
    '- Return exactly 5 story page blocks, one for each act.',
    '- Separate each page block with one blank line.',
    '- Do not include labels like "Page 1" or "Act 1" in the final output.',
    '- Each block should be polished final story prose, not notes or instructions.',
    '- Use the samples only for tone and cadence. Never copy sample lines verbatim unless a line is explicitly required.',
    '',
    'SHARED STORY ARCHITECTURE',
    replacePromptVariables(architecture, variables),
    '',
    `${validAgeGroup} AGE GROUP CONFIGURATION`,
    `Label: ${ageConfig.label || validAgeGroup}`,
    ageConfig.story_constraints ? `Story constraints:\n${formatValue(ageConfig.story_constraints, 2)}` : '',
    ageConfig.poetic_structure ? `Poetic structure:\n${formatValue(ageConfig.poetic_structure, 2)}` : '',
    ageConfig.development_notes?.length ? `Development notes:\n${formatValue(ageConfig.development_notes, 2)}` : '',
    instructions ? `Generation instructions:\n${instructions}` : '',
    '',
    'AGE-SPECIFIC ACT PROMPTS',
    ageActs,
    '',
    'Generate the final 5 story page blocks now.'
  ]
    .filter((section) => section !== '')
    .join('\n\n');
}

export { NOT_MATCHED_TEXT };
