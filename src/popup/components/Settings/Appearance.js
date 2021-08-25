'use strict';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Section from '../Common/Section';

const Options = styled.div`
  display: flex;
  flex-direction: row;
`;

const Theme = styled.div`
  width: 14px;
  height: 14px;
  margin-right: 5px;
  border-radius: 50%;
  border: 1px solid
    ${(props) =>
      props.selected === props.name
        ? props.theme.accent
        : props.theme.elevation};
  background-color: ${(props) =>
    props.name === 'light' ? '#eeeeee' : '#202124'};
  background-clip: padding-box;
  cursor: pointer;
`;

const Appearance = ({ title, options, margin, onChange }) => {
  const storage = options.storage;

  const [theme, setTheme] = useState('light');

  useEffect(() => {
    chrome.storage.local.get([storage], (stored) => setTheme(stored[storage]));
  }, []);

  useEffect(() => {
    chrome.storage.local.set({ [storage]: theme });
    onChange(theme);
  }, [theme]);

  return (
    <Section margin={margin}>
      <h1>{title}</h1>

      <Options>
        <Theme
          name="light"
          title={options.name.light}
          selected={theme}
          onClick={() => setTheme('light')}
        />
        <Theme
          name="dark"
          title={options.name.dark}
          selected={theme}
          onClick={() => setTheme('dark')}
        />
      </Options>
    </Section>
  );
};

export default Appearance;
