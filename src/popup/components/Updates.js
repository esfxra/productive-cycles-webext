'use strict';

import React from 'react';
import styled from 'styled-components';
import Section from './Common/Section';

const List = styled.ul`
  list-style-position: outside;
  padding-left: 24px;
  margin-bottom: 0;
`;

const locale = {
  title: chrome.i18n.getMessage('updates'),
  greeting: chrome.i18n.getMessage('updates_greeting', '0.6'),
  notes: chrome.i18n.getMessage('updates_notes'),
  update_1: chrome.i18n.getMessage('updates_update_1'),
  update_2: chrome.i18n.getMessage('updates_update_2'),
  update_3: chrome.i18n.getMessage('updates_update_3'),
};

const Updates = () => {
  return (
    <Section width={375}>
      <h1>{locale.title}</h1>
      <p>{locale.greeting}</p>

      <span>{locale.notes}</span>
      <List>
        <li>{locale.update_1}</li>
        <li>{locale.update_2}</li>
        <li>{locale.update_3}</li>
      </List>
    </Section>
  );
};

export default Updates;
