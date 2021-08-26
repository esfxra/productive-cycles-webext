import React, { useContext, useEffect, useState } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { SettingsContext } from '../SettingsProvider';
import Nav from './Common/Nav';
import Timer from './Timer/Timer';
import Settings from './Settings/Settings';
import Updates from './Updates';
import { themes } from '../themes';
import { Views } from '../../types';
import '../popup.css';

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
  const [{ theme }] = useContext(SettingsContext);
  const [view, setView] = useState<Views>('timer');

  useEffect(() => {
    chrome.storage.local.get(['updates'], (stored) => {
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
        {view === 'settings' && <Settings />}
        {view === 'updates' && <Updates />}
      </ThemeProvider>
    </StyledPopup>
  );
}
