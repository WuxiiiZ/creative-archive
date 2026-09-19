import { useState } from "react";
import type { Section } from "../types/postSection";
import type { Post } from "../types/post";
import { requestAiAssist, type AiAssistAction } from "../api/ai";
import { useCreatePostForm } from "../hooks/useCreatePostForm";
import { useLocale } from "../hooks/useLocale";
import {
  PaperPanel,
  PaperPanelBody,
  PaperPanelHeader,
  PaperPanelTitle,
} from "../reusableUI/PaperPanel";
import { TagSuggestField } from "../reusableUI/TagSuggestField";

interface CreatePostPageProps {
  onCreatePost: (post: Post) => void | Promise<void>;
  availableTags: string[];
  availableSubtags: string[];
  initialPost?: Post;
  submitLabel?: string;
}

export default function CreatePostPage({
  onCreatePost,
  availableTags,
  availableSubtags,
  initialPost,
  submitLabel,
}: CreatePostPageProps) {
  const { copy, locale } = useLocale();
  const {
    formData,
    errors,
    submitError,
    isSubmitting,
    isUploading,
    updateField,
    handleImagesSelected,
    removeImage,
    handleSubmit,
    isEditing,
  } = useCreatePostForm(onCreatePost, { initialPost });

  const [aiBusy, setAiBusy] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [aiCritique, setAiCritique] = useState<string | null>(null);
  const [aiOpen, setAiOpen] = useState(false);

  const title = isEditing ? copy.compose.editTitle : copy.compose.createTitle;
  const eyebrow = isEditing
    ? copy.compose.editEyebrow
    : copy.compose.createEyebrow;
  const hint = isEditing ? copy.compose.editHint : copy.compose.createHint;
  const buttonLabel =
    submitLabel ?? (isEditing ? copy.compose.update : copy.compose.save);

  async function runAi(action: AiAssistAction) {
    const content = formData.content.trim();
    if (!content) {
      setAiCritique(null);
      setAiMessage(copy.compose.aiNeedContent);
      return;
    }

    setAiBusy(true);
    setAiMessage(null);
    try {
      const result = await requestAiAssist({
        action,
        title: formData.title,
        content,
        locale,
      });

      if (action === "summarize") {
        updateField("summary", result.text.slice(0, 160));
        setAiCritique(null);
        setAiMessage(copy.compose.aiAppliedSummary);
      } else if (action === "proofread") {
        updateField("content", result.text);
        setAiCritique(null);
        setAiMessage(copy.compose.aiAppliedProofread);
      } else {
        setAiCritique(result.text);
        setAiMessage(null);
      }
    } catch (error) {
      setAiCritique(null);
      setAiMessage(
        error instanceof Error ? error.message : copy.compose.aiFailed,
      );
    } finally {
      setAiBusy(false);
    }
  }

  const contentPreview = formData.content.trim();

  return (
    <>
      <PaperPanel id="compose" variant="cream" className="compose">
      <PaperPanelHeader>
        <p className="compose__eyebrow">{eyebrow}</p>
        <PaperPanelTitle>{title}</PaperPanelTitle>
        <p className="compose__hint">{hint}</p>
      </PaperPanelHeader>

      <PaperPanelBody>
        <form className="compose-form" onSubmit={handleSubmit} noValidate>
          <div className="compose-form__field compose-form__field--title">
            <label htmlFor="title">{copy.compose.title}</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => updateField("title", e.target.value)}
              maxLength={100}
              placeholder={copy.compose.titlePlaceholder}
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? "title-error" : undefined}
            />
            {errors.title && (
              <span id="title-error" className="field-error" role="alert">
                {errors.title}
              </span>
            )}
          </div>

          <div className="compose-form__field compose-form__field--summary">
            <label htmlFor="summary">
              {copy.compose.summary}
              <span className="compose-form__optional">
                {" "}
                ({copy.compose.optional})
              </span>
            </label>
            <input
              type="text"
              id="summary"
              value={formData.summary}
              onChange={(e) => updateField("summary", e.target.value)}
              maxLength={160}
              placeholder={copy.compose.summaryPlaceholder}
            />
          </div>

          <div className="compose-form__field compose-form__field--content">
            <label htmlFor="content">{copy.compose.content}</label>
            <div className="compose-form__content-shell">
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => updateField("content", e.target.value)}
                placeholder={copy.compose.contentPlaceholder}
                aria-invalid={Boolean(errors.content)}
                aria-describedby={
                  errors.content
                    ? "content-error content-count"
                    : "content-count"
                }
              />
              <span id="content-count" className="compose-form__char-count">
                {copy.compose.charCount(
                  Array.from(formData.content).length,
                )}
              </span>
            </div>
            {errors.content && (
              <span id="content-error" className="field-error" role="alert">
                {errors.content}
              </span>
            )}
          </div>

          <div className="compose-form__field compose-form__field--section">
            <label htmlFor="section">{copy.compose.section}</label>
            <select
              id="section"
              value={formData.section}
              onChange={(e) =>
                updateField("section", e.target.value as Section)
              }
            >
              {(Object.keys(copy.section) as Section[]).map((value) => (
                <option key={value} value={value}>
                  {copy.section[value]}
                </option>
              ))}
            </select>
          </div>

          <TagSuggestField
            id="tags"
            label={copy.compose.tags}
            values={formData.tags}
            options={availableTags}
            placeholder={copy.compose.tagsPlaceholder}
            hint={copy.compose.tagsHint}
            noMatch={copy.compose.tagsNoMatch}
            suggestionsLabel={`${copy.compose.tags} ${copy.compose.tagsSuggestions}`}
            addLabel={copy.compose.removeTag}
            variant="tag"
            onChange={(values) => updateField("tags", values)}
          />

          <TagSuggestField
            id="subtags"
            label={copy.compose.subtags}
            values={formData.subtags}
            options={availableSubtags}
            placeholder={copy.compose.subtagsPlaceholder}
            hint={copy.compose.tagsHint}
            noMatch={copy.compose.tagsNoMatch}
            suggestionsLabel={`${copy.compose.subtags} ${copy.compose.tagsSuggestions}`}
            addLabel={copy.compose.removeTag}
            variant="subtag"
            onChange={(values) => updateField("subtags", values)}
          />

          <div className="compose-form__field compose-form__field--images">
            <label htmlFor="images">
              {copy.compose.images}
              <span className="compose-form__optional">
                {" "}
                ({copy.compose.optional})
              </span>
            </label>
            <p className="compose-form__images-hint">{copy.compose.imagesHint}</p>
            <input
              type="file"
              id="images"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              disabled={isUploading || isSubmitting}
              onChange={(e) => {
                void handleImagesSelected(e.target.files);
                e.target.value = "";
              }}
            />
            {isUploading ? (
              <p className="compose-form__upload-status">
                {copy.compose.uploading}
              </p>
            ) : null}
            {formData.images.length > 0 ? (
              <ul className="compose-form__image-list">
                {formData.images.map((url) => (
                  <li key={url} className="compose-form__image-item">
                    <img src={url} alt="" />
                    <button
                      type="button"
                      className="compose-form__image-remove"
                      onClick={() => removeImage(url)}
                      disabled={isSubmitting}
                    >
                      {copy.compose.removeImage}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="compose-form__actions">
            {submitError ? (
              <p className="compose-form__error" role="alert">
                {submitError}
              </p>
            ) : null}
            <button
              className="btn btn--sticker"
              type="submit"
              disabled={isSubmitting || isUploading || aiBusy}
            >
              {isSubmitting ? copy.compose.saving : buttonLabel}
            </button>
          </div>
        </form>
      </PaperPanelBody>
      </PaperPanel>

      <button
        type="button"
        className="compose-ai-fab"
        onClick={() => setAiOpen((prev) => !prev)}
        aria-expanded={aiOpen}
        aria-controls="compose-ai-panel"
      >
        {aiOpen ? copy.compose.aiClose : copy.compose.aiOpen}
      </button>

      {aiOpen ? (
        <aside id="compose-ai-panel" className="compose-ai-panel">
          <header className="compose-ai-panel__header">
            <p className="compose-ai-panel__title">{copy.compose.aiLabel}</p>
            <button
              type="button"
              className="compose-ai-panel__close"
              onClick={() => setAiOpen(false)}
              aria-label={copy.compose.aiClose}
            >
              ×
            </button>
          </header>
          <p className="compose-ai-panel__hint">{copy.compose.aiHint}</p>
          <div className="compose-ai-panel__preview">
            <p className="compose-ai-panel__preview-label">
              {copy.compose.aiPreviewLabel}
            </p>
            <p className="compose-ai-panel__preview-text">
              {contentPreview || copy.compose.aiPreviewEmpty}
            </p>
          </div>
          <div className="compose-form__ai-actions" role="group">
            <button
              type="button"
              className="btn btn--ghost compose-form__ai-btn"
              disabled={aiBusy || isSubmitting || isUploading}
              onClick={() => void runAi("summarize")}
            >
              {copy.compose.aiSummarize}
            </button>
            <button
              type="button"
              className="btn btn--ghost compose-form__ai-btn"
              disabled={aiBusy || isSubmitting || isUploading}
              onClick={() => void runAi("critique")}
            >
              {copy.compose.aiCritique}
            </button>
            <button
              type="button"
              className="btn btn--ghost compose-form__ai-btn"
              disabled={aiBusy || isSubmitting || isUploading}
              onClick={() => void runAi("proofread")}
            >
              {copy.compose.aiProofread}
            </button>
          </div>
          {aiBusy ? (
            <p className="compose-form__ai-status" aria-live="polite">
              {copy.compose.aiWorking}
            </p>
          ) : null}
          {aiMessage ? (
            <p className="compose-form__ai-status" role="status">
              {aiMessage}
            </p>
          ) : null}
          {aiCritique ? (
            <div className="compose-form__ai-critique" aria-live="polite">
              <p className="compose-form__ai-critique-title">
                {copy.compose.aiCritiqueTitle}
              </p>
              <p className="compose-form__ai-critique-body">{aiCritique}</p>
            </div>
          ) : null}
        </aside>
      ) : null}
    </>
  );
}
