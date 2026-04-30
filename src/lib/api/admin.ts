
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

export type AdminStoryFormat =
  | 'interactive_search'
  | 'story_adventure'
  | 'interactive_story'
  | 'adventure_story';
export type AdminStoryStatus = 'draft' | 'generating' | 'completed' | 'failed' | string;

export interface AdminStoryListFilters {
  search?: string;
  status?: string;
  format_type?: string;
  created_from?: string;
  created_to?: string;
}

export interface AdminStorySummary {
  id: string;
  uid?: string | null;
  story_title: string;
  character_name: string;
  format: AdminStoryFormat;
  status: AdminStoryStatus;
  created_at?: string | null;
  generation_duration_seconds?: number | null;
  user_id?: string | null;
  user_email?: string | null;
  user_name?: string | null;
  child_name?: string | null;
  cover_image?: string | null;
  error_message?: string | null;
}

export interface AdminStoryPage {
  key: string;
  label: string;
  image_url: string;
  page_number?: number | null;
  text?: string | null;
}

export interface AdminStoryTextPage {
  page_number: number;
  text: string;
  audio_url?: string | null;
}

export interface AdminStoryDetail {
  id: string;
  uid?: string | null;
  story_title: string;
  character_name: string;
  status: AdminStoryStatus;
  format: AdminStoryFormat;
  created_at?: string | null;
  generation_duration_seconds?: number | null;
  owner?: {
    user_id?: string | null;
    email?: string | null;
    name?: string | null;
  } | null;
  child_profile?: Record<string, unknown> | null;
  character?: {
    id?: string | null;
    character_name?: string | null;
    original_image_url?: string | null;
    enhanced_images?: string[] | null;
  } | null;
  cover_image?: string | null;
  pages: AdminStoryPage[];
  story_pages_text: AdminStoryTextPage[];
  jobs: Array<Record<string, unknown>>;
  raw_story: Record<string, unknown>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function pickString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

function pickIdentifier(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

function pickNumber(...values: unknown[]): number | null | undefined {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return undefined;
}

function unwrapAdminPayload(value: unknown): unknown {
  if (!isRecord(value)) return value;

  const nestedData = value.data;
  if (Array.isArray(nestedData) || isRecord(nestedData)) {
    return nestedData;
  }

  return value;
}

function normalizeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  }
  if (typeof value === 'string' && value.trim()) {
    return [value.trim()];
  }
  return [];
}

function normalizeAdminStorySummary(value: unknown): AdminStorySummary | undefined {
  const raw = isRecord(value) ? value : undefined;
  if (!raw) return undefined;

  const normalizedFormat = normalizeStoryFormat(raw.format ?? raw.story_format ?? raw.story_type);

  return {
    id: pickIdentifier(raw.id, raw.uid) ?? '',
    uid: pickIdentifier(raw.uid) ?? null,
    story_title: pickString(raw.story_title, raw.title, raw.story_name) ?? 'Untitled story',
    character_name: pickString(raw.character_name) ?? 'Untitled character',
    format: normalizedFormat,
    status: pickString(raw.status, raw.story_status) ?? 'Unknown',
    created_at: pickString(raw.created_at, raw.createdAt) ?? null,
    generation_duration_seconds: pickNumber(
      raw.generation_duration_seconds,
      raw.generation_duration,
      raw.duration_seconds
    ) ?? null,
    user_id: pickIdentifier(raw.user_id) ?? null,
    user_email: pickString(raw.user_email, raw.email) ?? null,
    user_name: pickString(raw.user_name, raw.owner_name, raw.name) ?? null,
    child_name: pickString(raw.child_name) ?? null,
    cover_image: pickString(raw.cover_image, raw.story_cover, raw.coverImage) ?? null,
    error_message: pickString(raw.error_message, raw.error) ?? null
  };
}

function normalizeStoryFormat(value: unknown): AdminStoryFormat {
  if (value === 'interactive_story') return 'interactive_search';
  if (value === 'adventure_story') return 'story_adventure';
  if (value === 'interactive_search' || value === 'story_adventure') return value;
  return 'story_adventure';
}

