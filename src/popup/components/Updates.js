'use strict';

import React from 'react';
import Section from './Common/Section';
import styled from 'styled-components';

const Updates = () => {
  return (
    <Section>
      <h1>Updates</h1>
      <p>Welcome to version 0.4</p>
      <p>
        This release is a complete rewrite of the codebase, and it includes many
        under the hood improvements
      </p>
      <span>Release notes:</span>
      <ul>
        <li>
          Changes to minutes while the timer is running are now queued; the
          timer will not reset 🕗
        </li>
        <li>More ways to configure automatic start 🔁</li>
        <li>Option to disable notifications ⏹</li>
        <li>Bug fixes 🐞</li>
      </ul>
    </Section>
  );
};

export default Updates;
