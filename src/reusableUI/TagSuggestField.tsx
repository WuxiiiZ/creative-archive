/**
 * TagSuggestField — multi-tag input with suggestion chips.
 *
 * Type a value and press Enter (or comma) to add it; click a suggestion to add;
 * click × on a selected chip to remove. Suggestions filter as you type.
 */
import { useState, type KeyboardEvent } from "react";

interface TagSuggestFieldProps {
  id: string;
  label: string;
  values: string[];
  options: string[];
  placeholder?: string;
  hint?: string;
  noMatch?: string;
  suggestionsLabel?: string;
  addLabel?: string;
  variant?: "tag" | "subtag";
  onChange: (values: string[]) => void;
}

function normalizeTag(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function hasTag(list: string[], candidate: string) {
  const needle = candidate.toLowerCase();
  return list.some((item) => item.toLowerCase() === needle);
}

export function TagSuggestField({
  id,
  label,
  values,
  options,
  placeholder,
  hint,
  noMatch,
  suggestionsLabel,
  addLabel,
  variant = "tag",
  onChange,
}: TagSuggestFieldProps) {
  const [draft, setDraft] = useState("");
  const trimmed = draft.trim().toLowerCase();

  const suggestions = options.filter((option) => {
    if (hasTag(values, option)) return false;
    if (!trimmed) return true;
    return option.toLowerCase().includes(trimmed);
  });

  const listId = `${id}-suggestions`;
  const canCreate =
    Boolean(trimmed) &&
    !hasTag(values, draft) &&
    !options.some((option) => option.toLowerCase() === trimmed);

  function addTag(raw: string) {
    const next = normalizeTag(raw);
    if (!next || hasTag(values, next)) {
      setDraft("");
      return;
    }
    onChange([...values, next]);
    setDraft("");
  }

  function removeTag(tag: string) {
    onChange(values.filter((item) => item !== tag));
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(draft);
      return;
    }
    if (event.key === "Backspace" && !draft && values.length > 0) {
      event.preventDefault();
      onChange(values.slice(0, -1));
    }
  }

  return (
    <div className="compose-form__field tag-suggest">
      <label htmlFor={id}>{label}</label>

      {values.length > 0 ? (
        <ul className="tag-suggest__selected" aria-label={label}>
          {values.map((tag) => (
            <li key={tag}>
              <span
                className={[
                  "tag-suggest__chip",
                  "tag-suggest__chip--selected",
                  `tag-suggest__chip--${variant}`,
                ].join(" ")}
              >
                {tag}
                <button
                  type="button"
                  className="tag-suggest__remove"
                  aria-label={`${addLabel ?? "Remove"} ${tag}`}
                  onClick={() => removeTag(tag)}
                >
                  ×
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <input
        type="text"
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => {
          if (draft.trim()) addTag(draft);
        }}
        placeholder={placeholder}
        autoComplete="off"
        aria-autocomplete="list"
        aria-controls={
          suggestions.length > 0 || canCreate ? listId : undefined
        }
      />

      {options.length === 0 && values.length === 0 ? (
        <p className="tag-suggest__empty">
          {hint ?? "Type a new one — it will show up here next time."}
        </p>
      ) : (
        <div
          className="tag-suggest__chips"
          id={listId}
          role="listbox"
          aria-label={suggestionsLabel ?? `${label} suggestions`}
        >
          {canCreate ? (
            <button
              type="button"
              className={[
                "tag-suggest__chip",
                `tag-suggest__chip--${variant}`,
                "tag-suggest__chip--create",
              ].join(" ")}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => addTag(draft)}
            >
              + {normalizeTag(draft)}
            </button>
          ) : null}

          {suggestions.length === 0 && !canCreate ? (
            <p className="tag-suggest__empty">
              {noMatch ?? hint ?? "No matches — keep typing to add it."}
            </p>
          ) : (
            suggestions.map((option) => (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={false}
                className={[
                  "tag-suggest__chip",
                  `tag-suggest__chip--${variant}`,
                ].join(" ")}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => addTag(option)}
              >
                {option}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
