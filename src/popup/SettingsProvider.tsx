import React, { createContext, useReducer, useEffect } from 'react';

interface Props {
  children: React.ReactNode;
}

type SettingsContextType = [SettingsState, SettingsDispatch];

interface SettingsState {
  theme: 'light' | 'dark';
  notificationsEnabled: boolean;
  notificationsSound: boolean;
  autoStartCycles: boolean;
  autoStartBreaks: boolean;
  cycleMinutes: number;
  breakMinutes: number;
  totalCycles: number;
  badgeTimer: boolean;
}

type SettingsAction =
  | { type: 'init'; payload: SettingsState }
  | { type: 'theme'; payload: SettingsState['theme'] }
  | { type: 'notificationsEnabled' }
  | { type: 'notificationsSound' }
  | { type: 'autoStartCycles' }
  | { type: 'autoStartBreaks' }
  | { type: 'cycleMinutes'; payload: SettingsState['cycleMinutes'] }
  | { type: 'breakMinutes'; payload: SettingsState['breakMinutes'] }
  | { type: 'totalCycles'; payload: SettingsState['totalCycles'] }
  | { type: 'badgeTimer' };

type SettingsDispatch = (action: SettingsAction) => void;

const initialSettings: SettingsState = {
  theme: 'light',
  notificationsEnabled: true,
  notificationsSound: true,
  autoStartCycles: true,
  autoStartBreaks: true,
  cycleMinutes: 25,
  breakMinutes: 5,
  totalCycles: 4,
  badgeTimer: true,
};

function reducer(state: SettingsState, action: SettingsAction) {
  if (action.type === 'init') {
    return action.payload;
  }

  if (action.type === 'theme') {
    return { ...state, theme: action.payload };
  }

  if (action.type === 'notificationsEnabled') {
    return { ...state, notificationsEnabled: !state.notificationsEnabled };
  }

  if (action.type === 'notificationsSound') {
    return { ...state, notificationsSound: !state.notificationsSound };
  }

  if (action.type === 'autoStartCycles') {
    return { ...state, autoStartCycles: !state.autoStartCycles };
  }

  if (action.type === 'autoStartBreaks') {
    return { ...state, autoStartBreaks: !state.autoStartBreaks };
  }

  if (action.type === 'cycleMinutes') {
    return { ...state, cycleMinutes: action.payload };
  }

  if (action.type === 'breakMinutes') {
    return { ...state, breakMinutes: action.payload };
  }

  if (action.type === 'totalCycles') {
    return { ...state, totalCycles: action.payload };
  }

  if (action.type === 'badgeTimer') {
    return { ...state, badgeTimer: !state.badgeTimer };
  }

  return state;
}

export const SettingsContext = createContext<SettingsContextType>([
  initialSettings,
  () => {
    console.log('SettingsProvider - Reducer has not been initialized.');
  },
]);

export default function SettingsProvider({ children }: Props): JSX.Element {
  const [settings, settingsDispatch] = useReducer(reducer, initialSettings);

  // Get stored settings after first render, and dispatch when obtained
  useEffect(() => {
    function getSettings() {
      chrome.storage.local.get(initialSettings, (storedSettings) => {
        settingsDispatch({
          type: 'init',
          payload: storedSettings as SettingsState,
        });
      });
    }

    getSettings();
  }, []);

  // Update stored settings anytime there is a state update
  useEffect(() => {
    function save() {
      void chrome.storage.local.set(settings);
    }

    save();
  }, [settings]);

  const contextValue: SettingsContextType = [settings, settingsDispatch];

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}
