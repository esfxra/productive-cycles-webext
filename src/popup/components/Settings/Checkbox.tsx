import React from 'react';
import styled from 'styled-components';

interface Props {
  isChecked: boolean;
  onClick: () => void;
}

const Box = styled.div<{ isChecked: boolean }>`
  position: relative;
  display: block;
  height: 13px;
  width: 13px;
  margin: 0 auto;
  border-style: solid;
  border-radius: 3px;
  border-width: 1px;
  border-color: ${(props) =>
    props.isChecked ? props.theme.settings.checkbox : props.theme.foreground};
  background-color: ${(props) =>
    props.isChecked ? props.theme.settings.checkbox : props.theme.elevation};
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
    border: solid ${(props) => props.theme.settings.checkmark};
    border-radius: 1px;
    border-width: 0 3px 3px 0 !important;
    transform: rotate(45deg);
  }
`;

export default function Checkbox({ isChecked, onClick }: Props): JSX.Element {
  return (
    <Box isChecked={isChecked} onClick={onClick}>
      {isChecked && <Checkmark />}
    </Box>
  );
}
