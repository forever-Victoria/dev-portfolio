import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import FallbackSpinner from './components/FallbackSpinner';
import NavBar from './components/NavBar';
import Home from './components/Home';
import useProfile from './hooks/useProfile';

function MainApp() {
  const { data } = useProfile();
  const routes = data.routes;

  return (
    <div className="MainApp">
      <NavBar />
      <main className="main">
        <Suspense fallback={<FallbackSpinner />}>
          <Routes>
            <Route exact path="/" element={<Home />} />
            {routes
              && routes.sections.map((route) => {
                const SectionComponent = React.lazy(() => import(`./components/${route.component}.jsx`));
                return (
                  <Route
                    key={route.headerTitle}
                    path={route.path}
                    element={<SectionComponent header={route.headerTitle} />}
                  />
                );
              })}
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default MainApp;
