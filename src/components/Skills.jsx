import React from 'react';
import ReactMarkdown from 'react-markdown';
import PropTypes from 'prop-types';
import { Fade } from 'react-awesome-reveal';
import Header from './Header';
import useProfile from '../hooks/useProfile';
import FallbackSpinner from './FallbackSpinner';
import EditableMarkdown from './editor/EditableMarkdown';
import '../css/skills.css';

function Skills(props) {
  const { header } = props;
  const { data, editing } = useProfile();
  const skills = data.skills;

  return (
    <>
      <Header title={header} />
      {skills ? (
        <div className="section-content-container">
          <Fade triggerOnce>
            <div className="bento">
              {skills.intro && (
                <div className="tile skills-intro-tile span-6">
                  {editing ? (
                    <EditableMarkdown
                      path="skills.intro"
                      value={skills.intro}
                      label="技能简介（Markdown）"
                    />
                  ) : (
                    <ReactMarkdown>{skills.intro}</ReactMarkdown>
                  )}
                </div>
              )}
              {skills.skills?.map((category, categoryIndex) => (
                <div
                  key={`category-${categoryIndex}`}
                  className="tile tile--interactive skill-category-tile span-2"
                >
                  <h3 className="skill-category-title">
                    <span data-edit={`skills.skills.${categoryIndex}.title`}>
                      {category.title}
                    </span>
                  </h3>
                  <div className="skill-grid">
                    {category.items.map((item, itemIndex) => (
                      <div key={`item-${itemIndex}`} className="skill-item">
                        <img src={item.icon} alt={item.title} />
                        <span data-edit={`skills.skills.${categoryIndex}.items.${itemIndex}.title`}>
                          {item.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Fade>
        </div>
      ) : <FallbackSpinner /> }
    </>
  );
}

Skills.propTypes = {
  header: PropTypes.string.isRequired,
};

export default Skills;
