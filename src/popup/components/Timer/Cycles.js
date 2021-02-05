'use strict';

import React from 'react';
import styled, { keyframes } from 'styled-components';

const StyledCycles = styled.div`
  display: grid;
  grid-template-columns: ${(props) =>
    props.total >= 4 ? 'repeat(4, auto)' : `repeat(${props.total}, auto)`};
  grid-auto-flow: row;
  grid-auto-rows: 16px;
  gap: 16px;
  justify-content: ${(props) =>
    props.total >= 3 ? 'space-between' : 'space-evenly'};
  min-height: 17px;
`;

const Dot = styled.div`
  display: inline-block;
  justify-self: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: ${(props) => props.theme.cycles.pending};
`;

const running = (props) => keyframes`
  from { background-color: ${props.theme.cycles.pending}; }
  to { background-color: ${props.theme.cycles.complete}; }
`;

const Running = styled(Dot)`
  animation: ${running} 1s infinite alternate;
`;

const Pending = styled(Dot)`
  background-color: ${(props) => props.theme.cycles.pending};
`;

const Complete = styled(Dot)`
  background-color: ${(props) => props.theme.cycles.complete};
`;

const Cycle = ({ status }) => {
  let cycle;
  if (status === 'running' || status === 'paused') cycle = <Running />;
  else if (status === 'initial') cycle = <Pending />;
  else if (status === 'complete') cycle = <Complete />;

  return cycle;
};

const Cycles = ({ period, status, total }) => {
  const totalCycles = Math.ceil(total / 2);
  let cycles = [];
  let i = 0;
  while (cycles.length < totalCycles) {
    if (i % 2 === 0) {
      if (i === period) {
        cycles.push(<Cycle key={i / 2} status={status} />);
      } else if (i < period) {
        cycles.push(<Cycle key={i / 2} status={'complete'} />);
      } else if (i > period) {
        cycles.push(<Cycle key={i / 2} status={'initial'} />);
      }
    }

    i += 1; // Will skip odd indexes (aka breaks)
  }

  return <StyledCycles total={totalCycles}>{cycles}</StyledCycles>;
};

export default Cycles;
