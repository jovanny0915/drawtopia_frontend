/**
 * Stories Database Operations
 */

import { supabase } from '../supabase';

export interface Story {
  id?: string;
  uid?: string; // Unique identifier
  created_at?: string;
  user_id?: string; // User ID of the story creator/owner
  child_profile_id: string;
  character_id?: number; // Reference to character in characters table
  character_name: string;
  character_type: 'person' | 'animal' | 'magical_creature';
  special_ability?: string;
  character_style: '3d' | 'cartoon' | 'anime';
  story_world: 'forest' | 'space' | 'underwater';
  adventure_type: 'treasure_hunt' | 'helping_friend';
  original_image_url: string;
  enhanced_images?: string[];
  story_title?: string;
  story_cover?: string;
  cover_design?: string;
  story_content?: string | any; // JSON string or object containing story pages/text
  scene_images?: string[]; // Array of scene image URLs
  audio_urls?: (string | null)[]; // Array of audio URLs (one per page, null if failed)
  dedication_text?: string; // Dedication message text
  dedication_image?: string; // Dedication page image URL
  status?: 'generating' | 'completed' | 'failed';
  story_type?: string; // Type of story: adventure story book or search adventure
  reading_state?: ReadingState; // Reading statistics
}

// Reading state interfaces
export interface StoryAdventureReadingState {
  reading_time: number; // Time in seconds
  audio_listened: boolean;
}

export interface InteractiveSearchReadingState {
  reading_time: number; // Time in seconds
  avg_star: number;
  avg_hint: number;
}

export type ReadingState = StoryAdventureReadingState | InteractiveSearchReadingState;

export interface DatabaseResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Create a new story
 * @param story - The story data to insert
 * @returns Promise with operation result
 */
export async function createStory(story: Story): Promise<DatabaseResult> {
  console.log('Creating story:', story);
  try {
    // Prepare story_content - convert to JSON string if it's an object
    let storyContentValue: string | null = null;
    if (story.story_content) {
      if (typeof story.story_content === 'string') {
        storyContentValue = story.story_content;
      } else {
        storyContentValue = JSON.stringify(story.story_content);
      }
    }

    const uid: string = crypto.randomUUID();
    const { data, error } = await supabase
      .from('stories')
      .insert([{
        uid: uid,
        user_id: story.user_id,
        child_profile_id: story.child_profile_id,
        character_id: story.character_id || null,
        character_name: story.character_name,
        character_type: story.character_type,
        special_ability: story.special_ability,
        character_style: story.character_style,
        story_world: story.story_world,
        adventure_type: story.adventure_type,
        original_image_url: story.original_image_url,
        enhanced_images: story.enhanced_images || [],
        story_title: story.story_title,
        story_cover: story.story_cover,
        cover_design: story.cover_design,
        story_content: storyContentValue,
        scene_images: story.scene_images || [],
        audio_url: story.audio_urls || [],
        dedication_text: story.dedication_text || null,
        dedication_image: story.dedication_image || null,
        status: story.status || 'generating',
        story_type: story.story_type || 'story'
      }])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating story:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data: data
    };

  } catch (error) {
    console.error('Unexpected error creating story:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while creating the story'
    };
  }
}

/**
 * Update a story
 * @param storyId - The story ID to update
 * @param updates - The fields to update
 * @returns Promise with operation result
 */
export async function updateStory(storyId: string, updates: Partial<Story>): Promise<DatabaseResult> {
  try {
    const { data, error } = await supabase
      .from('stories')
      .update(updates)
      .eq('id', storyId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating story:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data: data
    };

  } catch (error) {
    console.error('Unexpected error updating story:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while updating the story'
    };
  }
}

/**
 * Update reading state for a story by uid
 * @param storyUid - The story UID
 * @param readingState - The reading state to update
 * @returns Promise with operation result
 */
