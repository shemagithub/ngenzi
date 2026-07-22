import ImageKit from 'imagekit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });
// Also try .env.local if it exists
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Initialize ImageKit only if credentials are available
let imagekit = null;
const isImageKitConfigured = 
  process.env.IMAGEKIT_PUBLIC_KEY && 
  process.env.IMAGEKIT_PRIVATE_KEY && 
  process.env.IMAGEKIT_URL_ENDPOINT;

if (isImageKitConfigured) {
  try {
    imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });
    console.log("✅ ImageKit connected successfully!");
  } catch (error) {
    console.warn("⚠️  ImageKit initialization failed:", error.message);
    imagekit = null;
  }
} else {
  console.warn("⚠️  ImageKit not configured. Images will be saved locally.");
  console.warn("   Set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT in .env to use ImageKit");
}

export default imagekit;
export { isImageKitConfigured };