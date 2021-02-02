'use strict';

import React from 'react';
import styled from 'styled-components';
import Section from './Common/Section';

const List = styled.ul`
  list-style-position: outside;
  padding-left: 24px;
  margin-bottom: 0;
`;

const Updates = () => {
  return (
    <Section width={350}>
      <h1>Updates</h1>
      <p>Welcome to version 0.5</p>

      <span>Release notes:</span>
      <List>
        <li>
          Fixed a stability issue that made the timer count at an abnormal rate
          🔧
        </li>
        <li>UI rewrite and tweaks 🎨</li>
      </List>
    </Section>
  );
};

export default Updates;
