'use strict';

import React, { useState, useEffect } from 'react';
import './Nav.css';

const Icon = ({ onClick }) => (
  <div className="nav-menu-icon" onClick={onClick}>
    <div class="nav-menu-icon-dot"></div>
    <div class="nav-menu-icon-dot"></div>
    <div class="nav-menu-icon-dot"></div>
  </div>
);

const NavList = () => (
  <ul className="nav-list">
    <li>Timer</li>
    <li>Settings</li>
  </ul>
);

const Nav = () => {
  const [open, setOpen] = useState(false);

  const openMenu = () => setOpen((open) => !open);

  return (
    <nav>
      <div id="nav-menu">
        <Icon onClick={openMenu} />
        {open && <NavList />}
      </div>
    </nav>
  );
};

export default Nav;
