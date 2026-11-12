import React from 'react';
import ReactMarkdown from 'react-markdown';
import PropTypes from 'prop-types';
import { Fade } from 'react-awesome-reveal';
import Header from './Header';
import useProfile from '../hooks/useProfile';
import FallbackSpinner from './FallbackSpinner';
import '../css/timeline.css';

function Experience(props) {
  const { header } = props;
  const { data } = useProfile();
  const experiences = data.experiences;

  return (
    <>
      <Header title={header} />
      {experiences ? (
        <div className="section-content-container">
          <Fade triggerOnce>
            <div className="tl tl--experience">
              {experiences.experiences?.map((item, index) => (
                <div className="tl-item" key={`exp-${index}`}>
                  <div className="tl-node--dot" />
                  <div className="tl-card">
                    <div className="tl-date" data-edit={`experiences.experiences.${index}.dateText`}>
                      {item.dateText}
                    </div>
                    <h3 className="tl-title" data-edit={`experiences.experiences.${index}.title`}>
                      {item.title}
                    </h3>
                    <div className="tl-subtitle">
                      <span className="accent" data-edit={`experiences.experiences.${index}.subtitle`}>
                        {item.subtitle}
                      </span>
                      {item.workType ? (
                        <span>
                          {' · '}
                          <span data-edit={`experiences.experiences.${index}.workType`}>
                            {item.workType}
                          </span>
                        </span>
                      ) : ''}
                    </div>
                    <ul className="tl-list">
                      {item.workDescription.map((point, pointIndex) => (
                        <li key={`point-${pointIndex}`}>
                          <span data-edit={`experiences.experiences.${index}.workDescription.${pointIndex}`}>
                            <ReactMarkdown components={{ p: 'span' }}>{point}</ReactMarkdown>
                          </span>
                        </li>
                      ))}
                    </ul>
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

Experience.propTypes = {
  header: PropTypes.string.isRequired,
};

export default Experience;
