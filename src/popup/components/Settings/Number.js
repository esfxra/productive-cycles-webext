'use strict';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const boundaries = {
  cycleMinutes: { min: 1, max: 59 },
  breakMinutes: { min: 1, max: 59 },
  totalCycles: { min: 1, max: 8 },
};

const NumberInput = styled.input`
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

const Number = ({ storage }) => {
  const [number, setNumber] = useState({ value: 0, valid: true });

  // Get stored value when the Number component is loaded
  useEffect(() => {
    chrome.storage.local.get(storage, (stored) => {
      setNumber((number) => ({ valid: number.valid, value: stored[storage] }));
    });
  }, []);

  // Update stored value when the state is updated, and if the input is valid
  useEffect(() => {
    if (number.valid) chrome.storage.local.set({ [storage]: number.value });
  }, [number]);

  // Match boundaries
  const min = boundaries[storage].min;
  const max = boundaries[storage].max;

  // Handle changes in input field
  const handleChange = (e) => {
    const result = validate(e.target.value, min, max);
    setNumber(result);
  };

  return (
    <NumberInput
      type="number"
      value={number.value}
      valid={number.valid}
      min={min}
      max={max}
      onChange={handleChange}
    />
  );
};

export default Number;
