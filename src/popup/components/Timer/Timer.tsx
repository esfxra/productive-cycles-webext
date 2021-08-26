import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import Section from '../Common/Section';
import Counter from './Counter';
import CycleController from './CycleController';
import InputController from './InputController';
import { Inputs, Status } from '../../../types';

const locale = {
  complete: chrome.i18n.getMessage('complete'),
  completeButton: chrome.i18n.getMessage('complete_button'),
};

const CompleteMessage = styled.div`
  margin-bottom: 18px;
  font-size: 16px;
  color: ${(props) => props.theme.foreground};
`;

const NewTimerButton = styled.div`
  margin-top: 20px;
  padding: 5px;
  font-size: 12px;
  text-align: center;
  border-radius: 5px;
  color: #ffffff;
  background-color: ${(props) => props.theme.button.main};
  cursor: pointer;
`;

export default function Timer(): JSX.Element {
  const port = useRef<chrome.runtime.Port>();
  const [time, setTime] = useState('25:00');
  const [period, setPeriod] = useState(0);
  const [status, setStatus] = useState<Status>('initial');
  const [total, setTotal] = useState(7);

  useEffect(() => {
    port.current = chrome.runtime.connect({ name: 'port-from-popup' });
    port.current.onMessage.addListener(handleMessage);
    port.current.postMessage({ command: 'preload' });

    return () => {
      if (port.current) {
        port.current.onMessage.removeListener(handleMessage);
        port.current.disconnect();
      } else {
        throw new Error('The messaging port was not present no unmount.');
      }
    };
  }, []);

  function handleMessage(message: {
    time: string;
    period: number;
    status: Status;
    totalPeriods: number;
  }) {
    setTime(message.time);
    setPeriod(message.period);
    setStatus(message.status);
    setTotal(message.totalPeriods);
  }

  function handleInput({ type }: { type: Inputs }) {
    if (port.current) {
      port.current.postMessage({ command: type });
    } else {
      throw new Error('The messaging port is not present.');
    }
  }

  const isComplete = period === total - 1 && status === 'complete';

  const normal = (
    <>
      <Counter remaining={time} />
      <InputController status={status} period={period} onInput={handleInput} />
      <CycleController status={status} period={period} totalPeriods={total} />
    </>
  );

  const complete = (
    <>
      <CompleteMessage>{locale['complete']}</CompleteMessage>
      <CycleController period={period} status={status} totalPeriods={total} />
      <NewTimerButton onClick={() => handleInput({ type: 'reset-all' })}>
        {locale['completeButton']}
      </NewTimerButton>
    </>
  );

  return <Section>{isComplete ? complete : normal}</Section>;
}
