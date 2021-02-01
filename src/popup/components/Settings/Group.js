'use strict';

import React from 'react';
import Section from '../Common/Section';
import Option from './Option';

const Group = ({ title, options, margin }) => {
  return (
    <Section margin={margin}>
      <h1>{title}</h1>

      {options.map((option, i) => (
        <Option
          key={option.name}
          name={option.name}
          type={option.type}
          storage={option.storage}
          margin={i === options.length - 1 ? false : true}
        />
      ))}
    </Section>
  );
};

export default Group;
