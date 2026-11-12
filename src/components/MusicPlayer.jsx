import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import bgmUrl from '../../media/Tico - 冷冬叙事.mp3';
import './musicPlayer.css';

// A quiet, looping background track with a frosted-glass note button:
// the note spins while the music plays and a slash appears when it is paused.
// The music is on by default: every load tries to start it immediately, and
// browsers that block autoplay get unlocked by the first pointer/key gesture
// anywhere on the page. Pausing is only a per-visit choice, not remembered.
const VOLUME = 0.35;

function MusicPlayer() {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  const playAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = VOLUME;
    const attempt = audio.play();
    // Browsers reject play() when autoplay is not allowed yet; that is
    // expected and the first gesture listener below handles it.
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(() => {});
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;
    audio.volume = VOLUME;

    playAudio();

    // If the browser blocked autoplay, a single gesture unlocks it. Gestures
    // on the button itself are left to the click handler so the first click
    // on the note never starts the music and pauses it again by accident.
    const unlock = (event) => {
      const target = event.target instanceof Element ? event.target.closest('.bgm-toggle') : null;
      if (target) return;
      if (audio.paused) playAudio();
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });

    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      // Stop playback when the player unmounts (route changes, HMR) so an
      // orphaned audio element can never keep playing in the background.
      audio.pause();
    };
  }, [playAudio]);

  // The audio element itself is the source of truth: a click can arrive in the
  // same tick as a pending play() promise, so `playing` may lag behind.
  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      playAudio();
    } else {
      audio.pause();
    }
  };

  const label = playing ? '暂停背景音乐' : '播放背景音乐';

  return (
    <>
      {/* The mute/caption track is irrelevant here (instrumental BGM). */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio
        ref={audioRef}
        className="bgm-audio"
        src={bgmUrl}
        loop
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => setFailed(true)}
      />

      <button
        type="button"
        className={`bgm-toggle${playing ? ' is-playing' : ''}`}
        onClick={toggle}
        aria-pressed={playing}
        aria-label={label}
        title={failed ? '背景音乐加载失败' : label}
        disabled={failed}
      >
        <svg
          className="bgm-toggle__note"
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <ellipse
            cx="7.1"
            cy="17.4"
            rx="3.7"
            ry="2.7"
            fill="currentColor"
            transform="rotate(-20 7.1 17.4)"
          />
          <path
            d="M10.8 17.2V5c3.6.3 6.6 1.8 8 4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <svg
          className="bgm-toggle__slash"
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <line className="bgm-toggle__slash-base" x1="19.5" y1="4.5" x2="4.5" y2="19.5" />
          <line className="bgm-toggle__slash-line" x1="19.5" y1="4.5" x2="4.5" y2="19.5" />
        </svg>
      </button>
    </>
  );
}

export default MusicPlayer;
