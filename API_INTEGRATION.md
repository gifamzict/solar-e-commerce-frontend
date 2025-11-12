# API Integration Guide

## Production API Configuration

The frontend is now configured to use the production backend API hosted on Railway.

### API Base URL
```
https://web-production-e65f7.up.railway.app/api
```

## Configuration Files

### Environment Variables (`.env`)
The API base URL is configured in the `.env` file:
```env
VITE_API_BASE_URL=https://web-production-e65f7.up.railway.app/api
```

For local development, you can change this to:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## API Services

### Authentication Service (`src/services/auth.ts`)
Handles user registration, login, logout, and profile management.

**Available Functions:**
- `register(userData)` - Register a new user
- `login(credentials)` - Login user
- `logout()` - Logout user
- `getCurrentUser()` - Get current authenticated user
- `isAuthenticated()` - Check if user is logged in
- `getAuthToken()` - Get stored auth token

### Product Service (`src/services/product.ts`)
Handles product-related operations.

**Available Functions:**
- `getProducts(filters)` - Get all products with filters
- `getProductById(id)` - Get single product
- `searchProducts(query)` - Search products
- `getProductsByCategory(categoryId)` - Get products by category
- `getFeaturedProducts()` - Get featured products

### Category Service (`src/services/category.ts`)
Handles category-related operations.

**Available Functions:**
- `getCategories()` - Get all categories
- `getCategoryById(id)` - Get single category
- `getCategoryBySlug(slug)` - Get category by slug

## API Client Configuration (`src/lib/apiClient.ts`)

The centralized axios client handles:
- Authentication headers
- Request/response interceptors
- Global error handling
- Token management
- Image URL transformation

### Features:
- **Automatic Token Injection**: Auth tokens are automatically added to requests
- **Error Handling**: Global error handling with toast notifications
- **Session Management**: Auto-redirect to login on 401 errors
- **Image URL Helper**: `getImageUrl()` function for proper image URLs

## Usage Examples

### Authentication

```typescript
import authService from '@/services/auth';

// Register
const result = await authService.register({
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  password: 'Password@123',
  password_confirmation: 'Password@123'
});

// Login
const result = await authService.login({
  email: 'john@example.com',
  password: 'Password@123'
});

// Get current user
const user = await authService.getCurrentUser();

// Logout
await authService.logout();
```

### Products

```typescript
import productService from '@/services/product';

// Get all products
const { products, pagination } = await productService.getProducts();

// Get products with filters
const result = await productService.getProducts({
  category_id: 1,
  search: 'solar',
  min_price: 5000,
  max_price: 50000,
  in_stock: true,
  page: 1,
  per_page: 20
});

// Get single product
const { product } = await productService.getProductById(1);

// Search products
const result = await productService.searchProducts('solar panel');
```

### Categories

```typescript
import categoryService from '@/services/category';

// Get all categories
const { categories } = await categoryService.getCategories();

// Get single category with products
const { category } = await categoryService.getCategoryById(1);

// Get category by slug
const { category } = await categoryService.getCategoryBySlug('solar-panels');
```

## Authentication Flow

### Registration
1. User fills registration form (first name, last name, email, password)
2. Call `authService.register()`
3. Token is automatically saved to localStorage
4. User receives verification email
5. Redirect to appropriate page

### Login
1. User fills login form (email, password)
2. Call `authService.login()`
3. Token is automatically saved to localStorage
4. Fetch user profile
5. Redirect to dashboard/home

### Protected Routes
The axios interceptor automatically adds the token to all requests. On 401 errors, users are redirected to login.

## Image URLs

All product and category images are automatically transformed to use the full production URL:

```typescript
import { getImageUrl } from '@/lib/apiClient';

// Transform image path to full URL
const fullImageUrl = getImageUrl('/storage/products/image.jpg');
// Returns: https://web-production-e65f7.up.railway.app/storage/products/image.jpg
```

## Error Handling

The API client automatically handles errors and shows toast notifications:

- **401 Unauthorized**: Redirects to login and clears tokens
- **403 Forbidden**: Shows permission error
- **404 Not Found**: Shows resource not found error
- **422 Validation Error**: Shows first validation error message
- **429 Too Many Requests**: Shows rate limit error
- **500 Server Error**: Shows server error message

## Token Storage

Tokens are stored in localStorage:
- **Store Users**: `store_auth_token`
- **Admin Users**: `admin_auth_token`

The axios interceptor automatically uses the appropriate token based on the request URL.

## API Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Validation Error
- **429**: Too Many Requests
- **500**: Server Error

## Development vs Production

### Production (Default)
```env
VITE_API_BASE_URL=https://web-production-e65f7.up.railway.app/api
```

### Local Development
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## Testing the Integration

1. **Restart the dev server** after updating `.env`:
   ```bash
   npm run dev
   ```

2. **Test Registration**:
   - Go to /auth
   - Click "Sign Up"
   - Fill in the registration form
   - Check console for API responses

3. **Test Login**:
   - Use registered credentials
   - Check if token is saved in localStorage
   - Verify redirect after login

4. **Test Products**:
   - Navigate to products page
   - Check if products are loading
   - Verify images are displaying correctly

5. **Test Protected Routes**:
   - Try accessing protected pages
   - Verify authentication is working

## Troubleshooting

### CORS Errors
The backend is configured to accept requests from approved domains. If you get CORS errors, contact the backend administrator to add your domain.

### Images Not Loading
Make sure the `getImageUrl()` function is being used to transform image paths to full URLs.

### 401 Errors
- Check if token is in localStorage
- Verify token is not expired
- Check if Authorization header is being sent

### Network Errors
- Verify the API base URL is correct
- Check internet connection
- Verify backend is running

## Support

For backend API issues or questions:
- **Backend URL**: https://web-production-e65f7.up.railway.app
- **Admin Email**: admin@gifamz.com
- **Support Email**: support@quovatech.com

---

**Last Updated**: November 7, 2025  
**API Version**: 1.0  
**Status**: ✅ Production Ready
