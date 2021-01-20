'use strict';

import React, { useState } from 'react';
import styled from 'styled-components';

const Input = styled.input.attrs((props) => ({
  type: 'number',
  value: props.value,
  min: props.min,
  max: props.max,
  onChange: props.onChange,
}))`
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
  if (isNaN(value)) {
    return { valid: false, value: value };
  } else if (typeof value === 'string' && value === '') {
    return { valid: false, value: '' };
  }

  let parsed;
  if (typeof value !== 'number') parsed = parseInt(value);

  if (parsed < min || parsed > max) {
    return { valid: false, value: parsed };
  } else {
    return { valid: true, value: parsed };
  }
};

const NumberInput = ({ value, min, max, onChange }) => {
  const [valid, setValid] = useState(true);

  const handleChange = (e) => {
    const result = validate(e.target.value, min, max);

    onChange(result.valid, result.value);
    setValid(result.valid);
  };

  return (
    <Input
      value={value}
      valid={valid}
      min={min}
      max={max}
      onChange={handleChange}
    />
  );
};

export default NumberInput;
