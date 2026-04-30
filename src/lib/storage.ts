
import { supabase } from './supabase';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export async function uploadAvatar(file: File, userId?: string, onProgress?: (progress: number) => void): Promise<UploadResult> {
  try {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.'
      };
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'File size too large. Please upload an image smaller than 5MB.'
      };
    }

    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${userId || 'user'}_${timestamp}_${randomString}.${fileExtension}`;

    if (onProgress) {
      onProgress(10);
      await new Promise(resolve => setTimeout(resolve, 100));
      onProgress(30);
    }

    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (onProgress) {
      onProgress(80);
      await new Promise(resolve => setTimeout(resolve, 150));
    }

    if (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload image'
      };
    }

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(data.path);

    if (onProgress) {
      onProgress(100);
    }

    return {
      success: true,
      url: urlData.publicUrl
    };

  } catch (error) {
    console.error('Avatar upload error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while uploading the image'
    };
  }
}

export async function deleteAvatar(filePath: string): Promise<{ success: boolean; error?: string }> {
  try {
    let fileName = filePath;
    if (filePath.includes('/avatars/')) {
      fileName = filePath.split('/avatars/').pop() || filePath;
    }

    const { error } = await supabase.storage
      .from('avatars')
      .remove([fileName]);

    if (error) {
      console.error('Delete error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete image'
      };
    }

    return { success: true };

  } catch (error) {
    console.error('Avatar deletion error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while deleting the image'
    };
  }
}

export async function uploadCharacterImage(
  file: File, 
  userId?: string, 
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  try {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.'
      };
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'File size too large. Please upload an image smaller than 10MB.'
      };
    }

    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `character_${userId || 'user'}_${timestamp}_${randomString}.${fileExtension}`;

    if (onProgress) {
      onProgress(10);
      await new Promise(resolve => setTimeout(resolve, 100));
      onProgress(30);
    }

    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (onProgress) {
      onProgress(80);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    if (error) {
      console.error('Character upload error:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload character image'
      };
    }

    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(data.path);

    if (onProgress) {
      onProgress(100);
    }

    return {
      success: true,
      url: urlData.publicUrl
    };

  } catch (error) {
    console.error('Character upload error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while uploading the character image'
    };
  }
}

export async function deleteCharacterImage(filePath: string): Promise<{ success: boolean; error?: string }> {
  try {
    let fileName = filePath;
    if (filePath.includes('/images/')) {
      fileName = filePath.split('/images/').pop() || filePath;
    }

    const { error } = await supabase.storage
      .from('images')
      .remove([fileName]);

    if (error) {
      console.error('Delete error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete character image'
      };
    }

    return { success: true };

  } catch (error) {
    console.error('Character image deletion error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while deleting the character image'
    };
  }
}

export function getOptimizedImageUrl(url: string, width: number = 40, height: number = 40): string {
  if (url.includes('supabase')) {
    return `${url}?width=${width}&height=${height}&resize=cover&quality=80`;
  }
  return url;
}

export async function uploadBookTemplateImage(
  file: File, 
  imageType: 'cover' | 'copyright' | 'dedication' | 'story' | 'last_story' | 'back_cover',
  templateId?: string, 
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  try {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.'
      };
    }

    const maxSize = 15 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'File size too large. Please upload an image smaller than 15MB.'
      };
    }

    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `template_${imageType}_${templateId || 'new'}_${timestamp}_${randomString}.${fileExtension}`;

    if (onProgress) {
      onProgress(10);
      await new Promise(resolve => setTimeout(resolve, 100));
      onProgress(30);
    }

    const { data, error } = await supabase.storage
      .from('book-templates')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (onProgress) {
      onProgress(80);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    if (error) {
      console.error('Book template image upload error:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload book template image'
      };
    }

    const { data: urlData } = supabase.storage
      .from('book-templates')
      .getPublicUrl(data.path);

    if (onProgress) {
      onProgress(100);
    }

    return {
      success: true,
      url: urlData.publicUrl
    };

  } catch (error) {
    console.error('Book template image upload error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while uploading the book template image'
    };
  }
}

export async function deleteBookTemplateImage(filePath: string): Promise<{ success: boolean; error?: string }> {
  try {
    let fileName = filePath;
    if (filePath.includes('/book-templates/')) {
      fileName = filePath.split('/book-templates/').pop() || filePath;
    }

    const { error } = await supabase.storage
      .from('book-templates')
      .remove([fileName]);

    if (error) {
      console.error('Delete error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete book template image'
      };
    }

    return { success: true };

  } catch (error) {
    console.error('Book template image deletion error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while deleting the book template image'
    };
  }
}

export async function uploadBookTemplateStoryPages(
  files: File[],
  templateId?: string,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; urls?: string[]; errors?: string[] }> {
  try {
    const results: UploadResult[] = [];
    const totalFiles = files.length;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const result = await uploadBookTemplateImage(
        file,
        'story',
        templateId,
        (fileProgress) => {
          if (onProgress) {
            const overallProgress = ((i / totalFiles) * 100) + ((fileProgress / totalFiles));
            onProgress(Math.min(overallProgress, 100));
          }
        }
      );
      results.push(result);
    }

    const allSucceeded = results.every(r => r.success);
    const urls = results.filter(r => r.success && r.url).map(r => r.url!);
    const errors = results.filter(r => !r.success && r.error).map(r => r.error!);

    return {
      success: allSucceeded,
      urls: urls.length > 0 ? urls : undefined,
      errors: errors.length > 0 ? errors : undefined
    };

  } catch (error) {
    console.error('Story pages upload error:', error);
    return {
      success: false,
      errors: ['An unexpected error occurred while uploading story page images']
    };
  }
}
