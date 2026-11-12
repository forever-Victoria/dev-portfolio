import React from 'react';
import { Fade } from 'react-awesome-reveal';
import PropTypes from 'prop-types';
import useProfile from '../hooks/useProfile';
import Header from './Header';
import FallbackSpinner from './FallbackSpinner';
import '../css/timeline.css';

function Education(props) {
  const { header } = props;
  const { data } = useProfile();
  const education = data.education;

  return (
    <>
      <Header title={header} />
      {education ? (
        <div className="section-content-container">
          <Fade triggerOnce>
            <div className="tl tl--education">
              {education.education?.map((item, index) => (
                <div className="tl-item" key={`edu-${index}`}>
                  <div className="tl-node--icon">
                    {item.icon && (
                      <img src={item.icon.src} alt={item.icon.alt} />
                    )}
                  </div>
                  <div className="tl-card">
                    <div className="tl-date" data-edit={`education.education.${index}.title`}>
                      {item.title}
                    </div>
                    <h3 className="tl-title" data-edit={`education.education.${index}.cardTitle`}>
                      {item.cardTitle}
                    </h3>
                    <div className="tl-subtitle">
                      <span className="accent" data-edit={`education.education.${index}.cardSubtitle`}>
                        {item.cardSubtitle}
                      </span>
                    </div>
                    {item.cardDetailedText && (
                      <div className="tl-detail" data-edit={`education.education.${index}.cardDetailedText`}>
                        {item.cardDetailedText}
                      </div>
                    )}
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

Education.propTypes = {
  header: PropTypes.string.isRequired,
};

export default Education;
