import {
  describe, it, expect, vi, afterEach, beforeEach,
} from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
import MusicPlayer from './components/MusicPlayer';

const PAUSED_KEY = 'portfolio:bgm-paused';

const pausedDescriptor = Object.getOwnPropertyDescriptor(
  window.HTMLMediaElement.prototype,
  'paused',
);

// jsdom has no media engine: fake play/pause so they flip `paused` and fire the
// matching media events, just like a real browser.
const stubPlayback = () => {
  let paused = true;
  Object.defineProperty(window.HTMLMediaElement.prototype, 'paused', {
    configurable: true,
    get: () => paused,
  });
  return {
    play: vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(function playMock() {
      paused = false;
      this.dispatchEvent(new Event('play'));
      return Promise.resolve();
    }),
    pause: vi.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(function pauseMock() {
      paused = true;
      this.dispatchEvent(new Event('pause'));
    }),
  };
};

describe('MusicPlayer', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    if (pausedDescriptor) {
      Object.defineProperty(window.HTMLMediaElement.prototype, 'paused', pausedDescriptor);
    }
    window.localStorage.clear();
  });

  it('stays paused when the visitor paused it previously', () => {
    window.localStorage.setItem(PAUSED_KEY, '1');
    const { play } = stubPlayback();

    const { getByRole } = render(<MusicPlayer />);
    const button = getByRole('button');

    expect(play).not.toHaveBeenCalled();
    expect(button).toHaveAttribute('aria-label', '播放背景音乐');
    expect(button).not.toHaveClass('is-playing');
    expect(button.querySelector('.bgm-toggle__slash')).toBeInTheDocument();
  });

  it('autoplays, then toggles pause/play on click', () => {
    const { play, pause } = stubPlayback();

    const { getByRole } = render(<MusicPlayer />);
    const button = getByRole('button');

    expect(play).toHaveBeenCalled();
    expect(button).toHaveClass('is-playing');
    expect(button).toHaveAttribute('aria-label', '暂停背景音乐');

    fireEvent.click(button);
    expect(pause).toHaveBeenCalled();
    expect(button).not.toHaveClass('is-playing');
    expect(button).toHaveAttribute('aria-label', '播放背景音乐');
    expect(window.localStorage.getItem(PAUSED_KEY)).toBe('1');

    fireEvent.click(button);
    expect(play).toHaveBeenCalledTimes(2);
    expect(button).toHaveClass('is-playing');
    expect(window.localStorage.getItem(PAUSED_KEY)).toBe('0');
  });
});
