import React, { useContext } from 'react';
import { SettingsContext } from '../../SettingsProvider';
import Section from '../Common/Section';
import ThemeSelector from './ThemeSelector';

const locale = {
  title: chrome.i18n.getMessage('settings_appearance'),
};

export default function Appearance(): JSX.Element {
  const [{ theme }, settingsDispatch] = useContext(SettingsContext);

  function updateTheme(theme: 'light' | 'dark') {
    settingsDispatch({ type: 'theme', payload: theme });
  }

  return (
    <Section>
      <h1>{locale['title']}</h1>

      <ThemeSelector
        type="light"
        isSelected={theme === 'light'}
        onClick={updateTheme}
      />

      <ThemeSelector
        type="dark"
        isSelected={theme === 'dark'}
        onClick={updateTheme}
      />
    </Section>
  );
}