export async function updateReadingState(storyUid: string, readingState: ReadingState): Promise<DatabaseResult> {
  try {
    // First, get the current reading_state to merge with new data
    const { data: existingStory, error: fetchError } = await supabase
      .from('stories')
      .select('reading_state')
      .eq('uid', storyUid)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching existing reading state:', fetchError);
    }

    // Merge existing reading state with new data
    // IMPORTANT: Sum the reading_time instead of replacing it
    let mergedState: any;
    
    if (existingStory?.reading_state && typeof existingStory.reading_state === 'object') {
      const existingReadingTime = existingStory.reading_state.reading_time || 0;
      const newReadingTime = readingState.reading_time || 0;
      
      // Merge all fields and sum the reading_time
      mergedState = {
        ...existingStory.reading_state,
        ...readingState,
        reading_time: existingReadingTime + newReadingTime // Sum instead of replace
      };
      
      console.log(`[updateReadingState] Summing reading time: ${existingReadingTime} + ${newReadingTime} = ${mergedState.reading_time}`);
    } else {
      // No existing state, use the new state as-is
      mergedState = readingState;
    }

    const { data, error } = await supabase
      .from('stories')
      .update({ reading_state: mergedState })
      .eq('uid', storyUid)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating reading state:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data: data
    };

  } catch (error) {
    console.error('Unexpected error updating reading state:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while updating reading state'
    };
  }
}

/**
 * Get stories for a specific child profile
 * @param childProfileId - The child profile ID
 * @returns Promise with stories
 */
export async function getStoriesForChild(childProfileId: string): Promise<DatabaseResult> {
  try {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('child_profile_id', childProfileId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching stories for child:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data: data || []
    };

  } catch (error) {
    console.error('Unexpected error fetching stories for child:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while fetching stories'
    };
  }
}

/**
 * Get all stories for a parent (across all their children)
 * @param parentId - The parent's user ID
 * @returns Promise with stories
 */
export async function getAllStoriesForParent(parentId: string): Promise<DatabaseResult> {
  try {
    // Validate parentId
    if (!parentId || typeof parentId !== 'string' || parentId.trim() === '' || parentId === 'undefined' || parentId === 'null') {
      console.error('[getAllStoriesForParent] Invalid parentId:', parentId);
      return {
        success: false,
        error: 'Invalid parent ID provided'
      };
    }
    
    // Determine backend URL
    let backendUrl = 'https://drawtopia-backend.vercel.app'; // http://localhost:8000
    
    // Call Python backend API
    const endpoint = `${backendUrl}/api/books/?parent_id=${encodeURIComponent(parentId)}`;
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

      return {
        success: false,
        error: errorMessage
      };
    }

    const data = await response.json();

    return {
      success: true,
      data: data || []
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred while fetching stories'
    };
  }
}

/**
 * Get all characters from the backend API
 * @returns Promise with character data
 */
export async function getAllCharacters(parentId: string): Promise<DatabaseResult> {
  try {
    // Determine backend URL
    let backendUrl = 'https://drawtopia-backend.vercel.app'; // http://localhost:8000
    
    // Call Python backend API
    const endpoint = `${backendUrl}/api/characters/?parent_id=${encodeURIComponent(parentId)}`;
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (parseError) {
        const errorText = await response.text().catch(() => '');
        errorMessage = errorText || errorMessage;
      }

      return {
        success: false,
        error: errorMessage
      };
    }

    const data = await response.json();

    return {
      success: true,
      data: data || []
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred while fetching characters'
    };
  }
}

/**
 * Delete a character by ID
 * @param characterId - The character ID to delete
 * @param userId - The user ID for authorization
 * @returns Promise with deletion result
 */
export async function deleteCharacter(characterId: string, userId: string): Promise<DatabaseResult> {
  try {
    // Determine backend URL
    let backendUrl = 'https://drawtopia-backend.vercel.app'; // http://localhost:8000
    
    // Call Python backend API
    const endpoint = `${backendUrl}/api/characters/${encodeURIComponent(characterId)}?user_id=${encodeURIComponent(userId)}`;
    
    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (parseError) {
        const errorText = await response.text().catch(() => '');
        errorMessage = errorText || errorMessage;
      }

      return {
        success: false,
        error: errorMessage
      };
    }

    const data = await response.json();

    return {
      success: true,
      data: data
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred while deleting character'
    };
  }
}

/**
 * Get a single story by ID
 * @param storyId - The story ID
 * @returns Promise with story data
 */
export async function getStoryById(storyId: string): Promise<DatabaseResult> {
  try {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('uid', storyId)

    console.log('[getStoryById] Data:', data);

    if (error) {
      console.error('Error fetching story:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data: data
    };

  } catch (error) {
    console.error('Unexpected error fetching story:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while fetching the story'
    };
  }
}

/**
 * Delete a story
 * @param storyId - The story ID to delete
 * @returns Promise with operation result
 */
export async function deleteStory(storyId: string): Promise<DatabaseResult> {
  try {
    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', storyId);

    if (error) {
      console.error('Error deleting story:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true
    };

  } catch (error) {
    console.error('Unexpected error deleting story:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while deleting the story'
    };
  }
}
