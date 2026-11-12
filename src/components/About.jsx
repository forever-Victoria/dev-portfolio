import React from 'react';
import ReactMarkdown from 'react-markdown';
import PropTypes from 'prop-types';
import { Fade } from 'react-awesome-reveal';
import Header from './Header';
import useProfile from '../hooks/useProfile';
import FallbackSpinner from './FallbackSpinner';
import EditableMarkdown from './editor/EditableMarkdown';
import EditableImage from './editor/EditableImage';
import '../css/about.css';

function About(props) {
  const { header } = props;
  const { data, editing } = useProfile();
  const { about } = data;

  return (
    <>
      <Header title={header} />
      <div className="section-content-container">
        {about ? (
          <Fade triggerOnce>
            <div className="bento">
              <div className="tile about-bio-tile span-4 rspan-2">
                {editing ? (
                  <EditableMarkdown
                    path="about.about"
                    value={about.about}
                    label="个人简介（Markdown）"
                  />
                ) : (
                  <ReactMarkdown>{about.about}</ReactMarkdown>
                )}
              </div>
              {(editing || about?.imageSource) && (
                <div className="tile about-image-tile span-2 rspan-2">
                  <EditableImage path="about.imageSource" src={about?.imageSource} alt="profile" />
                </div>
              )}
            </div>
          </Fade>
        ) : <FallbackSpinner />}
      </div>
    </>
  );
}

About.propTypes = {
  header: PropTypes.string.isRequired,
};

export default About;
