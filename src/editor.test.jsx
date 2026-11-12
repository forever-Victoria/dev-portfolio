import {
  describe, it, expect, vi, beforeAll,
} from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import { getValue } from './store/profileStore';

// react-dark-mode-toggle pulls in lottie-web, which needs a real <canvas>.
vi.mock('react-dark-mode-toggle', () => ({
  default: () => null,
}));

// jsdom has no IntersectionObserver; react-awesome-reveal's <Fade> needs one.
beforeAll(() => {
  window.IntersectionObserver = class {
    constructor(cb) { this.cb = cb; }

    observe() {}

    unobserve() {}

    disconnect() {}
  };
});

const fixtures = {
  'profile/navbar.json': {
    logo: { source: 'images/logo.png', height: 45, width: 50 },
    sections: [{ title: '首页', href: '/' }, { title: '关于我', href: '/about' }],
  },
  'profile/routes.json': { sections: [] },
  'profile/home.json': { name: '测试用户', roles: ['一名开发者'], status: '你好' },
  'profile/social.json': { social: [] },
  'profile/about.json': { about: '简介' },
  'profile/skills.json': { intro: '技能', skills: [] },
  'profile/education.json': { education: [] },
  'profile/experiences.json': { experiences: [] },
  'profile/projects.json': { projects: [] },
};

function stubFetch() {
  vi.stubGlobal('fetch', vi.fn(async (url) => {
    const key = String(url).split('?')[0].replace(/^\//, '');
    const body = fixtures[key];
    if (!body) throw new Error(`unexpected fetch: ${key}`);
    return {
      ok: true,
      status: 200,
      json: async () => JSON.parse(JSON.stringify(body)),
    };
  }));
}

describe('in-page editor', () => {
  it('loads content, enters edit mode and commits an inline edit', async () => {
    stubFetch();
    window.localStorage.clear();
    render(<App />);

    // Content from profile JSON is rendered (the name appears twice: hero + monogram).
    await waitFor(() => {
      expect(document.querySelector('[data-edit="home.name"]')).toBeTruthy();
    });
    expect(screen.getAllByText('测试用户').length).toBeGreaterThan(0);

    // Enter edit mode.
    fireEvent.click(screen.getByRole('button', { name: /编辑内容/ }));
    expect(await screen.findByRole('button', { name: '保存' })).toBeInTheDocument();

    // Click the name field: it becomes editable in place.
    const nameField = document.querySelector('[data-edit="home.name"]');
    expect(nameField).toBeTruthy();
    fireEvent.click(nameField);
    expect(nameField.getAttribute('contenteditable')).toBe('true');

    // Type a new value and blur to commit it into the store.
    nameField.textContent = '张三';
    fireEvent.blur(nameField);

    await waitFor(() => expect(getValue('home.name')).toBe('张三'));
    expect(await screen.findByText(/已修改 1 个文件/)).toBeInTheDocument();
  });
});
