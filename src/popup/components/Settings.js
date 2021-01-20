'use strict';

import React, { useState, useEffect } from 'react';
import Section from './Common/Section';
import Appearance from './Settings/Appearance';
import Checkbox from './Settings/Checkbox';
import NumberInput from './Settings/NumberInput';
import styled from 'styled-components';

const StyledOption = styled.div`
  display: grid;
  align-items: center;
  grid-template-columns: 120px 40px;
  column-gap: 15px;
  margin-bottom: ${(props) => (props.margin ? '13px' : '0')};
`;

const Label = styled.div`
  font-size: 13px;
  color: ${(props) => props.theme.foreground};
`;

const Option = ({ children, name, margin }) => {
  return (
    <StyledOption margin={margin}>
      <Label>{name}</Label>
      {children}
    </StyledOption>
  );
};

const settings = {
  theme: 'light',
  notifications: {
    enabled: false,
    sound: false,
  },
  autoStart: {
    cycles: false,
    breaks: false,
  },
  timer: {
    cycleMinutes: 25,
    breakMinutes: 5,
    totalCycles: 4,
  },
};

const Settings = ({ changeTheme }) => {
  const [theme, setTheme] = useState(settings.theme);
  const [notifications, setNotifications] = useState(settings.notifications);
  const [autoStart, setAutoStart] = useState(settings.autoStart);
  const [timer, setTimer] = useState(settings.timer);

  useEffect(() => {
    chrome.storage.local.get(
      {
        theme: 'light',
        notificationsEnabled: true,
        notificationsSound: true,
        autoStartCycles: true,
        autoStartBreaks: true,
        cycleMinutes: 25,
        breakMinutes: 5,
        totalCycles: 4,
      },
      (storage) => {
        // Theme
        setTheme({ theme: storage.theme });

        // Notifications
        setNotifications({
          enabled: storage.notificationsEnabled,
          sound: storage.notificationsSound,
        });
        // Automatic start
        setAutoStart({
          cycles: storage.autoStartCycles,
          breaks: storage.autoStartBreaks,
        });
        // Timer settings
        setTimer({
          cycleMinutes: storage.cycleMinutes,
          breakMinutes: storage.breakMinutes,
          totalCycles: storage.totalCycles,
        });
      }
    );
  }, []);

  const updateTheme = (update) => {
    chrome.storage.local.set({ theme: update });
    setTheme(update);
    changeTheme(update);
  };

  const updateNotifications = {
    toggleEnabled: (update) => {
      chrome.storage.local.set({ notificationsEnabled: update });
      setNotifications({ ...notifications, enabled: update });
    },
    toggleSound: (update) => {
      chrome.storage.local.set({ notificationsSound: update });
      setNotifications({ ...notifications, sound: update });
    },
  };

  const updateAutoStart = {
    toggleCycles: (update) => {
      chrome.storage.local.set({ autoStartCycles: update });
      setAutoStart({ ...autoStart, cycles: update });
    },
    toggleBreaks: (update) => {
      chrome.storage.local.set({ autoStartBreaks: update });
      setAutoStart({ ...autoStart, breaks: update });
    },
  };

  const updateTimer = {
    cycleMinutes: (valid, update) => {
      if (valid) chrome.storage.local.set({ cycleMinutes: update });
      setTimer({ ...timer, cycleMinutes: update });
    },
    breakMinutes: (valid, update) => {
      if (valid) chrome.storage.local.set({ breakMinutes: update });
      setTimer({ ...timer, breakMinutes: update });
    },
    totalCycles: (valid, update) => {
      if (valid) chrome.storage.local.set({ totalCycles: update });
      setTimer({ ...timer, totalCycles: update });
    },
  };

  return (
    <>
      <Section margin={true}>
        <h1>Appearance</h1>
        <Appearance onChange={updateTheme} />
      </Section>

      <Section margin={true}>
        <h1>Notifications</h1>
        <Option name="Enable notifications" margin={true}>
          <Checkbox
            checked={notifications.enabled}
            onChange={updateNotifications.toggleEnabled}
          />
        </Option>

        <Option name="Enable sound">
          <Checkbox
            checked={notifications.sound}
            onChange={updateNotifications.toggleSound}
          />
        </Option>
      </Section>

      <Section margin={true}>
        <h1>Automatic start</h1>
        <Option name="Auto-start cycles" margin={true}>
          <Checkbox
            checked={autoStart.cycles}
            onChange={updateAutoStart.toggleCycles}
          />
        </Option>

        <Option name="Auto-start breaks">
          <Checkbox
            checked={autoStart.breaks}
            onChange={updateAutoStart.toggleBreaks}
          />
        </Option>
      </Section>

      <Section>
        <h1>Timer options</h1>
        <Option name="Cycle minutes" margin={true}>
          <NumberInput
            value={timer.cycleMinutes}
            min="1"
            max="59"
            onChange={updateTimer.cycleMinutes}
          />
        </Option>

        <Option name="Break minutes" margin={true}>
          <NumberInput
            value={timer.breakMinutes}
            min="1"
            max="59"
            onChange={updateTimer.breakMinutes}
          />
        </Option>

        <Option name="Total cycles">
          <NumberInput
            value={timer.totalCycles}
            min="1"
            max="12"
            onChange={updateTimer.totalCycles}
          />
        </Option>
      </Section>
    </>
  );
};
export default Settings;
