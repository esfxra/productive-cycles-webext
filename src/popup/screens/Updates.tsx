import React from 'react';
import MainLayout from '../components/MainLayout';

export default function UpdatesScreen(): JSX.Element {
  return (
    <MainLayout>
      <h1>Updates</h1>
      <p>Welcome to version 0.0.8</p>
      <ul>
        <li>Prep work for manifest v3 migration.</li>
        <li>Performance improvements.</li>
        <li>Tooltips.</li>
      </ul>
    </MainLayout>
  );
}
