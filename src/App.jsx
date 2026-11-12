import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import useDarkMode from './hooks/useDarkMode';
import AppContext from './AppContext';
import MainApp from './MainApp';
import GlobalStyles from './theme/GlobalStyles';
import NightSky from './components/NightSky';
import EditorBar from './components/editor/EditorBar';
import MusicPlayer from './components/MusicPlayer';
import { lightTheme, darkTheme } from './theme/themes';

function App() {
  const darkMode = useDarkMode(true);

  return (
    <AppContext.Provider value={{ darkMode }}>
      <ThemeProvider theme={darkMode.value ? darkTheme : lightTheme}>
        <GlobalStyles />
        <NightSky />
        <div className="App">
          <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
            <MainApp />
          </BrowserRouter>
        </div>
        <EditorBar />
        <MusicPlayer />
      </ThemeProvider>
    </AppContext.Provider>
  );
}

export default App;
