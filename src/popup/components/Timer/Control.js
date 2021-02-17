'use strict';

import React from 'react';
import styled from 'styled-components';
import startIcon from '../../assets/control-start.svg';
import pauseIcon from '../../assets/control-pause.svg';
import resetIcon from '../../assets/control-reset-cycle.svg';
import resetAllIcon from '../../assets/control-reset-all.svg';

const control = {
  start: {
    icon: startIcon,
    text: chrome.i18n.getMessage('control_start'),
  },
  pause: {
    icon: pauseIcon,
    text: chrome.i18n.getMessage('control_pause'),
  },
  'reset-cycle': {
    icon: resetIcon,
    text: chrome.i18n.getMessage('control_resetCycle'),
  },
  'reset-all': {
    icon: resetAllIcon,
    text: chrome.i18n.getMessage('control_resetAll'),
  },
  skip: {
    text: chrome.i18n.getMessage('control_skipBreak'),
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

const Button = ({ name, onClick }) => {
  const highlight = name === 'start';
  return (
    <StyledButton
      title={control[name].text}
      highlight={highlight}
      onClick={() => onClick({ command: name })}
    >
      <Icon src={control[name].icon} />
    </StyledButton>
  );
};

const Skip = ({ onClick }) => (
  <StyledSkip onClick={() => onClick({ command: 'skip' })}>
    {control['skip'].text}
  </StyledSkip>
);

const Control = ({ period, status, handleInput }) => {
  const isCycle = period % 2 === 0;
  const isRunning = status === 'running';

  const start = <Button name="start" onClick={handleInput} />;
  const pause = <Button name="pause" onClick={handleInput} />;
  const reset = <Button name="reset-cycle" onClick={handleInput} />;
  const resetAll = <Button name="reset-all" onClick={handleInput} />;
  const skip = <Skip onClick={handleInput} />;

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
