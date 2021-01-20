'use strict';

import React from 'react';
import styled from 'styled-components';

const Options = styled.div`
  display: flex;
  flex-direction: row;
`;

const Theme = styled.div`
  cursor: pointer;
  width: 14px;
  height: 14px;
  margin-right: 5px;
  border-radius: 50%;
  background-color: ${(props) =>
    props.title === 'Light mode' ? '#f5f5f5' : '#202124'};
`;

const Appearance = ({ onChange }) => {
  return (
    <Options>
      <Theme
        alt="Light mode toggle"
        title="Light mode"
        onClick={() => onChange('light')}
      />
      <Theme
        alt="Dark mode toggle"
        title="Dark mode"
        onClick={() => onChange('dark')}
      />
    </Options>
  );
};

export default Appearance;
