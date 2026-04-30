
import { supabase } from '../supabase';
import { env } from '../env';

export interface BookTemplate {
  id: string;
  name: string;
  story_world?: 'forest' | 'underwater' | 'outerspace';
  story_style?: string;
  story_format?: string;
  cover_image?: string;
  copyright_page_image?: string;
  dedication_page_image?: string;
  story_page_images?: string[];
  main_character_images?: string[];
  last_words_page_image?: string;
  last_story_page_image?: string;
  back_cover_image?: string;
  created_at?: string;
}

export interface BookTemplateInsert {
  name: string;
  story_world?: 'forest' | 'underwater' | 'outerspace';
  story_style?: string;
  story_format?: string;
  cover_image?: string;
  copyright_page_image?: string;
  dedication_page_image?: string;
  story_page_images?: string[];
  main_character_images?: string[];
  last_words_page_image?: string;
  last_story_page_image?: string;
  back_cover_image?: string;
}

export async function getBookTemplates(): Promise<{ data: BookTemplate[] | null; error: string | null }> {
  const { data, error } = await supabase
    .from('book_templates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as BookTemplate[], error: null };
}

export async function addBookTemplate(
  template: BookTemplateInsert
): Promise<{ data: BookTemplate | null; error: string | null }> {
  const { data, error } = await supabase
    .from('book_templates')
    .insert(template)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as BookTemplate, error: null };
}

export async function updateBookTemplate(
  id: string,
  updates: Partial<BookTemplateInsert>
): Promise<{ data: BookTemplate | null; error: string | null }> {
  const { data, error } = await supabase
    .from('book_templates')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as BookTemplate, error: null };
}

export async function deleteBookTemplate(
  id: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('book_templates').delete().eq('id', id);
  return { error: error?.message ?? null };
}

export async function getRandomTemplateByStoryWorld(
  storyWorld: 'forest' | 'underwater' | 'outerspace'
): Promise<{ data: BookTemplate | null; error: string | null }> {
  try {
    const response = await fetch(
      `${env.API_BASE_URL}/templates/random?story_world=${encodeURIComponent(storyWorld)}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    );

    if (response.ok) {
      const result = await response.json();
      if (result?.success && result?.data?.cover_image) {
        return { data: result.data as BookTemplate, error: null };
      }
      if (result?.error) {
        return { data: null, error: result.error as string };
      }
    } else {
      const errorBody = await response.json().catch(() => null);
      const errorMessage = errorBody?.detail || `HTTP ${response.status}: ${response.statusText}`;
      console.warn(`Backend template lookup failed: ${errorMessage}`);
    }
  } catch (backendError) {
    console.warn('Backend template lookup unavailable, falling back to Supabase client query:', backendError);
  }

  const { data, error } = await supabase
    .from('book_templates')
    .select('*')
    .eq('story_world', storyWorld)
    .not('cover_image', 'is', null);

  if (error) return { data: null, error: error.message };
  
  if (!data || data.length === 0) {
    return { data: null, error: `No templates found for story world: ${storyWorld}` };
  }
  
  const randomIndex = Math.floor(Math.random() * data.length);
  return { data: data[randomIndex] as BookTemplate, error: null };
}
