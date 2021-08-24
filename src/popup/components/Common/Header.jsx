import React, { useContext } from 'react';
import styled, { ThemeContext } from 'styled-components';

import useLocale from '../../hooks/useLocale';

import settingsLight from '../../assets/settings-light.svg';
import settingsDark from '../../assets/settings-dark.svg';
import backLight from '../../assets/back-light.svg';
import backDark from '../../assets/back-dark.svg';

const locale_set = ['nav_settings', 'nav_back'];

// Objects acting as dictionaries to trace image according to theme
const settings = {
  icon: { light: settingsLight, dark: settingsDark },
};
const back = {
  icon: { light: backLight, dark: backDark },
};

// Settings icon
const Settings = ({ theme, title }) => (
  <img src={settings.icon[theme.name]} title={title} />
);

// Back icon
const Back = ({ theme, title }) => (
  <img src={back.icon[theme.name]} title={title} />
);

// Main Nav component
export default function Header({ view, navigate }) {
  const theme = useContext(ThemeContext);
  const locale = useLocale(locale_set);

  const target = determineTarget(view);
  const icon = determineIcon(view, theme, locale);

  return (
    <StyledHeader>
      <IconWrapper onClick={() => navigate(target)}>{icon}</IconWrapper>
    </StyledHeader>
  );
}

// Helper functions
function determineTarget(view) {
  if (view === 'timer') return 'settings';
  else return 'timer';
}

function determineIcon(view, theme, locale) {
  if (view === 'timer')
    return <Settings theme={theme} title={locale['nav_settings']} />;
  else return <Back theme={theme} title={locale['nav_back']} />;
}

// Styled wrappers
const StyledHeader = styled.nav`
  width: 100%;
  height: 21px;
  padding-top: 10px;
  padding-bottom: 10px;
`;
const IconWrapper = styled.div`
  float: right;
  height: 21px;
  padding: 0 3px;
  cursor: pointer;
`;
