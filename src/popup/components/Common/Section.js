'use strict';

import React, { useContext } from 'react';
import styled from 'styled-components';
// import { ThemeContext } from '../Context/ThemeContext';

const StyledSection = styled.div`
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  border-radius: 5px;
  padding: 13px;
  margin-bottom: ${(props) => (props.margin ? '13px' : '0')};
  background-color: #ffffff;
`;

const Section = ({ children, margin }) => {
  // const theme = useContext(ThemeContext);
  return <StyledSection margin={margin}>{children}</StyledSection>;
};

export default Section;
