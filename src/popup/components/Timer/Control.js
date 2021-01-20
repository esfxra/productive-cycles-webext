'use strict';

import React from 'react';
import styled from 'styled-components';

const StyledControl = styled.div`
  position: relative;
  top: -2px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 25px;
`;

const Button = styled.div`
  border-radius: 5px;
  background-color: ${(props) =>
    props.highlight ? props.theme.button : props.theme.button_alt};
  cursor: pointer;
`;

const Icon = styled.img.attrs((props) => ({
  alt: props.alt,
  title: props.title,
  src: props.src,
}))`
  display: block;
  width: 17px;
  height: 17px;
  padding: 4px;
`;

const ResetAllIcon = styled(Icon)`
  width: 18px;
  height: 18px;
  padding: 3.5px;
`;

const StyledSkip = styled.div`
  position: relative;
  top: -2px;
  padding-bottom: 4px;
  font-size: 14px;
  opacity: 0.5;
  color: #666666;
  border-bottom: 1px dashed #666666;
  cursor: pointer;

  &:hover {
    opacity: 1;
  }
`;

const Start = ({ onClick }) => (
  <Button highlight={true} onClick={onClick}>
    <Icon
      alt="Start button"
      title="Start"
      src="../assets/icons/control-start.svg"
    />
  </Button>
);

const Pause = ({ onClick }) => (
  <Button onClick={onClick}>
    <Icon
      alt="Pause button"
      title="Pause"
      src="../assets/icons/control-pause.svg"
    />
  </Button>
);

const Reset = ({ onClick }) => (
  <Button onClick={onClick}>
    <Icon
      alt="Reset cycle button"
      title="Reset cycle"
      src="../assets/icons/control-reset-cycle.svg"
    />
  </Button>
);

const ResetAll = ({ onClick }) => (
  <Button onClick={onClick}>
    <ResetAllIcon
      alt="Reset all button"
      title="Reset all"
      src="../assets/icons/control-reset-all.svg"
    />
  </Button>
);

const Skip = ({ onClick }) => (
  <StyledSkip onClick={onClick}>Skip break</StyledSkip>
);

const Control = ({ period, status, start, pause, reset, resetAll, skip }) => {
  const isCycle = period % 2 === 0;

  return (
    <StyledControl>
      {isCycle && (status === 'initial' || status === 'paused') && (
        <Start onClick={start} />
      )}
      {isCycle && status === 'running' && <Pause onClick={pause} />}
      {isCycle && <Reset onClick={reset} />}
      {isCycle && <ResetAll onClick={resetAll} />}
      {!isCycle && status === 'running' && <Skip onClick={skip} />}
    </StyledControl>
  );
};

export default Control;
