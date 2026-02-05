import { env } from '../env';

const API_BASE_URL = (env.API_BASE_URL || 'https://image-edit-five.vercel.app').replace(/\/api\/?$/, '');

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
 * Generate 3 story title suggestions via the backend API using OpenAI.
 * Uses character and story information to create personalized titles.
 */
export async function generateStoryTitles(
  options: GenerateStoryTitlesOptions
): Promise<GenerateStoryTitlesResult> {
  try {
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
        story_format: options.storyFormat || 'story',
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
