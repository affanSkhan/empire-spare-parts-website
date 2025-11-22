/**
 * Convert a string to a URL-friendly slug
 * Example: "Front Bumper Swift" -> "front-bumper-swift"
 */
export function slugify(text) {
  if (!text) return '';
  
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Remove special characters
    .replace(/[^\w\s-]/g, '')
    // Replace spaces with hyphens
    .replace(/[\s_]+/g, '-')
    // Replace multiple hyphens with single hyphen
    .replace(/--+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate a unique slug by appending a timestamp if needed
 */
export function generateUniqueSlug(text) {
  const baseSlug = slugify(text);
  const timestamp = Date.now().toString(36);
  return `${baseSlug}-${timestamp}`;
}
