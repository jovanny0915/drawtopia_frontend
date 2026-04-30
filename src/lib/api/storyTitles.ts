import { env } from '../env';
import { getPrompt1Data, loadRuntimePromptDocuments } from '../promptRuntime';

const API_BASE_URL = (env.API_BASE_URL || 'https://image-edit-five.vercel.app').replace(/\/api\/?$/, '');

function normalizeStoryFormatForTitleGeneration(storyFormat?: string): 'interactive' | 'story' {
  const normalized = (storyFormat || 'story').trim().toLowerCase().replace(/[-\s]/g, '_');

  if (
    normalized === 'interactive' ||
    normalized === 'interactive_story' ||
    normalized === 'interactive_search' ||
    normalized === 'search' ||
    normalized === 'search_and_find' ||
    normalized === 'intersearch'
  ) {
    return 'interactive';
  }

  return 'story';
}

function getWorldDisplayName(storyWorld: string): string {
  const normalized = storyWorld.trim().toLowerCase();
  return {
    forest: 'Enchanted Forest',
    'enchanted-forest': 'Enchanted Forest',
    enchanted_forest: 'Enchanted Forest',
    outerspace: 'Outer Space',
    'outer-space': 'Outer Space',
    outer_space: 'Outer Space',
    underwater: 'Underwater Kingdom',
    'underwater-kingdom': 'Underwater Kingdom',
    underwater_kingdom: 'Underwater Kingdom'
  }[normalized] || storyWorld;
}

function renderTitlePromptTemplate(template: string, replacements: Record<string, string>): string {
  return Object.entries(replacements).reduce((result, [key, value]) => {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return result.replace(new RegExp(`\\{${escapedKey}\\}`, 'g'), value ?? '');
  }, template);
}

export function buildStoryTitlePrompt(options: GenerateStoryTitlesOptions): string {
  const normalizedStoryFormat = normalizeStoryFormatForTitleGeneration(options.storyFormat);
  const worldDisplay = getWorldDisplayName(options.storyWorld);
  const ageGroup = options.ageGroup || '7-10';
  const titlePrompts = getPrompt1Data().storyTitlePrompts || {};

  if (normalizedStoryFormat === 'interactive') {
    return renderTitlePromptTemplate(titlePrompts.interactive, {
      character_name: options.characterName,
      world_display: worldDisplay,
      special_ability: options.specialAbility,
      age_group: ageGroup
    });
  }

  const learningTheme = options.learningTheme?.trim() || 'wonder and heart';
  return renderTitlePromptTemplate(titlePrompts.story, {
    character_name: options.characterName,
    learning_theme: learningTheme,
    world_display: worldDisplay,
    special_ability: options.specialAbility,
    age_group: ageGroup
  });
}

export interface GenerateStoryTitlesOptions {
  characterName: string;
  specialAbility: string;
  storyWorld: string;
  adventureType: string;
  characterType?: string;
  characterStyle?: string;
  storyFormat?: string;
  ageGroup?: string;
  learningTheme?: string;
}

export interface GenerateStoryTitlesResult {
  success: boolean;
  titles?: string[];
  error?: string;
}

export async function generateStoryTitles(
  options: GenerateStoryTitlesOptions
): Promise<GenerateStoryTitlesResult> {
  try {
    await loadRuntimePromptDocuments();
    const normalizedStoryFormat = normalizeStoryFormatForTitleGeneration(options.storyFormat);
    const titlePrompt = buildStoryTitlePrompt(options);

    const response = await fetch(`${API_BASE_URL}/story/generate-titles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        character_name: options.characterName,
        special_ability: options.specialAbility,
        story_world: options.storyWorld,
        adventure_type: options.adventureType,
        character_type: options.characterType || 'person',
        character_style: options.characterStyle || 'cartoon',
        story_format: normalizedStoryFormat,
        age_group: options.ageGroup || '7-10',
        learning_theme: options.learningTheme?.trim() || undefined,
        title_prompt: titlePrompt
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `Failed to generate story titles: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!data.success || !Array.isArray(data.titles)) {
      throw new Error('Invalid response from story titles API');
    }

    return {
      success: true,
      titles: data.titles
    };
  } catch (err) {
    console.error('Error generating story titles:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to generate story titles'
    };
  }
}
