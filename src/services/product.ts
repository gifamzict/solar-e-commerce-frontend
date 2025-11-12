/**
 * Product Service
 * Handles product-related API calls
 */

import apiClient, { getImageUrl } from '@/lib/apiClient';

export interface Product {
    id: number;
    name: string;
    description: string;
    price: string;
    category_id: number;
    stock_quantity: number;
    image_url: string | null;
    is_featured: boolean;
    status: string;
    specifications?: Record<string, any>;
    category?: {
        id: number;
        name: string;
        slug: string;
        description?: string;
    };
    created_at: string;
    updated_at: string;
}

export interface ProductFilters {
    category_id?: number;
    search?: string;
    min_price?: number;
    max_price?: number;
    in_stock?: boolean;
    page?: number;
    per_page?: number;
}

export interface ProductsResponse {
    products: Product[];
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
}

export interface SingleProductResponse {
    product: Product;
}

/**
 * Get all products with optional filters
 */
export const getProducts = async (filters?: ProductFilters): Promise<ProductsResponse> => {
    const response = await apiClient.get('/products', { params: filters });

    // Transform image URLs
    if (response.data.products) {
        response.data.products = response.data.products.map((product: Product) => ({
            ...product,
            image_url: getImageUrl(product.image_url)
        }));
    }

    return response.data;
};

/**
 * Get single product by ID
 */
export const getProductById = async (id: number): Promise<SingleProductResponse> => {
    const response = await apiClient.get(`/products/${id}`);

    // Transform image URL
    if (response.data.product) {
        response.data.product.image_url = getImageUrl(response.data.product.image_url);
    }

    return response.data;
};

/**
 * Search products
 */
export const searchProducts = async (query: string): Promise<ProductsResponse> => {
    return getProducts({ search: query });
};

/**
 * Get products by category
 */
export const getProductsByCategory = async (categoryId: number, page = 1): Promise<ProductsResponse> => {
    return getProducts({ category_id: categoryId, page });
};

/**
 * Get featured products
 */
export const getFeaturedProducts = async (): Promise<Product[]> => {
    const response = await getProducts({ per_page: 10 });
    return response.products.filter(p => p.is_featured);
};

const productService = {
    getProducts,
    getProductById,
    searchProducts,
    getProductsByCategory,
    getFeaturedProducts
};

export default productService;
