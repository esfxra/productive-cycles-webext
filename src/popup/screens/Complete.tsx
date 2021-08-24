import React from 'react';
import styled from 'styled-components';
import MainLayout from '../components/MainLayout';
import useLocale from '../hooks/useLocale';

const LOCALE_SET = ['complete', 'complete_button'];

const CompleteMessage = styled.div`
  margin-bottom: 18px;
  font-size: 16px;
  color: ${(props) => props.theme.foreground};
`;

const NewTimerButton = styled.button`
  margin-top: 20px;
  padding: 5px;
  font-size: 12px;
  text-align: center;
  border-radius: 5px;
  color: #ffffff;
  background-color: ${(props) => props.theme.button.main};
  cursor: pointer;
`;

export default function CompleteScreen(): JSX.Element {
  const locale = useLocale(LOCALE_SET);

  return (
    <MainLayout>
      <CompleteMessage>{locale['complete']}</CompleteMessage>
      {/* <Cycles period={period} status={Status.Complete} total={totalPeriods} /> */}
      <NewTimerButton>{locale['complete_button']}</NewTimerButton>
    </MainLayout>
  );
}
