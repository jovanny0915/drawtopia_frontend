/**
 * Characters Database Operations
 */

import { supabase } from '../supabase';

export interface Character {
  id?: number;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  child_profile_id?: number | null;
  
  // Basic character information
  character_name: string;
  character_type: 'person' | 'animal' | 'magical_creature';
  special_ability?: string;
  
  // Character appearance/style
  character_style: '3d' | 'cartoon' | 'anime';
  
  // Character images
  original_image_url: string;
  enhanced_images?: string; // Text URL of enhanced image
  thumbnail_url?: string;
  
  // Character metadata
  age_group?: '3-6' | '7-10' | '11-12';
  description?: string;
  
  // Usage statistics
  last_used_at?: string;
  
  // Character status
  is_active?: boolean;
  is_favorite?: boolean;
  
  // Character extraction data (for AI generation consistency)
  extraction_data?: CharacterExtractionData;
  
  // Tags for categorization
  tags?: string[];
}

export interface CharacterExtractionData {
  facial_features?: {
    eye_color?: string;
    hair_color?: string;
    hair_style?: string;
    skin_tone?: string;
    [key: string]: any;
  };
  clothing?: string[];
  distinctive_features?: string[];
  pose?: string;
  extraction_model?: string;
  extraction_timestamp?: string;
  [key: string]: any;
}

export interface DatabaseResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Create a new character
 * @param character - The character data to insert
 * @returns Promise with operation result
 */
export async function createCharacter(character: Character): Promise<DatabaseResult> {
  console.log('Creating character:', character);
  try {
    const { data, error } = await supabase
      .from('characters')
      .insert([{
        user_id: character.user_id,
        child_profile_id: character.child_profile_id,
        character_name: character.character_name,
        character_type: character.character_type,
        special_ability: character.special_ability,
        character_style: character.character_style,
        original_image_url: character.original_image_url,
        enhanced_images: character.enhanced_images || '', // Store as text URL
        description: character.description,
      }])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating character:', error);
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
    console.error('Unexpected error creating character:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while creating the character'
    };
  }
}

/**
 * Get character by ID
 * @param characterId - The character ID
 * @returns Promise with character data
 */
export async function getCharacterById(characterId: number): Promise<DatabaseResult> {
  try {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('id', characterId)
      .single();

    if (error) {
      console.error('Error fetching character:', error);
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
    console.error('Unexpected error fetching character:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while fetching the character'
    };
  }
}

/**
 * Get all characters for a user
 * @param userId - The user ID
 * @param options - Optional filters
 * @returns Promise with characters
 */
export async function getCharactersByUserId(
  userId: string,
  options?: {
    childProfileId?: number;
    isActive?: boolean;
    isFavorite?: boolean;
    characterType?: string;
    orderBy?: 'created_at' | 'last_used_at' | 'character_name';
    ascending?: boolean;
  }
): Promise<DatabaseResult> {
  try {
    let query = supabase
      .from('characters')
      .select('*')
      .eq('user_id', userId);

    // Apply filters
    if (options?.childProfileId !== undefined) {
      query = query.eq('child_profile_id', options.childProfileId);
    }

    if (options?.isActive !== undefined) {
      query = query.eq('is_active', options.isActive);
    }

    if (options?.isFavorite !== undefined) {
      query = query.eq('is_favorite', options.isFavorite);
    }

    if (options?.characterType) {
      query = query.eq('character_type', options.characterType);
    }

    // Apply ordering
    const orderBy = options?.orderBy || 'created_at';
    const ascending = options?.ascending !== undefined ? options.ascending : false;
    query = query.order(orderBy, { ascending });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching characters:', error);
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
    console.error('Unexpected error fetching characters:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while fetching characters'
    };
  }
}

/**
 * Get characters for a child profile
 * @param childProfileId - The child profile ID
 * @returns Promise with characters
 */
export async function getCharactersByChildProfile(childProfileId: number): Promise<DatabaseResult> {
  try {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('child_profile_id', childProfileId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching characters for child profile:', error);
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
    console.error('Unexpected error fetching characters:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while fetching characters'
    };
  }
}

/**
 * Update character
 * @param characterId - The character ID
 * @param updates - The fields to update
 * @returns Promise with operation result
 */
export async function updateCharacter(
  characterId: number,
  updates: Partial<Character>
): Promise<DatabaseResult> {
  try {
    const { data, error } = await supabase
      .from('characters')
      .update(updates)
      .eq('id', characterId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating character:', error);
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
    console.error('Unexpected error updating character:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while updating the character'
    };
  }
}

/**
 * Toggle character favorite status
 * @param characterId - The character ID
 * @param isFavorite - New favorite status
 * @returns Promise with operation result
 */
export async function toggleCharacterFavorite(
  characterId: number,
  isFavorite: boolean
): Promise<DatabaseResult> {
  return updateCharacter(characterId, { is_favorite: isFavorite });
}

/**
 * Soft delete character (set is_active to false)
 * @param characterId - The character ID
 * @returns Promise with operation result
 */
export async function softDeleteCharacter(characterId: number): Promise<DatabaseResult> {
  return updateCharacter(characterId, { is_active: false });
}

/**
 * Hard delete character
 * @param characterId - The character ID
 * @returns Promise with operation result
 */
export async function deleteCharacter(characterId: number): Promise<DatabaseResult> {
  try {
    const { error } = await supabase
      .from('characters')
      .delete()
      .eq('id', characterId);

    if (error) {
      console.error('Error deleting character:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data: null
    };

  } catch (error) {
    console.error('Unexpected error deleting character:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while deleting the character'
    };
  }
}

/**
 * Search characters by name or tags
 * @param userId - The user ID
 * @param searchTerm - The search term
 * @returns Promise with matching characters
 */
export async function searchCharacters(
  userId: string,
  searchTerm: string
): Promise<DatabaseResult> {
  try {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .or(`character_name.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching characters:', error);
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
    console.error('Unexpected error searching characters:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while searching characters'
    };
  }
}

/**
 * Get most used characters for a user
 * @param userId - The user ID
 * @param limit - Maximum number of characters to return
 * @returns Promise with most used characters
 */
export async function getMostUsedCharacters(
  userId: string,
  limit: number = 10
): Promise<DatabaseResult> {
  try {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .limit(limit);

    if (error) {
      console.error('Error fetching most used characters:', error);
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
    console.error('Unexpected error fetching most used characters:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while fetching most used characters'
    };
  }
}

/**
 * Get recently used characters for a user
 * @param userId - The user ID
 * @param limit - Maximum number of characters to return
 * @returns Promise with recently used characters
 */
export async function getRecentlyUsedCharacters(
  userId: string,
  limit: number = 10
): Promise<DatabaseResult> {
  try {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .not('last_used_at', 'is', null)
      .order('last_used_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recently used characters:', error);
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
    console.error('Unexpected error fetching recently used characters:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while fetching recently used characters'
    };
  }
}

