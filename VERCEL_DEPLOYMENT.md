# Vercel Deployment Checklist

## ✅ Code is Already Vercel-Ready!

All URLs and paths in the codebase are flexible and will work on Vercel:
- ✅ All API routes use relative paths (`/api/...`)
- ✅ All image paths use relative paths (`/bg.png`, `/watermelon.svg`)
- ✅ All external URLs are absolute (Modrinth, NameMC, etc.)
- ✅ No hardcoded localhost URLs
- ✅ Environment variables properly configured

## Required Environment Variables on Vercel

You MUST add these in Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_STORAGE_BUCKET=watermelon-images
```

Do not commit real API keys or service-role secrets to this repository. If any previously committed key was real, rotate it immediately.

## Deployment Steps

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables (above)
4. Deploy!

## Notes

- The `.env.local` file is NOT uploaded to Vercel (it's gitignored)
- You must manually add environment variables in Vercel dashboard
- All image assets in `/public` folder will be deployed automatically
- API routes will work automatically at `yourdomain.vercel.app/api/...`

## What Works Automatically

- ✅ Authenticated image uploads (Watermelon Storage)
- ✅ Image cropping and editing
- ✅ Gallery storage (localStorage)
- ✅ Version fetching from Mojang API
- ✅ All pages and navigation
- ✅ Responsive design

## Testing After Deploy

1. Visit homepage - check if it loads
2. Try uploading an image via ImageFrame page
3. Confirm private images load only for the uploader
4. Test commands page
5. Test mods page
6. Check if Minecraft version auto-updates
