'use strict';

import React from 'react';
import styled from 'styled-components';
import useLocale from '../../hooks/useLocale';
import { INPUT } from '../../../shared-constants';
import { Status } from '../../../shared-types';

import startIcon from '../../assets/control-start.svg';
import pauseIcon from '../../assets/control-pause.svg';
import resetIcon from '../../assets/control-reset-cycle.svg';
import resetAllIcon from '../../assets/control-reset-all.svg';

const locale_set = [
  'control_start',
  'control_pause',
  'control_resetCycle',
  'control_resetAll',
  'control_skipBreak',
];

const control = {
  Start: {
    icon: startIcon,
  },
  Pause: {
    icon: pauseIcon,
  },
  ResetCycle: {
    icon: resetIcon,
  },
  ResetAll: {
    icon: resetAllIcon,
  },
};

const StyledControl = styled.div`
  position: relative;
  top: -2px;
  display: flex;
  flex-direction: row;
  justify-content: ${(props) =>
    props.period % 2 === 0 ? 'space-between' : 'center'};
  width: 100%;
  margin-bottom: 25px;
`;

const StyledButton = styled.div`
  border-radius: 5px;
  background-color: ${(props) =>
    props.highlight ? props.theme.button.main : props.theme.button.alt};
  cursor: pointer;
`;

const Icon = styled.img.attrs((props) => ({
  src: props.src,
}))`
  display: block;
  width: 17px;
  height: 17px;
  padding: 4px;
`;

const StyledSkip = styled.div`
  position: relative;
  top: -2px;
  padding-bottom: 4px;
  font-size: 14px;
  opacity: 0.5;
  color: ${(props) => props.theme.foreground};
  border-bottom: 1px dashed ${(props) => props.theme.foreground};
  cursor: pointer;

  &:hover {
    opacity: 1;
  }
`;

const Button = ({ name, title, onClick }) => {
  const highlight = name === 'Start';
  return (
    <StyledButton
      title={title}
      highlight={highlight}
      onClick={() => onClick({ command: name })}
    >
      <Icon src={control[name].icon} />
    </StyledButton>
  );
};

const Skip = ({ title, onClick }) => (
  <StyledSkip onClick={() => onClick({ command: INPUT.Skip })}>
    {title}
  </StyledSkip>
);

const Control = ({ period, status, handleInput }) => {
  const locale = useLocale(locale_set);

  const isCycle = period % 2 === 0;
  const isRunning = status === Status.Running;

  const start = (
    <Button
      name={INPUT.Start}
      title={locale['control_start']}
      onClick={handleInput}
    />
  );
  const pause = (
    <Button
      name={INPUT.Pause}
      title={locale['control_pause']}
      onClick={handleInput}
    />
  );
  const reset = (
    <Button
      name={INPUT.ResetCycle}
      title={locale['control_resetCycle']}
      onClick={handleInput}
    />
  );
  const resetAll = (
    <Button
      name={INPUT.ResetAll}
      title={locale['control_resetAll']}
      onClick={handleInput}
    />
  );
  const skip = (
    <Skip title={locale['control_skipBreak']} onClick={handleInput} />
  );

  let control;
  if (isCycle) {
    control = (
      <>
        {isRunning ? pause : start}
        {reset}
        {resetAll}
      </>
    );
  } else {
    control = isRunning ? skip : start;
  }

  return <StyledControl period={period}>{control}</StyledControl>;
};

export default Control;
