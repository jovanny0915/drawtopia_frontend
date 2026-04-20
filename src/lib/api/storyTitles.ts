import { env } from '../env';

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

export interface GenerateStoryTitlesOptions {
  characterName: string;
  specialAbility: string;
  storyWorld: string;
  adventureType: string;
  characterType?: string;
  characterStyle?: string;
  storyFormat?: string;
  ageGroup?: string;
}

export interface GenerateStoryTitlesResult {
  success: boolean;
  titles?: string[];
  error?: string;
}

/**
 * Generate 3 story title suggestions via the backend API.
 * The backend selects the exact prompt template based on the normalized story format.
 */
export async function generateStoryTitles(
  options: GenerateStoryTitlesOptions
): Promise<GenerateStoryTitlesResult> {
  try {
    const normalizedStoryFormat = normalizeStoryFormatForTitleGeneration(options.storyFormat);

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
        age_group: options.ageGroup || '7-10'
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
