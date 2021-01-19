'use strict';

import React from 'react';
import styled from 'styled-components';

const Box = styled.div`
  position: relative;
  display: block;
  border-style: solid;
  border-radius: 3px;
  border-width: 1px;
  height: 13px;
  width: 13px;
  margin: 0 auto;
  border-color: #666666;
  background-color: ${(props) => (props.checked ? '#666666' : '#ffffff')};
  cursor: pointer;
`;

const Checkmark = styled.div`
  &:after {
    content: '';
    position: absolute;
    display: block;
    left: 3px;
    top: 0px;
    width: 3px;
    height: 7px;
    border: solid white;
    border-radius: 1px;
    border-width: 0 3px 3px 0 !important;
    -webkit-transform: rotate(45deg);
    -ms-transform: rotate(45deg);
    transform: rotate(45deg);
  }
`;

const Checkbox = ({ checked, onChange }) => {
  return (
    <Box checked={checked} onClick={() => onChange(!checked)}>
      {checked && <Checkmark />}
    </Box>
  );
};

export default Checkbox;
