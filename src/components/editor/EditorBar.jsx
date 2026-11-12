import React, { useEffect } from 'react';
import useProfile from '../../hooks/useProfile';
import {
  reloadFromDisk,
  saveToDisk,
  setEditing,
} from '../../store/profileStore';
import useInlineEdit from './useInlineEdit';
import './editor.css';

export default function EditorBar() {
  const { editing, dirty, hasDraft, notice, loading, error } = useProfile();
  useInlineEdit(editing);

  // Outline every editable node only while the mode is on.
  useEffect(() => {
    document.body.classList.toggle('is-editing', Boolean(editing));
    return () => document.body.classList.remove('is-editing');
  }, [editing]);

  useEffect(() => {
    if (!editing) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setEditing(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editing]);

  if (loading || error) return null;

  if (!editing) {
    return (
      <button
        type="button"
        className="editor-fab"
        onClick={() => setEditing(true)}
        title="开启后可以直接点击页面上的文字修改"
      >
        <span aria-hidden="true">✎</span>
        编辑内容
      </button>
    );
  }

  return (
    <div className="editor-bar" role="toolbar" aria-label="内容编辑工具栏">
      <div className="editor-bar__status">
        <span className="editor-bar__dot" data-dirty={dirty.length > 0} />
        {dirty.length > 0 ? `已修改 ${dirty.length} 个文件` : '编辑模式：点击文字即可修改'}
      </div>

      {notice && (
        <span className={`editor-bar__notice editor-bar__notice--${notice.type}`}>
          {notice.text}
        </span>
      )}

      {hasDraft && dirty.length === 0 && (
        <span className="editor-bar__notice editor-bar__notice--info">
          有未保存的本地草稿
        </span>
      )}

      <div className="editor-bar__actions">
        <button
          type="button"
          className="editor-btn editor-btn--primary"
          onClick={saveToDisk}
          disabled={dirty.length === 0}
        >
          保存
        </button>
        <button
          type="button"
          className="editor-btn"
          onClick={reloadFromDisk}
          title="丢弃所有本地修改，重新从 JSON 文件读取"
        >
          重置
        </button>
        <button
          type="button"
          className="editor-btn"
          onClick={() => setEditing(false)}
        >
          完成
        </button>
      </div>
    </div>
  );
}
