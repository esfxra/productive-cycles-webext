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
  text-align: center;
  box-shadow: none;
  font-family: 'Open Sans', sans-serif;
  font-size: 13px;
  padding: 3px;
  border-radius: 4px;
  border-width: 1px;
  border-style: solid;
  border-color: #ffffff;
  color: #666666;
  background-color: #f2f2f2;

  -moz-appearance: textfield;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &:focus {
    outline: none;
    border-color: ${(props) => (props.valid ? 'rgb(129, 65, 247)' : 'red')};
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
