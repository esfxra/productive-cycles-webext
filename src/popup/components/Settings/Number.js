'use strict';

import React, { useState } from 'react';
import styled from 'styled-components';

const Input = styled.input`
  padding: 3px;
  text-align: center;
  font-family: 'Open Sans', sans-serif;
  font-size: 13px;
  border-radius: 4px;
  border-width: 1px;
  border-style: solid;
  border-color: ${(props) => props.theme.elevation};
  color: ${(props) => props.theme.foreground};
  background-color: ${(props) => props.theme.input};
  box-shadow: none;

  -moz-appearance: textfield;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &:focus {
    outline: none;
    border-color: ${(props) => (props.valid ? props.theme.accent : 'red')};
  }
`;

const validate = (value, min, max) => {
  if (value === '') return { valid: false, value: '' }; // Prevents a NaN not handled by 'number' type input

  let parsed = parseInt(value);

  if (parsed < min || parsed > max) {
    return { valid: false, value: parsed };
  } else {
    return { valid: true, value: parsed };
  }
};

const Number = ({ value, min, max, onChange }) => {
  const [valid, setValid] = useState(true);

  const handleChange = (e) => {
    const result = validate(e.target.value, min, max);

    setValid(result.valid);
    onChange(result.valid, result.value);
  };

  return (
    <Input
      type="number"
      value={value}
      valid={valid}
      min={min}
      max={max}
      onChange={handleChange}
    />
  );
};

export default Number;
