import React from 'react';
import Section from './Common/Section';

interface Props {
  children: React.ReactNode;
}

export default function MainLayout({ children }: Props): JSX.Element {
  return <Section>{children}</Section>;
}
