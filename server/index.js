import express from 'express';
import cors from 'cors';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { pipeline } from 'stream/promises';
import path from 'path';
import { homedir } from 'os';
import dotenv from 'dotenv';

// Load .env from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const app = express();
const PORT = 3001;

// Target download directory
const DOWNLOAD_DIR = path.join(homedir(), 'Downloads', 'Wallpaper');

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

/**
 * POST /api/download
 * Body: { imageUrl: string, id: string }
 *
 * Fetches the full-resolution image from Wallhaven CDN
 * and saves it to ~/Downloads/Wallpaper/wallhaven-<id>.<ext>
 */
app.post('/api/download', async (req, res) => {
  const { imageUrl, id } = req.body;

  if (!imageUrl || !id) {
    return res.status(400).json({ success: false, message: 'Missing imageUrl or id' });
  }

  // Extract file extension from the image URL
  const ext = path.extname(new URL(imageUrl).pathname) || '.jpg';
  const filename = `wallhaven-${id}${ext}`;
  const filepath = path.join(DOWNLOAD_DIR, filename);

  // Ensure download directory exists
  if (!existsSync(DOWNLOAD_DIR)) {
    mkdirSync(DOWNLOAD_DIR, { recursive: true });
    console.log(`📁 Created download directory: ${DOWNLOAD_DIR}`);
  }

  // Check if file already exists
  if (existsSync(filepath)) {
    return res.json({
      success: true,
      alreadyExists: true,
      message: `"${filename}" is already in your Wallpaper folder`,
      filename,
    });
  }

  try {
    console.log(`⬇️  Downloading: ${imageUrl}`);

    // Build headers — include API key if available
    const headers = {};
    if (process.env.WALLHAVEN_API_KEY) {
      headers['X-API-Key'] = process.env.WALLHAVEN_API_KEY;
    }

    const response = await fetch(imageUrl, { headers });

    if (!response.ok) {
      throw new Error(`Wallhaven CDN responded with ${response.status}`);
    }

    // Stream the image to disk
    const fileStream = createWriteStream(filepath);
    await pipeline(response.body, fileStream);

    console.log(`✅ Saved: ${filepath}`);

    return res.json({
      success: true,
      alreadyExists: false,
      message: `"${filename}" downloaded successfully!`,
      filename,
    });
  } catch (error) {
    console.error(`❌ Download failed:`, error.message);
    return res.status(500).json({
      success: false,
      message: `Download failed: ${error.message}`,
    });
  }
});

/**
 * GET /api/wallhaven/*
 * Proxies any Wallhaven API request to avoid CORS issues.
 * e.g. /api/wallhaven/search?q=nature → https://wallhaven.cc/api/v1/search?q=nature
 *      /api/wallhaven/w/abc123     → https://wallhaven.cc/api/v1/w/abc123
 */
app.get('/api/wallhaven/*', async (req, res) => {
  // Extract the path after /api/wallhaven/
  const wallhavenPath = req.params[0];
  const queryString = new URLSearchParams(req.query).toString();
  const url = `https://wallhaven.cc/api/v1/${wallhavenPath}${queryString ? '?' + queryString : ''}`;

  try {
    const headers = {};
    if (process.env.WALLHAVEN_API_KEY) {
      headers['X-API-Key'] = process.env.WALLHAVEN_API_KEY;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Wallhaven API responded with ${response.status}`,
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(`❌ Wallhaven API proxy error:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', downloadDir: DOWNLOAD_DIR });
});

app.listen(PORT, () => {
  console.log(`\n🖼️  Wallhaven Download Server running on http://localhost:${PORT}`);
  console.log(`📂 Downloads will be saved to: ${DOWNLOAD_DIR}\n`);
});
