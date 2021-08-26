import React, { useContext } from 'react';
import { SettingsContext } from '../../SettingsProvider';
import Section from '../Common/Section';
import Option from './Option';
import Checkbox from './Checkbox';

const locale = {
  title: chrome.i18n.getMessage('settings_notifications'),
  enabled: chrome.i18n.getMessage('settings_notifications_enabled'),
  sound: chrome.i18n.getMessage('settings_notifications_sound'),
};

export default function Notifications(): JSX.Element {
  const [settings, settingsDispatch] = useContext(SettingsContext);

  // Destructure appropriate settings
  const { notificationsEnabled, notificationsSound } = settings;

  return (
    <Section>
      <h1>{locale['title']}</h1>

      <Option>
        <span>{locale['enabled']}</span>
        <Checkbox
          isChecked={notificationsEnabled}
          onClick={() => settingsDispatch({ type: 'notificationsEnabled' })}
        />
      </Option>

      <Option>
        <span>{locale['sound']}</span>
        <Checkbox
          isChecked={notificationsSound}
          onClick={() => settingsDispatch({ type: 'notificationsSound' })}
        />
      </Option>
    </Section>
  );
}
