import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { setValue } from '../../store/profileStore';

/**
 * Markdown-style inline image editor: while edit mode is on, a small button
 * over the picture opens a file picker and the chosen image is downscaled
 * (max 1200px) into a JPEG data URL stored in the profile JSON.
 */
const MAX_SIDE = 1200;
const QUALITY = 0.85;

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('无法读取图片'));
    };
    img.src = url;
  });
}

async function toDataUrl(file) {
  const img = await loadImage(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));
  const ctx = canvas.getContext('2d');
  // JPEG has no alpha channel: flatten transparency onto white.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', QUALITY);
}

export default function EditableImage({ path, src, alt }) {
  const inputRef = useRef(null);

  const pick = (event) => {
    const input = event.currentTarget;
    const file = input.files && input.files[0];
    input.value = '';
    if (!file) return;
    toDataUrl(file)
      .then((dataUrl) => setValue(path, dataUrl))
      .catch(() => {});
  };

  return (
    <>
      {src ? <img src={src} alt={alt} /> : <span className="about-image-empty">还没有图片</span>}
      <button
        type="button"
        className="about-image-upload"
        onClick={() => inputRef.current && inputRef.current.click()}
      >
        {src ? '更换图片' : '上传图片'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="about-image-file"
        onChange={pick}
      />
    </>
  );
}

EditableImage.propTypes = {
  path: PropTypes.string.isRequired,
  src: PropTypes.string,
  alt: PropTypes.string,
};

EditableImage.defaultProps = {
  src: '',
  alt: '',
};
