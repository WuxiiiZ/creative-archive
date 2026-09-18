# Creative Archive (Frontend)

Vite + React + TypeScript SPA for a personal creative archive: public browsing and an `/admin` drafting desk protected by JWT login. Posts are loaded from and saved to the Node API under `server/`.

## Public editions (English vs Chinese)

Posts come from **one shared API**. Creating, editing, or deleting a post updates both editions at once. Only chrome / UI copy changes; the post title, body, and tags stay as you wrote them.

| Edition | Local URL | Role |
| --- | --- | --- |
| **English** | `http://localhost:5173/en/` | Default share / deploy link (path includes `/en/`) |
| **Chinese (zh-CN)** | `http://localhost:5173/` | Same site at the root, Chinese UI |

Examples: English posts list → `http://localhost:5173/en/posts`; Chinese posts list → `http://localhost:5173/posts`. A small sliding **中 | EN** switch in the header corner keeps the current page.

Admin follows the same locale prefix (not linked from the public chrome):

| Edition | Admin URL |
| --- | --- |
| **Chinese** | `http://localhost:5173/admin` |
| **English** | `http://localhost:5173/en/admin` |

## Stack

| Piece | Role |
| --- | --- |
| **Vite** | Dev server and production bundler |
| **React 19** | UI |
| **TypeScript** | Types across the app |
| **React Router** | Public vs admin routes; admin gate |

Default API base URL: `http://localhost:3001` (`VITE_API_URL` in `.env.development`).

## Local setup

Requires a running **PostgreSQL** database (see `server/README.md`). Create once:

```bash
createdb creative_archive
```

Then:

```bash
# from repo root — frontend
npm install
npm run dev          # http://localhost:5173  (Chinese root)
                     # English edition: http://localhost:5173/en/

# backend (separate terminal) — set DATABASE_URL in server/.env first
npm run dev:server   # http://localhost:3001
```

Both processes should be running for list / create / edit / delete / image upload to work.

Default admin login (from `server/.env`): username `admin`, password `admin`.

Admin desk (not linked from the public chrome): `http://localhost:5173/admin` (Chinese) or `http://localhost:5173/en/admin` (English) — home, new post, manage (edit / delete).

## Project structure

```text
creative-archive/
├── index.html              # HTML shell Vite mounts into
├── package.json            # Frontend deps + scripts
├── vite.config.ts          # Vite config
├── .env.development        # Local VITE_API_URL (gitignored via .env.*)
├── src/
│   ├── main.tsx            # React entry: mounts <App />
│   ├── App.tsx             # Router + layouts (public / admin) + auth gate
│   ├── App.css             # Global / page styles
│   ├── api/                # HTTP calls to the backend
│   ├── i18n/               # Locale path helpers + UI copy (zh / en)
│   ├── context/            # Archive + auth + locale global state
│   ├── hooks/              # Reusable React hooks
│   ├── types/              # Shared domain types
│   ├── components/         # Route-level pages
│   └── reusableUI/         # Shared presentational components
└── server/                 # Backend package (see server/README.md)
```

## What each source area does

### Entry & routing

| File | Meaning |
| --- | --- |
| `src/main.tsx` | Boots React into `#root`. |
| `src/App.tsx` | Public Chinese `/`, `/posts` and English `/en`, `/en/posts`; Chinese `/admin/...` and English `/en/admin/...`. Wraps tree in `AuthProvider` + `ArchiveProvider` + `LocaleProvider`. |
| `src/App.css` | App-wide styling. |

### API layer (`src/api/`)

| File | Meaning |
| --- | --- |
| `config.ts` | Resolves `API_BASE_URL` from `VITE_API_URL`. |
| `token.ts` | Read/write/clear JWT in `localStorage`. |
| `auth.ts` | `login()` → `POST /api/auth/login`, stores token. |
| `posts.ts` | `fetchPosts()` (public); `createPost` / `updatePost` / `deletePost` with Bearer JWT. |
| `uploads.ts` | `uploadImage(file)` → `POST /api/uploads` (multipart), returns public URL. |

### State (`src/context/`, `src/hooks/`)

| File | Meaning |
| --- | --- |
| `authContextInstance.ts` | Auth context types. |
| `AuthContext.tsx` | Provider: token, `login`, `logout`, `isAuthenticated`. |
| `useAuth.ts` | Safe hook for auth context. |
| `archiveContextInstance.ts` | Archive context type, actions (`SET_POSTS`, `ADD_POST`, `UPDATE_POST`, `REMOVE_POST`, …). |
| `ArchiveContext.tsx` | Provider: loads posts on mount; `addPost` / `updatePost` / `deletePost` sync with API. |
| `useArchive.ts` | Safe hook to read archive context. |
| `useCreatePostForm.ts` | Create / edit form state, validation, image upload, submit. |
| `useLocale.ts` | Safe hook for locale, UI copy, and localized public paths. |

### i18n (`src/i18n/`, `src/context/LocaleContext.tsx`)

| File | Meaning |
| --- | --- |
| `locale.ts` | `zh` vs `en` from the URL; `/en` prefix helpers for public and admin paths. |
| `messages.ts` | UI strings (public + admin masthead, home, list, login, compose, 404, section labels). |
| `localeContextInstance.ts` / `LocaleContext.tsx` | Reads the path, sets `<html lang>`, exposes `copy` + `localizePath`. |

### Types (`src/types/`)

| File | Meaning |
| --- | --- |
| `post.ts` | `Post` shape (id, title, content, section, tags, …). |
| `postSection.ts` | `Section` (`A` \| `B` \| `C`) and display labels. |

### Pages (`src/components/`)

| File | Meaning |
| --- | --- |
| `HomePage.tsx` | Public landing (copy follows `/` vs `/en`). |
| `AdminHomePage.tsx` | Admin desk home; target of **View Site**. |
| `ExistingPosts.tsx` | Post list (public) and manage list (edit / delete). |
| `CreatePostPage.tsx` | Admin compose + edit form. |
| `LoginPage.tsx` | Admin sign-in form. |
| `RequireAuth.tsx` | Redirects to the locale’s `/admin/login` when not signed in. |
| `NotFoundPage.tsx` | 404 for unknown public paths (locale-aware). |

### Shared UI (`src/reusableUI/`)

| File | Meaning |
| --- | --- |
| `Masthead.tsx` | Header/nav (`public` vs `admin`); public: Home, Created Posts; admin: New Post, Manage Posts, View Site → admin home, Sign out. |
| `LocaleSwitch.tsx` | Compact sliding **中 | EN** switch in the header corner; drag or tap; keeps the current public or admin page. |
| `PaperPanel.tsx` | Panel layout primitives. |
| `PostCard.tsx` | Single post card; optional Edit / Delete actions. |
| `TagSuggestField.tsx` | Tag / subtag input with suggestions. |
| `ErrorBoundary.tsx` | Catches render errors in a subtree. |

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Frontend dev server |
| `npm run dev:server` | Backend dev server (from root) |
| `npm run build` | Typecheck + production build → `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |
