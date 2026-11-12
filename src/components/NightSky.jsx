import React, { useEffect, useMemo, useRef } from 'react';
import './nightSky.css';

// Deterministic-ish helpers so the layer looks good on every load without
// needing to persist anything.
const rand = (min, max) => min + Math.random() * (max - min);

/* ------------------------------------------------------------------ */
/* Twinkling stars: a fixed DOM layer between the wallpaper and the    */
/* page content. Each star pulses opacity/scale with its own duration  */
/* and delay, so the sky sparkles asynchronously ("一闪一闪").          */
/* A few bigger stars get a cross-shaped flare for extra shine.        */
/* ------------------------------------------------------------------ */
function TwinklingStars() {
  const stars = useMemo(
    () => Array.from({ length: 70 }, (_, i) => ({
      id: i,
      top: rand(0, 92),
      left: rand(0, 100),
      size: rand(1.5, 4),
      duration: rand(1.8, 5),
      delay: rand(0, 5),
      // Warm gold echoes the lantern light in the wallpaper; white adds sparkle.
      color: Math.random() < 0.45 ? '#ffe9a8' : '#ffffff',
      flare: Math.random() < 0.12,
    })),
    [],
  );

  return (
    <div className="stars-layer" aria-hidden="true">
      {stars.map((s) => (
        <span
          key={s.id}
          className={s.flare ? 'star star--flare' : 'star'}
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            '--star-color': s.color,
            '--twinkle-duration': `${s.duration}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Snowfall: one fixed canvas above everything (pointer-events none).  */
/* Each flake drifts down with a sinusoidal sway; wind slowly wanders  */
/* so the snow feels alive instead of mechanically vertical.           */
/* ------------------------------------------------------------------ */
function Snowfall() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    // Environments without canvas support (e.g. jsdom) simply skip the snow.
    if (!ctx) return undefined;

    let raf = 0;
    let flakes = [];
    let wind = 0.15;
    let windTarget = 0.15;
    let running = true;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const count = () => {
      const area = window.innerWidth * window.innerHeight;
      return Math.min(160, Math.max(60, Math.round(area / 12000)));
    };

    const makeFlake = (fromTop = false) => ({
      x: rand(0, window.innerWidth),
      y: fromTop ? rand(-40, -5) : rand(-20, window.innerHeight),
      r: rand(1, 3.4),
      speedY: rand(0.5, 1.7) * (0.7 + rand(0, 0.6)),
      swayAmp: rand(0.4, 1.6),
      swayFreq: rand(0.008, 0.02),
      phase: rand(0, Math.PI * 2),
      opacity: rand(0.35, 0.9),
    });

    const seed = () => {
      flakes = Array.from({ length: count() }, () => makeFlake());
    };

    let last = performance.now();

    const tick = (now) => {
      if (!running) return;
      const dt = Math.min((now - last) / 16.7, 3); // ~frames, clamped
      last = now;

      // Wind slowly wanders between -0.5 and 0.5 px/frame.
      if (Math.random() < 0.005) windTarget = rand(-0.5, 0.5);
      wind += (windTarget - wind) * 0.01;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.fillStyle = 'rgba(255, 255, 255, 1)';

      flakes.forEach((f) => {
        f.phase += f.swayFreq * dt;
        f.y += f.speedY * dt;
        f.x += (wind + Math.sin(f.phase) * f.swayAmp) * dt;

        if (f.y - f.r > window.innerHeight) {
          Object.assign(f, makeFlake(true));
        }
        if (f.x < -20) f.x = window.innerWidth + 10;
        if (f.x > window.innerWidth + 20) f.x = -10;

        ctx.globalAlpha = f.opacity;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };

    resize();
    seed();
    raf = requestAnimationFrame(tick);

    const onResize = () => {
      resize();
      seed();
    };
    window.addEventListener('resize', onResize);

    // Pause when the tab is hidden to save battery/CPU.
    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className="snowfall-canvas" aria-hidden="true" />;
}

export default function NightSky() {
  return (
    <>
      <TwinklingStars />
      <Snowfall />
    </>
  );
}
