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
    <Section width={375}>
      <h1>Updates</h1>
      <p>Welcome to version 0.6</p>

      <span>Release notes:</span>
      <List>
        <li>New option to show the timer on top of the icon ⏱</li>
        <li>Adjusted colors in both the light and dark theme 🎨</li>
        <li>Simplified navigation ⚙️</li>
      </List>
    </Section>
  );
};

export default Updates;
