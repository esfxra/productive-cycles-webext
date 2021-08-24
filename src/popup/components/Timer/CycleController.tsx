import React, { useContext } from 'react';
import { TimerContext } from './TimerController';
import SettingsContext from '../../context/SettingsContext';
import CycleGrid from './CycleGrid';
import CycleDot from './CycleDot';
import { Status } from '../../../types';

export default function CycleController(): JSX.Element {
  const { totalPeriods } = useContext(SettingsContext);
  const { state } = useContext(TimerContext);

  const totalCycles = Math.ceil(totalPeriods / 2);
  const { period, status } = state;

  const cycles = [];

  for (let idx = 0; idx < totalPeriods; idx += 1) {
    const isBreak = idx % 2 !== 0;
    if (isBreak) {
      continue;
    }

    const cycleNumber = idx / 2 + 1;

    if (idx === period) {
      cycles.push(
        <CycleDot key={cycleNumber} cycle={cycleNumber} status={status} />
      );
    }

    if (idx < period) {
      cycles.push(
        <CycleDot
          key={cycleNumber}
          cycle={cycleNumber}
          status={Status.Complete}
        />
      );
    }

    if (idx > period) {
      cycles.push(
        <CycleDot
          key={cycleNumber}
          cycle={cycleNumber}
          status={Status.Initial}
        />
      );
    }
  }

  return <CycleGrid total={totalCycles}>{cycles}</CycleGrid>;
}
