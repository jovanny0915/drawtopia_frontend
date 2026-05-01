import { env } from '$lib/env';

const API_URL = env.API_BASE_URL;

export interface AdminStorySummary {
  id: string;
  uid?: string | null;
  story_title: string;
  character_name: string;
  format?: string | null;
  status?: string | null;
  created_at?: string | null;
  cover_image?: string | null;
  user_email?: string | null;
  user_name?: string | null;
  child_name?: string | null;
}

export interface AdminStoryPage {
  key: string;
  label: string;
  image_url?: string | string[] | null;
  image_urls?: string[];
  page_number?: number | null;
  text?: string | null;
}

export interface AdminStoryPageText {
  page_number: number;
  text: string;
  audio_url?: string | null;
}

export interface AdminStoryDetail {
  id: string;
  uid?: string | null;
  story_title: string;
  character_name: string;
  format?: string | null;
  status?: string | null;
  cover_image?: string | null;
  pages: AdminStoryPage[];
  story_pages_text: AdminStoryPageText[];
  character?: {
    id?: string | null;
    character_name?: string | null;
    original_image_url?: string | null;
    enhanced_images?: string[];
  };
  raw_story?: Record<string, any>;
}

export interface AdminStoriesResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  detail?: string;
}

async function parseAdminStoryResponse<T>(response: Response): Promise<AdminStoriesResponse<T>> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      success: false,
      error: data.detail || data.error || data.message || response.statusText
    };
  }
  return data as AdminStoriesResponse<T>;
}

export async function getAdminStories(): Promise<AdminStoriesResponse<AdminStorySummary[]>> {
  try {
    const response = await fetch(`${API_URL}/admin/stories`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });
    return await parseAdminStoryResponse<AdminStorySummary[]>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load stories'
    };
  }
}

export async function getAdminStoryDetail(storyId: string): Promise<AdminStoriesResponse<AdminStoryDetail>> {
  try {
    const response = await fetch(`${API_URL}/admin/stories/${encodeURIComponent(storyId)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });
    return await parseAdminStoryResponse<AdminStoryDetail>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load story detail'
    };
  }
}

export async function updateAdminStory(
  storyId: string,
  updates: {
    story_title?: string | null;
    story_pages_text?: AdminStoryPageText[];
    scene_images?: string[];
    scene_image_update?: {
      page_number: number;
      image_url: string;
      image_index?: number;
    };
    story_cover?: string | null;
    cover_image?: string | null;
    enhanced_images?: string[];
  }
): Promise<AdminStoriesResponse<AdminStoryDetail['raw_story']>> {
  try {
    const response = await fetch(`${API_URL}/admin/stories/${encodeURIComponent(storyId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return await parseAdminStoryResponse<AdminStoryDetail['raw_story']>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update story'
    };
  }
}
