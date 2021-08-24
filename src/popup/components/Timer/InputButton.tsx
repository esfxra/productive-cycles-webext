import React from 'react';
import styled from 'styled-components';
import startIcon from '../../assets/control-start.svg';
import pauseIcon from '../../assets/control-pause.svg';
import resetIcon from '../../assets/control-reset-cycle.svg';
import resetAllIcon from '../../assets/control-reset-all.svg';
import { INPUT } from '../../../defaults';
import { Inputs } from '../../../types';

const locale = {
  Start: chrome.i18n.getMessage('control_start'),
  Pause: chrome.i18n.getMessage('control_pause'),
  ResetCycle: chrome.i18n.getMessage('control_resetCycle'),
  ResetAll: chrome.i18n.getMessage('control_resetAll'),
};

const icons = {
  Start: startIcon,
  Pause: pauseIcon,
  ResetCycle: resetIcon,
  ResetAll: resetAllIcon,
};

interface Props {
  type: Inputs;
  onClick: ({ type }: { type: string }) => void;
}

export default function InputButton({ type, onClick }: Props): JSX.Element {
  const highlight = type === INPUT.Start;

  return (
    <Button title={locale[type]} highlight={highlight} onClick={onClick}>
      <Icon src={icons[type]} />
    </Button>
  );
}

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
