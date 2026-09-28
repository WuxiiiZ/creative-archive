import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import {
  FIRST_WAKE_TIMEOUT_MS,
  RETRY_TIMEOUT_MS,
  isAbortError,
  withTransientRetry,
} from "../api/http";
import {
  createPost,
  deletePost as deletePostRequest,
  fetchPosts,
  recordPostView,
  updatePost as updatePostRequest,
} from "../api/posts";
import type { Post } from "../types/post";
import {
  ArchiveContext,
  type ArchiveAction,
  type ArchiveState,
} from "./archiveContextInstance";

const initialState: ArchiveState = {
  posts: [],
  availableTags: [],
  availableSubtags: [],
  loading: true,
  waking: false,
  error: null,
};

function uniqueAppend(list: string[], values: string[]): string[] {
  return values.reduce((next, value) => {
    const trimmed = value.trim();
    if (!trimmed || next.includes(trimmed)) return next;
    return [...next, trimmed];
  }, list);
}

function collectTags(posts: Post[], key: "tags" | "subtags"): string[] {
  return posts.reduce<string[]>(
    (list, post) => uniqueAppend(list, post[key]),
    [],
  );
}

function archiveReducer(
  state: ArchiveState,
  action: ArchiveAction,
): ArchiveState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_WAKING":
      return { ...state, waking: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, waking: false };
    case "SET_POSTS": {
      const posts = action.payload;
      return {
        ...state,
        posts,
        availableTags: collectTags(posts, "tags"),
        availableSubtags: collectTags(posts, "subtags"),
        loading: false,
        waking: false,
        error: null,
      };
    }
    case "ADD_POST": {
      const post = action.payload;
      return {
        ...state,
        posts: [post, ...state.posts],
        availableTags: uniqueAppend(state.availableTags, post.tags),
        availableSubtags: uniqueAppend(state.availableSubtags, post.subtags),
        error: null,
      };
    }
    case "UPDATE_POST": {
      const post = action.payload;
      const posts = state.posts.map((item) =>
        item.id === post.id ? post : item,
      );
      return {
        ...state,
        posts,
        availableTags: collectTags(posts, "tags"),
        availableSubtags: collectTags(posts, "subtags"),
        error: null,
      };
    }
    case "SET_VIEW_COUNT": {
      const { id, viewCount } = action.payload;
      return {
        ...state,
        posts: state.posts.map((item) =>
          item.id === id ? { ...item, viewCount } : item,
        ),
      };
    }
    case "REMOVE_POST": {
      const posts = state.posts.filter((item) => item.id !== action.payload);
      return {
        ...state,
        posts,
        availableTags: collectTags(posts, "tags"),
        availableSubtags: collectTags(posts, "subtags"),
        error: null,
      };
    }
    default:
      return state;
  }
}

export function ArchiveProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(archiveReducer, initialState);
  const abortRef = useRef<AbortController | null>(null);

  const refreshPosts = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const { signal } = controller;

    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_WAKING", payload: false });
    dispatch({ type: "SET_ERROR", payload: null });

    try {
      const posts = await withTransientRetry(
        (attempt) =>
          fetchPosts({
            signal,
            timeoutMs: attempt === 0 ? FIRST_WAKE_TIMEOUT_MS : RETRY_TIMEOUT_MS,
          }),
        {
          signal,
          onRetry: () => dispatch({ type: "SET_WAKING", payload: true }),
        },
      );
      if (signal.aborted) return;
      dispatch({ type: "SET_POSTS", payload: posts });
    } catch (error) {
      if (signal.aborted || isAbortError(error)) return;
      const message =
        error instanceof Error ? error.message : "Failed to load posts";
      dispatch({ type: "SET_ERROR", payload: message });
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  useEffect(() => {
    void refreshPosts();
    return () => abortRef.current?.abort();
  }, [refreshPosts]);

  const addPost = useCallback(async (post: Post) => {
    const saved = await createPost(post);
    dispatch({ type: "ADD_POST", payload: saved });
  }, []);

  const updatePost = useCallback(async (post: Post) => {
    const saved = await updatePostRequest(post);
    dispatch({ type: "UPDATE_POST", payload: saved });
  }, []);

  const deletePost = useCallback(async (id: string) => {
    await deletePostRequest(id);
    dispatch({ type: "REMOVE_POST", payload: id });
  }, []);

  const recordView = useCallback(async (id: string) => {
    const viewCount = await recordPostView(id);
    if (viewCount == null) return;
    dispatch({ type: "SET_VIEW_COUNT", payload: { id, viewCount } });
  }, []);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      addPost,
      updatePost,
      deletePost,
      recordView,
      refreshPosts,
    }),
    [state, addPost, updatePost, deletePost, recordView, refreshPosts],
  );

  return (
    <ArchiveContext.Provider value={value}>{children}</ArchiveContext.Provider>
  );
}
