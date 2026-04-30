
import { supabase } from '../supabase';

export interface Story {
  id?: string;
  uid?: string;
  created_at?: string;
  user_id?: string;
  child_profile_id: string;
  character_id?: number;
  character_name: string;
  character_type: 'person' | 'animal' | 'magical_creature';
  special_ability?: string;
  character_style: '3d' | 'cartoon' | 'anime';
  story_world: 'forest' | 'space' | 'underwater';
  adventure_type: 'treasure_hunt' | 'helping_friend';
  original_image_url: string;
  enhanced_images?: string[];
  story_title?: string;
  template_id?: string;
  story_cover?: string;
  cover_design?: string;
  story_content?: string | any;
  scene_images?: string[];
  audio_urls?: (string | null)[];
  dedication_text?: string;
  dedication_image?: string;
  copyright_image?: string;
  last_word_page_image?: string;
  last_admin_page_image?: string;
  back_cover_image?: string;
  status?: 'generating' | 'completed' | 'failed';
  story_type?: string;
  reading_state?: ReadingState;
  hints?: number | null;
  gift_id?: string;
  purchased?: boolean;
}

export interface StoryAdventureReadingState {
  reading_time: number;
  audio_listened: boolean;
}

export interface InteractiveSearchReadingState {
  reading_time: number;
  avg_star: number;
  avg_hint: number;
}

export type ReadingState = StoryAdventureReadingState | InteractiveSearchReadingState;

export interface DatabaseResult {
  success: boolean;
  data?: any;
  error?: string;
}

function hasValue(v: string | null | undefined): boolean {
  return typeof v === 'string' && v.trim().length > 0;
}

function buildStoryRowPayload(story: Story, uid: string, storyContentValue: string | null) {
  return {
    uid,
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
    template_id: story.template_id || null,
    story_cover: story.story_cover,
    cover_design: story.cover_design,
    story_content: storyContentValue,
    scene_images: story.scene_images || [],
    audio_url: story.audio_urls || [],
    dedication_text: story.dedication_text || null,
    dedication_image: story.dedication_image || null,
    copyright_image: story.copyright_image || null,
    last_word_page_image: story.last_word_page_image || null,
    last_admin_page_image: story.last_admin_page_image || null,
    back_cover_image: story.back_cover_image || null,
    status: story.status || 'generating',
    story_type: story.story_type || 'story',
    hints: story.story_type === 'search' ? (story.hints !== undefined ? story.hints : 3) : null,
    gift_id: story.gift_id || null,
    purchased: story.purchased ?? false
  };
}

export async function createStory(story: Story): Promise<DatabaseResult> {
  console.log('Creating story:', story);
  try {
    let storyContentValue: string | null = null;
    if (story.story_content) {
      if (typeof story.story_content === 'string') {
        storyContentValue = story.story_content;
      } else {
        storyContentValue = JSON.stringify(story.story_content);
      }
    }

    const existingUid = (story.uid || '').trim() || null;
    if (existingUid) {
      const { data: existingRow } = await supabase
        .from('stories')
        .select('*')
        .eq('uid', existingUid)
        .maybeSingle();
      if (existingRow) {
        const preserved = {
          template_id: hasValue(story.template_id) ? story.template_id : (existingRow.template_id ?? null),
          dedication_text: hasValue(story.dedication_text) ? story.dedication_text : (existingRow.dedication_text ?? null),
          dedication_image: hasValue(story.dedication_image) ? story.dedication_image : (existingRow.dedication_image ?? null),
          copyright_image: hasValue(story.copyright_image) ? story.copyright_image : (existingRow.copyright_image ?? null),
          last_word_page_image: hasValue(story.last_word_page_image) ? story.last_word_page_image : (existingRow.last_word_page_image ?? null),
          last_admin_page_image: hasValue(story.last_admin_page_image) ? story.last_admin_page_image : (existingRow.last_admin_page_image ?? null),
          back_cover_image: hasValue(story.back_cover_image) ? story.back_cover_image : (existingRow.back_cover_image ?? null)
        };
        const mergedStory: Story = { ...story, ...preserved };
        const payload = buildStoryRowPayload(mergedStory, existingUid, storyContentValue);
        const { data, error } = await supabase
          .from('stories')
          .update(payload)
          .eq('uid', existingUid)
          .select('*')
          .single();
        if (error) {
          console.error('Error updating story (existing draft):', error);
          return { success: false, error: error.message };
        }
        return { success: true, data };
      }
    }

    const uid = crypto.randomUUID();
    const payload = buildStoryRowPayload(story, uid, storyContentValue);
    const { data, error } = await supabase
      .from('stories')
      .insert([payload])
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

export async function updateReadingState(storyUid: string, readingState: ReadingState): Promise<DatabaseResult> {
  try {
    const { data: existingStory, error: fetchError } = await supabase
      .from('stories')
      .select('reading_state')
      .eq('uid', storyUid)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching existing reading state:', fetchError);
    }

    let mergedState: any;
    
    if (existingStory?.reading_state && typeof existingStory.reading_state === 'object') {
      const existingReadingTime = existingStory.reading_state.reading_time || 0;
      const newReadingTime = readingState.reading_time || 0;
      
      mergedState = {
        ...existingStory.reading_state,
        ...readingState,
        reading_time: existingReadingTime + newReadingTime
      };
      
      console.log(`[updateReadingState] Summing reading time: ${existingReadingTime} + ${newReadingTime} = ${mergedState.reading_time}`);
    } else {
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

export async function getAllStoriesForParent(parentId: string): Promise<DatabaseResult> {
  try {
    if (!parentId || typeof parentId !== 'string' || parentId.trim() === '' || parentId === 'undefined' || parentId === 'null') {
      console.error('[getAllStoriesForParent] Invalid parentId:', parentId);
      return {
        success: false,
        error: 'Invalid parent ID provided'
      };
    }
    
    let backendUrl = 'https://image-edit-five.vercel.app';
    
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

export async function getAllCharacters(parentId: string): Promise<DatabaseResult> {
  try {
    let backendUrl = 'https://image-edit-five.vercel.app';
    
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

export async function deleteCharacter(characterId: string, userId: string): Promise<DatabaseResult> {
  try {
    let backendUrl = 'https://image-edit-five.vercel.app';
    
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
