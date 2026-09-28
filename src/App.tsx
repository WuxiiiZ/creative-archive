import { useEffect } from "react";
import {
  BrowserRouter,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { ArchiveProvider } from "./context/ArchiveContext";
import { AuthProvider } from "./context/AuthContext";
import { LocaleProvider } from "./context/LocaleContext";
import { NoticeProvider } from "./context/NoticeContext";
import { useArchive } from "./hooks/useArchive";
import { useLocale } from "./hooks/useLocale";
import { ApiWakeBanner } from "./reusableUI/ApiWakeBanner";
import { Masthead } from "./reusableUI/Masthead";
import { HomePage } from "./components/HomePage";
import { AdminHomePage } from "./components/AdminHomePage";
import CreatePostPage from "./components/CreatePostPage";
import { ExistingPosts } from "./components/ExistingPosts";
import { PostDetailPage } from "./components/PostDetailPage";
import { LoginPage } from "./components/LoginPage";
import { NotFoundPage } from "./components/NotFoundPage";
import { RequireAuth } from "./components/RequireAuth";
import { releasePostViewVisit } from "./utils/postViewVisit";
import "./App.css";

function NewPostPage() {
  const {
    state: { availableTags, availableSubtags },
    addPost,
  } = useArchive();

  return (
    <CreatePostPage
      onCreatePost={addPost}
      availableTags={availableTags}
      availableSubtags={availableSubtags}
    />
  );
}

function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { copy, localizePath } = useLocale();
  const {
    state: { posts, availableTags, availableSubtags, loading, waking, error },
    updatePost,
    refreshPosts,
  } = useArchive();

  const post = posts.find((item) => item.id === id);

  if (!post && (loading || waking)) {
    return (
      <section className="home-welcome paper-panel paper-panel--lavender">
        <p className="home-welcome__eyebrow">{copy.manage.missingEyebrow}</p>
        <h2 className="home-welcome__title">{copy.connection.wakingTitle}</h2>
        <p className="home-welcome__lede">{copy.connection.wakingBody}</p>
      </section>
    );
  }

  if (!post && error) {
    return (
      <section className="home-welcome paper-panel paper-panel--lavender">
        <p className="home-welcome__eyebrow">{copy.manage.missingEyebrow}</p>
        <h2 className="home-welcome__title">{copy.connection.unavailableTitle}</h2>
        <p className="home-welcome__lede">{copy.connection.unavailableBody}</p>
        <div className="home-welcome__actions">
          <button
            type="button"
            className="btn btn--sticker"
            onClick={() => {
              void refreshPosts();
            }}
          >
            {copy.connection.retry}
          </button>
        </div>
      </section>
    );
  }

  if (!post) {
    return (
      <section className="home-welcome paper-panel paper-panel--lavender">
        <p className="home-welcome__eyebrow">{copy.manage.missingEyebrow}</p>
        <h2 className="home-welcome__title">{copy.manage.missingTitle}</h2>
        <p className="home-welcome__lede">{copy.manage.missingLede}</p>
      </section>
    );
  }

  return (
    <CreatePostPage
      initialPost={post}
      onCreatePost={async (next) => {
        await updatePost(next);
        navigate(localizePath("/admin/posts"), { replace: true });
      }}
      availableTags={availableTags}
      availableSubtags={availableSubtags}
    />
  );
}

function PostsPage() {
  const {
    state: { posts },
  } = useArchive();

  return <ExistingPosts posts={posts} showFilters />;
}

function ManagePostsPage() {
  const { copy, localizePath } = useLocale();
  const {
    state: { posts },
    deletePost,
  } = useArchive();

  return (
    <ExistingPosts
      posts={posts}
      title={copy.manage.title}
      manage={{
        editPath: (id) => localizePath(`/admin/posts/${id}/edit`),
        onDelete: deletePost,
      }}
    />
  );
}

function adminDeskPages() {
  return (
    <>
      <Route index element={<AdminHomePage />} />
      <Route path="new-post" element={<NewPostPage />} />
      <Route path="posts" element={<ManagePostsPage />} />
      <Route path="posts/:id/edit" element={<EditPostPage />} />
    </>
  );
}

function PublicLayout() {
  const { pathname } = useLocation();
  useEffect(() => {
    releasePostViewVisit(pathname);
  }, [pathname]);

  return (
    <div className="fanpage">
      <Masthead variant="public" />
      <main className="fanpage__frame">
        <ApiWakeBanner />
        <Outlet />
      </main>
    </div>
  );
}

function AdminLayout() {
  return (
    <div className="fanpage">
      <Masthead variant="admin" />
      <main className="fanpage__frame">
        <ApiWakeBanner />
        <Outlet />
      </main>
    </div>
  );
}

/**
 * zh and en share the same layout route parents so Masthead / LocaleSwitch
 * stay mounted across language switches (avoids a full remount hitch).
 */
function ArchiveApp() {
  return (
    <Routes>
      <Route path="/admin/login" element={<LoginPage />} />
      <Route path="/en/admin/login" element={<LoginPage />} />

      <Route
        element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route path="admin">{adminDeskPages()}</Route>
        <Route path="en/admin">{adminDeskPages()}</Route>
      </Route>

      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="posts" element={<PostsPage />} />
        <Route path="posts/:id" element={<PostDetailPage />} />
        <Route path="en" element={<HomePage />} />
        <Route path="en/posts" element={<PostsPage />} />
        <Route path="en/posts/:id" element={<PostDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ArchiveProvider>
          <LocaleProvider>
            <NoticeProvider>
              <ArchiveApp />
            </NoticeProvider>
          </LocaleProvider>
        </ArchiveProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
