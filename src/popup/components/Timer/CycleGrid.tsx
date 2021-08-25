import React from 'react';
import styled from 'styled-components';

interface Props {
  children: React.ReactNode;
  total: number;
}

const Grid = styled.div<{ total: number }>`
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

export default function CycleGrid({ children, total }: Props): JSX.Element {
  return <Grid total={total}>{children}</Grid>;
}
