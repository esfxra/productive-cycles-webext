import React, { useContext } from 'react';
import { SettingsContext } from '../../SettingsProvider';
import Section from '../Common/Section';
import Option from './Option';
import Checkbox from './Checkbox';

const locale = {
  title: chrome.i18n.getMessage('settings_autoStart'),
  cycles: chrome.i18n.getMessage('settings_autoStart_cycles'),
  breaks: chrome.i18n.getMessage('settings_autoStart_breaks'),
};

export default function Notifications(): JSX.Element {
  const [settings, settingsDispatch] = useContext(SettingsContext);

  // Destructure appropriate settings
  const { autoStartCycles, autoStartBreaks } = settings;

  return (
    <Section>
      <h1>{locale['title']}</h1>

      <Option>
        <span>{locale['cycles']}</span>
        <Checkbox
          isChecked={autoStartCycles}
          onClick={() => settingsDispatch({ type: 'notificationsEnabled' })}
        />
      </Option>

      <Option>
        <span>{locale['breaks']}</span>
        <Checkbox
          isChecked={autoStartBreaks}
          onClick={() => settingsDispatch({ type: 'notificationsSound' })}
        />
      </Option>
    </Section>
  );
}
