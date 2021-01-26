'use strict';

import React from 'react';
import styled from 'styled-components';

const StyledSection = styled.div`
  width: ${(props) => (props.width ? `${props.width}px` : 'auto')};
  padding: 13px;
  margin-bottom: ${(props) => (props.margin ? '13px' : '0')};
  border-radius: 5px;
  background-color: ${(props) => props.theme.elevation};
  box-sizing: border-box;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
`;

const Section = ({ children, width, margin }) => {
  return (
    <StyledSection width={width} margin={margin}>
      {children}
    </StyledSection>
  );
};

export default Section;
