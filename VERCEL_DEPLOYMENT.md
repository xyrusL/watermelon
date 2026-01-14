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
IMGBB_API_KEY=4f4dbe1b41eb52c517833a6e1913183b
FREEIMAGE_API_KEY=6d207e02198a847aa98d0a2a901485a5
```

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

- ✅ Image uploads (imgbb & freeimage)
- ✅ Image cropping and editing
- ✅ Gallery storage (localStorage)
- ✅ Version fetching from Mojang API
- ✅ All pages and navigation
- ✅ Responsive design

## Testing After Deploy

1. Visit homepage - check if it loads
2. Try uploading an image via ImageFrame page
3. Test commands page
4. Test mods page
5. Check if Minecraft version auto-updates

**Everything is flexible and ready! Just add the environment variables and deploy! 🚀**
