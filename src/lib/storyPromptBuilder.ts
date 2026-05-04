import { getPromptStoryData, getStoryTemplateData } from '$lib/promptRuntime';

const NOT_MATCHED_TEXT = 'The story theme is not matched or existed';

type AgeGroup = '3-6' | '7-10' | '11-12';

type StoryWorldKey = 'enchanted_forest' | 'underwater_kingdom' | 'outer_space';
type StoryTemplateWorldKey = 'forest' | 'underwater' | 'space';
type StoryThemeKey = 'courage' | 'kindness' | 'connection' | 'patience' | 'bedtime_routine';

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
  characterGender?: string;
}

export interface TemplateStoryPage {
  pageNumber: number;
  text: string;
}

type StructuredTemplatePages =
  | string[]
  | {
      pages?: string[];
      story_text?: string[];
      storyText?: string[];
      [key: string]: unknown;
    };

type ParsedTemplateMap = Partial<
  Record<StoryWorldKey, Partial<Record<AgeGroup, Partial<Record<StoryThemeKey, string[]>>>>>
>;

type StoryTemplateDocument = {
  story_template?: Partial<
    Record<
      StoryTemplateWorldKey,
      Partial<Record<StoryThemeKey, Partial<Record<AgeGroup, Record<string, string>>>>>
    >
  >;
};

type PronounSet = {
  subject: string;
  object: string;
  possessive: string;
  reflexive: string;
};

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

function normalizeThemeKey(storyTheme?: string): StoryThemeKey {
  const normalized = (storyTheme || '').toLowerCase().trim();
  const compact = normalized.replace(/[\s&_/-]+/g, '');
  const themeMap: Record<string, StoryThemeKey> = {
    courage: 'courage',
    kindnessempathy: 'kindness',
    kindness: 'kindness',
    empathy: 'kindness',
    connection: 'connection',
    patienceendurance: 'patience',
    patience: 'patience',
    endurance: 'patience',
    bedtimeroutinesleephygiene: 'bedtime_routine',
    bedtimeroutine: 'bedtime_routine',
    bedtime: 'bedtime_routine',
    sleephygiene: 'bedtime_routine',
    sleep: 'bedtime_routine'
  };
  return themeMap[compact] || 'kindness';
}

