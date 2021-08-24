import React, { useState, useEffect } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { SettingsProvider } from './context/SettingsContext';
import Nav from './components/Common/Nav';
import Timer from './screens/Timer';
import Settings from './screens/Settings';
import Updates from './screens/Updates';
import { SETTINGS } from '../defaults';
import { themes } from './themes';
import { ExtensionSettings } from '../types';
import './Popup.css';

export default function Popup(): JSX.Element {
  const [view, setView] = useState('timer');
  const [settings, setSettings] = useState(SETTINGS);

  useEffect(() => {
    chrome.storage.local.get(SETTINGS, (stored: ExtensionSettings) => {
      // Set new settings
      setSettings(stored);

      // Debug
      console.log(`Popup - showWelcome: ${stored.showWelcome}`);
      console.log(`Popup - showUpdates: ${stored.showUpdates}`);

      // Show updates if any have occurred, and disable flag afterwards
      if (stored.showUpdates || stored.showWelcome) {
        setView('updates');
        chrome.storage.local.set({ showUpdates: false, showWelcome: false });
      }
    });
  }, []);

  return (
    <StyledPopup>
      <ThemeProvider theme={themes[settings.theme]}>
        <GlobalStyle />
        <Nav view={view} navigate={setView} />
        <SettingsProvider value={settings}>
          {view === 'timer' && <Timer />}
          {view === 'settings' && <Settings />}
          {view === 'updates' && <Updates />}
        </SettingsProvider>
      </ThemeProvider>
    </StyledPopup>
  );
}

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
