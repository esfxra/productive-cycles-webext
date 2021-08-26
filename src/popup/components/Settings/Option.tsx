import React from 'react';
import styled from 'styled-components';

interface Props {
  children: React.ReactNode;
}

const OptionGrid = styled.div`
  max-width: 190px;
  display: grid;
  align-items: center;
  grid-template-columns: 1fr 40px;
  column-gap: 10px;
  margin-bottom: 13px;

  &:last-of-type {
    margin-bottom: 0;
  }
`;

/**
 * @todo Implement automatic width for all locales.
 * Note that at the moment max-width is set to 190px.
 * This prevents flexibility starting at that value.
 */
export default function Option({ children }: Props): JSX.Element {
  return <OptionGrid>{children}</OptionGrid>;
}
