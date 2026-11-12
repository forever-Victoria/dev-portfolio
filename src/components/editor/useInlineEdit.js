import { useEffect } from 'react';
import { getValue, setValue } from '../../store/profileStore';

/* Separators accepted for array-ish fields (roles, tags, bullet points). */
const LIST_SEPARATOR = /\s*[/、,，]\s*/;

/* innerText respects rendered line breaks but is missing in some engines
   (jsdom); fall back to textContent there. */
function readText(el) {
  return typeof el.innerText === 'string' ? el.innerText : el.textContent;
}

function normalize(el) {
  const raw = readText(el).replace(/\u00a0/g, ' ').replace(/\r/g, '');

  if (el.dataset.list !== undefined) {
    return raw.split(LIST_SEPARATOR).map((s) => s.trim()).filter(Boolean);
  }
  if (el.dataset.editMultiline !== undefined) {
    return raw.replace(/\n{3,}/g, '\n\n').trim();
  }
  return raw.replace(/\s*\n\s*/g, ' ').trim();
}

function caretFromPoint(x, y) {
  if (document.caretRangeFromPoint) return document.caretRangeFromPoint(x, y);
  if (document.caretPositionFromPoint) {
    const pos = document.caretPositionFromPoint(x, y);
    if (!pos) return null;
    const range = document.createRange();
    range.setStart(pos.offsetNode, pos.offset);
    range.collapse(true);
    return range;
  }
  return null;
}

function beginEdit(el, event) {
  if (el.getAttribute('contenteditable') === 'true') return;

  const original = el.innerHTML;
  el.setAttribute('contenteditable', 'true');
  el.classList.add('is-editing-field');
  el.focus({ preventScroll: true });

  const range = caretFromPoint(event.clientX, event.clientY);
  if (range && el.contains(range.startContainer)) {
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  let cancelled = false;

  const finish = (commit) => {
    el.removeEventListener('blur', onBlur);
    el.removeEventListener('keydown', onKeyDown);
    el.removeAttribute('contenteditable');
    el.classList.remove('is-editing-field');

    if (!commit || cancelled) {
      // Put the rendered markup back; React's state was never touched.
      el.innerHTML = original;
      return;
    }

    const nextValue = normalize(el);
    const path = el.dataset.edit;
    const prevValue = getValue(path);
    if (JSON.stringify(nextValue) !== JSON.stringify(prevValue)) {
      setValue(path, nextValue);
    } else {
      // Nothing changed content-wise, but the DOM may hold stray markup.
      el.innerHTML = original;
    }
  };

  const onBlur = () => finish(true);
  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      cancelled = true;
      el.blur();
      return;
    }
    // Multiline fields keep Enter; single-line fields finish on Enter.
    if (e.key === 'Enter' && el.dataset.editMultiline === undefined) {
      e.preventDefault();
      e.stopPropagation();
      el.blur();
    }
  };

  el.addEventListener('blur', onBlur);
  el.addEventListener('keydown', onKeyDown);
}

/**
 * Global click-to-edit behaviour, active only while edit mode is on.
 * Any element carrying [data-edit="file.path"] becomes editable in place.
 */
export default function useInlineEdit(editing) {
  useEffect(() => {
    if (!editing) return undefined;

    const onClick = (event) => {
      const target = event.target.closest ? event.target : null;
      if (!target) return;

      const field = target.closest('[data-edit]');
      if (field) {
        // Already being edited: let the browser place the caret normally.
        if (field.getAttribute('contenteditable') === 'true') return;
        // Never let a click through to the underlying link / button in edit mode.
        event.preventDefault();
        event.stopPropagation();
        beginEdit(field, event);
        return;
      }

      // Swallow navigation so browsing the page doesn't jump away mid-edit.
      if (target.closest('a')) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [editing]);
}
