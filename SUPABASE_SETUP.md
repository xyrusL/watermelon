# Supabase Storage Setup Guide

## What is Supabase?
Supabase provides cloud storage for your images with:
- ✅ **1 GB FREE storage**
- ✅ **Full privacy control** - YOU own the data
- ✅ **Private-by-default access** - Safer for user uploads
- ✅ **Fast CDN delivery**

## Setup Steps (5 minutes)

### 1. Create Supabase Account
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub (free)

### 2. Create a New Project
1. Click "New project"
2. Choose a name (e.g., "watermelon-storage")
3. Create a strong database password
4. Select a region (closest to you)
5. Click "Create new project"
6. Wait 2-3 minutes for setup

### 3. Create Storage Bucket
1. In Supabase dashboard, click "Storage" in left menu
2. Click "New bucket"
3. Name it: `watermelon-images`
4. **IMPORTANT:** Make it **PRIVATE** (leave public access off)
5. Click "Create bucket"

### 4. Set Up Policies
1. Click on your `watermelon-images` bucket
2. Click "Policies" tab
3. Click "New Policy"
4. Select "For full customization" 
5. Add this policy:

**Policy name:** No public bucket access
**Allowed operations:** SELECT, INSERT, UPDATE, DELETE
**Policy definition:**
```sql
false
```
6. Click "Review" then "Save policy"

### 5. Get Your Credentials
1. Go to "Settings" (gear icon in left menu)
2. Click "API"
3. Find:
   - **Project URL** (under "Project URL")
   - **Service Role Key** (under "Project API keys" - click "Reveal")

### 6. Add to .env.local
Open your `.env.local` file and replace:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

With your actual values:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ...
SUPABASE_STORAGE_BUCKET=watermelon-images
```

### 7. Create Database Table for Image Tracking
1. In Supabase dashboard, click "SQL Editor" in left menu
2. Click "New Query"
3. Paste this SQL:

```sql
CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_path TEXT NOT NULL,
  filename TEXT NOT NULL,
  url TEXT,
  file_size INTEGER,
  uploader_name TEXT,
  uploader_email TEXT,
  host TEXT DEFAULT 'supabase',
  is_private BOOLEAN DEFAULT true,
  is_nsfw BOOLEAN DEFAULT false,
  image_width INTEGER,
  image_height INTEGER,
  frame_width INTEGER,
  frame_height INTEGER,
  user_deleted_at TIMESTAMPTZ,
  user_deleted_by_email TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- The app uses the service role server-side for reads and writes.
-- Do not add broad public table policies unless you intend to expose the table.
```

4. Click "Run" to create the table

### 8. Test It!
1. Restart your dev server: `npm run dev`
2. Go to ImageFrame page
3. Select "Watermelon Storage" (recommended badge)
4. Upload a test image
5. Copy the URL - it will be a Watermelon route like:
   `https://your-domain/api/images/<image-id>`

## How It Works

1. **User uploads image** → Your site
2. **Image stored in** → Private Supabase Storage bucket
3. **Returns image route** → Watermelon access-controlled URL
4. **Use in Minecraft** → Make the image public first, then use `/imageframe create <url> <width> <height>`

## Benefits Over Other Hosts

| Feature | Watermelon Storage | imgbb | freeimage |
|---------|-------------------|-------|-----------|
| Privacy Control | ✅ Full | ❌ No | ❌ No |
| Delete Reliability | ✅ Perfect | ⚠️ Unreliable | ✅ Good |
| Max File Size | 50 MB | 32 MB | 10 MB |
| Your Own Data | ✅ Yes | ❌ No | ❌ No |
| Cost | FREE (1GB) | FREE | FREE |

## Troubleshooting

**Error: "Supabase not configured"**
- Make sure you added the URL and KEY to `.env.local`
- Restart the dev server after changing `.env.local`

**Error: "Upload failed"**
- Check if bucket exists and the service role key is correct
- Verify the app can write to the bucket with server-side credentials

**Error: "403 Forbidden"**
- Verify the requesting user is signed in
- Check that image ownership and admin permissions are correct

## Free Tier Limits
- **1 GB storage** (about 1,000 images)
- **2 GB bandwidth/month**
- Unlimited requests

Perfect for your Minecraft server! 🍉
