'use strict';

import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

const StyledNav = styled.nav`
  width: 100%;
  min-height: 19px;
  padding-top: 11px;
  padding-bottom: 11px;
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
  background-color: ${(props) => props.theme.foreground};
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
  background-color: ${(props) => props.theme.menu};
`;

const MenuItem = styled.li`
  margin: 2px;
  padding: 5px 10px;

  &: hover {
    border-radius: 5px;
    background-color: ${(props) => props.theme.foreground};
  }
`;

const Nav = ({ navigate }) => {
  const [open, setOpen] = useState(false);
  const iconRef = useRef();
  const listRef = useRef();

  useEffect(() => {
    if (open) document.addEventListener('mousedown', handleOutsideClick);
    else document.removeEventListener('mousedown', handleOutsideClick);

    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [open]);

  const toggleMenu = () => setOpen((open) => !open);

  const navigateTo = (input) => {
    navigate(input);
    setOpen(false);
  };

  const handleOutsideClick = (e) => {
    const clickOnIcon = iconRef.current.contains(e.target);
    const clickOnList = listRef.current.contains(e.target);

    if (clickOnIcon || clickOnList) return;
    else setOpen(false);
  };

  return (
    <StyledNav>
      <Menu>
        <MenuIcon ref={iconRef} onClick={toggleMenu}>
          <Dot />
          <Dot />
          <Dot />
        </MenuIcon>
        {open && (
          <MenuList ref={listRef}>
            <MenuItem onClick={() => navigateTo('timer')}>Timer</MenuItem>
            <MenuItem onClick={() => navigateTo('settings')}>Settings</MenuItem>
          </MenuList>
        )}
      </Menu>
    </StyledNav>
  );
};

export default Nav;
