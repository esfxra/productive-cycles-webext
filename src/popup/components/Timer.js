'use strict';

import React, { useState, useEffect, useRef } from 'react';
import Section from './Common/Section';
import Counter from './Timer/Counter';
import Control from './Timer/Control';
import Cycles from './Timer/Cycles';

const Timer = () => {
  const port = useRef();
  const total = useRef(7);
  const [time, setTime] = useState('25:00');
  const [period, setPeriod] = useState(0);
  const [status, setStatus] = useState('initial');

  useEffect(() => {
    port.current = chrome.runtime.connect({ name: 'port-from-popup' });
    port.current.onMessage.addListener(handleMessage);
    port.current.postMessage({ command: 'preload' });
  });

  // Improvement: Use a reducer to handle the input
  const start = () => {
    port.current.postMessage({ command: 'start' });
  };

  const pause = () => {
    port.current.postMessage({ command: 'pause' });
  };

  const reset = () => {
    port.current.postMessage({ command: 'reset-cycle' });
  };

  const resetAll = () => {
    port.current.postMessage({ command: 'reset-all' });
  };

  const skip = () => {
    port.current.postMessage({ command: 'skip' });
  };

  return (
    <Section>
      <Counter time={time} />
      <Control
        period={period}
        status={status}
        start={start}
        pause={pause}
        reset={reset}
        resetAll={resetAll}
        skip={skip}
      />
      <Cycles period={period} status={status} totalPeriods={total.current} />
    </Section>
  );

  function handleMessage(message) {
    setTime(message.time);
    setPeriod(message.period);
    setStatus(message.status);
    total.current = message.totalPeriods;
  }
};

export default Timer;
