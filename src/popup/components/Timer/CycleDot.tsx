import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Status } from '../../../types';

interface Props {
  cycle: number;
  status: Status;
}

export default function CycleDot({ cycle, status }: Props): JSX.Element {
  switch (status) {
    case Status.Running:
    case Status.Paused:
      return <Running cycle={cycle} />;
    case Status.Initial:
      return <Pending cycle={cycle} />;
    case Status.Complete:
      return <Complete cycle={cycle} />;
  }
}

const running = (props) => keyframes`
  from { background-color: ${props.theme.cycles.pending}; }
  to { background-color: ${props.theme.cycles.complete}; }
`;

const Dot = styled.div.attrs<{ cycle: number }>(({ cycle }) => ({
  title: `${chrome.i18n.getMessage('progress_dot')} ${cycle}`,
}))`
  display: inline-block;
  justify-self: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: ${(props) => props.theme.cycles.pending};
`;

const Running = styled(Dot)<{ cycle: number }>`
  animation: ${running} 1s infinite alternate;
`;

const Pending = styled(Dot)<{ cycle: number }>`
  background-color: ${(props) => props.theme.cycles.pending};
`;

const Complete = styled(Dot)<{ cycle: number }>`
  background-color: ${(props) => props.theme.cycles.complete};
`;
