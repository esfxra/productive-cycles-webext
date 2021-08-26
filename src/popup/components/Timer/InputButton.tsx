import React from 'react';
import styled from 'styled-components';
import StartIcon from '../../assets/control-start.svg';
import PauseIcon from '../../assets/control-pause.svg';
import ResetIcon from '../../assets/control-reset-cycle.svg';
import ResetAllIcon from '../../assets/control-reset-all.svg';
import { CycleInputs } from '../../../types';

interface Props {
  type: CycleInputs;
  onClick: ({ type }: { type: string }) => void;
}

const locale = {
  start: chrome.i18n.getMessage('control_start'),
  pause: chrome.i18n.getMessage('control_pause'),
  'reset-cycle': chrome.i18n.getMessage('control_resetCycle'),
  'reset-all': chrome.i18n.getMessage('control_resetAll'),
};

const icons = {
  start: StartIcon,
  pause: PauseIcon,
  'reset-cycle': ResetIcon,
  'reset-all': ResetAllIcon,
};

const Button = styled.button<{ highlight: boolean }>`
  width: auto;
  padding: 0;
  border-width: 0;
  border-radius: 5px;
  background-color: ${(props) =>
    props.highlight ? props.theme.button.main : props.theme.button.alt};
  cursor: pointer;
`;

const Icon = styled.img.attrs((props) => ({
  src: props.src,
}))`
  display: block;
  width: 17px;
  height: 17px;
  padding: 4px;
`;

export default function InputButton({ type, onClick }: Props): JSX.Element {
  const highlight = type === 'start';

  return (
    <Button title={locale[type]} highlight={highlight} onClick={onClick}>
      <Icon src={icons[type]} />
    </Button>
  );
}
