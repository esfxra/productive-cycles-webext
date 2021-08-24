'use strict';

import React from 'react';
import styled from 'styled-components';
import Checkbox from './Checkbox';
import Number from './Number';

const StyledOption = styled.div`
  max-width: 190px;
  display: grid;
  align-items: center;
  grid-template-columns: 1fr 40px;
  column-gap: 10px;
  margin-bottom: ${(props) => (props.margin ? '13px' : '0')};
  white-space: ${(props) => (props.noWrap ? 'normal' : 'nowrap')};
`;

const Input = ({ type, storage }) => {
  if (type === 'checkbox') return <Checkbox storage={storage} />;
  else if (type === 'number') return <Number storage={storage} />;
  else return null;
};

const Option = ({ option, last }) => {
  const noWrap = option.storage === 'badgeTimer';

  return (
    <StyledOption margin={!last} noWrap={noWrap}>
      <span>{option.name}</span>
      <Input type={option.type} storage={option.storage} />
    </StyledOption>
  );
};

export default Option;
