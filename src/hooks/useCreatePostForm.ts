import { useState } from "react";
import type { PostLanguage } from "../types/postLanguage";
import { asPostLanguage } from "../types/postLanguage";
import type { Section } from "../types/postSection";
import type { Post } from "../types/post";
import { uploadImage } from "../api/uploads";
import { useLocale } from "./useLocale";
import { useNotice } from "./useNotice";
import type { Messages } from "../i18n/messages";

export interface CreatePostFormData {
  title: string;
  summary: string;
  content: string;
  section: Section;
  language: PostLanguage;
  tags: string[];
  subtags: string[];
  images: string[];
}

export interface CreatePostFormErrors {
  title?: string;
  content?: string;
}

const emptyFormData: CreatePostFormData = {
  title: "",
  summary: "",
  content: "",
  section: "A",
  language: "zh",
  tags: [],
  subtags: [],
  images: [],
};

function fromPost(post: Post): CreatePostFormData {
  return {
    title: post.title,
    summary: post.summary ?? "",
    content: post.content,
    section: post.section,
    language: asPostLanguage(post.language),
    tags: [...post.tags.filter(Boolean)],
    subtags: [...post.subtags.filter(Boolean)],
    images: [...(post.images ?? [])],
  };
}

function validate(
  formData: CreatePostFormData,
  formCopy: Messages["form"],
): CreatePostFormErrors {
  const errors: CreatePostFormErrors = {};
  const title = formData.title.trim();
  const content = formData.content.trim();

  if (!title) {
    errors.title = formCopy.titleRequired;
  } else if (title.length < 3) {
    errors.title = formCopy.titleShort;
  } else if (title.length > 100) {
    errors.title = formCopy.titleLong;
  }

  if (!content) {
    errors.content = formCopy.contentRequired;
  }

  return errors;
}

function toPost(formData: CreatePostFormData, existing?: Post): Post {
  const now = new Date().toISOString();
  return {
    id: existing?.id ?? crypto.randomUUID(),
    title: formData.title.trim(),
    summary: formData.summary.trim(),
    content: formData.content.trim(),
    section: formData.section,
    language: formData.language,
    tags: formData.tags.map((tag) => tag.trim()).filter(Boolean),
    subtags: formData.subtags.map((tag) => tag.trim()).filter(Boolean),
    images: [...formData.images],
    viewCount: existing?.viewCount ?? 0,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

export function useCreatePostForm(
  onSave: (post: Post) => void | Promise<void>,
  options?: { initialPost?: Post; resetOnSuccess?: boolean },
) {
  const { copy } = useLocale();
  const { showNotice } = useNotice();
  const initialPost = options?.initialPost;
  const resetOnSuccess = options?.resetOnSuccess ?? !initialPost;

  const [formData, setFormData] = useState<CreatePostFormData>(
    initialPost ? fromPost(initialPost) : emptyFormData,
  );
  const [errors, setErrors] = useState<CreatePostFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  function updateField<K extends keyof CreatePostFormData>(
    key: K,
    value: CreatePostFormData[K],
  ) {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (key in errors) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key as keyof CreatePostFormErrors];
        return next;
      });
    }
  }

  async function handleImagesSelected(files: FileList | null) {
    if (!files || files.length === 0) return;

    setSubmitError(null);
    setIsUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        uploaded.push(await uploadImage(file));
      }
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploaded],
      }));
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : copy.form.uploadFailed,
      );
    } finally {
      setIsUploading(false);
    }
  }

  function removeImage(url: string) {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((item) => item !== url),
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate(formData, copy.form);
    setErrors(nextErrors);
    setSubmitError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await onSave(toPost(formData, initialPost));
      showNotice(
        initialPost ? copy.form.updateSuccess : copy.form.saveSuccess,
      );
      if (resetOnSuccess) {
        setFormData(emptyFormData);
        setErrors({});
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : copy.form.saveFailed,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    formData,
    errors,
    submitError,
    isSubmitting,
    isUploading,
    updateField,
    handleImagesSelected,
    removeImage,
    handleSubmit,
    isEditing: Boolean(initialPost),
  };
}
