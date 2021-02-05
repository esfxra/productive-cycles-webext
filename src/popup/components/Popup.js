'use strict';

import React, { useState, useEffect } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import Nav from './Common/Nav';
import Timer from './Timer/Timer';
import Settings from './Settings/Settings';
import Updates from './Updates';
import './Popup.css';

const light = {
  name: 'light',
  foreground: '#747980',
  background: '#eeeeee',
  accent: '#3c50fa',
  elevation: '#ffffff',
  menu: '#C2C5CB',
  button: '#747980',
  button_alt: '#C2C5CB',
  number: '#e7e8ea',
  checkbox: '#e7e8ea',
  checkmark: '#747980',
};

const dark = {
  name: 'dark',
  foreground: '#f5f5f5',
  background: '#1e1f23',
  accent: '#3c50fa',
  elevation: '#27282D',
  menu: '#434552',
  button: '#3c50fa',
  button_alt: '#484B56',
  number: '#787d8a',
  checkbox: '#787d8a',
  checkmark: '#f5f5f5',
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
