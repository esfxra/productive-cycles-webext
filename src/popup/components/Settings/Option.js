'use strict';

import React from 'react';
import styled from 'styled-components';
import Checkbox from './Checkbox';
import Number from './Number';

const StyledOption = styled.div`
  display: grid;
  align-items: center;
  grid-template-columns: 120px 40px;
  column-gap: 15px;
  margin-bottom: ${(props) => (props.margin ? '13px' : '0')};
`;

const Input = ({ type, storage }) => {
  if (type === 'checkbox') return <Checkbox storage={storage} />;
  else if (type === 'number') return <Number storage={storage} />;
  else return null;
};

const Option = ({ option, last }) => {
  return (
    <StyledOption margin={!last}>
      <span>{option.name}</span>
      <Input type={option.type} storage={option.storage} />
    </StyledOption>
  );
};

export default Option;
