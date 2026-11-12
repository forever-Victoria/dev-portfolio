import React, { useEffect, useRef, useState } from 'react';
import { setValue } from '../../store/profileStore';

/**
 * Markdown fields (about bio, skills intro, project descriptions) can't be
 * edited as rendered HTML without losing formatting, so in edit mode we swap
 * them for a plain textarea holding the raw Markdown.
 */
export default function EditableMarkdown({ path, value, label }) {
  const [draft, setDraft] = useState(value ?? '');
  const ref = useRef(null);
  const dirtyRef = useRef(false);

  useEffect(() => {
    if (!dirtyRef.current) setDraft(value ?? '');
  }, [value]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [draft]);

  const commit = () => {
    if (!dirtyRef.current) return;
    dirtyRef.current = false;
    setValue(path, draft.replace(/\n{3,}/g, '\n\n').trim());
  };

  return (
    <div className="edit-md-wrap">
      {label && <span className="edit-md-label">{label}</span>}
      <textarea
        ref={ref}
        className="edit-md"
        value={draft}
        spellCheck={false}
        onChange={(e) => {
          dirtyRef.current = true;
          setDraft(e.target.value);
        }}
        onBlur={commit}
      />
      <span className="edit-md-hint">支持 Markdown：**加粗**、- 列表</span>
    </div>
  );
}
