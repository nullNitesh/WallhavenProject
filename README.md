# 🖼️ Wallhaven Downloader

Browse [Wallhaven](https://wallhaven.cc) wallpapers in a sleek local web app and download them directly to `~/Downloads/Wallpaper/` with a single click.

## Features

- **Search & Browse** — Full-text search with category, purity, and sorting filters
- **One-Click Download** — Wallpapers are saved directly to `~/Downloads/Wallpaper/` — no browser download dialogs
- **Detail View** — Click any wallpaper to see metadata, tags, colors, and full preview
- **Duplicate Detection** — Already downloaded? You'll get a notification instead of re-downloading
- **Dark Glassmorphism UI** — Premium dark theme with smooth animations

## Tech Stack

- **Frontend**: Vite + Vanilla JS + CSS
- **Backend**: Express.js (local server for filesystem downloads)
- **API**: [Wallhaven API v1](https://wallhaven.cc/help/api)

## Quick Start

```bash
# Install dependencies
npm install

# Start both frontend and backend
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

## Configuration (Optional)

For NSFW wallpaper access, create a `.env` file in the project root:

```
WALLHAVEN_API_KEY=your_api_key_here
```

Get your API key from [wallhaven.cc/settings/account](https://wallhaven.cc/settings/account).

## How It Works

1. You search/browse wallpapers — the frontend calls the Wallhaven API directly
2. You click **Download** on a wallpaper — the frontend sends a request to a local Express server
3. The Express server fetches the full-resolution image and saves it to `~/Downloads/Wallpaper/`
4. You get a toast notification confirming success ✅
