/**
 * Cloud Storage Utility
 * Handles image uploads to Imgbb or other cloud storage services
 */

// Get Imgbb API key from environment variable
const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;

/**
 * Upload a single image to Imgbb
 * @param file - The image file to upload
 * @returns Promise with the permanent image URL
 */
export const uploadImageToImgbb = async (file: File): Promise<string> => {
    if (!IMGBB_API_KEY) {
        throw new Error('Imgbb API key is not configured. Please add VITE_IMGBB_API_KEY to your .env file.');
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('key', IMGBB_API_KEY);

    try {
        const response = await fetch('https://api.imgbb.com/1/upload', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success && data.data?.url) {
            console.log('Image uploaded successfully:', data.data.url);
            return data.data.url; // Returns the permanent image URL
        } else {
            throw new Error(data.error?.message || 'Image upload failed');
        }
    } catch (error) {
        console.error('Error uploading image to Imgbb:', error);
        throw new Error('Failed to upload image. Please try again.');
    }
};

/**
 * Upload multiple images to Imgbb
 * @param files - Array of image files to upload
 * @returns Promise with array of permanent image URLs
 */
export const uploadMultipleImages = async (files: File[]): Promise<string[]> => {
    if (!files || files.length === 0) {
        return [];
    }

    console.log(`Uploading ${files.length} images to cloud storage...`);

    try {
        // Upload all images in parallel
        const uploadPromises = files.map((file) => uploadImageToImgbb(file));
        const imageUrls = await Promise.all(uploadPromises);

        console.log(`Successfully uploaded ${imageUrls.length} images`);
        return imageUrls; // Returns array of URLs
    } catch (error) {
        console.error('Error uploading multiple images:', error);
        throw error;
    }
};

/**
 * Validate if a string is a valid image URL
 * @param url - The URL to validate
 * @returns boolean indicating if URL is valid
 */
export const isValidImageUrl = (url: string): boolean => {
    try {
        const urlObj = new URL(url);
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
        return false;
    }
};

/**
 * Get image URLs from mixed input (files and existing URLs)
 * Uploads new files and preserves existing URLs
 * @param files - New files to upload
 * @param existingUrls - Already uploaded image URLs to preserve
 * @returns Promise with combined array of image URLs
 */
export const getImageUrls = async (
    files: File[],
    existingUrls: string[] = []
): Promise<string[]> => {
    // Upload new files if any
    const newUrls = files.length > 0 ? await uploadMultipleImages(files) : [];

    // Combine existing URLs with new ones
    return [...existingUrls, ...newUrls];
};

export default {
    uploadImageToImgbb,
    uploadMultipleImages,
    isValidImageUrl,
    getImageUrls,
};
