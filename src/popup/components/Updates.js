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
    <Section width={375}>
      <h1>{locale["updates"]}</h1>
      <p>{locale["updates_greeting"]}</p>

      <span>{locale["updates_notes"]}</span>
      <List>
        <li>{locale["updates_update_1"]}</li>
        <li>{locale["updates_update_2"]}</li>
        <li>{locale["updates_update_3"]}</li>
      </List>
    </Section>
  );
};

export default Updates;
