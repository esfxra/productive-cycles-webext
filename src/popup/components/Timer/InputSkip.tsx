import React from 'react';
import styled from 'styled-components';

interface Props {
  onClick: ({ type }: { type: string }) => void;
}

const locale = { skip: chrome.i18n.getMessage('control_skipBreak') };

const Skip = styled.button`
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

export default function InputSkip({ onClick }: Props): JSX.Element {
  return <Skip onClick={onClick}>{locale.skip}</Skip>;
}
