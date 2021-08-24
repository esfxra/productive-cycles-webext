import React from 'react';
import { SETTINGS } from '../../defaults';

const SettingsContext = React.createContext(SETTINGS);

export const SettingsProvider = SettingsContext.Provider;
export const SettingsConsumer = SettingsContext.Consumer;

export default SettingsContext;
