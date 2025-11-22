import { createClient } from '@supabase/supabase-js'

/**
 * Supabase Client Configuration
 * 
 * This creates a singleton instance of the Supabase client
 * that can be imported and used throughout the application.
 * 
 * Make sure to set up your .env.local file with:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Helper function to upload images to Supabase Storage
 * @param {File} file - The image file to upload
 * @param {string} bucket - The storage bucket name (e.g., 'product-images')
 * @param {string} path - The path within the bucket (e.g., 'products/image-name.jpg')
 * @returns {Promise<{data: object, error: object}>}
 */
export async function uploadImage(file, bucket, path) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    return { data: null, error }
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return { data: { ...data, publicUrl }, error: null }
}

/**
 * Helper function to delete images from Supabase Storage
 * @param {string} bucket - The storage bucket name
 * @param {string} path - The path within the bucket
 * @returns {Promise<{data: object, error: object}>}
 */
export async function deleteImage(bucket, path) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .remove([path])

  return { data, error }
}

/**
 * Upload multiple product images to Supabase Storage
 * @param {string} productId - The product UUID
 * @param {File[]} files - Array of image files to upload
 * @returns {Promise<Array>} Array of uploaded image data with URLs
 */
export async function uploadProductImages(productId, files) {
  const uploadedImages = [];
  const errors = [];

  for (const file of files) {
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const safeName = file.name?.replace(/[^a-zA-Z0-9.-]/g, '_') || 'image.jpg';
      const filePath = `${productId}/${timestamp}-${safeName}`;

      // Upload to storage (pass the actual file, not just path)
      const { data, error } = await uploadImage(file, 'product-images', filePath);

      if (error) {
        errors.push({ file: file.name, error: error.message });
        continue;
      }

      uploadedImages.push({
        path: filePath,
        publicUrl: data.publicUrl,
        fileName: file.name,
      });
    } catch (err) {
      errors.push({ file: file.name || 'unknown', error: err.message });
    }
  }

  return { uploadedImages, errors };
}

/**
 * Extract storage path from Supabase public URL
 * @param {string} publicUrl - The full public URL from Supabase
 * @returns {string} The storage path (e.g., "productId/filename.jpg")
 */
export function extractStoragePath(publicUrl) {
  if (!publicUrl) return null;
  
  try {
    // URL format: https://{project}.supabase.co/storage/v1/object/public/product-images/{path}
    const url = new URL(publicUrl);
    const pathParts = url.pathname.split('/');
    const bucketIndex = pathParts.indexOf('product-images');
    
    if (bucketIndex === -1) return null;
    
    // Get everything after the bucket name
    const storagePath = pathParts.slice(bucketIndex + 1).join('/');
    return storagePath;
  } catch (err) {
    console.error('Error extracting storage path:', err);
    return null;
  }
}

/**
 * Delete a product image from both storage and database
 * @param {string} imageId - The product_images table row ID
 * @param {string} imageUrl - The image public URL
 * @returns {Promise<{success: boolean, error: object}>}
 */
export async function deleteProductImage(imageId, imageUrl) {
  try {
    // Extract storage path from URL
    const storagePath = extractStoragePath(imageUrl);
    
    if (!storagePath) {
      throw new Error('Could not extract storage path from URL');
    }

    // Delete from storage
    const { error: storageError } = await deleteImage('product-images', storagePath);
    
    if (storageError) {
      console.error('Storage deletion error:', storageError);
      // Continue to delete from database even if storage fails
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('product_images')
      .delete()
      .eq('id', imageId);

    if (dbError) {
      throw dbError;
    }

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
}

/**
 * Set an image as the primary image for a product
 * @param {string} productId - The product UUID
 * @param {string} imageId - The image ID to set as primary
 * @returns {Promise<{success: boolean, error: object}>}
 */
export async function setPrimaryImage(productId, imageId) {
  try {
    // First, set all images for this product to non-primary
    const { error: updateAllError } = await supabase
      .from('product_images')
      .update({ is_primary: false })
      .eq('product_id', productId);

    if (updateAllError) {
      throw updateAllError;
    }

    // Then set the selected image as primary
    const { error: setPrimaryError } = await supabase
      .from('product_images')
      .update({ is_primary: true })
      .eq('id', imageId);

    if (setPrimaryError) {
      throw setPrimaryError;
    }

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
}
