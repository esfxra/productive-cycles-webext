import React from 'react';
import { render } from 'react-dom';
import SettingsProvider from './SettingsProvider';
import Popup from './components/Popup';

render(
  <SettingsProvider>
    <Popup />
  </SettingsProvider>,
  document.querySelector('#popup')
);
