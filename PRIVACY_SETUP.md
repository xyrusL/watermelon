# Privacy Feature Setup Guide

This guide will help you set up the new privacy feature for user uploads.

## ✅ What's Been Added

### 1. User Panel
- Users can view their own uploads
- Toggle uploads between public/private
- Filter uploads by visibility
- View upload statistics

### 2. Privacy Control
- Default: All uploads are **public**
- Users can make uploads **private** (only visible to them and admins)
- Admins see everything regardless of privacy settings

### 3. API Endpoints
- `/api/user/images` - Get user's own uploads
- `/api/user/update-visibility` - Toggle public/private
- `/api/admin/members` - Get all Clerk users (admin only)

## 🔧 Setup Instructions

### Step 1: Run SQL Migration

You need to add the `is_private` column to your Supabase database.

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run the SQL file: `supabase_add_privacy.sql`

```sql
-- Add is_private column to images table
ALTER TABLE images 
ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_images_is_private ON images(is_private);
CREATE INDEX IF NOT EXISTS idx_images_uploader_email ON images(uploader_email);
```

### Step 2: Verify the Setup

1. **Test User Panel:**
   - Sign in to your app
   - Click "👤 My Uploads" button in the header
   - You should see all your uploads

2. **Test Privacy Toggle:**
   - Click the 👁️ (eye) icon on any upload to make it private
   - Click the 🔒 (lock) icon to make it public again
   - Verify that private uploads don't appear in "Recent Uploads"

3. **Test Admin View:**
   - Sign in as an admin
   - Click "🛡️ Admin" button
   - Go to "Members" tab - you should see ALL Clerk users (not just uploaders)
   - Admins can see both public and private images

## 📋 Features

### For Regular Users:
✅ View their own uploads
✅ Make uploads private (hidden from public gallery)
✅ Make uploads public (visible in recent uploads)
✅ Filter by public/private status
✅ View upload statistics

### For Admins:
✅ See ALL images (public + private)
✅ See ALL registered Clerk users
✅ View upload counts per user
✅ Full management capabilities

## 🎯 How Privacy Works

### Public Upload (Default)
- Visible in "Recent Uploads"
- Anyone can see it
- Marked with 👁️ icon

### Private Upload
- NOT visible in "Recent Uploads"  
- Only visible to:
  - The uploader (in their User Panel)
  - Admins (in Admin Panel)
- Marked with 🔒 icon

## 🚨 Important Notes

1. **Existing uploads:** All existing uploads are **public by default**
2. **New uploads:** All new uploads are **public by default**
3. **Admins:** Can see everything regardless of privacy settings
4. **Recent uploads:** Only shows public images (+ user's own private images if signed in)

## 💡 Usage Examples

### User wants to hide an embarrassing upload:
1. Click "👤 My Uploads"
2. Find the image
3. Click the 👁️ icon to make it private
4. Image disappears from public gallery

### User wants to share an image publicly:
1. Upload as normal (public by default)
2. Or toggle private image to public by clicking 🔒

### Admin checking who registered:
1. Click "🛡️ Admin"
2. Go to "Members" tab
3. See all registered users (even if they never uploaded)

## 🔍 Troubleshooting

### "Members tab shows 0 users"
- Run the SQL migration first
- Make sure Clerk is properly configured
- Check browser console for errors

### "Privacy toggle doesn't work"
- Verify the SQL migration was successful
- Check that `is_private` column exists in `images` table

### "Private images still visible"
- Clear your browser cache
- Sign out and sign back in
- Check that you're using the latest code

## 📞 Need Help?

If you encounter any issues:
1. Check the browser console for errors
2. Verify the SQL migration was successful
3. Ensure all environment variables are set correctly
4. Check Supabase logs for any database errors

---

**Created:** January 14, 2026
**Feature:** User Privacy Controls
