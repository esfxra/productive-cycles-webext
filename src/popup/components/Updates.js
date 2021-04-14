"use strict";

import React from "react";
import styled from "styled-components";

import useLocale from "../hooks/useLocale";

import Section from "./Common/Section";

const List = styled.ul`
  list-style-position: outside;
  padding-left: 24px;
  margin-bottom: 0;
`;

const Item = styled.li`
  white-space: nowrap;
`;

const locale_set = [
  "updates",
  "updates_greeting",
  "updates_notes",
  "updates_update_1",
  "updates_update_2",
  "updates_update_3",
];

const Updates = () => {
  const locale = useLocale(locale_set);

  return (
    <Section>
      <h1>{locale["updates"]}</h1>
      <p>{locale["updates_greeting"]}</p>

      <span>{locale["updates_notes"]}</span>
      <List>
        <Item>{locale["updates_update_1"]}</Item>
        <Item>{locale["updates_update_2"]}</Item>
        <Item>{locale["updates_update_3"]}</Item>
      </List>
    </Section>
  );
};

export default Updates;
