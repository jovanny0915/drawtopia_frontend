/**
 * Book Templates Database Operations
 * Templates store image URLs for book pages.
 * 
 * Storage Structure:
 * All images are stored in: book-images/book-templates/[template-name]/
 * - cover_image.png
 * - copyright_page_image.png
 * - dedication_page_image.png
 * - story-page-1.png, story-page-2.png, etc.
 * - last_story_page_image.png
 * - back_cover_image.png
 */

import { supabase } from '../supabase';

export interface BookTemplate {
  id: string;
  name: string;
  /** Story world theme: forest, underwater, or outerspace */
  story_world?: 'forest' | 'underwater' | 'outerspace';
  /** URL to cover image stored in Supabase storage at: book-templates/[template-name]/cover_image.* */
  cover_image?: string;
  /** URL to copyright page image stored in Supabase storage at: book-templates/[template-name]/copyright_page_image.* */
  copyright_page_image?: string;
  /** URL to dedication page image stored in Supabase storage at: book-templates/[template-name]/dedication_page_image.* */
  dedication_page_image?: string;
  /** Array of URLs to story page images stored in Supabase storage at: book-templates/[template-name]/story-page-[N].* */
  story_page_images?: string[];
  /** URL to last story page image stored in Supabase storage at: book-templates/[template-name]/last_story_page_image.* */
  last_story_page_image?: string;
  /** URL to back cover image stored in Supabase storage at: book-templates/[template-name]/back_cover_image.* */
  back_cover_image?: string;
  created_at?: string;
}

export interface BookTemplateInsert {
  name: string;
  story_world?: 'forest' | 'underwater' | 'outerspace';
  cover_image?: string;
  copyright_page_image?: string;
  dedication_page_image?: string;
  story_page_images?: string[];
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

/**
 * Get a random book template by story_world
 * Used for cover generation to insert character into template cover image
 */
export async function getRandomTemplateByStoryWorld(
  storyWorld: 'forest' | 'underwater' | 'outerspace'
): Promise<{ data: BookTemplate | null; error: string | null }> {
  const { data, error } = await supabase
    .from('book_templates')
    .select('*')
    .eq('story_world', storyWorld)
    .not('cover_image', 'is', null); // Only get templates with cover images

  if (error) return { data: null, error: error.message };
  
  if (!data || data.length === 0) {
    return { data: null, error: `No templates found for story world: ${storyWorld}` };
  }
  
  // Select a random template from the results
  const randomIndex = Math.floor(Math.random() * data.length);
  return { data: data[randomIndex] as BookTemplate, error: null };
}
