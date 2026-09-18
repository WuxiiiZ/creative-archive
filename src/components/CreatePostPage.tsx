import type { Section } from "../types/postSection";
import type { Post } from "../types/post";
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
  const { copy } = useLocale();
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

  const title = isEditing ? copy.compose.editTitle : copy.compose.createTitle;
  const eyebrow = isEditing
    ? copy.compose.editEyebrow
    : copy.compose.createEyebrow;
  const hint = isEditing ? copy.compose.editHint : copy.compose.createHint;
  const buttonLabel =
    submitLabel ?? (isEditing ? copy.compose.update : copy.compose.save);

  return (
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
              disabled={isSubmitting || isUploading}
            >
              {isSubmitting ? copy.compose.saving : buttonLabel}
            </button>
          </div>
        </form>
      </PaperPanelBody>
    </PaperPanel>
  );
}
