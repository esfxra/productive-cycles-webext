'use strict';

import React, { useContext } from 'react';
import { ThemeContext } from 'styled-components';
import menuLight from '../../assets/menu-light.svg';
import menuDark from '../../assets/menu-dark.svg';

const icon = {
  light: menuLight,
  dark: menuDark,
};

const NavIcon = () => {
  const theme = useContext(ThemeContext);

  return <img src={icon[theme.name]} />;
};

export default NavIcon;
