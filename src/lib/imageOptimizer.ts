/**
 * Client-side Image Optimizer
 * Compresses and resizes images in the browser before upload to avoid 413 errors
 */

export interface OptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg';
}

export interface OptimizationResult {
  file: File;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
}

/**
 * Optimize an image file in the browser before upload
 * Reduces file size by resizing and compressing
 */
export async function optimizeImage(
  file: File,
  options: OptimizationOptions = {}
): Promise<OptimizationResult> {
  const {
    maxWidth = 2048,
    maxHeight = 2048,
    quality = 0.85,
    format = 'webp'
  } = options;

  const originalSize = file.size;

  return new Promise((resolve, reject) => {
    // Create file reader
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Failed to read file'));

    reader.onload = (e) => {
      const img = new Image();

      img.onerror = () => reject(new Error('Failed to load image'));

      img.onload = () => {
        try {
          // Calculate new dimensions maintaining aspect ratio
          let { width, height } = img;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
          }

          // Create canvas
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          // Draw image on canvas
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Enable image smoothing for better quality
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Draw the image
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to create blob'));
                return;
              }

              // Create new file from blob
              const optimizedFile = new File(
                [blob],
                file.name.replace(/\.[^.]+$/, `.${format === 'webp' ? 'webp' : 'jpg'}`),
                { type: format === 'webp' ? 'image/webp' : 'image/jpeg' }
              );

              const optimizedSize = optimizedFile.size;
              const compressionRatio = ((originalSize - optimizedSize) / originalSize) * 100;

              resolve({
                file: optimizedFile,
                originalSize,
                optimizedSize,
                compressionRatio
              });
            },
            format === 'webp' ? 'image/webp' : 'image/jpeg',
            quality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Optimize multiple images in parallel
 */
export async function optimizeImages(
  files: File[],
  options: OptimizationOptions = {}
): Promise<OptimizationResult[]> {
  return Promise.all(files.map(file => optimizeImage(file, options)));
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

/**
 * Check if browser supports WebP
 */
export function supportsWebP(): boolean {
  const canvas = document.createElement('canvas');
  if (canvas.getContext && canvas.getContext('2d')) {
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
  return false;
}

/**
 * Optimize image with automatic format selection
 */
export async function optimizeImageAuto(
  file: File,
  options: Omit<OptimizationOptions, 'format'> = {}
): Promise<OptimizationResult> {
  const format = supportsWebP() ? 'webp' : 'jpeg';
  return optimizeImage(file, { ...options, format });
}
