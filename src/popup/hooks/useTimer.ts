import { useContext, useRef, useEffect, useState } from 'react';
import SettingsContext from '../context/SettingsContext';
import useInterval from './useInterval';
import { INPUT, STORED_STATE } from '../../defaults';
import { TimerState, Status, StoredState, Inputs } from '../../types';

interface DispatchInput {
  type: Inputs;
}

type TimerDispatch = ({ type }: DispatchInput) => void;

export default function useTimer(
  initialState: TimerState
): [TimerState, TimerDispatch] {
  const [state, setState] = useState(initialState);
  const port = useRef<chrome.runtime.Port>(null);
  const settings = useContext(SettingsContext);

  useInterval(() => {
    onTick();
  }, state.delay);

  useEffect(() => {
    onInit();

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

  const onInit = async () => {
    const storedState = await getState();
    const isCycle = state.period % 2 === 0;

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

    setState({
      remaining: newRemaining,
      delay: newDelay,
      status: storedState.status,
      period: storedState.period,
    });
  };

  const onMessage = (message: any) => {
    console.log('Received new message');
    console.log(message);
  };

  /**
   * @note onTick is keeping a stale previous state
   */
  const onTick = () => {
    // Subtract from remaining time
    const remaining = state.remaining - 1000;

    if (remaining > 0) {
      setState((state) => ({ ...state, remaining }));
      return;
    }

    // End
    const { cycleMinutes, breakMinutes, cycleAutoStart, breakAutoStart } =
      settings;

    const isCycle = state.period % 2 === 0;
    const cycleDuration = cycleMinutes * 60000;
    const breakDuration = breakMinutes * 60000;
    const autoStart = isCycle ? cycleAutoStart : breakAutoStart;

    const newRemaining = isCycle ? cycleDuration : breakDuration;
    const newDelay = autoStart ? 1000 : null;
    const newStatus = autoStart ? Status.Running : Status.Initial;
    const newPeriod = state.period + 1;

    port.current.postMessage({
      topic: 'End',
      data: { status: newStatus, period: newPeriod },
    });

    setState({
      remaining: newRemaining,
      delay: newDelay,
      status: newStatus,
      period: newPeriod,
    });
    return;
  };

  /**
   * @todo Check autoStart from the current settings value to start the next cycle or not?
   */
  const onSkip = () => {
    const { cycleMinutes, breakMinutes, cycleAutoStart, breakAutoStart } =
      settings;

    const isCycle = state.period % 2 === 0;
    const cycleDuration = cycleMinutes * 60000;
    const breakDuration = breakMinutes * 60000;
    const autoStart = isCycle ? cycleAutoStart : breakAutoStart;

    const newRemaining = isCycle ? cycleDuration : breakDuration;
    const newDelay = autoStart ? 1000 : null;
    const newStatus = autoStart ? Status.Running : Status.Initial;
    const newPeriod = state.period + 1;

    port.current.postMessage({
      topic: INPUT.Skip,
      data: { status: newStatus, period: newPeriod },
    });

    setState({
      remaining: newRemaining,
      delay: newDelay,
      status: newStatus,
      period: newPeriod,
    });
  };

  const onStart = () => {
    console.log('Start');
    const newDelay = 1000;
    const newStatus = Status.Running;

    port.current.postMessage({
      topic: INPUT.Start,
      data: { status: newStatus },
    });

    setState((state) => ({ ...state, delay: newDelay, status: newStatus }));
  };

  const onPause = () => {
    const newDelay = null;
    const newStatus = Status.Paused;

    port.current.postMessage({
      topic: INPUT.Pause,
      data: { status: newStatus },
    });

    setState((state) => ({ ...state, delay: newDelay, status: newStatus }));
  };

  const onResetCycle = () => {
    const newRemaining = settings.cycleMinutes * 60000;
    const newDelay = null;
    const newStatus = Status.Initial;
    let newPeriod: number;

    if (state.status === Status.Initial && state.period !== 0) {
      // The case where the timer's status is 'Initial'
      newPeriod = state.period - 2;
    } else {
      // The case where the timer's status is 'Running'
      newPeriod = state.period;
    }

    port.current.postMessage({
      topic: INPUT.ResetCycle,
      data: { status: newStatus, period: newPeriod },
    });

    setState({
      remaining: newRemaining,
      delay: newDelay,
      status: newStatus,
      period: newPeriod,
    });
  };

  const onResetAll = () => {
    const newRemaining = settings.cycleMinutes * 60000;
    const newDelay = null;
    const newStatus = Status.Initial;
    const newPeriod = 0;

    port.current.postMessage({
      topic: INPUT.ResetAll,
      data: { status: newStatus, period: newPeriod },
    });

    setState({
      remaining: newRemaining,
      delay: newDelay,
      status: newStatus,
      period: newPeriod,
    });
  };

  const dispatch = ({ type }: DispatchInput): void => {
    switch (type) {
      case 'Skip':
        onSkip();
        break;
      case 'Start':
        onStart();
        break;
      case 'Pause':
        onPause();
        break;
      case 'ResetCycle':
        onResetCycle();
        break;
      case 'ResetAll':
        onResetAll();
        break;
    }
  };

  return [state, dispatch];
}

async function getState(): Promise<StoredState> {
  const getStateFromStorage = (): Promise<StoredState> => {
    return new Promise((resolve) =>
      chrome.storage.local.get(STORED_STATE, (state) =>
        resolve(state as StoredState)
      )
    );
  };

  return await getStateFromStorage();
}
