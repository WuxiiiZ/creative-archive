/**
 * Backend entry: create and start the HTTP server, register API routes.
 * Posts live in PostgreSQL; uploaded images are stored under server/uploads/.
 */
import "dotenv/config";
import cors from "cors";
import express from "express";
import multer from "multer";
import { credentialsMatch, requireAuth, signAdminToken } from "./auth.js";
import { ensureSchema } from "./db.js";
import {
  ensureDailyStatsSchema,
  getDeskDailyStats,
  recordPostCreated,
  recordPostDeleted,
  recordPostUpdated,
} from "./dailyStats.js";
import {
  deletePostById,
  findPostById,
  incrementPostView,
  insertPost,
  listPosts,
  updatePostById,
} from "./postsRepo.js";
import { parseNewPost, parsePostUpdate } from "./types.js";
import { publicUploadUrl, uploadImage, uploadsDir } from "./uploads.js";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

/** Comma-separated origins, e.g. "http://localhost:5173,https://your-app.vercel.app" */
const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:5173";

app.use(
  cors({
    origin: corsOrigin.split(",").map((origin) => origin.trim()),
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(uploadsDir));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body as {
    username?: unknown;
    password?: unknown;
  };

  if (!credentialsMatch(username, password)) {
    res.status(401).json({ error: "Invalid username or password." });
    return;
  }

  const token = signAdminToken(String(username));
  res.json({ token });
});

app.get("/api/posts", async (_req, res) => {
  try {
    const posts = await listPosts();
    res.json(posts);
  } catch (error) {
    console.error("Failed to list posts:", error);
    res.status(500).json({ error: "Failed to load posts." });
  }
});

app.post("/api/posts", requireAuth, async (req, res) => {
  const post = parseNewPost(req.body);
  if (!post) {
    res.status(400).json({
      error: "Invalid post. Require non-empty title and section A|B|C.",
    });
    return;
  }

  try {
    const saved = await insertPost(post);
    await recordPostCreated(saved);
    res.status(201).json(saved);
  } catch (error) {
    console.error("Failed to create post:", error);
    res.status(500).json({ error: "Failed to create post." });
  }
});

app.put("/api/posts/:id", requireAuth, async (req, res) => {
  const id = String(req.params.id);
  try {
    const existing = await findPostById(id);
    if (!existing) {
      res.status(404).json({ error: "Post not found." });
      return;
    }

    const updated = parsePostUpdate(req.body, existing);
    if (!updated) {
      res.status(400).json({
        error: "Invalid post. Require non-empty title and section A|B|C.",
      });
      return;
    }

    const saved = await updatePostById(updated);
    if (!saved) {
      res.status(404).json({ error: "Post not found." });
      return;
    }

    await recordPostUpdated(existing, saved);
    res.json(saved);
  } catch (error) {
    console.error("Failed to update post:", error);
    res.status(500).json({ error: "Failed to update post." });
  }
});

app.delete("/api/posts/:id", requireAuth, async (req, res) => {
  const id = String(req.params.id);
  try {
    const removed = await deletePostById(id);
    if (!removed) {
      res.status(404).json({ error: "Post not found." });
      return;
    }
    await recordPostDeleted(removed);
    res.json(removed);
  } catch (error) {
    console.error("Failed to delete post:", error);
    res.status(500).json({ error: "Failed to delete post." });
  }
});

app.get("/api/stats/desk", requireAuth, async (_req, res) => {
  try {
    const stats = await getDeskDailyStats();
    res.json(stats);
  } catch (error) {
    console.error("Failed to load desk stats:", error);
    res.status(500).json({ error: "Failed to load desk stats." });
  }
});

app.post("/api/posts/:id/view", async (req, res) => {
  const id = String(req.params.id);
  try {
    const viewCount = await incrementPostView(id);
    if (viewCount === null) {
      res.status(404).json({ error: "Post not found." });
      return;
    }
    res.json({ viewCount });
  } catch (error) {
    console.error("Failed to record view:", error);
    res.status(500).json({ error: "Failed to record view." });
  }
});

app.post("/api/uploads", requireAuth, (req, res) => {
  uploadImage(req, res, (error) => {
    if (error) {
      const message =
        error instanceof Error ? error.message : "Upload failed.";
      const status =
        error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE"
          ? 400
          : 400;
      res.status(status).json({ error: message });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        error: 'Expected a single image file field named "image".',
      });
      return;
    }

    res.status(201).json({ url: publicUploadUrl(req.file.filename) });
  });
});

async function main() {
  await ensureSchema();
  await ensureDailyStatsSchema();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`creative-archive API listening on http://0.0.0.0:${PORT}`);
  });
}

main().catch((error) => {
  console.error("Failed to start API:", error);
  process.exit(1);
});
