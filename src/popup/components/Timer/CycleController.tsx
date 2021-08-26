import React from 'react';
import CycleGrid from './CycleGrid';
import CycleDot from './CycleDot';
import { Status } from '../../../types';

interface Props {
  status: Status;
  period: number;
  totalPeriods: number;
}

/**
 * Control the rendering of CycleDots within a CycleGrid component.
 */
export default function CycleController({
  status,
  period,
  totalPeriods,
}: Props): JSX.Element {
  const totalCycles = Math.ceil(totalPeriods / 2);

  const cycles = [];

  // Iterate through all possible periods, add cycles to render array and skip breaks
  for (let idx = 0; idx < totalPeriods; idx += 1) {
    const isBreak = idx % 2 !== 0;
    if (isBreak) {
      continue;
    }

    const cycleNumber = idx / 2 + 1;

    // Use the status of the current period
    if (idx === period) {
      cycles.push(
        <CycleDot key={cycleNumber} cycle={cycleNumber} status={status} />
      );
    }

    // Show as 'Complete' since it has already passed
    if (idx < period) {
      cycles.push(
        <CycleDot key={cycleNumber} cycle={cycleNumber} status="complete" />
      );
    }

    // Show as 'Initial' since it is still pending
    if (idx > period) {
      cycles.push(
        <CycleDot key={cycleNumber} cycle={cycleNumber} status="initial" />
      );
    }
  }

  return <CycleGrid total={totalCycles}>{cycles}</CycleGrid>;
}
