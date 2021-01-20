'use strict';

import React from 'react';
import styled from 'styled-components';

const StyledSection = styled.div`
  padding: 13px;
  margin-bottom: ${(props) => (props.margin ? '13px' : '0')};
  border-radius: 5px;
  background-color: ${(props) => props.theme.elevation};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
`;

const Section = ({ children, margin }) => {
  return <StyledSection margin={margin}>{children}</StyledSection>;
};

export default Section;
