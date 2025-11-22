/**
 * Axios API Client Configuration
 * 
 * Production API: https://solar-e-commerce-backend-production.up.railway.app/api
 */

import axios from 'axios';
import { toast } from 'sonner';

// Get API base URL from environment variable
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://solar-e-commerce-backend-production.up.railway.app/api';

// Create axios instance with default configuration
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    timeout: 30000, // 30 seconds timeout
});

// Request interceptor - Add auth token to all requests
apiClient.interceptors.request.use(
    (config) => {
        // Check for token in localStorage (for store customers)
        const storeToken = localStorage.getItem('store_auth_token');
        // Check for admin token in localStorage
        const adminToken = localStorage.getItem('admin_auth_token');

        // Prioritize admin token for admin routes
        const token = config.url?.includes('/admin/') ? adminToken : (storeToken || adminToken);

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle network errors
        if (!error.response) {
            toast.error('Network error. Please check your internet connection.');
            return Promise.reject(new Error('Network error'));
        }

        const { status, data } = error.response;

        // Handle different error status codes
        switch (status) {
            case 401:
                // Unauthorized - token expired or invalid
                toast.error('Session expired. Please login again.');

                // Clear tokens
                localStorage.removeItem('store_auth_token');
                localStorage.removeItem('admin_auth_token');

                // Redirect to appropriate login page
                if (window.location.pathname.includes('/admin')) {
                    window.location.href = '/admin/login';
                } else {
                    window.location.href = '/auth';
                }
                break;

            case 403:
                // Forbidden - no permission
                toast.error(data.message || 'You do not have permission to perform this action.');
                break;

            case 404:
                // Not found
                toast.error(data.message || 'Resource not found.');
                break;

            case 422:
                // Validation error
                if (data.errors) {
                    const firstError = Object.values(data.errors)[0];
                    if (Array.isArray(firstError) && firstError.length > 0) {
                        toast.error(firstError[0] as string);
                    }
                } else {
                    toast.error(data.message || 'Validation error.');
                }
                break;

            case 429:
                // Too many requests
                toast.error('Too many requests. Please try again later.');
                break;

            case 500:
                // Server error
                toast.error('Server error. Please try again later.');
                console.error('Server error:', data);
                break;

            default:
                toast.error(data.message || 'An unexpected error occurred.');
        }

        return Promise.reject(error);
    }
);

/**
 * Helper function to handle file uploads
 */
export const uploadFile = async (endpoint: string, formData: FormData) => {
    const token = localStorage.getItem('admin_auth_token') || localStorage.getItem('store_auth_token');

    const response = await axios.post(`${API_BASE_URL}${endpoint}`, formData, {
        headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json'
        }
    });

    return response.data;
};

/**
 * Helper function to get full image URL
 */
export const getImageUrl = (path: string | null | undefined): string => {
    if (!path) {
        return 'https://via.placeholder.com/300x300?text=No+Image';
    }

    // If it's already a full URL, return as is
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    // Otherwise, construct the full URL
    const baseUrl = 'https://solar-e-commerce-backend-production.up.railway.app';
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

export default apiClient;
