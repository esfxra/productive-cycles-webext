import React from 'react';
import styled, { DefaultTheme, keyframes } from 'styled-components';
import { Status } from '../../../types';

interface Props {
  cycle: number;
  status: Status;
}

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

const runningKeyframes = (props: { theme: DefaultTheme }) => keyframes`
  from { background-color: ${props.theme.cycles.pending}; }
  to { background-color: ${props.theme.cycles.complete}; }
`;

const Running = styled(Dot)<{ cycle: number }>`
  animation: ${runningKeyframes} 1s infinite alternate;
`;

const Pending = styled(Dot)<{ cycle: number }>`
  background-color: ${(props) => props.theme.cycles.pending};
`;

const Complete = styled(Dot)<{ cycle: number }>`
  background-color: ${(props) => props.theme.cycles.complete};
`;

/**
 * Render a Dot representing the timer's cycles.
 * Distinguishes between 'current', 'pending', and 'complete' per the cycle status.
 */
export default function CycleDot({ cycle, status }: Props): JSX.Element {
  switch (status) {
    case 'running':
    case 'paused':
      // The case for the current cycle
      return <Running cycle={cycle} />;
    case 'initial':
      // The case for pending ones
      return <Pending cycle={cycle} />;
    case 'complete':
      // The case for those that are complete
      return <Complete cycle={cycle} />;
  }
}
