import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

// Files the in-page editor is allowed to write back to.
const PROFILE_FILES = new Set([
  'navbar',
  'routes',
  'home',
  'social',
  'about',
  'skills',
  'education',
  'experiences',
  'projects',
]);

/**
 * Dev-only endpoint used by the in-page editor's 保存 button.
 * POST /__save-profile  { file: 'home', data: {...} }
 * writes public/profile/<file>.json so edits live in the repo, not just the
 * browser. It is intentionally absent from production builds.
 */
function profileSavePlugin() {
  return {
    name: 'portfolio-profile-save',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__save-profile', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method Not Allowed');
          return;
        }

        let body = '';
        req.on('data', (chunk) => { body += chunk; });
        req.on('end', () => {
          try {
            const { file, data } = JSON.parse(body);
            if (!PROFILE_FILES.has(file)) throw new Error(`不允许写入 ${file}`);

            const target = path.resolve(
              server.config.root,
              'public',
              'profile',
              `${file}.json`,
            );
            fs.writeFileSync(target, `${JSON.stringify(data, null, 4)}\n`, 'utf8');

            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ ok: true, file }));
          } catch (err) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ ok: false, error: String(err.message || err) }));
          }
        });
      });
    },
  };
}

// GitHub Pages project sites live under /<repo>/ — every built asset URL has
// to be prefixed, otherwise the page loads but all JS/CSS 404s (blank screen).
// Override with VITE_BASE=/ for a user/org page (username.github.io).
const BUILD_BASE = process.env.VITE_BASE || '/dev-portfolio/';

/**
 * SPA deep links (e.g. /dev-portfolio/about) 404 on GitHub Pages; serving the
 * app's index.html as 404.html lets the client-side router take over.
 */
function spaFallbackPlugin(outDir) {
  return {
    name: 'portfolio-spa-fallback',
    apply: 'build',
    closeBundle() {
      const dir = path.resolve(outDir);
      fs.copyFileSync(path.join(dir, 'index.html'), path.join(dir, '404.html'));
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? BUILD_BASE : '/',
  plugins: [react(), profileSavePlugin(), spaFallbackPlugin('build')],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'build',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    css: true,
  },
}));
