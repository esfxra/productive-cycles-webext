'use strict';

import React from 'react';
import styled from 'styled-components';

const Options = styled.div`
  display: flex;
  flex-direction: row;
`;

const Theme = styled.div`
  width: 14px;
  height: 14px;
  margin-right: 5px;
  border-radius: 50%;
  border: 1px solid
    ${(props) =>
      props.selected === props.name
        ? props.theme.accent
        : props.theme.elevation};
  background-color: ${(props) =>
    props.name === 'light' ? '#eeeeee' : '#202124'};
  cursor: pointer;
`;

const Appearance = ({ selected, onChange }) => {
  return (
    <Options>
      <Theme
        name="light"
        alt="Light mode toggle"
        title="Light mode"
        selected={selected}
        onClick={() => onChange('light')}
      />
      <Theme
        name="dark"
        alt="Dark mode toggle"
        title="Dark mode"
        selected={selected}
        onClick={() => onChange('dark')}
      />
    </Options>
  );
};

export default Appearance;
