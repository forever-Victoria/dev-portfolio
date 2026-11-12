import endpoints from '../constants/endpoints';

/**
 * Single source of truth for every piece of profile content.
 *
 * All pages read from this store instead of fetching their own JSON, which is
 * what makes in-page editing possible: a value changed once is instantly
 * visible everywhere, and the whole tree can be persisted back to disk.
 *
 * Drafts are mirrored into localStorage so a refresh (or an accidental tab
 * close) never loses in-progress edits. "保存" pushes the dirty files back to
 * public/profile/*.json through a tiny dev-only endpoint (see vite.config.js).
 */

export const PROFILE_KEYS = Object.keys(endpoints);

const DRAFT_KEY = 'portfolio.profile.draft.v1';

let state = {
  data: {},
  loading: true,
  error: null,
  editing: false,
  dirty: [], // profile keys with unsaved changes
  hasDraft: false,
  notice: null,
};

const listeners = new Set();

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot() {
  return state;
}

function setState(patch) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

/* ------------------------------------------------------------------ */
/* Loading                                                            */
/* ------------------------------------------------------------------ */

let loadStarted = false;

export function ensureLoaded() {
  if (loadStarted) return;
  loadStarted = true;

  Promise.all(
    PROFILE_KEYS.map(async (key) => {
      const res = await fetch(endpoints[key], { cache: 'no-store' });
      if (!res.ok) throw new Error(`${key}.json 加载失败（${res.status}）`);
      return [key, await res.json()];
    }),
  )
    .then((entries) => {
      const base = Object.fromEntries(entries);
      const draft = readDraft();
      setState({
        data: draft?.data ? { ...base, ...draft.data } : base,
        loading: false,
        dirty: draft?.dirty ?? [],
        hasDraft: Boolean(draft?.data),
      });
    })
    .catch((err) => setState({ loading: false, error: String(err.message || err) }));
}

/** Re-fetch from disk, discarding any local draft. */
export async function reloadFromDisk() {
  clearDraft();
  const entries = await Promise.all(
    PROFILE_KEYS.map(async (key) => {
      const res = await fetch(`${endpoints[key]}?t=${Date.now()}`, { cache: 'no-store' });
      return [key, await res.json()];
    }),
  );
  setState({
    data: Object.fromEntries(entries),
    dirty: [],
    hasDraft: false,
    notice: { type: 'ok', text: '已恢复为文件里的内容' },
  });
}

/* ------------------------------------------------------------------ */
/* Draft persistence                                                  */
/* ------------------------------------------------------------------ */

function readDraft() {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.data ? parsed : null;
  } catch {
    return null;
  }
}

let draftTimer = 0;

function writeDraft() {
  window.clearTimeout(draftTimer);
  draftTimer = window.setTimeout(() => {
    try {
      window.localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ data: state.data, dirty: state.dirty, savedAt: Date.now() }),
      );
    } catch {
      /* quota exceeded / private mode — edits still live in memory */
    }
  }, 250);
}

function clearDraft() {
  window.clearTimeout(draftTimer);
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

/* ------------------------------------------------------------------ */
/* Path helpers: "home.roles.0", "projects.projects.2.links.0.text"   */
/* ------------------------------------------------------------------ */

export function toPath(path) {
  return Array.isArray(path) ? path : String(path).split('.');
}

export function getValue(path) {
  return toPath(path).reduce(
    (node, part) => (node == null ? undefined : node[part]),
    state.data,
  );
}

function setIn(node, parts, value) {
  if (parts.length === 0) return value;
  const [head, ...rest] = parts;
  if (Array.isArray(node)) {
    const next = node.slice();
    const index = Number(head);
    next[index] = setIn(node[index], rest, value);
    return next;
  }
  return { ...(node || {}), [head]: setIn(node?.[head], rest, value) };
}

export function setValue(path, value) {
  const parts = toPath(path);
  const [fileKey, ...rest] = parts;
  if (!PROFILE_KEYS.includes(fileKey)) return;
  if (getValue(path) === value) return;

  setState({
    data: { ...state.data, [fileKey]: setIn(state.data[fileKey], rest, value) },
    dirty: state.dirty.includes(fileKey) ? state.dirty : [...state.dirty, fileKey],
  });
  writeDraft();
}

/* ------------------------------------------------------------------ */
/* Mode + saving                                                      */
/* ------------------------------------------------------------------ */

export function setEditing(editing) {
  setState({ editing, notice: null });
}

export function setNotice(notice) {
  setState({ notice });
}

export async function saveToDisk() {
  if (state.dirty.length === 0) {
    setState({ notice: { type: 'info', text: '没有需要保存的修改' } });
    return;
  }

  const results = await Promise.all(
    state.dirty.map(async (key) => {
      try {
        const res = await fetch('/__save-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: key, data: state.data[key] }),
        });
        return res.ok;
      } catch {
        return false;
      }
    }),
  );

  if (results.every(Boolean)) {
    clearDraft();
    setState({
      dirty: [],
      hasDraft: false,
      notice: { type: 'ok', text: '已保存到 public/profile/*.json' },
    });
  } else {
    setState({
      notice: {
        type: 'error',
        text: '保存失败：只有在 npm run dev 开发模式下才能写回文件',
      },
    });
  }
}
