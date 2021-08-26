import React from 'react';
import Section from '../components/Common/Section';

export default function Updates(): JSX.Element {
  return (
    <Section>
      <h1>Updates</h1>
      <p>Welcome to version 0.0.8</p>
      <ul>
        <li>Manifest v3 migration.</li>
        <li>Performance improvements.</li>
        <li>Tooltips?</li>
        <li>Stats page?</li>
      </ul>
    </Section>
  );
}
