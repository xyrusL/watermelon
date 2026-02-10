# 🍉 Watermelon Minecraft Server

A modern web platform for the Watermelon Minecraft SMP community. Built with Next.js and featuring a pixel-perfect design inspired by Minecraft aesthetics.

## 🎮 Features

- **Server Information** - Display server IP, status, and player count
- **Team Showcase** - Meet the server team members and administrators
- **Commands Guide** - Complete list of available server commands
- **Mods & Plugins** - Browse installed modifications and plugins
- **User Authentication** - Sign in with Clerk for personalized features
- **Image Frames** - Create custom Minecraft-style image frames
- **Responsive Design** - Glass-morphism UI that works on all devices

## 🖼️ ImageFrame Highlights

- **Smart frame suggestion** - Automatically maps image ratio to Minecraft frame sizes.
- **Face-guided auto frame** - When no manual crop is set, face detection can guide frame-size selection (full image remains primary signal).
- **Manual editor override** - Editor crop/frame selection always overrides auto suggestions.
- **Consistent file naming** - Upload APIs normalize filenames to `watermelon-*` format.
- **Gallery filtering + pagination** - Built-in sort/range/new-release filters with responsive per-page scaling by screen size.
- **Upload success modal workflow** - Command copy, direct URL copy, and auto-close countdown in a dedicated modal.

## 🚀 Live Server

**Server IP:** `watermelon.deze.me`

Join our survival multiplayer experience with friends!

## 💻 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS 4
- **Authentication:** Clerk
- **Database:** Supabase
- **Language:** TypeScript
- **Image Processing:** Sharp, React Image Crop

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### ImageFrame data setup (Supabase)

If your `images` table does not yet have frame/image dimension fields:

```bash
# Apply SQL in Supabase SQL Editor
supabase_add_frame_dimensions.sql

# Optional: backfill existing rows
npm run backfill:frames
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## 📁 Project Structure

```
watermelon/
├── app/
│   ├── about/          # About page
│   ├── api/            # API routes
│   ├── commands/       # Commands guide
│   ├── imageframe/     # Image frame creator
│   └── mods/           # Mods showcase
├── public/             # Static assets
├── scripts/            # Utility scripts (e.g. frame backfill)
└── supabase_add_*.sql  # SQL migrations
```

## 👥 Team

- **Yuii** - Minecraft Expert
- **Peach** - Adventurer
- **Jepot** - Server Admin
- **unknown0607** - Ideas Guy

## 🎨 Design Features

- Custom pixel font styling
- Glass-morphism effects
- Minecraft-themed UI elements
- Smooth animations and transitions
- Dark mode optimized

## 📝 License

Private project for the Watermelon SMP community.
