# Creative Archive API (Backend)

Node + Express + TypeScript HTTP API for the Creative Archive frontend. Posts are stored in **PostgreSQL**. Images go to **Cloudinary** when `CLOUDINARY_*` is set; otherwise they are saved under `server/uploads/` and referenced by URL in each post’s `images` array. Admin write routes require a JWT from `/api/auth/login`.

The frontend has Chinese and English editions that read the **same** post list (public at `/` vs `/en/`, admin at `/admin` vs `/en/admin`):

| Edition | Typical frontend URL | Notes |
| --- | --- | --- |
| **English** | `http://localhost:5173/en/` · admin `…/en/admin` | Default share / deploy link |
| **Chinese** | `http://localhost:5173/` · admin `…/admin` | Root URL; same posts, Chinese UI |

Create / update / delete on this API therefore refresh both editions together.

## Stack

| Piece | Role |
| --- | --- |
| **Node.js** | Runtime |
| **Express** | HTTP server and routes |
| **PostgreSQL** | Persistent post storage (`pg`) |
| **multer** | Multipart image uploads |
| **cloudinary** | Cloud image storage when configured |
| **TypeScript** | Source language (`tsc` → `dist/`) |
| **cors** | Allows the Vite/Vercel frontend origin |
| **jsonwebtoken** | Sign and verify admin JWTs |
| **dotenv** | Load `server/.env` |
| **tsx** | Dev runner with watch (`npm run dev`) |

## Local setup

1. Make sure PostgreSQL is running (this project was verified with Homebrew `postgresql@15` on port `5432`).
2. Create a database (once):

```bash
createdb creative_archive
# or: psql -d postgres -c "CREATE DATABASE creative_archive;"
```

3. Configure env and start:

```bash
cd server
cp .env.example .env   # then set DATABASE_URL if needed
npm install
npm run dev            # http://localhost:3001 — creates the posts table on boot
```

Or from the repo root: `npm run dev:server`.

Default credentials in `.env.example`: `admin` / `admin`. Change them before deploying.

Example local `DATABASE_URL` (Homebrew, no password):

```text
DATABASE_URL=postgresql://YOUR_MAC_USERNAME@localhost:5432/creative_archive
PUBLIC_BASE_URL=http://localhost:3001
```

## Project structure

```text
server/
├── package.json        # Backend deps + scripts
├── tsconfig.json       # Compiles src/ → dist/
├── .env.example        # PORT, CORS, DB, JWT, admin credentials
├── uploads/            # Local image files (gitignored except .gitkeep)
├── src/
│   ├── index.ts        # App entry: middleware, routes, listen
│   ├── db.ts           # pg pool + schema bootstrap
│   ├── postsRepo.ts    # Post CRUD against PostgreSQL
│   ├── uploads.ts      # Cloudinary or local disk + public URL helper
│   ├── auth.ts         # Login helpers + requireAuth middleware
│   └── types.ts        # Post model + request validation
└── dist/               # Build output (generated, gitignored at repo root)
```

## What each file does

| File | Meaning |
| --- | --- |
| `src/index.ts` | Creates Express, CORS + JSON, static `/uploads`, auth + posts + upload routes. |
| `src/db.ts` | `DATABASE_URL` pool; `ensureSchema()` creates `posts` if missing. |
| `src/postsRepo.ts` | List / insert / update / delete posts in PostgreSQL. |
| `src/uploads.ts` | Uploads to Cloudinary when configured; else `uploads/` + `PUBLIC_BASE_URL`. |
| `src/auth.ts` | Checks admin username/password, signs JWT, `requireAuth` for protected routes. |
| `src/types.ts` | `Post` / `Section` types; `parseNewPost()` / `parsePostUpdate()` validate bodies. |

## HTTP API

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/health` | No | Liveness → `{ ok: true }` |
| `POST` | `/api/auth/login` | No | Body `{ username, password }` → `{ token }` |
| `GET` | `/api/posts` | No | List all posts |
| `POST` | `/api/posts` | Bearer JWT | Create a post |
| `PUT` | `/api/posts/:id` | Bearer JWT | Update a post |
| `DELETE` | `/api/posts/:id` | Bearer JWT | Delete a post |
| `POST` | `/api/uploads` | Bearer JWT | Multipart field `image` → `{ url }` |
| `POST` | `/api/ai/assist` | Bearer JWT | `{ action, title?, content, locale? }` → `{ action, text }` (`summarize` \| `critique` \| `proofread`) |
| `GET` | `/uploads/:file` | No | Serve a locally uploaded image |

Example login:

```json
{ "username": "admin", "password": "admin" }
```

Example create / update body (header `Authorization: Bearer <token>`):

```json
{
  "title": "Hello",
  "summary": "optional blurb",
  "content": "…",
  "section": "A",
  "tags": ["intro"],
  "subtags": [],
  "images": ["http://localhost:3001/uploads/….png"]
}
```

Upload: `multipart/form-data` with field name `image` (JPEG / PNG / WebP / GIF, max 5MB). Put returned `url` values into `images` when saving the post.

## Environment

| Variable | Default | Meaning |
| --- | --- | --- |
| `PORT` | `3001` | Listen port |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed frontend origin(s), comma-separated |
| `DATABASE_URL` | `postgresql://localhost:5432/creative_archive` | Postgres connection string |
| `PUBLIC_BASE_URL` | `http://localhost:3001` | Origin for local-disk upload URLs |
| `CLOUDINARY_CLOUD_NAME` | — | Cloudinary cloud name (with key + secret → cloud uploads) |
| `CLOUDINARY_API_KEY` | — | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | — | Cloudinary API secret |
| `CLOUDINARY_FOLDER` | `creative-archive` | Optional Media Library folder |
| `GEMINI_API_KEY` | — | Enables compose AI assist |
| `GEMINI_MODEL` | `gemini-3.6-flash` | Optional model override |
| `JWT_SECRET` | dev fallback | Secret used to sign tokens |
| `ADMIN_USERNAME` | `admin` | Login username |
| `ADMIN_PASSWORD` | `admin` | Login password |

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Watch TypeScript and restart |
| `npm run build` | Emit `dist/` |
| `npm start` | Run compiled `dist/index.js` (production / Render) |

## Implementation notes

### Phase: PostgreSQL + local uploads

**What changed:** Replaced the in-memory `posts` array with a `posts` table. Added `POST /api/uploads` and static `/uploads`. No seed data.

**Files:** `db.ts`, `postsRepo.ts`, `uploads.ts`, updated `index.ts`, `.env.example`, `uploads/.gitkeep`.
