import React, { useState } from 'react';
import { Fade } from 'react-awesome-reveal';
import PropTypes from 'prop-types';
import Header from './Header';
import useProfile from '../hooks/useProfile';
import ProjectCard from './projects/ProjectCard';
import FallbackSpinner from './FallbackSpinner';
import '../css/projects.css';

const Projects = (props) => {
  const { header } = props;
  const { data, editing } = useProfile();
  const projects = data.projects;
  const [showMore, setShowMore] = useState(false);

  // In edit mode every project is shown, otherwise editing is impossible.
  const numberOfItems = editing || showMore
    ? projects?.projects?.length ?? 0
    : 6;

  return (
    <>
      <Header title={header} />
      {projects ? (
        <div className="section-content-container">
          <Fade triggerOnce>
            <div className="bento">
              {projects.projects?.slice(0, numberOfItems).map((project, index) => (
                <ProjectCard
                  key={`project-${index}`}
                  project={project}
                  pathBase={`projects.projects.${index}`}
                  featured={index === 0}
                />
              ))}
            </div>
          </Fade>

          {!editing && !showMore && projects.projects?.length > numberOfItems && (
            <div className="projects-more">
              <button
                type="button"
                className="btn-pill btn-ghost"
                onClick={() => setShowMore(true)}
              >
                加载更多
              </button>
            </div>
          )}
        </div>
      ) : <FallbackSpinner /> }
    </>
  );
};

Projects.propTypes = {
  header: PropTypes.string.isRequired,
};

export default Projects;
