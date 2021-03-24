"use strict";

import React from "react";
import styled from "styled-components";

const StyledCounter = styled.div`
  margin-bottom: 25px;
  text-align: center;
`;

const Time = styled.div`
  height: 30px;
  font-family: "Roboto Mono", monospace;
  font-size: 23px;
  color: ${(props) => props.theme.foreground};
`;

const Counter = ({ time }) => {
  return (
    <StyledCounter>
      <Time>{time}</Time>
    </StyledCounter>
  );
};

export default Counter;
