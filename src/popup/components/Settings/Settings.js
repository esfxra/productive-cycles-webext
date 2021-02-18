'use strict';

import React from 'react';
import Appearance from './Appearance';
import Group from './Group';

// Get localized strings
const locale = {
  appearance: {
    title: chrome.i18n.getMessage('settings_appearance'),
    light: chrome.i18n.getMessage('settings_appearance_light'),
    dark: chrome.i18n.getMessage('settings_appearance_dark'),
  },
  notifications: {
    title: chrome.i18n.getMessage('settings_notifications'),
    enabled: chrome.i18n.getMessage('settings_notifications_enabled'),
    sound: chrome.i18n.getMessage('settings_notifications_sound'),
  },
  autoStart: {
    title: chrome.i18n.getMessage('settings_autoStart'),
    cycles: chrome.i18n.getMessage('settings_autoStart_cycles'),
    breaks: chrome.i18n.getMessage('settings_autoStart_breaks'),
  },
  timer: {
    title: chrome.i18n.getMessage('settings_timer'),
    cycleMinutes: chrome.i18n.getMessage('settings_timer_cycleMinutes'),
    breakMinutes: chrome.i18n.getMessage('settings_timer_breakMinutes'),
    totalCycles: chrome.i18n.getMessage('settings_timer_totalCycles'),
    badgeTimer: chrome.i18n.getMessage('settings_timer_badgeTimer'),
  },
};

// Build option objects: appearance, notifications, autoStart, timer
const appearance = {
  name: { light: locale.appearance.light, dark: locale.appearance.dark },
  storage: 'theme',
};

const notifications = [
  {
    name: locale.notifications.enabled,
    type: 'checkbox',
    storage: 'notificationsEnabled',
  },
  {
    name: locale.notifications.sound,
    type: 'checkbox',
    storage: 'notificationsSound',
  },
];

const autoStart = [
  {
    name: locale.autoStart.cycles,
    type: 'checkbox',
    storage: 'autoStartCycles',
  },
  {
    name: locale.autoStart.breaks,
    type: 'checkbox',
    storage: 'autoStartBreaks',
  },
];

const timer = [
  { name: locale.timer.cycleMinutes, type: 'number', storage: 'cycleMinutes' },
  { name: locale.timer.breakMinutes, type: 'number', storage: 'breakMinutes' },
  { name: locale.timer.totalCycles, type: 'number', storage: 'totalCycles' },
  { name: locale.timer.badgeTimer, type: 'checkbox', storage: 'badgeTimer' },
];

const Settings = ({ changeTheme }) => {
  return (
    <>
      {/* Appearance settings */}
      <Appearance
        title={locale.appearance.title}
        options={appearance}
        margin={true}
        onChange={changeTheme}
      />

      {/* Notifications settings */}
      <Group
        title={locale.notifications.title}
        options={notifications}
        margin={true}
      />

      {/* Auto-start settings */}
      <Group title={locale.autoStart.title} options={autoStart} margin={true} />

      {/* Timer settings */}
      <Group title={locale.timer.title} options={timer} />
    </>
  );
};

export default Settings;
