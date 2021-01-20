'use strict';

import React, { useState, useEffect } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import Nav from './Nav';
import Timer from './Timer';
import Settings from './Settings';
import './Popup.css';

const light = {
  name: 'light',
  foreground: '#666666',
  background: '#eeeeee',
  accent: '#8141f7',
  elevation: '#fffffff',
  menu: '#b3b3b3',
  button: '#666666',
  button_alt: '#b3b3b3',
  input: '#f2f2f2',
};

const dark = {
  name: 'dark',
  foreground: '#f5f5f5',
  background: '#202124',
  accent: '#8141f7',
  elevation: '#282828',
  menu: '#3a3a3a',
  button: '#595959',
  button_alt: '#444444',
  input: '#808080',
};

const StyledPopup = styled.div`
  padding-right: 13px;
  padding-left: 13px;
  padding-bottom: 13px;
  margin: 0;
`;

const GlobalStyle = createGlobalStyle`
  body {
    background-color: ${(props) => props.theme.background}
  }

  h1 {
    color: ${(props) => props.theme.foreground}
  }
`;

const Popup = () => {
  const [view, setView] = useState('timer');
  const [theme, setTheme] = useState('timer');

  useEffect(() => {
    chrome.storage.local.get(['theme'], (storage) => setTheme(storage.theme));
  }, []);

  return (
    <StyledPopup theme={theme}>
      <ThemeProvider theme={theme === 'light' ? light : dark}>
        <GlobalStyle />
        <Nav navigate={setView} />
        {view === 'timer' && <Timer />}
        {view === 'settings' && <Settings changeTheme={setTheme} />}
      </ThemeProvider>
    </StyledPopup>
  );
};

export default Popup;
