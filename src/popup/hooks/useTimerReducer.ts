import { useReducer } from 'react';
import { Inputs, Status, TimerState } from '../../types';

interface TimerAction {
  type: Inputs | 'ResetCycleBack' | 'Init';
  payload?: Partial<TimerState>;
}

interface TimerDispatch {
  (action: TimerAction): void;
}

const reducer = (state: TimerState, action: TimerAction) => {
  switch (action.type) {
    case 'Init':
      return {
        remaining: action.payload.remaining,
        delay: action.payload.delay,
        period: action.payload.period,
        status: action.payload.status,
      };

    case 'Skip':
      return {
        remaining: action.payload.remaining,
        delay: action.payload.delay,
        period: state.period + 1,
        status: action.payload.status,
      };

    case 'Start':
      return {
        remaining: state.remaining,
        delay: 1000,
        period: state.period,
        status: Status.Running,
      };

    case 'Pause':
      return {
        remaining: state.remaining,
        delay: null,
        period: state.period,
        status: Status.Paused,
      };

    case 'ResetCycle':
      return {
        remaining: action.payload.remaining,
        delay: null,
        period: state.period,
        status: Status.Initial,
      };

    case 'ResetCycleBack':
      return {
        remaining: action.payload.remaining,
        delay: null,
        period: state.period - 2,
        status: Status.Initial,
      };

    case 'ResetAll':
      return {
        remaining: action.payload.remaining,
        delay: null,
        period: 0,
        status: Status.Initial,
      };
  }
};

export default function useTimerReducer(
  initialState: TimerState
): [TimerState, TimerDispatch] {
  const [state, dispatch] = useReducer(reducer, initialState);

  // useEffect(() => {}, [state]);

  return [state, dispatch];
}
