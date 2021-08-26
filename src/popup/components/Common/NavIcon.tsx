import React from 'react';
import SettingsLight from '../../assets/settings-light.svg';
import SettingsDark from '../../assets/settings-dark.svg';
import BackLight from '../../assets/back-light.svg';
import BackDark from '../../assets/back-dark.svg';
import { Views } from '../../../types';

interface Props {
  view: Views;
  theme: 'light' | 'dark';
}

const locale = {
  settings: chrome.i18n.getMessage('nav_settings'),
  back: chrome.i18n.getMessage('nav_back'),
};

// Settings icon
function Settings({ theme }: { theme: Props['theme'] }) {
  const imgSrc = theme === 'light' ? SettingsLight : SettingsDark;

  return <img src={imgSrc} title={locale.settings} />;
}

// Back icon
function Back({ theme }: { theme: Props['theme'] }) {
  const imgSrc = theme === 'light' ? BackLight : BackDark;

  return <img src={imgSrc} title={locale.back} />;
}

export default function NavIcon({ view, theme }: Props): JSX.Element {
  return view === 'timer' ? <Settings theme={theme} /> : <Back theme={theme} />;
}
