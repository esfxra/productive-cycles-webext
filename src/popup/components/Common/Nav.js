'use strict';

import React, { useContext } from 'react';
import styled, { ThemeContext } from 'styled-components';
import settingsLight from '../../assets/settings-light.svg';
import settingsDark from '../../assets/settings-dark.svg';
import backLight from '../../assets/back-light.svg';
import backDark from '../../assets/back-dark.svg';

// Objects acting as dictionaries to trace image according to theme
const settings = {
  icon: { light: settingsLight, dark: settingsDark },
  text: chrome.i18n.getMessage('nav_settings'),
};
const back = {
  icon: { light: backLight, dark: backDark },
  text: chrome.i18n.getMessage('nav_back'),
};

// Styled wrappers
const StyledNav = styled.nav`
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

// Settings icon
const Settings = ({ theme }) => (
  <img src={settings.icon[theme.name]} title={settings.text} />
);

// Back icon
const Back = ({ theme }) => (
  <img src={back.icon[theme.name]} title={back.text} />
);

// Main Nav component
const Nav = ({ view, navigate }) => {
  const theme = useContext(ThemeContext);

  const target = determineTarget(view);
  const icon = determineIcon(view, theme);

  return (
    <StyledNav>
      <IconWrapper onClick={() => navigate(target)}>{icon}</IconWrapper>
    </StyledNav>
  );
};

// Helper functions
function determineTarget(view) {
  if (view === 'timer') return 'settings';
  else return 'timer';
}

function determineIcon(view, theme) {
  if (view === 'timer') return <Settings theme={theme} />;
  else return <Back theme={theme} />;
}

export default Nav;
