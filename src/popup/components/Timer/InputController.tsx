import React, { useContext } from 'react';
import InputRow from './InputRow';
import InputButton from './InputButton';
import InputSkip from './InputSkip';
import { Inputs, Status } from '../../../types';
import { TimerContext } from './TimerController';

interface Props {
  status: Status;
  period: number;
  onInput: ({ type }: { type: Inputs }) => void;
}

/**
 * @todo Consider moving handling of storage side effects here.
 * Examine whether these properties would count as valid values for current state.
 */
export default function InputController({
  status,
  period,
  onInput,
}: Props): JSX.Element {
  // const { state } = useContext(TimerContext);
  // const { period, status } = state;

  const showSkip = period % 2 !== 0;
  const showPause = status === Status.Running;

  const onSkip = () => onInput({ type: 'Skip' });
  const onStart = () => onInput({ type: 'Start' });
  const onPause = () => onInput({ type: 'Pause' });
  const onResetCycle = () => onInput({ type: 'ResetCycle' });
  const onResetAll = () => onInput({ type: 'ResetAll' });

  const skip = <InputSkip onClick={onSkip} />;
  const start = <InputButton key="Start" type="Start" onClick={onStart} />;
  const pause = <InputButton key="Pause" type="Pause" onClick={onPause} />;
  const resetCycle = (
    <InputButton key="ResetCycle" type="ResetCycle" onClick={onResetCycle} />
  );
  const resetAll = (
    <InputButton key="ResetAll" type="ResetAll" onClick={onResetAll} />
  );

  return (
    <InputRow>
      {showSkip ? skip : [showPause ? pause : start, resetCycle, resetAll]}
    </InputRow>
  );
}
