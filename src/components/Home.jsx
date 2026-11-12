import React from 'react';
import Typewriter from 'typewriter-effect';
import { Fade } from 'react-awesome-reveal';
import { Link } from 'react-router-dom';
import useProfile from '../hooks/useProfile';
import Social from './Social';
import FallbackSpinner from './FallbackSpinner';
import '../css/home.css';

function initialsOf(name) {
  if (!name) return '';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length > 1) {
    return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  }
  // Chinese names read better as the leading one or two characters.
  return name.trim().slice(0, 2);
}

function Home() {
  const { data, editing } = useProfile();
  const { home } = data;

  return home ? (
    <Fade triggerOnce className="home-fade-container">
      <section className="hero">
        <div className="bento">
          <div className="tile hero-intro span-4 rspan-2">
            {home.status && (
              <span className="hero-eyebrow" data-edit="home.status">{home.status}</span>
            )}
            <h1 className="hero-name" data-edit="home.name">{home.name}</h1>
            <div className="hero-roles">
              <span>我是&nbsp;</span>
              {editing ? (
                <span className="Typewriter__wrapper" data-edit="home.roles" data-list>
                  {(home.roles || []).join(' / ')}
                </span>
              ) : (
                <Typewriter
                  options={{
                    loop: true,
                    autoStart: true,
                    strings: home.roles,
                  }}
                />
              )}
            </div>
            {home.tagline && <p className="hero-tagline" data-edit="home.tagline">{home.tagline}</p>}
            <div className="hero-cta">
              <Link className="btn-pill btn-accent" to="/projects">
                看看我的作品
              </Link>
              <Link className="btn-pill btn-ghost" to="/about">
                关于我
              </Link>
            </div>
          </div>

          <div className="tile tile--accent monogram span-2">
            <span className="monogram-mark" data-edit="home.monogram">
              {home.monogram || initialsOf(home.name)}
            </span>
            <span className="monogram-label" data-edit="home.name">{home.name}</span>
          </div>

          <div className="tile hero-social span-2">
            <span className="tile-label">找到我</span>
            <Social />
          </div>
        </div>
      </section>
    </Fade>
  ) : <FallbackSpinner />;
}

export default Home;
