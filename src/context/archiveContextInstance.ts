import { createContext, type Dispatch } from "react";
import type { Post } from "../types/post";

export interface ArchiveState {
  posts: Post[];
  availableTags: string[];
  availableSubtags: string[];
  loading: boolean;
  error: string | null;
}

export type ArchiveAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_POSTS"; payload: Post[] }
  | { type: "ADD_POST"; payload: Post }
  | { type: "UPDATE_POST"; payload: Post }
  | { type: "REMOVE_POST"; payload: string };

export interface ArchiveContextValue {
  state: ArchiveState;
  dispatch: Dispatch<ArchiveAction>;
  addPost: (post: Post) => Promise<void>;
  updatePost: (post: Post) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  refreshPosts: () => Promise<void>;
}

export const ArchiveContext = createContext<ArchiveContextValue | undefined>(
  undefined,
);
