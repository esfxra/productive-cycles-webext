'use strict';

import React from 'react';
import Appearance from './Appearance';
import Group from './Group';

const appearance = { storage: 'theme' };

const notifications = [
  {
    name: 'Enable notifications',
    type: 'checkbox',
    storage: 'notificationsEnabled',
  },
  { name: 'Enable sound', type: 'checkbox', storage: 'notificationsSound' },
];

const autoStart = [
  { name: 'Auto-start cycles', type: 'checkbox', storage: 'autoStartCycles' },
  { name: 'Auto-start breaks', type: 'checkbox', storage: 'autoStartBreaks' },
];

const timer = [
  { name: 'Cycle minutes', type: 'number', storage: 'cycleMinutes' },
  { name: 'Break minutes', type: 'number', storage: 'breakMinutes' },
  { name: 'Total cycles', type: 'number', storage: 'totalCycles' },
];

const Settings = ({ changeTheme }) => {
  return (
    <>
      <Appearance options={appearance} margin={true} onChange={changeTheme} />
      <Group title="Notifications" options={notifications} margin={true} />
      <Group title="Automatic start" options={autoStart} margin={true} />
      <Group title="Timer options" options={timer} />
    </>
  );
};

export default Settings;
