import React from 'react';
import styled from 'styled-components';

interface Props {
  children: React.ReactNode;
}

const SectionCard = styled.div`
  width: 'auto';
  padding: 13px;
  margin-bottom: 13px;
  border-radius: 5px;
  background-color: ${(props) => props.theme.elevation};
  box-sizing: border-box;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  h1 {
    margin-top: 0;
    font-size: 14px;
    font-weight: 600;
    color: ${(props) => props.theme.foreground};
  }
  p,
  ul,
  li,
  span {
    font-size: 13px;
    color: ${(props) => props.theme.foreground};
  }

  &:last-of-type {
    margin-bottom: 0;
  }
`;

export default function Section({ children }: Props): JSX.Element {
  return <SectionCard>{children}</SectionCard>;
}
