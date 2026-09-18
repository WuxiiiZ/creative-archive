import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import {
  createPost,
  deletePost as deletePostRequest,
  fetchPosts,
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
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_POSTS": {
      const posts = action.payload;
      return {
        ...state,
        posts,
        availableTags: collectTags(posts, "tags"),
        availableSubtags: collectTags(posts, "subtags"),
        loading: false,
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

  const refreshPosts = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const posts = await fetchPosts();
      dispatch({ type: "SET_POSTS", payload: posts });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load posts";
      dispatch({ type: "SET_ERROR", payload: message });
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  useEffect(() => {
    void refreshPosts();
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

  const value = useMemo(
    () => ({
      state,
      dispatch,
      addPost,
      updatePost,
      deletePost,
      refreshPosts,
    }),
    [state, addPost, updatePost, deletePost, refreshPosts],
  );

  return (
    <ArchiveContext.Provider value={value}>{children}</ArchiveContext.Provider>
  );
}
