import React from 'react';
import styled from 'styled-components';

interface Props {
  type: 'light' | 'dark';
  isSelected: boolean;
  onClick: (theme: 'light' | 'dark') => void;
}

const locale = {
  light: chrome.i18n.getMessage('settings_appearance_light'),
  dark: chrome.i18n.getMessage('settings_appearance_dark'),
};

const Selector = styled.button`
  margin-right: 5px;
  padding: 0;
  border: none;
  background-color: transparent;
  cursor: pointer;
`;

const SelectorDot = styled.div<{ isSelected: boolean }>`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border-width: 1px;
  border-style: solid;
  border-color: ${(props) =>
    props.isSelected ? props.theme.accent : props.theme.elevation};
  background-clip: padding-box;
`;

const Light = styled(SelectorDot)`
  background-color: #eeeeee;
`;

const Dark = styled(SelectorDot)`
  background-color: #202124;
`;

export default function ThemeSelector({
  type,
  isSelected,
  onClick,
}: Props): JSX.Element {
  return (
    <Selector onClick={() => onClick(type)}>
      {type === 'light' ? (
        <Light isSelected={isSelected} title={locale['light']} />
      ) : (
        <Dark isSelected={isSelected} title={locale['dark']} />
      )}
    </Selector>
  );
}
