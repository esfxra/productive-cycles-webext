import React, { useContext } from 'react';
import styled, { ThemeContext } from 'styled-components';
import NavIcon from './NavIcon';
import { Views } from '../../../types';

interface Props {
  view: Views;
  navigate: (view: Views) => void;
}

const Header = styled.nav`
  width: 100%;
  height: 21px;
  padding-top: 10px;
  padding-bottom: 10px;
`;

const ClickableWrapper = styled.div`
  float: right;
  height: 21px;
  padding: 0 3px;
  cursor: pointer;
`;

function determineTarget(view: Views) {
  if (view === 'timer') {
    return 'settings';
  }

  return 'timer';
}

export default function Nav({ view, navigate }: Props): JSX.Element {
  const theme = useContext(ThemeContext);
  const target = determineTarget(view);

  return (
    <Header>
      <ClickableWrapper onClick={() => navigate(target)}>
        <NavIcon view={view} theme={theme.name as 'light' | 'dark'} />
      </ClickableWrapper>
    </Header>
  );
}
