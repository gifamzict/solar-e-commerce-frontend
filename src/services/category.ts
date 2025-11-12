/**
 * Category Service
 * Handles category-related API calls
 */

import apiClient, { getImageUrl } from '@/lib/apiClient';
import { Product } from './product';

export interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    image_url: string | null;
    products_count?: number;
    products?: Product[];
    created_at: string;
    updated_at: string;
}

export interface CategoriesResponse {
    categories: Category[];
}

export interface SingleCategoryResponse {
    category: Category;
}

/**
 * Get all categories
 */
export const getCategories = async (): Promise<CategoriesResponse> => {
    const response = await apiClient.get('/categories');

    // Transform image URLs
    if (response.data.categories) {
        response.data.categories = response.data.categories.map((category: Category) => ({
            ...category,
            image_url: getImageUrl(category.image_url)
        }));
    }

    return response.data;
};

/**
 * Get single category by ID with products
 */
export const getCategoryById = async (id: number): Promise<SingleCategoryResponse> => {
    const response = await apiClient.get(`/categories/${id}`);

    // Transform image URLs
    if (response.data.category) {
        response.data.category.image_url = getImageUrl(response.data.category.image_url);

        if (response.data.category.products) {
            response.data.category.products = response.data.category.products.map((product: Product) => ({
                ...product,
                image_url: getImageUrl(product.image_url)
            }));
        }
    }

    return response.data;
};

/**
 * Get category by slug
 */
export const getCategoryBySlug = async (slug: string): Promise<SingleCategoryResponse> => {
    const response = await apiClient.get(`/categories/slug/${slug}`);

    // Transform image URLs
    if (response.data.category) {
        response.data.category.image_url = getImageUrl(response.data.category.image_url);

        if (response.data.category.products) {
            response.data.category.products = response.data.category.products.map((product: Product) => ({
                ...product,
                image_url: getImageUrl(product.image_url)
            }));
        }
    }

    return response.data;
};

const categoryService = {
    getCategories,
    getCategoryById,
    getCategoryBySlug
};

export default categoryService;
