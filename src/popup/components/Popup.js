'use strict';

import React, { useState, useEffect } from 'react';
import Nav from './Nav';
import Timer from './Timer';
import Settings from './Settings';
import './Popup.css';

const Popup = () => {
  const [view, setView] = useState('timer');
  // const [theme, setTheme] = useState('timer');

  // useEffect(() => {
  //   chrome.storage.local.get(['theme'], (storage) => setTheme(storage.theme));
  // }, []);

  return (
    <div>
      <Nav navigate={setView} />
      {view === 'timer' && <Timer />}
      {view === 'settings' && <Settings />}
    </div>
  );
};

export default Popup;
