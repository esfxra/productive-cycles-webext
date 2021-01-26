'use strict';

import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import Section from './Common/Section';
import Counter from './Timer/Counter';
import Control from './Timer/Control';
import Cycles from './Timer/Cycles';

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
  background-color: ${(props) => props.theme.button};
  cursor: pointer;
`;

const Timer = () => {
  const port = useRef();
  const [time, setTime] = useState('25:00');
  const [period, setPeriod] = useState(0);
  const [status, setStatus] = useState('initial');
  const [total, setTotal] = useState(7);

  useEffect(() => {
    port.current = chrome.runtime.connect({ name: 'port-from-popup' });
    port.current.onMessage.addListener(handleMessage);
    port.current.postMessage({ command: 'preload' });

    return () => {
      port.current.onMessage.removeListener(handleMessage);
      port.current.disconnect();
    };
  }, []);

  const handleMessage = (message) => {
    setTime(message.time);
    setPeriod(message.period);
    setStatus(message.status);
    setTotal(message.totalPeriods);
  };

  const handleInput = (input) => {
    port.current.postMessage({ command: input.command });
  };

  const isComplete = period === total - 1 && status === 'complete';

  const normal = (
    <>
      <Counter time={time} />
      <Control period={period} status={status} handleInput={handleInput} />
      <Cycles period={period} status={status} total={total} />
    </>
  );

  const complete = (
    <>
      <CompleteMessage>Timer complete&nbsp;&nbsp;🎉</CompleteMessage>
      <Cycles period={period} status={status} total={total} />
      <NewTimerButton onClick={() => handleInput({ command: 'reset-all' })}>
        New timer
      </NewTimerButton>
    </>
  );

  return <Section width={140}>{isComplete ? complete : normal}</Section>;
};

export default Timer;
