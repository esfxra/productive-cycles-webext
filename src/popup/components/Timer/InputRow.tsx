import React from 'react';
import styled from 'styled-components';

interface Props {
  children: React.ReactNode;
}

const Row = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  top: -2px;
  width: 100%;
  margin-bottom: 25px;
`;

export default function InputRow({ children }: Props): JSX.Element {
  return <Row>{children}</Row>;
}
