/**
 * Image uploads: Cloudinary when CLOUDINARY_* is set, otherwise local disk
 * under server/uploads/ (served at /uploads/*).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { v2 as cloudinary } from "cloudinary";
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

function env(name: string): string {
  return (process.env[name] ?? "").trim();
}

/** True when all Cloudinary credentials are present. */
export function isCloudinaryConfigured(): boolean {
  return Boolean(
    env("CLOUDINARY_CLOUD_NAME") &&
      env("CLOUDINARY_API_KEY") &&
      env("CLOUDINARY_API_SECRET"),
  );
}

fs.mkdirSync(uploadsDir, { recursive: true });

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: env("CLOUDINARY_CLOUD_NAME"),
    api_key: env("CLOUDINARY_API_KEY"),
    api_secret: env("CLOUDINARY_API_SECRET"),
    secure: true,
  });
}

const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = EXT_BY_MIME[file.mimetype] ?? path.extname(file.originalname);
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

export const uploadImage = multer({
  storage: isCloudinaryConfigured() ? multer.memoryStorage() : diskStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      cb(new Error("Only JPEG, PNG, WebP, and GIF images are allowed."));
      return;
    }
    cb(null, true);
  },
}).single("image");

/** Build a public URL for a locally stored filename. */
export function publicUploadUrl(filename: string): string {
  const base = (
    process.env.PUBLIC_BASE_URL ?? "http://localhost:3001"
  ).replace(/\/$/, "");
  return `${base}/uploads/${filename}`;
}

function uploadBufferToCloudinary(buffer: Buffer): Promise<string> {
  const folder = env("CLOUDINARY_FOLDER") || "creative-archive";

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        if (!result?.secure_url) {
          reject(new Error("Cloudinary upload returned no URL."));
          return;
        }
        resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });
}

/**
 * Persist a multer file and return its public URL.
 * Uses Cloudinary when configured; otherwise local /uploads/.
 */
export async function storeUploadedImage(
  file: Express.Multer.File,
): Promise<string> {
  if (isCloudinaryConfigured()) {
    if (!file.buffer?.length) {
      throw new Error("Expected an in-memory image buffer for Cloudinary.");
    }
    return uploadBufferToCloudinary(file.buffer);
  }

  if (!file.filename) {
    throw new Error("Expected a saved filename for local disk upload.");
  }
  return publicUploadUrl(file.filename);
}
