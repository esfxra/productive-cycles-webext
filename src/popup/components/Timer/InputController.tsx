import React from 'react';
import InputRow from './InputRow';
import InputButton from './InputButton';
import InputSkip from './InputSkip';
import { Inputs, Status } from '../../../types';

interface Props {
  status: Status;
  period: number;
  onInput: ({ type }: { type: Inputs }) => void;
}

/**
 * Controller of input buttons displayed to the user.
 * Renders action buttons appropriate to whether the period is a cycle or a break.
 */
export default function InputController({
  status,
  period,
  onInput,
}: Props): JSX.Element {
  const showSkip = period % 2 !== 0;
  const showPause = status === 'running';

  const onSkip = () => onInput({ type: 'skip' });
  const onStart = () => onInput({ type: 'start' });
  const onPause = () => onInput({ type: 'pause' });
  const onResetCycle = () => onInput({ type: 'reset-cycle' });
  const onResetAll = () => onInput({ type: 'reset-all' });

  const skip = <InputSkip onClick={onSkip} />;
  const start = <InputButton key="start" type="start" onClick={onStart} />;
  const pause = <InputButton key="pause" type="pause" onClick={onPause} />;
  const resetCycle = (
    <InputButton key="reset-cycle" type="reset-cycle" onClick={onResetCycle} />
  );
  const resetAll = (
    <InputButton key="reset-all" type="reset-all" onClick={onResetAll} />
  );

  return (
    <InputRow>
      {showSkip ? skip : [showPause ? pause : start, resetCycle, resetAll]}
    </InputRow>
  );
}
