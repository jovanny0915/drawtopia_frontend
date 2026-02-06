import { getStoryById } from '$lib/database/stories';

function getStoryMeta(story: any): { title: string; description: string; imageUrl: string } | null {
  const row = Array.isArray(story) ? story[0] : story;
  if (!row) return null;
  const title = row.story_title || 'Untitled Story';
  const description = `"${title}" – A story created with Drawtopia.`;
  const imageUrl = row.story_cover ? row.story_cover.split('?')[0] : '';
  return { title, description, imageUrl };
}

export async function load({ url }) {
  // Share URL format: /share?{uid} (no param name)
  const uid = url.search ? url.search.slice(1).trim() : '';
  const shareCanonicalUrl = uid ? `${url.origin}${url.pathname}?${uid}` : '';
  if (!uid) {
    return { story: null, uid: '', shareCanonicalUrl, meta: null };
  }
  const result = await getStoryById(uid);
  const story = result.success && result.data ? result.data : null;
  const meta = story ? getStoryMeta(story) : null;
  return { story, uid, shareCanonicalUrl, meta };
}