function normalizeStoryTextPages(raw: Record<string, unknown>): AdminStoryTextPage[] {
  if (Array.isArray(raw.story_pages_text)) {
    return raw.story_pages_text
      .map((item, index): AdminStoryTextPage | null => {
        if (typeof item === 'string') {
          return { page_number: index + 1, text: item, audio_url: null };
        }
        if (!isRecord(item)) return null;

        const text = pickString(item.text, item.story, item.pageText);
        if (!text) return null;

        return {
          page_number: pickNumber(item.page_number, item.pageNumber) ?? index + 1,
          text,
          audio_url: pickString(item.audio_url, item.audioUrl) ?? null
        };
      })
      .filter((item): item is AdminStoryTextPage => item !== null);
  }

  const storyContent = raw.story_content;
  const parsed =
    typeof storyContent === 'string'
      ? (() => {
          try {
            return JSON.parse(storyContent);
          } catch {
            return storyContent.trim() ? { pages: [storyContent.trim()] } : null;
          }
        })()
      : storyContent;

  const pagesSource =
    Array.isArray(parsed) ? parsed : isRecord(parsed) && Array.isArray(parsed.pages) ? parsed.pages : [];

  return pagesSource
    .map((item, index): AdminStoryTextPage | null => {
      if (typeof item === 'string') {
        return item.trim() ? { page_number: index + 1, text: item.trim(), audio_url: null } : null;
      }
      if (!isRecord(item)) return null;

      const text = pickString(item.text, item.story, item.pageText);
      if (!text) return null;

      return {
        page_number: pickNumber(item.page_number, item.pageNumber) ?? index + 1,
        text,
        audio_url: pickString(item.audio_url, item.audioUrl) ?? null
      };
    })
    .filter((item): item is AdminStoryTextPage => item !== null);
}

function normalizeStoryPages(raw: Record<string, unknown>, format: AdminStoryFormat): AdminStoryPage[] {
  if (Array.isArray(raw.pages)) {
    return raw.pages
      .map((item, index): AdminStoryPage | null => {
        if (!isRecord(item)) return null;

        const imageUrl = pickString(item.image_url, item.imageUrl, item.url);
        if (!imageUrl) return null;

        return {
          key: pickString(item.key) ?? `page-${index + 1}`,
          label: pickString(item.label, item.title) ?? `Page ${index + 1}`,
          image_url: imageUrl,
          page_number: pickNumber(item.page_number, item.pageNumber) ?? null,
          text: pickString(item.text, item.story) ?? null
        };
      })
      .filter((item): item is AdminStoryPage => item !== null);
  }

  const pages: AdminStoryPage[] = [];
  const addPage = (
    label: string,
    imageUrl: string | undefined,
    key: string,
    pageNumber: number | null = null,
    text: string | null = null
  ) => {
    if (!imageUrl) return;
    pages.push({
      key,
      label,
      image_url: imageUrl,
      page_number: pageNumber,
      text
    });
  };

  addPage(
    'Copyright',
    pickString(raw.copyright_image, raw.copyright_page_image),
    'copyright'
  );
  addPage(
    'Dedication',
    pickString(raw.dedication_image, raw.dedication_page_image),
    'dedication'
  );

  const textPages = normalizeStoryTextPages(raw);
  const sceneImages = normalizeStringArray(raw.scene_images ?? raw.story_page_images ?? raw.page_images);
  const itemLabel = format === 'interactive_search' ? 'Scene' : 'Page';
  sceneImages.forEach((imageUrl, index) => {
    const pageNumber = index + 1;
    const matchingText = textPages.find((item) => item.page_number === pageNumber)?.text ?? null;
    addPage(`${itemLabel} ${pageNumber}`, imageUrl, `scene-${pageNumber}`, pageNumber, matchingText);
  });

  addPage(
    'Last Words',
    pickString(raw.last_word_page_image, raw.last_words_page_image),
    'last-words'
  );
  addPage(
    'Final Page',
    pickString(raw.last_admin_page_image, raw.last_story_page_image),
    'final-page'
  );
  addPage(
    'Back Cover',
    pickString(raw.back_cover_image, raw.back_page_image),
    'back-cover'
  );

  return pages;
}

