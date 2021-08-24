import React, { useContext, useEffect } from 'react';
import SettingsContext from '../../context/SettingsContext';
import useTimerReducer from '../../hooks/useTimerReducer';
import { STORED_STATE, TIMER_STATE } from '../../../defaults';
import { Status, StoredState } from '../../../types';

export default function TimerController(): JSX.Element {
  const settings = useContext(SettingsContext);
  const [state, dispatch] = useTimerReducer(TIMER_STATE);

  useEffect(() => {
    const getStored = () => {
      chrome.storage.local.get(STORED_STATE, (storedState: StoredState) => {
        const isCycle = storedState.period % 2 === 0;

        let newRemaining: number;
        if (storedState.targets.length) {
          newRemaining = storedState.targets[storedState.period] - Date.now();
        } else {
          newRemaining = isCycle
            ? settings.cycleMinutes * 60000
            : settings.breakMinutes * 60000;
        }

        let newDelay: number;
        if (storedState.status === Status.Running) {
          newDelay = 1000;
        } else {
          newDelay = null;
        }

        dispatch({
          type: 'Init',
          payload: {
            remaining: newRemaining,
            delay: newDelay,
            period: storedState.period,
            status: storedState.status,
          },
        });
      });
    };

    getStored();
  }, []);

  return (
    <>
      <Counter />
      <InputController />
      <CycleController />
    </>
  );
}
