/**
 * Admin API Client
 * Handles all admin operations by sending requests to the backend API
 */

import { env } from '$lib/env';

const API_URL = "https://image-edit-five.vercel.app/api";

export interface BookTemplate {
  id: string;
  name: string;
  story_world?: 'forest' | 'underwater' | 'outerspace';
  cover_image?: string;
  copyright_page_image?: string;
  dedication_page_image?: string;
  story_page_images?: string[];
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