function getThemeDisplayNameFromKey(themeKey: StoryThemeKey): string {
  const names: Record<StoryThemeKey, string> = {
    courage: 'Courage',
    kindness: 'Kindness',
    connection: 'Connection',
    patience: 'Patience',
    bedtime_routine: 'Bedtime Routine'
  };
  return names[themeKey];
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

function resolvePronouns(characterGender?: string): PronounSet {
  const normalized = (characterGender || '').toLowerCase().trim();
  if (['male', 'boy', 'man', 'he', 'him'].includes(normalized)) {
    return { subject: 'he', object: 'him', possessive: 'his', reflexive: 'himself' };
  }
  if (['female', 'girl', 'woman', 'she', 'her'].includes(normalized)) {
    return { subject: 'she', object: 'her', possessive: 'her', reflexive: 'herself' };
  }
  return { subject: 'they', object: 'them', possessive: 'their', reflexive: 'themself' };
}

function replacePronounPlaceholder(text: string, pronouns: PronounSet): string {
  const possessiveNouns = [
    'arm',
    'arms',
    'alert',
    'body',
    'breath',
    'breathing',
    'bunk',
    'chest',
    'eyes',
    'face',
    'fingers',
    'glow',
    'hand',
    'hands',
    'heart',
    'instruments',
    'job',
    'life',
    'markings',
    'mind',
    'mission',
    'normal',
    'own',
    'palms',
    'presence',
    'processing',
    'reading',
    'room',
    'routine',
    'schedule',
    'self',
    'shift',
    'shoes',
    'sleeping',
    'station',
    'things',
    'voice',
    'version'
  ].join('|');

  return text
    .replace(/\[PRONOUNS\]self\b/gi, pronouns.reflexive)
    .replace(new RegExp(`\\[PRONOUNS\\](?=\\s+(?:${possessiveNouns})\\b)`, 'gi'), pronouns.possessive)
    .replace(
      /\b(ask|asked|asking|help|helped|helps|let|letting|made|make|needed|needs|need|teach|teaches|taught|tell|tells|told|give|gives|gave|watch|watched|watching)\s+\[PRONOUNS\]\b/gi,
      (_match, verb: string) => `${verb} ${pronouns.object}`
    )
    .replace(
      /\b(beside|around|toward|towards|with|behind|for|to|of|at|against|through|from)\s+\[PRONOUNS\](?=([,.;]|\s+(?:and|or|but|as|while)\b|$))/gi,
      (_match, preposition: string) => `${preposition} ${pronouns.object}`
    )
    .replace(/\[PRONOUNS\]/gi, pronouns.subject);
}

function getStoryTemplateWorldKey(worldKey: StoryWorldKey): StoryTemplateWorldKey {
  if (worldKey === 'underwater_kingdom') return 'underwater';
  if (worldKey === 'outer_space') return 'space';
  return 'forest';
}

function lookupStoryTemplateJsonPages(
  storyTemplate: StoryTemplateDocument,
  worldKey: StoryWorldKey,
  ageGroup: AgeGroup,
  themeKey: StoryThemeKey
): string[] | null {
  const templateWorldKey = getStoryTemplateWorldKey(worldKey);
  const pagesByNumber = storyTemplate.story_template?.[templateWorldKey]?.[themeKey]?.[ageGroup];

  if (!pagesByNumber) {
    return null;
  }

  const pages = [1, 2, 3, 4, 5]
    .map((pageNumber) => pagesByNumber[`page${pageNumber}`])
    .filter((page): page is string => typeof page === 'string' && page.trim().length > 0);

  return pages.length >= 5 ? pages : null;
}

function normalizeStoryTextTemplateWorld(value: string): StoryWorldKey | null {
  const normalized = value.toLowerCase();
  if (normalized.includes('underwater')) return 'underwater_kingdom';
  if (normalized.includes('outer space') || normalized.includes('space')) return 'outer_space';
  if (normalized.includes('forest')) return 'enchanted_forest';
  return null;
}

function extractStructuredPages(value: unknown): string[] | null {
  if (Array.isArray(value)) {
    return value.filter((page): page is string => typeof page === 'string');
  }
  if (!value || typeof value !== 'object') {
    return null;
  }

  const template = value as Exclude<StructuredTemplatePages, string[]>;
  const directPages = template.pages || template.story_text || template.storyText;
  if (Array.isArray(directPages)) {
    return directPages.filter((page): page is string => typeof page === 'string');
  }

  const numberedPages = [1, 2, 3, 4, 5]
    .map((pageNumber) => {
      const pageValue =
        template[`page_${pageNumber}`] ||
        template[`page${pageNumber}`] ||
        template[String(pageNumber)];
      if (typeof pageValue === 'string') return pageValue;
      if (pageValue && typeof pageValue === 'object') {
        const pageObject = pageValue as Record<string, unknown>;
        return pageObject.story_text || pageObject.storyText || pageObject.text;
      }
      return null;
    })
    .filter((page): page is string => typeof page === 'string');

  return numberedPages.length > 0 ? numberedPages : null;
}

function lookupStructuredTemplatePages(
  promptStory: Record<string, unknown>,
  worldKey: StoryWorldKey,
  ageGroup: AgeGroup,
  themeKey: StoryThemeKey
): string[] | null {
  const root = promptStory.story_text_templates || promptStory.storyTextTemplates;
  if (!root || typeof root !== 'object') return null;

  const worldAliases: string[] = [
    worldKey,
    worldKey.replace(/_/g, '-'),
    worldKey === 'enchanted_forest' ? 'forest' : worldKey === 'underwater_kingdom' ? 'underwater' : 'outerspace',
    getWorldDisplayName(worldKey)
  ];
  const themeAliases: string[] = [
    themeKey,
    themeKey.replace(/_/g, '-'),
    themeKey.replace(/_/g, ''),
    getThemeDisplayNameFromKey(themeKey)
  ];

  const rootRecord = root as Record<string, unknown>;
  const worldNode = worldAliases.map((alias) => rootRecord[alias]).find(Boolean);
  if (!worldNode || typeof worldNode !== 'object') return null;

  const worldRecord = worldNode as Record<string, unknown>;
  const ageNode = worldRecord[ageGroup];
  if (ageNode && typeof ageNode === 'object') {
    const ageRecord = ageNode as Record<string, unknown>;
    const pages = themeAliases.map((alias) => extractStructuredPages(ageRecord[alias])).find(Boolean);
    if (pages) return pages;
  }

  const themeNode = themeAliases.map((alias) => worldRecord[alias]).find(Boolean);
  if (themeNode && typeof themeNode === 'object') {
    const themeRecord = themeNode as Record<string, unknown>;
    const pages = extractStructuredPages(themeRecord[ageGroup]);
    if (pages) return pages;
  }

  return null;
}

function parseStoryTextTemplateDocument(document: string): ParsedTemplateMap {
  const parsed: ParsedTemplateMap = {};
  let currentWorld: StoryWorldKey | null = null;
  let currentAge: AgeGroup | null = null;
  let currentTheme: StoryThemeKey | null = null;
  let currentPage: number | null = null;
  let collectingStoryText = false;
  let buffer: string[] = [];

  const commitPage = () => {
    if (!currentWorld || !currentAge || !currentTheme || !currentPage || buffer.length === 0) return;
    parsed[currentWorld] ??= {};
    parsed[currentWorld]![currentAge] ??= {};
    parsed[currentWorld]![currentAge]![currentTheme] ??= [];
    parsed[currentWorld]![currentAge]![currentTheme]![currentPage - 1] = buffer.join(' ').trim();
    buffer = [];
  };

  for (const rawLine of document.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const worldMatch = line.match(/^WORLD:\s*(.+)$/i);
    if (worldMatch) {
      commitPage();
      currentWorld = normalizeStoryTextTemplateWorld(worldMatch[1]);
      currentAge = null;
      currentTheme = null;
      currentPage = null;
      collectingStoryText = false;
      continue;
    }

    const ageMatch = line.match(/^Ages?\s+(\d+\s*-\s*\d+)/i);
    if (ageMatch) {
      commitPage();
      currentAge = parseAgeGroup(ageMatch[1].replace(/\s+/g, ''));
      currentTheme = null;
      currentPage = null;
      collectingStoryText = false;
      continue;
    }

    const themeMatch = line.match(/^Learning Theme:\s*(.+)$/i);
    if (themeMatch) {
      commitPage();
      currentTheme = normalizeThemeKey(themeMatch[1]);
      currentPage = null;
      collectingStoryText = false;
      continue;
    }

    const pageMatch = line.match(/^Page\s+([1-5])\b/i);
    if (pageMatch) {
      commitPage();
      currentPage = Number(pageMatch[1]);
      collectingStoryText = false;
      continue;
    }

    if (/^Story Text:\s*$/i.test(line)) {
      buffer = [];
      collectingStoryText = true;
      continue;
    }

    if (/^Character Pose:\s*$/i.test(line)) {
      commitPage();
      collectingStoryText = false;
      continue;
    }

    if (collectingStoryText) {
      buffer.push(line);
    }
  }

  commitPage();
  return parsed;
}

function lookupDocumentTemplatePages(
  promptStory: Record<string, unknown>,
  worldKey: StoryWorldKey,
  ageGroup: AgeGroup,
  themeKey: StoryThemeKey
): string[] | null {
  const document =
    promptStory.story_text_template_document ||
    promptStory.storyTextTemplateDocument ||
    promptStory.story_text_template_markdown;

  if (typeof document !== 'string' || document.trim().length === 0) {
    return null;
  }

  const pages = parseStoryTextTemplateDocument(document)[worldKey]?.[ageGroup]?.[themeKey];
  return pages && pages.filter(Boolean).length >= 5 ? pages : null;
}

export function buildTemplateStoryPages(options: StoryTextPromptOptions): TemplateStoryPage[] {
  const validAgeGroup = parseAgeGroup(options.ageGroup);
  if (!validAgeGroup) {
    throw new Error(`Template story text is not configured for age group "${options.ageGroup}"`);
  }

  const promptStory = getPromptStoryData() as Record<string, unknown>;
  const storyTemplate = getStoryTemplateData() as StoryTemplateDocument;
  const worldKey = normalizeWorldKey(options.storyWorld);
  const themeKey = normalizeThemeKey(options.storyTheme);
  const pageTemplates =
    lookupStoryTemplateJsonPages(storyTemplate, worldKey, validAgeGroup, themeKey) ||
    lookupStructuredTemplatePages(promptStory, worldKey, validAgeGroup, themeKey) ||
    lookupDocumentTemplatePages(promptStory, worldKey, validAgeGroup, themeKey);

  if (!pageTemplates || pageTemplates.length < 5) {
    throw new Error(
      `Template story text is missing for ${getWorldDisplayName(worldKey)} / ${validAgeGroup} / ${getThemeDisplayNameFromKey(themeKey)}`
    );
  }

  const variables: Record<string, string> = {
    CHARACTER_NAME: options.characterName || 'the child character',
    WORLD_NAME: getWorldDisplayName(worldKey),
    WORLD_STYLE: options.characterStyle || 'cartoon',
    ALLY_NAME: (promptStory.ally_name_by_story_world as Record<string, string> | undefined)?.[worldKey] || 'Fern',
    ALLY_TYPE: getAllyType(worldKey),
    SPECIAL_ABILITY: options.specialAbility || 'their special ability',
    CHARACTER_TYPE: options.characterType || 'character',
    CHARACTER_STYLE: options.characterStyle || 'cartoon',
    AGE_GROUP: validAgeGroup,
    LEARNING_THEME: getThemeDisplayNameFromKey(themeKey)
  };
  const pronouns = resolvePronouns(options.characterGender);

  return pageTemplates.slice(0, 5).map((template, index) => ({
    pageNumber: index + 1,
    text: replacePronounPlaceholder(replacePromptVariables(template, variables), pronouns)
  }));
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
