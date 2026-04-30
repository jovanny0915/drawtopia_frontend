import { env } from '$lib/env';

const API_URL = env.API_BASE_URL;

export type PromptFileKey = 'prompt1' | 'prompt_image' | 'backend_prompts';

export interface PromptDocument {
  file_key: PromptFileKey;
  content: unknown;
  description?: string | null;
  version?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  updated_by?: string | null;
}

export interface PromptDocumentsResponse {
  success: boolean;
  data?: Partial<Record<PromptFileKey, unknown>>;
  documents?: PromptDocument[];
  error?: string;
  message?: string;
}

export interface PromptUpdateResponse {
  success: boolean;
  data?: unknown;
  document?: PromptDocument;
  error?: string;
  message?: string;
}

async function parsePromptResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || data.error || data.message || response.statusText);
  }
  return data as T;
}

export async function getAdminPrompts(): Promise<PromptDocumentsResponse> {
  try {
    const response = await fetch(`${API_URL}/admin/prompts`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });
    return await parsePromptResponse<PromptDocumentsResponse>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load prompts'
    };
  }
}

export async function updateAdminPrompt(
  fileKey: PromptFileKey,
  keyPath: string[],
  value: unknown,
  baseContent?: unknown
): Promise<PromptUpdateResponse> {
  try {
    const response = await fetch(`${API_URL}/admin/prompts`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file_key: fileKey,
        key_path: keyPath,
        value,
        base_content: baseContent
      })
    });
    return await parsePromptResponse<PromptUpdateResponse>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update prompt'
    };
  }
}

export async function resetAdminPrompt(fileKey: PromptFileKey, defaultContent?: unknown): Promise<PromptUpdateResponse> {
  try {
    const response = await fetch(`${API_URL}/admin/prompts/${encodeURIComponent(fileKey)}/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ default_content: defaultContent })
    });
    return await parsePromptResponse<PromptUpdateResponse>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reset prompt'
    };
  }
}
