'use strict';

import React from 'react';
import styled from 'styled-components';

const Box = styled.div`
  position: relative;
  display: block;
  height: 13px;
  width: 13px;
  margin: 0 auto;
  border-style: solid;
  border-radius: 3px;
  border-width: 1px;
  border-color: ${(props) => props.theme.foreground};
  background-color: ${(props) =>
    props.checked ? props.theme.foreground : props.theme.elevation};
  cursor: pointer;
`;

const Checkmark = styled.div`
  &:after {
    content: '';
    position: absolute;
    left: 3px;
    top: 0px;
    display: block;
    width: 3px;
    height: 7px;
    border: solid ${(props) => props.theme.elevation};
    border-radius: 1px;
    border-width: 0 3px 3px 0 !important;
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