function normalizeAdminStoryDetail(value: unknown): AdminStoryDetail | undefined {
  const unwrapped = unwrapAdminPayload(value);
  const raw = isRecord(unwrapped) ? unwrapped : undefined;
  if (!raw) return undefined;

  const normalizedFormat = normalizeStoryFormat(raw.format ?? raw.story_format);
  const owner = isRecord(raw.owner) ? raw.owner : {};
  const character = isRecord(raw.character) ? raw.character : {};

  return {
    id: pickIdentifier(raw.id) ?? '',
    uid: pickIdentifier(raw.uid) ?? null,
    story_title: pickString(raw.story_title, raw.title, raw.story_name) ?? 'Untitled story',
    character_name: pickString(raw.character_name, character.character_name) ?? 'Untitled character',
    status: pickString(raw.status, raw.story_status) ?? 'Unknown',
    format: normalizedFormat,
    created_at: pickString(raw.created_at, raw.createdAt) ?? null,
    generation_duration_seconds: pickNumber(
      raw.generation_duration_seconds,
      raw.generation_duration,
      raw.duration_seconds
    ) ?? null,
    owner: {
      user_id: pickIdentifier(owner.user_id, raw.user_id) ?? null,
      email: pickString(owner.email, raw.user_email) ?? null,
      name: pickString(owner.name, raw.user_name, raw.owner_name) ?? null
    },
    child_profile: isRecord(raw.child_profile) ? raw.child_profile : null,
    character: {
      id: pickIdentifier(character.id, raw.character_id) ?? null,
      character_name: pickString(character.character_name, raw.character_name) ?? null,
      original_image_url: pickString(
        character.original_image_url,
        raw.original_image_url,
        raw.character_image,
        raw.character_original_image
      ) ?? null,
      enhanced_images: normalizeStringArray(character.enhanced_images ?? raw.enhanced_images)
    },
    cover_image: pickString(raw.cover_image, raw.story_cover, raw.coverImage) ?? null,
    pages: normalizeStoryPages(raw, normalizedFormat),
    story_pages_text: normalizeStoryTextPages(raw),
    jobs: Array.isArray(raw.jobs) ? raw.jobs.filter(isRecord) : [],
    raw_story: isRecord(raw.raw_story) ? raw.raw_story : raw
  };
}

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

export async function getAdminStories(filters?: AdminStoryListFilters): Promise<ApiResponse<AdminStorySummary[]>> {
  try {
    const query = new URLSearchParams();
    if (filters?.search?.trim()) query.set('search', filters.search.trim());
    if (filters?.status?.trim()) query.set('status', filters.status.trim());
    if (filters?.format_type?.trim()) query.set('format_type', filters.format_type.trim());
    if (filters?.created_from?.trim()) query.set('created_from', filters.created_from.trim());
    if (filters?.created_to?.trim()) query.set('created_to', filters.created_to.trim());

    const response = await fetch(`${API_URL}/admin/stories${query.toString() ? `?${query.toString()}` : ''}`, {
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
    const rawData = unwrapAdminPayload(json);
    const data = Array.isArray(rawData)
      ? rawData
          .map(normalizeAdminStorySummary)
          .filter((story): story is AdminStorySummary => story !== undefined)
      : [];

    return { success: true, data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to fetch admin stories' };
  }
}

export async function getAdminStoryDetail(storyId: string): Promise<ApiResponse<AdminStoryDetail>> {
  try {
    const response = await fetch(`${API_URL}/admin/stories/${encodeURIComponent(storyId)}`, {
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
    const normalized = normalizeAdminStoryDetail(json.data ?? json);

    if (!normalized) {
      return { success: false, error: 'Admin story detail response was empty or invalid' };
    }

    return { success: true, data: normalized };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to fetch admin story detail' };
  }
}

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

export async function uploadStoryPages(
  templateId: string,
  files: File[],
  existingImages: string[]
): Promise<ApiResponse<BookTemplate>> {
  try {
    let currentData: BookTemplate | undefined;
    const startIndex = existingImages.length;
    
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
