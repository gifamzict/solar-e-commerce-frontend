/**
 * Authentication Service
 * Handles user registration, login, logout, and profile management
 */

import apiClient from '@/lib/apiClient';

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    role: string | null;
    created_at: string;
    updated_at: string;
}

export interface RegisterRequest {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export interface RegisterResponse {
    message: string;
    user: {
        name: string;
        email: string;
        role: string | null;
    };
    token: string;
    email_sent: boolean;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    message: string;
    user: User;
    token: string;
    token_type: string;
}

export interface LogoutResponse {
    message: string;
}

/**
 * Register a new user
 */
export const register = async (userData: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post('/register', userData);

    // Save token to localStorage
    if (response.data.token) {
        localStorage.setItem('store_auth_token', response.data.token);
    }

    return response.data;
};

/**
 * Login user
 */
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post('/login', credentials);

    // Save token to localStorage
    if (response.data.token) {
        localStorage.setItem('store_auth_token', response.data.token);
    }

    return response.data;
};

/**
 * Logout user
 */
export const logout = async (): Promise<LogoutResponse> => {
    const response = await apiClient.post('/logout');

    // Remove token from localStorage
    localStorage.removeItem('store_auth_token');

    return response.data;
};

/**
 * Get current authenticated user profile
 */
export const getCurrentUser = async (): Promise<User> => {
    const response = await apiClient.get('/user');
    return response.data;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
    return !!localStorage.getItem('store_auth_token');
};

/**
 * Get stored auth token
 */
export const getAuthToken = (): string | null => {
    return localStorage.getItem('store_auth_token');
};

const authService = {
    register,
    login,
    logout,
    getCurrentUser,
    isAuthenticated,
    getAuthToken
};

export default authService;
