import React from 'react';
import styled from 'styled-components';

interface Props {
  remaining: string;
}

const CounterWrapper = styled.div`
  margin-bottom: 25px;
  text-align: center;
`;

const CounterText = styled.div`
  height: 30px;
  font-family: 'Roboto Mono', monospace;
  font-size: 23px;
  color: ${(props) => props.theme.foreground};
`;

export default function Counter({ remaining }: Props) {
  return (
    <CounterWrapper>
      <CounterText>{remaining}</CounterText>
    </CounterWrapper>
  );
}
