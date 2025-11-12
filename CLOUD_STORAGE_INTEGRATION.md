# Cloud Storage Integration - Remaining Tasks

## ✅ Completed

1. ✅ Created `src/lib/cloudStorage.ts` utility with image upload functions
2. ✅ Updated `AddProductDialog.tsx` - uploads images to Imgbb, sends URLs to backend
3. ✅ Updated `EditProductDialog.tsx` - preserves existing URLs, uploads new images
4. ✅ Added `VITE_IMGBB_API_KEY` to `.env` and `.env.example`

## 📋 Remaining Tasks

### 1. Get Imgbb API Key
**Before testing, you MUST get an API key:**

1. Go to https://api.imgbb.com/
2. Sign up for a free account (or login)
3. Get your API key
4. Update `.env` file:
   ```bash
   VITE_IMGBB_API_KEY=your_actual_api_key_here
   ```

### 2. Update AddPreorderDialog.tsx

**File:** `src/components/AddPreorderDialog.tsx`

**Changes needed:**

1. Add import at top:
```typescript
import { uploadMultipleImages } from "@/lib/cloudStorage";
```

2. Find the `handleSubmit` function (around line 130-170) and replace with:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validation
  if (!name || !categoryId || !preorderPrice || !depositPercent) {
    toast.error("Please fill in all required fields.");
    return;
  }

  try {
    // Step 1: Upload images to cloud storage if any
    let imageUrls: string[] = [];
    if (images && images.length > 0) {
      toast.info(`Uploading ${images.length} image(s) to cloud storage...`);
      imageUrls = await uploadMultipleImages(Array.from(images));
      toast.success(`${imageUrls.length} image(s) uploaded successfully!`);
    }

    // Step 2: Prepare pre-order data
    const depositAmount = depositPercent ? Math.round((Number(depositPercent) / 100) * Number(preorderPrice)) : 0;

    const preorderData = {
      product_name: name,
      name: name,
      category_id: categoryId,
      preorder_price: preorderPrice,
      pre_order_price: preorderPrice,
      deposit_percentage: depositPercent,
      ...(depositAmount && { deposit_amount: String(depositAmount) }),
      ...(maxPreorders && { max_preorders: maxPreorders }),
      ...(expectedDate && { 
        expected_availability_date: expectedDate,
        expected_availability: expectedDate 
      }),
      ...(description && { description }),
      ...(powerOutput && { power_output: powerOutput }),
      ...(warrantyPeriod && { warranty_period: warrantyPeriod }),
      ...(specifications && { specifications }),
      ...(videoUrl.trim() && { video_url: videoUrl.trim() }),
      ...(imageUrls.length > 0 && { images: imageUrls }),
    };

    // Step 3: Send to backend
    createPreorderMutation.mutate(preorderData);
  } catch (error) {
    console.error('Error uploading images:', error);
    toast.error('Failed to upload images. Please try again.');
  }
};
```

3. Update the `createPreorder` function in the preorder service file OR inline (whichever you're using) to send JSON instead of FormData:
```typescript
// Change from:
headers: { 'Content-Type': 'multipart/form-data' }
// To:
headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
```

### 3. Update EditPreorderDialog.tsx

**File:** `src/components/EditPreorderDialog.tsx`

**Similar changes as AddPreorderDialog:**

1. Add import:
```typescript
import { uploadMultipleImages } from "@/lib/cloudStorage";
```

2. Update `handleSubmit` to:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!name || !categoryId || !preorderPrice || !depositPercent || !preorder) {
    toast.error("Please fill in all required fields.");
    return;
  }

  try {
    // Step 1: Get existing image URLs
    let imageUrls: string[] = preorder.images || [];

    // Step 2: Upload new images if any
    if (images && images.length > 0) {
      toast.info(`Uploading ${images.length} new image(s)...`);
      const newImageUrls = await uploadMultipleImages(Array.from(images));
      imageUrls = [...imageUrls, ...newImageUrls]; // Combine existing + new
      toast.success(`${newImageUrls.length} image(s) uploaded!`);
    }

    // Step 3: Prepare update data
    const depositAmount = depositPercent ? Math.round((Number(depositPercent) / 100) * Number(preorderPrice)) : 0;

    const preorderData = {
      product_name: name,
      name: name,
      category_id: categoryId,
      preorder_price: preorderPrice,
      pre_order_price: preorderPrice,
      deposit_percentage: depositPercent,
      ...(depositAmount && { deposit_amount: String(depositAmount) }),
      ...(maxPreorders && { max_preorders: maxPreorders }),
      ...(expectedDate && { 
        expected_availability_date: expectedDate,
        expected_availability: expectedDate 
      }),
      ...(description && { description }),
      ...(powerOutput && { power_output: powerOutput }),
      ...(warrantyPeriod && { warranty_period: warrantyPeriod }),
      ...(specifications && { specifications }),
      ...(videoUrl.trim() && { video_url: videoUrl.trim() }),
      ...(imageUrls.length > 0 && { images: imageUrls }),
    };

    // Step 4: Send update
    updatePreorderMutation.mutate({ id: preorder.id, preorderData });
  } catch (error) {
    console.error('Error uploading images:', error);
    toast.error('Failed to upload images. Please try again.');
  }
};
```

3. Update mutation function signature to accept `preorderData` instead of `formData`

### 4. Fix Other Components with Trailing Slash

**Files that still have trailing slash in API_BASE_URL:**
- src/components/AddPromotionDialog.tsx
- src/components/EditPromotionDialog.tsx  
- src/components/StoreFooter.tsx
- src/pages/Settings.tsx
- src/pages/store/AllProducts.tsx
- src/pages/store/CategoryPage.tsx
- src/pages/store/SolarPanels.tsx

**Quick fix for each file:**
Replace:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://web-production-d1120.up.railway.app/api/';
```

With:
```typescript
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://web-production-d1120.up.railway.app/api').replace(/\/$/, '');
```

## 🧪 Testing Steps

1. **Get your Imgbb API key** and add to `.env`
2. **Restart dev server** (important - to load new env variable)
3. **Test Product Creation:**
   - Go to admin panel → Products → Add Product
   - Fill form and select images
   - Submit - you should see "Uploading X images..." toast
   - Check console for image URLs from Imgbb
   - Verify product created with cloud URLs

4. **Test Product Edit:**
   - Edit existing product
   - Add new images
   - Should preserve old URLs and add new ones

5. **Test Pre-orders** (after updating those files):
   - Same flow as products
   - Create new pre-order with images
   - Edit pre-order and add more images

## 📌 Important Notes

- Images are now stored permanently in Imgbb cloud
- No more lost images on Railway deployments
- Backend expects JSON with `images` array of URLs
- Each image URL looks like: `https://i.ibb.co/xyz123/image.jpg`
- Maximum 10 images per product/pre-order
- Free Imgbb account has unlimited uploads

## 🆘 Troubleshooting

**"Imgbb API key is not configured"**
- Make sure you added `VITE_IMGBB_API_KEY` to `.env`
- Restart dev server after adding env variable

**"Failed to upload image"**
- Check your API key is valid
- Check image file size (max 32MB on Imgbb)
- Check internet connection

**"Double slash in API URL"**
- Fix the trailing slash in API_BASE_URL (see task #4 above)

## 🎯 Summary

- ✅ Products: Done! Can create/edit with cloud images
- ⏳ Pre-orders: Need to update Add & Edit dialogs (instructions above)
- ⏳ Trailing slashes: Need to fix in 7 more files

Once complete, all image uploads will work with permanent cloud storage! 🚀
