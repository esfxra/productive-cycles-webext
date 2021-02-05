'use strict';

import React, { useState, useEffect } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { themes } from './themes';
import Nav from './Common/Nav';
import Timer from './Timer/Timer';
import Settings from './Settings/Settings';
import Updates from './Updates';
import './Popup.css';

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
      <ThemeProvider theme={theme ? themes[theme] : themes['light']}>
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
