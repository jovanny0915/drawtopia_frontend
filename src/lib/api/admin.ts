/**
 * Admin API Client
 * Handles all admin operations by sending requests to the backend API
 */

import { env } from '$lib/env';

const API_URL = env.API_BASE_URL;

export interface BookTemplate {
  id: string;
  name: string;
  story_world?: 'forest' | 'underwater' | 'outerspace';
  cover_image?: string;
  copyright_page_image?: string;
  dedication_page_image?: string;
  story_page_images?: string[];
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
  avatar_url?: string | null;
  role?: string | null;
  subscription_status?: string | null;
  credit?: number | null;
  created_at?: string | null;
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
export async function getUsers(): Promise<ApiResponse<AdminUser[]>> {
  try {
    const response = await fetch(`${API_URL}/admin/users`, {
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
export async function getTemplates(): Promise<ApiResponse<BookTemplate[]>> {
  try {
    const response = await fetch(`${API_URL}/admin/templates`, {
      method: 'GET',
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
 * Create a new book template
 */
export async function createTemplate(name: string, storyWorld?: 'forest' | 'underwater' | 'outerspace'): Promise<ApiResponse<BookTemplate>> {
  try {
    const response = await fetch(`${API_URL}/admin/templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, story_world: storyWorld })
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
export async function deleteTemplate(templateId: string): Promise<ApiResponse<void>> {
  try {
    const response = await fetch(`${API_URL}/admin/templates/${templateId}`, {
      method: 'DELETE',
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
  fieldKey: string,
  templateName: string
): Promise<ApiResponse<BookTemplate>> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('field_key', fieldKey);
    formData.append('template_name', templateName);

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
  templateName: string,
  pageIndex: number
): Promise<ApiResponse<BookTemplate>> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('template_name', templateName);
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
 * Upload multiple story page images for a template (uploads one by one sequentially)
 */
export async function uploadStoryPages(
  templateId: string,
  files: File[],
  templateName: string,
  existingImages: string[]
): Promise<ApiResponse<BookTemplate>> {
  try {
    let currentData: BookTemplate | undefined;
    const startIndex = existingImages.length;
    
    // Upload files one by one to avoid 413 error
    for (let i = 0; i < files.length; i++) {
      const pageIndex = startIndex + i;
      const file = files[i];
      
      const result = await uploadStoryPage(templateId, file, templateName, pageIndex);
      
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
 * Update template metadata (e.g., remove story pages, update story_world)
 */
export async function updateTemplate(
  templateId: string,
  updates: {
    name?: string;
    story_world?: 'forest' | 'underwater' | 'outerspace';
    cover_image?: string;
    copyright_page_image?: string;
    dedication_page_image?: string;
    story_page_images?: string[];
    last_story_page_image?: string;
    back_cover_image?: string;
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
