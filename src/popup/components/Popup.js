'use strict';

import React, { useState, useEffect, useRef } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import Nav from './Nav';
import Timer from './Timer';
import Settings from './Settings';
import Updates from './Updates';
import './Popup.css';

const light = {
  name: 'light',
  foreground: '#666666',
  background: '#eeeeee',
  accent: '#8141f7',
  elevation: '#ffffff',
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

const dark_alt = {
  name: 'dark',
  foreground: '#fffffe',
  background: '#1b1c22',
  accent: '#3c50fa',
  elevation: '#25262c',
  menu: '#434552',
  button: '#3c50fa',
  button_alt: '#434552',
  input: '#787d8a',
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
`;

const Popup = () => {
  const [view, setView] = useState('timer');
  const [theme, setTheme] = useState(); // Leave initial value empty on purpose to prevent flicker

  useEffect(() => {
    chrome.storage.local.get(['theme', 'updates'], (stored) => {
      // Set the theme
      setTheme(stored.theme);

      // Show updates if any have occurred, and disable flag afterwards
      if (stored.updates) {
        setView('updates');
        chrome.storage.local.set({ updates: false });
      }
    });
  }, []);

  return (
    <StyledPopup>
      <ThemeProvider theme={theme === 'light' ? light : dark}>
        <GlobalStyle />
        <Nav navigate={setView} />
        {view === 'timer' && <Timer />}
        {view === 'settings' && <Settings changeTheme={setTheme} />}
        {view === 'updates' && <Updates />}
      </ThemeProvider>
    </StyledPopup>
  );
};

export default Popup;
