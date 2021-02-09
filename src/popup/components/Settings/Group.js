'use strict';

import React from 'react';
import styled from 'styled-components';
import Section from '../Common/Section';
import Option from './Option';

const Separator = styled.div`
  width: 100%;
  height: 1px;
  padding: 0;
  margin: 13px 0;
  border-bottom: 1px dashed ${(props) => props.theme.foreground};
`;

const Group = ({ title, options, margin }) => {
  // Separate options by type
  let numbers = options.filter((option) => option.type === 'number');
  let checkboxes = options.filter((option) => option.type === 'checkbox');

  // Map number options to component
  numbers = mapOptions(numbers);

  // Map checkboxes options to component
  checkboxes = mapOptions(checkboxes);

  return (
    <Section margin={margin}>
      <h1>{title}</h1>

      {numbers}
      {numbers && checkboxes ? <Separator /> : null}
      {checkboxes}
    </Section>
  );
};

function mapOptions(options) {
  let result = null;

  if (options.length > 0) {
    result = options.map((x, i) => (
      <Option key={x.name} option={x} last={i === options.length - 1} />
    ));
  }

  return result;
}

export default Group;
