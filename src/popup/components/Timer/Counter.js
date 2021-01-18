'use strict';

import React from 'react';
import styled from 'styled-components';

const StyledCounter = styled.div`
  margin-bottom: 25px;
  text-align: center;
`;

const Time = styled.div`
  font-family: 'Roboto Mono', monospace;
  min-height: 23px;
  font-size: 23px;
`;

const Counter = ({ time }) => {
  return (
    <StyledCounter>
      <Time>{time}</Time>
    </StyledCounter>
  );
};

export default Counter;
