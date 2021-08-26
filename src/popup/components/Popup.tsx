import React, { useState, useEffect } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { themes } from '../themes';
import Nav from './Common/Nav';
import Timer from './Timer/Timer';
import Settings from './Settings/Settings';
import Updates from './Updates';
import '../popup.css';
import { Views } from '../../types';

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

export default function Popup(): JSX.Element {
  const [view, setView] = useState<Views>('timer');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    chrome.storage.local.get(['theme', 'updates'], (stored) => {
      // Set the theme
      setTheme(stored.theme);

      // Show updates if any have occurred, and disable flag afterwards
      if (stored.updates) {
        setView('updates');
        void chrome.storage.local.set({ updates: false });
      }
    });
  }, []);

  return (
    <StyledPopup>
      <ThemeProvider theme={themes[theme]}>
        <GlobalStyle />
        <Nav view={view} navigate={setView} />
        {view === 'timer' && <Timer />}
        {view === 'settings' && <Settings changeTheme={setTheme} />}
        {view === 'updates' && <Updates />}
      </ThemeProvider>
    </StyledPopup>
  );
}
