'use strict';

import React from 'react';

import useLocale from '../../hooks/useLocale';

import Appearance from './Appearance';
import Group from './Group';

const locale_set = [
  'settings_appearance',
  'settings_appearance_light',
  'settings_appearance_dark',
  'settings_notifications',
  'settings_notifications_enabled',
  'settings_notifications_sound',
  'settings_autoStart',
  'settings_autoStart_cycles',
  'settings_autoStart_breaks',
  'settings_timer',
  'settings_timer_cycleMinutes',
  'settings_timer_breakMinutes',
  'settings_timer_totalCycles',
  'settings_timer_badgeTimer',
];

const Settings = ({ changeTheme }) => {
  const locale = useLocale(locale_set);

  const appearance = {
    name: {
      light: locale['settings_appearance_light'],
      dark: locale['settings_appearance_dark'],
    },
    storage: 'theme',
  };

  const notifications = [
    {
      name: locale['settings_notifications_enabled'],
      type: 'checkbox',
      storage: 'notificationsEnabled',
    },
    {
      name: locale['settings_notifications_sound'],
      type: 'checkbox',
      storage: 'notificationsSound',
    },
  ];

  const autoStart = [
    {
      name: locale['settings_autoStart_cycles'],
      type: 'checkbox',
      storage: 'autoStartCycles',
    },
    {
      name: locale['settings_autoStart_breaks'],
      type: 'checkbox',
      storage: 'autoStartBreaks',
    },
  ];

  const timer = [
    {
      name: locale['settings_timer_cycleMinutes'],
      type: 'number',
      storage: 'cycleMinutes',
    },
    {
      name: locale['settings_timer_breakMinutes'],
      type: 'number',
      storage: 'breakMinutes',
    },
    {
      name: locale['settings_timer_totalCycles'],
      type: 'number',
      storage: 'totalCycles',
    },
    {
      name: locale['settings_timer_badgeTimer'],
      type: 'checkbox',
      storage: 'badgeTimer',
    },
  ];

  return (
    <>
      {/* Appearance settings */}
      <Appearance
        title={locale['settings_appearance']}
        options={appearance}
        margin={true}
        onChange={changeTheme}
      />

      {/* Notifications settings */}
      <Group
        title={locale['settings_notifications']}
        options={notifications}
        margin={true}
      />

      {/* Auto-start settings */}
      <Group
        title={locale['settings_autoStart']}
        options={autoStart}
        margin={true}
      />

      {/* Timer settings */}
      <Group title={locale['settings_timer']} options={timer} />
    </>
  );
};

export default Settings;
