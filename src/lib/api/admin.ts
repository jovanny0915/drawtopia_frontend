/**
 * Admin API Client
 * Handles all admin operations by sending requests to the backend API
 */

import { env } from '$lib/env';

const API_URL = env.API_BASE_URL;

export type TemplateStoryStyle =
  | '3d'
  | 'anime'
  | 'cartoon'
  | 'story'
  | 'search'
  | 'adventure'
  | 'search-and-find';

export type BookTemplateStoryFormat = 'adventure_story' | 'interactive_story';

export interface BookTemplate {
  id: string;
  name: string;
  story_world?: 'forest' | 'underwater' | 'outerspace';
  story_style?: TemplateStoryStyle | string;
  story_type?: TemplateStoryStyle | string;
  story_format?: BookTemplateStoryFormat | string;
  cover_image?: string;
  copyright_page_image?: string;
  dedication_page_image?: string;
  story_page_images?: string[];
  main_character_images?: string[];
  character_for_finding?: string[];
  positions?: { x: number; y: number }[];
  last_words_page_image?: string;
  last_story_page_image?: string;
  back_cover_image?: string;
  created_at?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface StoryCountByDay {
  date: string;
  count: number;
}

export interface UserAuthCountByDay {
  date: string;
  login_count: number;
  register_count: number;
  total_count: number;
}

export interface AdminUser {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  role?: string | null;
  account_type?: string | null;
  subscription_status?: string | null;
  subscription_expires?: string | null;
  credit?: number | null;
  created_at?: string | null;
  registration_date?: string | null;
  last_login?: string | null;
  total_stories_created?: number | null;
  story_count?: number | null;
  child_count?: number | null;
  purchase_count?: number | null;
  total_amount_paid?: number | null;
  latest_subscription?: Record<string, unknown> | null;
}

export interface AdminUserListFilters {
  search?: string;
  account_type?: string;
  subscription_status?: string;
  registered_from?: string;
  registered_to?: string;
  story_count_min?: number;
  story_count_max?: number;
}

export interface AdminUserDetail {
  account_information: Record<string, unknown> & AdminUser;
  characters: Array<Record<string, unknown>>;
  story_library: Array<Record<string, unknown>>;
  payment_history: Array<Record<string, unknown>>;
  generation_history: Array<Record<string, unknown>>;
}

export interface AdminUserCreateInput {
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  subscription_status?: string;
  credit?: number;
}

export interface AdminUserUpdateInput {
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  subscription_status?: string;
  credit?: number;
}

/**
 * Get story generation counts per day (from stories table) for the last N days.
 */
export async function getStoryCountsByDay(days: number = 90): Promise<ApiResponse<StoryCountByDay[]>> {
  try {
    const response = await fetch(`${API_URL}/admin/analysis/story-counts-by-day?days=${days}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      return {
        success: false,
        error: errorData.detail || `HTTP ${response.status}: ${response.statusText}`
      };
    }
    const json = await response.json();
    return { success: true, data: json.data ?? [] };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to fetch story counts' };
  }
}

/**
 * Get login/register counts per day (from user_auth_history table) for the last N days.
 */
export async function getUserAuthCountsByDay(days: number = 90): Promise<ApiResponse<UserAuthCountByDay[]>> {
  try {
    const response = await fetch(`${API_URL}/admin/analysis/user-auth-counts-by-day?days=${days}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      return {
        success: false,
        error: errorData.detail || `HTTP ${response.status}: ${response.statusText}`
      };
    }
    const json = await response.json();
    return { success: true, data: json.data ?? [] };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to fetch user auth counts' };
  }
}

/**
 * Get users list for admin user management page
 */
export async function getUsers(filters?: AdminUserListFilters): Promise<ApiResponse<AdminUser[]>> {
  try {
    const query = new URLSearchParams();
    if (filters?.search?.trim()) query.set('search', filters.search.trim());
    if (filters?.account_type?.trim()) query.set('account_type', filters.account_type.trim());
    if (filters?.subscription_status?.trim()) query.set('subscription_status', filters.subscription_status.trim());
    if (filters?.registered_from?.trim()) query.set('registered_from', filters.registered_from.trim());
    if (filters?.registered_to?.trim()) query.set('registered_to', filters.registered_to.trim());
    if (typeof filters?.story_count_min === 'number' && Number.isFinite(filters.story_count_min)) {
      query.set('story_count_min', String(filters.story_count_min));
    }
    if (typeof filters?.story_count_max === 'number' && Number.isFinite(filters.story_count_max)) {
      query.set('story_count_max', String(filters.story_count_max));
    }

    const response = await fetch(`${API_URL}/admin/users${query.toString() ? `?${query.toString()}` : ''}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      return {
        success: false,
        error: errorData.detail || `HTTP ${response.status}: ${response.statusText}`
      };
    }
    const json = await response.json();
    return { success: true, data: json.data ?? [] };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to fetch users' };
  }
}

/**
 * Get a single user detail payload for admin.
 */
export async function getUserDetail(userId: string): Promise<ApiResponse<AdminUserDetail>> {
  try {
    const response = await fetch(`${API_URL}/admin/users/${userId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      return {
        success: false,
        error: errorData.detail || `HTTP ${response.status}: ${response.statusText}`
      };
    }
    const json = await response.json();
    return { success: true, data: json.data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to fetch user detail' };
  }
}

/**
 * Create user record from admin panel
 */
export async function createUser(payload: AdminUserCreateInput): Promise<ApiResponse<AdminUser>> {
  try {
    const response = await fetch(`${API_URL}/admin/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      return {
        success: false,
        error: errorData.detail || `HTTP ${response.status}: ${response.statusText}`
      };
    }
    const json = await response.json();
    return { success: true, data: json.data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to create user' };
  }
}

/**
 * Update user record from admin panel
 */
export async function updateUser(userId: string, payload: AdminUserUpdateInput): Promise<ApiResponse<AdminUser>> {
  try {
    const response = await fetch(`${API_URL}/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      return {
        success: false,
        error: errorData.detail || `HTTP ${response.status}: ${response.statusText}`
      };
    }
    const json = await response.json();
    return { success: true, data: json.data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to update user' };
  }
}

/**
 * Delete user record from admin panel
 */
export async function deleteUser(userId: string): Promise<ApiResponse<void>> {
  try {
    const response = await fetch(`${API_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      return {
        success: false,
        error: errorData.detail || `HTTP ${response.status}: ${response.statusText}`
      };
    }
    const json = await response.json();
    return { success: true, message: json.message };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to delete user' };
  }
}

/**
 * Get all book templates
 */
export async function getTemplates(
  storyFormat?: BookTemplateStoryFormat
): Promise<ApiResponse<BookTemplate[]>> {
  try {
    const query = new URLSearchParams();
    if (storyFormat) {
      query.set('story_format', storyFormat);
    }

    const response = await fetch(`${API_URL}/admin/templates${query.toString() ? `?${query.toString()}` : ''}`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      return {
        success: false,
        error: errorData.detail || `HTTP ${response.status}: ${response.statusText}`
      };
    }

    const result = await response.json();
    return {
      success: true,
      data: result.data
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error'
    };
  }
}

/**
 * Get one random book template by story world via backend API.
 * Uses backend service-level DB access, avoiding frontend RLS visibility issues.
 */
export async function getRandomTemplateByStoryWorld(
  storyWorld: 'forest' | 'underwater' | 'outerspace',
  storyStyle?: string,
  storyFormat?: BookTemplateStoryFormat | 'story' | 'interactive' | string
): Promise<ApiResponse<BookTemplate>> {
  try {
    const query = new URLSearchParams({
      story_world: storyWorld
    });
    if (storyStyle && storyStyle.trim()) {
      query.set('story_style', storyStyle.trim().toLowerCase());
    }
    if (storyFormat && storyFormat.trim()) {
      const normalizedFormat = storyFormat.trim().toLowerCase().replace('-', '_');
      const storyFormatQuery: BookTemplateStoryFormat =
        normalizedFormat === 'interactive_story' || normalizedFormat === 'interactive'
          ? 'interactive_story'
          : 'adventure_story';
      query.set('story_format', storyFormatQuery);
    }

    const response = await fetch(
      `${API_URL}/templates/random?${query.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      return {
        success: false,
        error: errorData.detail || `HTTP ${response.status}: ${response.statusText}`
      };
    }

    const result = await response.json();
    if (!result?.success || !result?.data) {
      return {
        success: false,
        error: result?.error || 'No template data returned'
      };
    }

    return {
      success: true,
      data: result.data
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error'
    };
  }
}

/**
 * Create a new book template
 */
export async function createTemplate(
  name: string,
  storyWorld?: 'forest' | 'underwater' | 'outerspace',
  storyStyle?: TemplateStoryStyle | string,
  storyFormat: BookTemplateStoryFormat = 'adventure_story'
): Promise<ApiResponse<BookTemplate>> {
  try {
    const response = await fetch(`${API_URL}/admin/templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        story_world: storyWorld,
        story_style: storyStyle,
        story_format: storyFormat
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      return {
        success: false,
        error: errorData.detail || `HTTP ${response.status}: ${response.statusText}`
      };
    }

    const result = await response.json();
    return {
      success: true,
      data: result.data
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error'
    };
  }
}

/**
 * Delete a book template
 */
export async function deleteTemplate(
  templateId: string,
  storyFormat?: BookTemplateStoryFormat
): Promise<ApiResponse<void>> {
  try {
    const query = new URLSearchParams();
    if (storyFormat) {
      query.set('story_format', storyFormat);
    }

    const response = await fetch(
      `${API_URL}/admin/templates/${templateId}${query.toString() ? `?${query.toString()}` : ''}`,
      {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      return {
        success: false,
        error: errorData.detail || `HTTP ${response.status}: ${response.statusText}`
      };
    }

    const result = await response.json();
    return {
      success: true,
      message: result.message
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error'
    };
  }
}

/**
 * Upload a single image for a template field
 */
export async function uploadTemplateImage(
  templateId: string,
  file: File,
  fieldKey: string
): Promise<ApiResponse<BookTemplate>> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('field_key', fieldKey);

    const response = await fetch(`${API_URL}/admin/templates/${templateId}/upload-image`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      return {
        success: false,
        error: errorData.detail || `HTTP ${response.status}: ${response.statusText}`
      };
    }

    const result = await response.json();
    return {
      success: true,
      data: result.data
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error'
    };
  }
}

/**
 * Upload a single story page image for a template
 */
export async function uploadStoryPage(
  templateId: string,
  file: File,
  pageIndex: number
): Promise<ApiResponse<BookTemplate>> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('page_index', pageIndex.toString());

    const response = await fetch(`${API_URL}/admin/templates/${templateId}/upload-story-page`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      return {
        success: false,
        error: errorData.detail || `HTTP ${response.status}: ${response.statusText}`
      };
    }

    const result = await response.json();
    return {
      success: true,
      data: result.data
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error'
    };
  }
}

/**
 * Upload a single main character image for a template (0-based index in main_character_images array)
 */
export async function uploadMainCharacterImage(
  templateId: string,
  file: File,
  imageIndex: number
): Promise<ApiResponse<BookTemplate>> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('image_index', imageIndex.toString());

    const response = await fetch(
      `${API_URL}/admin/templates/${templateId}/upload-main-character-image`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      return {
        success: false,
        error: errorData.detail || `HTTP ${response.status}: ${response.statusText}`
      };
    }

    const result = await response.json();
    return {
      success: true,
      data: result.data
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error'
    };
  }
}

/**
 * Upload a single character-for-finding image for a template (0-based index in character_for_finding array)
 */
export async function uploadCharacterForFindingImage(
  templateId: string,
  file: File,
  imageIndex: number
): Promise<ApiResponse<BookTemplate>> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('image_index', imageIndex.toString());

    const response = await fetch(
      `${API_URL}/admin/templates/${templateId}/upload-character-for-finding-image`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      return {
        success: false,
        error: errorData.detail || `HTTP ${response.status}: ${response.statusText}`
      };
    }

    const result = await response.json();
    return {
      success: true,
      data: result.data
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Network error' };
  }
}

/**
 * Upload multiple story page images for a template (uploads one by one sequentially)
 */
export async function uploadStoryPages(
  templateId: string,
  files: File[],
  existingImages: string[]
): Promise<ApiResponse<BookTemplate>> {
  try {
    let currentData: BookTemplate | undefined;
    const startIndex = existingImages.length;
    
    // Upload files one by one to avoid 413 error
    for (let i = 0; i < files.length; i++) {
      const pageIndex = startIndex + i;
      const file = files[i];
      
      const result = await uploadStoryPage(templateId, file, pageIndex);
      
      if (!result.success || result.error) {
        return {
          success: false,
          error: `Failed to upload image ${i + 1}/${files.length}: ${result.error}`
        };
      }
      
      currentData = result.data;
    }

    return {
      success: true,
      data: currentData
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error'
    };
  }
}

/**
 * Delete a single image field from a template.
 * Also removes the underlying object from storage on the backend.
 */
export async function deleteTemplateImage(
  templateId: string,
  fieldKey: 'cover_image' | 'copyright_page_image' | 'dedication_page_image' | 'last_words_page_image' | 'last_story_page_image' | 'back_cover_image'
): Promise<ApiResponse<BookTemplate>> {
  try {
    const response = await fetch(
      `${API_URL}/admin/templates/${templateId}/image?field_key=${encodeURIComponent(fieldKey)}`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      return {
        success: false,
        error: errorData.detail || `HTTP ${response.status}: ${response.statusText}`
      };
    }

    const result = await response.json();
    return {
      success: true,
      data: result.data
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error'
    };
  }
}

/**
 * Delete one story page image by index.
 * Also removes the underlying object from storage on the backend.
 */
export async function deleteStoryPage(
  templateId: string,
  pageIndex: number
): Promise<ApiResponse<BookTemplate>> {
  try {
    const response = await fetch(`${API_URL}/admin/templates/${templateId}/story-page/${pageIndex}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      return {
        success: false,
        error: errorData.detail || `HTTP ${response.status}: ${response.statusText}`
      };
    }

    const result = await response.json();
    return {
      success: true,
      data: result.data
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error'
    };
  }
}

/**
 * Delete one main character image by index.
 * Also removes the underlying object from storage on the backend.
 */
export async function deleteMainCharacterImage(
  templateId: string,
  imageIndex: number
): Promise<ApiResponse<BookTemplate>> {
  try {
    const response = await fetch(
      `${API_URL}/admin/templates/${templateId}/main-character-image/${imageIndex}`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      return {
        success: false,
        error: errorData.detail || `HTTP ${response.status}: ${response.statusText}`
      };
    }

    const result = await response.json();
    return {
      success: true,
      data: result.data
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error'
    };
  }
}

export async function deleteCharacterForFindingImage(
  templateId: string,
  imageIndex: number
): Promise<ApiResponse<BookTemplate>> {
  try {
    const response = await fetch(
      `${API_URL}/admin/templates/${templateId}/character-for-finding-image/${imageIndex}`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      return {
        success: false,
        error: errorData.detail || `HTTP ${response.status}: ${response.statusText}`
      };
    }

    const result = await response.json();
    return {
      success: true,
      data: result.data
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Network error' };
  }
}

/**
 * Update template metadata (e.g., remove story pages, update story_world)
 */
export async function updateTemplate(
  templateId: string,
  updates: {
    name?: string;
    story_world?: 'forest' | 'underwater' | 'outerspace' | null;
    story_style?: TemplateStoryStyle | string | null;
    story_type?: TemplateStoryStyle | string | null;
    story_format?: BookTemplateStoryFormat | string | null;
    cover_image?: string | null;
    copyright_page_image?: string | null;
    dedication_page_image?: string | null;
    story_page_images?: string[];
    main_character_images?: string[];
    character_for_finding?: string[];
    positions?: { x: number; y: number }[];
    last_words_page_image?: string | null;
    last_story_page_image?: string | null;
    back_cover_image?: string | null;
  }
): Promise<ApiResponse<BookTemplate>> {
  try {
    const response = await fetch(`${API_URL}/admin/templates/${templateId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      return {
        success: false,
        error: errorData.detail || `HTTP ${response.status}: ${response.statusText}`
      };
    }

    const result = await response.json();
    return {
      success: true,
      data: result.data
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error'
    };
  }
}
