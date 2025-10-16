import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Constructs a proper image URL from the backend storage path
 * Handles cases where the path may or may not start with a slash
 * @param imagePath - The image path from the backend (e.g., "/path/to/image.jpg" or "path/to/image.jpg")
 * @param baseUrl - The base URL of the backend (default: from env or localhost:8000)
 * @returns Full URL to the image
 */
export function getImageUrl(imagePath: string | undefined | null, baseUrl?: string): string {
  // Return placeholder if no image path
  if (!imagePath) {
    return '/placeholder.svg';
  }

  // If it's already a full URL (http:// or https://), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If it's a relative path starting with /, return as is
  if (imagePath.startsWith('/')) {
    return imagePath;
  }

  // Get base URL from parameter or environment variable
  const apiBaseUrl = baseUrl || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/';
  
  // Remove /api/ from the end if present to get the base domain
  const backendBaseUrl = apiBaseUrl.replace(/\/api\/?$/, '');
  
  // Construct the full URL ensuring proper path structure
  return `${backendBaseUrl}/storage/${imagePath}`;
}

/**
 * Handles multiple image paths (for products with multiple images)
 * @param images - Array of image paths or a single image path
 * @param baseUrl - The base URL of the backend
 * @returns Array of full image URLs
 */
export function getImageUrls(images: string | string[] | undefined | null, baseUrl?: string): string[] {
  if (!images) {
    return ['/placeholder.svg'];
  }

  const imageArray = Array.isArray(images) ? images : [images];
  
  // Filter out any empty strings or null values
  const validImages = imageArray.filter(img => img && img.trim().length > 0);
  
  // If no valid images, return placeholder
  if (validImages.length === 0) {
    return ['/placeholder.svg'];
  }

  return validImages.map(img => getImageUrl(img, baseUrl));
}

// Currency helpers
export function formatNaira(value: number | string): string {
  const num = typeof value === 'number' ? value : Number(String(value).replace(/[^0-9.-]/g, ''));
  if (Number.isNaN(num)) return '₦0.00';
  try {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  } catch {
    // Fallback
    return `₦${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }
}

export function ensureNairaSymbol(text: string): string {
  if (!text) return '₦0.00';
  let t = String(text).trim();
  if (t.startsWith('₦')) return t;
  // Replace common currency codes/symbols at the start with ₦
  t = t.replace(/^\s*(NGN|₦)\s*/i, '₦');
  t = t.replace(/^\s*(USD|EUR|GBP)\s*/i, '');
  t = t.replace(/^\s*[$€£]\s*/, '');
  // If it still doesn't start with ₦, prefix it
  if (!t.startsWith('₦')) {
    // Ensure spacing like ₦1,234 vs ₦ 1,234
    t = `₦${t}`;
  }
  return t;
}

export function apiUrl(path: string): string {
  const base = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
  const cleanBase = String(base).replace(/\/?$/, '');
  const cleanPath = String(path).replace(/^\//, '');
  return `${cleanBase}/${cleanPath}`;
}

export function apiJoin(...parts: string[]): string {
  const cleaned = parts.map((p, i) => {
    let s = String(p || '');
    if (i === 0) return s.replace(/\/?$/, '');
    return s.replace(/^\//, '');
  });
  return cleaned.join('/');
}

// YouTube helpers
export function extractYouTubeId(input?: string | null): string | null {
  if (!input) return null;
  const str = String(input);
  // Matches youtu.be/ID
  let m = str.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (m) return m[1];
  // Matches youtube.com/watch?v=ID
  m = str.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (m) return m[1];
  // Matches youtube.com/embed/ID
  m = str.match(/(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (m) return m[1];
  return null;
}

export function getYouTubeEmbedUrl(input?: string | null): string | null {
  const id = extractYouTubeId(input);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}

export function getYouTubeThumbnailUrl(input?: string | null, quality: 'default' | 'mq' | 'hq' = 'hq'): string {
  const id = extractYouTubeId(input);
  if (!id) return '/placeholder.svg';
  const map = { default: 'default.jpg', mq: 'mqdefault.jpg', hq: 'hqdefault.jpg' } as const;
  const file = map[quality] || map.hq;
  return `https://img.youtube.com/vi/${id}/${file}`;
}










