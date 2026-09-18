/**
 * Local disk uploads: multer writes under server/uploads/, URLs point at /uploads/*.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import multer from "multer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Resolved uploads directory (server/uploads), stable in both tsx and dist. */
export const uploadsDir = path.resolve(__dirname, "..", "uploads");

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = EXT_BY_MIME[file.mimetype] ?? path.extname(file.originalname);
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

export const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      cb(new Error("Only JPEG, PNG, WebP, and GIF images are allowed."));
      return;
    }
    cb(null, true);
  },
}).single("image");

/** Build a public URL for a stored filename. */
export function publicUploadUrl(filename: string): string {
  const base = (
    process.env.PUBLIC_BASE_URL ?? "http://localhost:3001"
  ).replace(/\/$/, "");
  return `${base}/uploads/${filename}`;
}
