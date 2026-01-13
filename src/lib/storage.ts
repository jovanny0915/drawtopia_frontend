/**
 * Supabase Storage utilities for avatar uploads
 */

import { supabase } from './supabase';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload avatar to Supabase storage
 * @param file - The file to upload
 * @param userId - The user ID (optional, for organizing files)
 * @returns Promise with upload result
 */
export async function uploadAvatar(file: File, userId?: string, onProgress?: (progress: number) => void): Promise<UploadResult> {
  try {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.'
      };
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'File size too large. Please upload an image smaller than 5MB.'
      };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${userId || 'user'}_${timestamp}_${randomString}.${fileExtension}`;

    // Simulate progress for better UX (call onProgress if provided)
    if (onProgress) {
      onProgress(10);
      await new Promise(resolve => setTimeout(resolve, 100));
      onProgress(30);
    }

    // Upload to Supabase storage
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

    // Get public URL
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

/**
 * Delete avatar from Supabase storage
 * @param filePath - The file path to delete
 * @returns Promise with deletion result
 */
export async function deleteAvatar(filePath: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Extract filename from URL if full URL is provided
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

/**
 * Upload character image to Supabase storage
 * @param file - The file to upload
 * @param userId - The user ID (optional, for organizing files)
 * @param onProgress - Optional progress callback
 * @returns Promise with upload result
 */
export async function uploadCharacterImage(
  file: File, 
  userId?: string, 
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  try {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.'
      };
    }

    // Validate file size (10MB max for character images)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'File size too large. Please upload an image smaller than 10MB.'
      };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `character_${userId || 'user'}_${timestamp}_${randomString}.${fileExtension}`;

    // Simulate progress for better UX
    if (onProgress) {
      onProgress(10);
      await new Promise(resolve => setTimeout(resolve, 100));
      onProgress(30);
    }

    // Upload to Supabase storage
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

    // Get public URL
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

/**
 * Delete character image from Supabase storage
 * @param filePath - The file path to delete
 * @returns Promise with deletion result
 */
export async function deleteCharacterImage(filePath: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Extract filename from URL if full URL is provided
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

/**
 * Get optimized image URL with transformations
 * @param url - Original image URL
 * @param width - Desired width
 * @param height - Desired height
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(url: string, width: number = 40, height: number = 40): string {
  // For Supabase, we can use transformation parameters if enabled
  // Otherwise, return the original URL
  if (url.includes('supabase')) {
    return `${url}?width=${width}&height=${height}&resize=cover&quality=80`;
  }
  return url;
}
