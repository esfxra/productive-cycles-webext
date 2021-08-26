import React, { ChangeEvent, useEffect, useState } from 'react';
import styled from 'styled-components';

interface Props {
  value: number;
  updateValue: (value: number) => void;
  min: number;
  max: number;
}

const Input = styled.input<{ isValid: boolean }>`
  padding: 3px;
  text-align: center;
  font-family: 'Open Sans', sans-serif;
  font-size: 13px;
  border-radius: 4px;
  border-width: 1px;
  border-style: solid;
  border-color: ${(props) => props.theme.elevation};
  color: ${(props) => props.theme.foreground};
  background-color: ${(props) => props.theme.settings.number};
  background-clip: padding-box;
  box-shadow: none;

  -moz-appearance: textfield;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &:focus {
    outline: none;
    border-color: ${(props) => (props.isValid ? props.theme.accent : 'red')};
  }
`;

function validate(number: string, min: number, max: number) {
  // Prevent a NaN from attempting to parse an empty string to a number
  if (number === '') {
    return { valid: false, value: '' };
  }

  // Parse the string to an integer
  const parsed = parseInt(number, 10);

  // Check if the parsed number is within range
  if (parsed < min || parsed > max) {
    return { valid: false, value: parsed };
  }

  return { valid: true, value: parsed };
}

export default function NumberInput({
  value,
  updateValue,
  min,
  max,
}: Props): JSX.Element {
  const [number, setNumber] = useState(String(value));
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setNumber(String(value));
  }, [value]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const numStr = event.target.value;
    const result = validate(numStr, min, max);

    if (result.valid && typeof result.value === 'number') {
      updateValue(result.value);
    }

    setIsValid(result.valid);
    setNumber(numStr);
  }

  return (
    <Input
      type="number"
      value={number}
      isValid={isValid}
      min={min}
      max={max}
      onChange={handleChange}
    />
  );
}
