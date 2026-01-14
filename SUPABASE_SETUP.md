# Supabase Storage Setup Guide

## What is Supabase?
Supabase provides FREE cloud storage for your images with:
- ✅ **1 GB FREE storage**
- ✅ **Full privacy control** - YOU own the data
- ✅ **Direct raw URLs** - Perfect for Minecraft ImageFrame
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
4. **IMPORTANT:** Make it **PUBLIC** (toggle the switch)
5. Click "Create bucket"

### 4. Set Up Policies (Allow public uploads)
1. Click on your `watermelon-images` bucket
2. Click "Policies" tab
3. Click "New Policy"
4. Select "For full customization" 
5. Add this policy:

**Policy name:** Public Upload and Read
**Allowed operations:** SELECT, INSERT, DELETE
**Policy definition:**
```sql
true
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
```

### 7. Test It!
1. Restart your dev server: `npm run dev`
2. Go to ImageFrame page
3. Select "Watermelon Storage" (recommended badge)
4. Upload a test image
5. Copy the URL - it will be a direct link like:
   `https://xxxxx.supabase.co/storage/v1/object/public/watermelon-images/imageframe/123456-abc.jpg`

## How It Works

1. **User uploads image** → Your site
2. **Image stored in** → Supabase Storage bucket
3. **Returns direct URL** → Public CDN link
4. **Use in Minecraft** → `/imageframe create <url> <width> <height>`

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
- Check if bucket is PUBLIC
- Verify storage policies allow INSERT

**Error: "403 Forbidden"**
- Bucket must be public
- Check RLS policies

## Free Tier Limits
- **1 GB storage** (about 1,000 images)
- **2 GB bandwidth/month**
- Unlimited requests

Perfect for your Minecraft server! 🍉
