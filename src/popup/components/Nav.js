'use strict';

import React, { useState } from 'react';
import styled from 'styled-components';

const StyledNav = styled.nav`
  width: 100%;
  min-height: 19px;
  margin-top: 11px;
  margin-bottom: 11px;
`;

const Menu = styled.div`
  position: relative;
  float: right;
  cursor: pointer;
`;

const MenuIcon = styled.div`
  padding: 0 7px;
  min-height: 19px;
  cursor: pointer;
`;

const Dot = styled.div`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  margin-bottom: 2px;
  display: block;
  background-color: #666666;
`;

const MenuList = styled.ul`
  position: absolute;
  list-style: none;
  text-transform: capitalize;
  margin-top: 2px;
  margin-left: 0;
  margin-right: -1px;
  margin-bottom: 0;
  padding: 0;
  z-index: 200;
  right: 0;
  border-radius: 5px;
  font-size: 12px;
  box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.14),
    0 2px 1px -1px rgba(0, 0, 0, 0.12), 0 1px 3px 0 rgba(0, 0, 0, 0.2);
  color: #ffffff;
  background-color: #b3b3b3;
`;

const MenuItem = styled.li`
  margin: 2px;
  padding: 5px 10px;

  &: hover {
    border-radius: 5px;
    background-color: #666666;
  }
`;

const Nav = ({ navigate }) => {
  const [open, setOpen] = useState(false);

  const toggleMenu = () => setOpen((open) => !open);

  return (
    <StyledNav>
      <Menu>
        <MenuIcon onClick={toggleMenu}>
          <Dot />
          <Dot />
          <Dot />
        </MenuIcon>
        {open && (
          <MenuList>
            <MenuItem onClick={() => navigate('timer')}>Timer</MenuItem>
            <MenuItem onClick={() => navigate('settings')}>Settings</MenuItem>
          </MenuList>
        )}
      </Menu>
    </StyledNav>
  );
};

export default Nav;
