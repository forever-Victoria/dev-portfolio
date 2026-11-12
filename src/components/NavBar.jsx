import { Navbar, Nav, Container } from 'react-bootstrap';
import React, { useState, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import styled, { ThemeContext } from 'styled-components';
import useProfile from '../hooks/useProfile';
import ThemeToggler from './ThemeToggler';

const styles = {
  logoStyle: {
    width: 50,
    height: 40,
  },
};

const ExternalNavLink = styled.a`
  color: ${(props) => props.theme.navbarTheme.linkColor};
  &:hover {
    color: ${(props) => props.theme.navbarTheme.linkHoverColor};
  }
  &::after {
    background-color: ${(props) => props.theme.accentColor};
  }
`;

const InternalNavLink = styled(NavLink)`
  color: ${(props) => props.theme.navbarTheme.linkColor};
  &:hover {
    color: ${(props) => props.theme.navbarTheme.linkHoverColor};
  }
  &::after {
    background-color: ${(props) => props.theme.accentColor};
  }
  &.active {
    color: ${(props) => props.theme.navbarTheme.linkActiveColor};
  }
`;

const NavBar = () => {
  const theme = useContext(ThemeContext);
  const { data } = useProfile();
  const navData = data.navbar;
  const [expanded, setExpanded] = useState(false);

  return (
    <Navbar
      fixed="top"
      expand="md"
      variant={theme.bsPrimaryVariant}
      className="navbar-custom"
      expanded={expanded}
    >
      <Container>
        {navData?.logo && (
          <Navbar.Brand href={import.meta.env.BASE_URL}>
            <img
              src={navData?.logo?.source}
              className="d-inline-block align-top"
              alt="main logo"
              style={
                navData?.logo?.height && navData?.logo?.width
                  ? { height: navData?.logo?.height, width: navData?.logo?.width }
                  : styles.logoStyle
              }
            />
          </Navbar.Brand>
        )}
        <Navbar.Toggle
          aria-controls="responsive-navbar-nav"
          onClick={() => setExpanded(!expanded)}
        />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto" />
          <Nav>
            {navData?.sections?.map((section, index) => (
              section?.type === 'link' ? (
                <ExternalNavLink
                  key={`ext-${index}`}
                  href={section.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setExpanded(false)}
                  className="navbar__link"
                  theme={theme}
                >
                  <span data-edit={`navbar.sections.${index}.title`}>{section.title}</span>
                </ExternalNavLink>
              ) : (
                <InternalNavLink
                  key={`int-${index}`}
                  onClick={() => setExpanded(false)}
                  end={index === 0}
                  className="navbar__link"
                  to={section.href}
                  theme={theme}
                >
                  <span data-edit={`navbar.sections.${index}.title`}>{section.title}</span>
                </InternalNavLink>
              )
            ))}
          </Nav>
          <ThemeToggler
            onClick={() => setExpanded(false)}
          />
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
