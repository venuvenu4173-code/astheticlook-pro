import { supabase, isSupabaseConfigured } from './supabase';

export const BUCKET_NAME = 'product-images';
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateImageFile(file: File): ValidationResult {
  if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Unsupported file type "${file.type || 'unknown'}". Allowed formats: JPG, JPEG, PNG, WebP.`,
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size (${sizeMb} MB) exceeds maximum allowed limit of 5 MB.`,
    };
  }

  return { valid: true };
}

/**
 * Uploads a local file directly to Supabase Storage bucket 'product-images'.
 * Returns publicUrl and storagePath.
 */
export async function uploadProductImage(
  file: File,
  productId?: string
): Promise<{ publicUrl: string; storagePath: string }> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Generate unique clean path
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 9);
  const cleanBaseName = file.name
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 30);

  const folder = productId ? `products/${productId}` : 'products/general';
  const filePath = `${folder}/${timestamp}_${cleanBaseName}_${randomSuffix}.${ext}`;

  if (!isSupabaseConfigured || !supabase) {
    // If Supabase is not configured, create a local object URL with informative path
    const localUrl = URL.createObjectURL(file);
    return {
      publicUrl: localUrl,
      storagePath: `local_preview/${filePath}`,
    };
  }

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Supabase Storage upload failed: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

  return {
    publicUrl: publicUrlData.publicUrl,
    storagePath: filePath,
  };
}

/**
 * Deletes an image from Supabase Storage bucket.
 */
export async function deleteProductImage(storagePath: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return true;
  }
  if (storagePath.startsWith('local_preview/')) {
    return true;
  }

  const { error } = await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
  if (error) {
    console.error('Failed to remove image from Supabase Storage:', error);
    return false;
  }
  return true;
}
