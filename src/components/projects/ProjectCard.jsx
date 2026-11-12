import React from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import useProfile from '../../hooks/useProfile';
import EditableMarkdown from '../editor/EditableMarkdown';

const ProjectCard = ({ project, featured = false, pathBase }) => {
  const { editing } = useProfile();

  return (
    <article
      className={`tile tile--interactive project-card ${
        featured ? 'span-4 project-card--featured' : 'span-2'
      }`}
    >
      {project?.image && (
        <div className="project-card__media">
          <img src={project.image} alt={project.title} />
        </div>
      )}

      <div className="project-card__body">
        <h3 className="project-card__title" data-edit={`${pathBase}.title`}>
          {project.title}
        </h3>
        <div className="project-card__text">
          {editing ? (
            <EditableMarkdown
              path={`${pathBase}.bodyText`}
              value={project.bodyText}
              label="项目描述（Markdown）"
            />
          ) : (
            <ReactMarkdown>{project.bodyText}</ReactMarkdown>
          )}
        </div>
      </div>

      <div className="project-card__footer">
        {project?.links?.length > 0 && (
          <div className="project-card__links">
            {project.links.map((link, index) => (
              <a
                key={`link-${index}`}
                className="proj-link"
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span data-edit={`${pathBase}.links.${index}.text`}>{link.text}</span>
                {' '}
                ↗
              </a>
            ))}
          </div>
        )}
        {project?.tags?.length > 0 && (
          <div className="project-card__tags">
            {project.tags.map((tag, index) => (
              <span key={`tag-${index}`} className="project-tag">
                <span data-edit={`${pathBase}.tags.${index}`}>{tag}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
};

ProjectCard.propTypes = {
  featured: PropTypes.bool,
  pathBase: PropTypes.string.isRequired,
  project: PropTypes.shape({
    title: PropTypes.string.isRequired,
    bodyText: PropTypes.string.isRequired,
    image: PropTypes.string,
    links: PropTypes.arrayOf(PropTypes.shape({
      text: PropTypes.string.isRequired,
      href: PropTypes.string.isRequired,
    })),
    tags: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};

export default ProjectCard;
