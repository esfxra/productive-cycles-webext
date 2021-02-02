'use strict';

import React, { useContext } from 'react';
import styled, { ThemeContext } from 'styled-components';
import menuLight from '../../assets/menu-light.svg';
import menuDark from '../../assets/menu-dark.svg';

const icon = {
  light: menuLight,
  dark: menuDark,
};

const IconWrapper = styled.div`
  min-height: 19px;
  padding: 0 3px;
  cursor: pointer;
`;

const MenuIcon = () => {
  const theme = useContext(ThemeContext);

  return (
    <IconWrapper>
      <img src={icon[theme.name]} />
    </IconWrapper>
  );
};

export default MenuIcon;
