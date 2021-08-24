import React, { useEffect, useRef } from 'react';
import MainLayout from '../components/MainLayout';
import Counter from '../components/Timer/Counter';
import InputController from '../components/Timer/InputController';
import CycleController from '../components/Timer/CycleController';
// import useTimerReducer from '../hooks/useTimerReducer';
// import { STORED_STATE } from '../../defaults';
import { Inputs } from '../../types';

export default function Timer(): JSX.Element {
  const port = useRef<chrome.runtime.Port>(null);

  // Port effect
  useEffect(() => {
    // Initialize port for messaging
    port.current = chrome.runtime.connect({ name: 'port-from-popup' });
    port.current.onMessage.addListener(onMessage);

    // Cleanup
    return () => {
      // Remove listener and disconnect port
      port.current.onMessage.removeListener(onMessage);
      port.current.disconnect();
    };
  }, []);

  const onMessage = (message) => {
    console.log(message);
  };

  return (
    <MainLayout>
      <TimerController />
    </MainLayout>
  );
}
