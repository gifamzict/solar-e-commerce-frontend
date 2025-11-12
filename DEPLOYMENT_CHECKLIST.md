# 🚀 Production Deployment Checklist

## ✅ Configuration Updates

### 1. Environment Variables
- [x] Updated `.env` with production API URL
- [x] Updated `.env.example` with production API URL
- [x] API Base URL: `https://web-production-d1120.up.railway.app/api`

### 2. API Client Setup
- [x] Created centralized axios client (`src/lib/apiClient.ts`)
- [x] Configured request/response interceptors
- [x] Added automatic token injection
- [x] Implemented global error handling
- [x] Added image URL transformation helper

### 3. Service Files Created
- [x] Authentication Service (`src/services/auth.ts`)
- [x] Product Service (`src/services/product.ts`)
- [x] Category Service (`src/services/category.ts`)

### 4. Auth Component Updates
- [x] Updated API base URL configuration
- [x] Fixed registration to use `first_name` and `last_name`
- [x] Added proper headers to API requests
- [x] Implemented name splitting logic

---

## 📋 Pre-Deployment Checklist

### Backend Integration
- [ ] Verify `.env` has correct production API URL
- [ ] Test registration endpoint
- [ ] Test login endpoint
- [ ] Test product fetching
- [ ] Test category fetching
- [ ] Verify image URLs are working

### Authentication Flow
- [ ] Test user registration
- [ ] Test user login
- [ ] Test logout
- [ ] Test token persistence
- [ ] Test protected routes
- [ ] Test session expiration handling

### API Services
- [ ] Test product listing
- [ ] Test product search
- [ ] Test product filtering
- [ ] Test category listing
- [ ] Test single product view
- [ ] Test single category view

### Error Handling
- [ ] Test validation errors (422)
- [ ] Test authentication errors (401)
- [ ] Test permission errors (403)
- [ ] Test not found errors (404)
- [ ] Test server errors (500)
- [ ] Test network errors

### Image Display
- [ ] Test product images loading
- [ ] Test category images loading
- [ ] Test placeholder images for missing images
- [ ] Test image URLs are correct

---

## 🔧 Deployment Steps

### Step 1: Restart Development Server
After updating `.env`, restart the dev server:
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Step 2: Test Locally
1. Open browser to `http://localhost:8080`
2. Test registration flow
3. Test login flow
4. Test product browsing
5. Check browser console for errors
6. Verify network requests in DevTools

### Step 3: Build for Production
```bash
npm run build
```

### Step 4: Preview Production Build
```bash
npm run preview
```

### Step 5: Deploy
Deploy the `dist` folder to your hosting service (Vercel, Netlify, etc.)

---

## 🧪 Testing Scenarios

### Registration Test
1. Navigate to `/auth`
2. Click "Sign Up" tab
3. Fill in:
   - Full Name: "John Doe"
   - Email: "test@example.com"
   - Password: "Password@123"
   - Confirm Password: "Password@123"
   - Check "Terms of Service" checkbox
4. Submit form
5. **Expected**: Success message, redirect, token in localStorage

### Login Test
1. Navigate to `/auth`
2. Click "Sign In" tab
3. Fill in credentials
4. Submit form
5. **Expected**: Success message, redirect, token in localStorage, user data loaded

### Product Browsing Test
1. Navigate to products page
2. **Expected**: Products load from production API
3. **Expected**: Images display correctly
4. **Expected**: Product details are accurate

### Protected Route Test
1. Without logging in, try to access protected route
2. **Expected**: Redirect to login page
3. After logging in, access protected route
4. **Expected**: Page loads successfully

---

## 🐛 Common Issues & Solutions

### Issue 1: CORS Error
**Error**: "CORS policy: No 'Access-Control-Allow-Origin'"
**Solution**: 
- Contact backend admin to add your frontend domain to allowed origins
- Current allowed domains: ggtl.com, www.ggtl.com
- For Railway deployment, add your deployment URL

### Issue 2: Images Not Loading
**Error**: Images show broken or placeholder
**Solution**:
- Check if `getImageUrl()` is being used in components
- Verify image paths start with `/storage/`
- Check backend storage is publicly accessible

### Issue 3: 401 Unauthorized After Login
**Error**: "Unauthorized" error after successful login
**Solution**:
- Check if token is saved to localStorage
- Verify token key is `store_auth_token`
- Check axios interceptor is adding token to headers
- Clear localStorage and login again

### Issue 4: Registration Fails with Validation Error
**Error**: "The first_name field is required"
**Solution**:
- Verify form is sending `first_name` and `last_name` (not `name`)
- Check name splitting logic in `handleRegisterSubmit`
- Ensure both fields are not empty

### Issue 5: Token Expires Too Quickly
**Error**: Frequent 401 errors requiring re-login
**Solution**:
- Check backend token expiration settings
- Implement token refresh mechanism (if needed)
- Notify backend admin to adjust token lifetime

---

## 📊 Environment Variables Reference

### Production
```env
VITE_API_BASE_URL=https://web-production-d1120.up.railway.app/api
```

### Local Development
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### Staging (if applicable)
```env
VITE_API_BASE_URL=https://staging-api-url.com/api
```

---

## 📞 Support Contacts

- **Backend API**: https://web-production-d1120.up.railway.app
- **Admin Email**: admin@gifamz.com
- **Technical Support**: support@quovatech.com

---

## 📝 Important Notes

1. **No Trailing Slash**: API base URL should NOT end with `/`
   - ✅ Correct: `https://domain.com/api`
   - ❌ Wrong: `https://domain.com/api/`

2. **Token Storage**: 
   - Store users: `store_auth_token`
   - Admin users: `admin_auth_token`

3. **Headers**: All requests include:
   - `Content-Type: application/json`
   - `Accept: application/json`
   - `Authorization: Bearer {token}` (if authenticated)

4. **Image URLs**: Always use `getImageUrl()` helper for image paths

5. **Error Handling**: Errors are automatically handled by axios interceptor with toast notifications

---

## ✅ Post-Deployment Verification

After deployment, verify:
- [ ] Registration works
- [ ] Login works
- [ ] Products load correctly
- [ ] Images display properly
- [ ] Categories load correctly
- [ ] Protected routes work
- [ ] Logout works
- [ ] Error messages display correctly
- [ ] Token persistence works
- [ ] Session timeout handles correctly

---

## 🎯 Next Steps

1. **Deploy Frontend**: Deploy to Vercel/Netlify/your hosting
2. **Update CORS**: Add frontend domain to backend CORS settings
3. **SSL Certificate**: Ensure frontend uses HTTPS
4. **Custom Domain**: Point custom domain to deployment
5. **Monitor**: Set up error tracking (Sentry, LogRocket, etc.)
6. **Analytics**: Add Google Analytics or similar
7. **Performance**: Optimize images and assets
8. **SEO**: Add meta tags and sitemap

---

**Status**: ✅ Ready for Production  
**Last Updated**: November 7, 2025  
**Version**: 1.0.0
