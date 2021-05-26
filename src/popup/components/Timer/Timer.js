"use strict";

import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import Section from "../Common/Section";
import Counter from "./Counter";
import Control from "./Control";
import Cycles from "./Cycles";
import useLocale from "../../hooks/useLocale";
import { Input, Status } from "../../../shared-types";

const locale_set = ["complete", "complete_button"];

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

const Timer = () => {
  const port = useRef();
  const [time, setTime] = useState("25:00");
  const [period, setPeriod] = useState(0);
  const [status, setStatus] = useState(Status.Initial);
  const [total, setTotal] = useState(7);
  const locale = useLocale(locale_set);

  useEffect(() => {
    port.current = chrome.runtime.connect({ name: "port-from-popup" });
    port.current.onMessage.addListener(handleMessage);
    port.current.postMessage({ command: Input.Preload });

    return () => {
      port.current.onMessage.removeListener(handleMessage);
      port.current.disconnect();
    };
  }, []);

  const handleMessage = (message) => {
    console.log("Received new message");
    console.log(message);

    setTime(message.remaining);
    setStatus(message.status);
    setPeriod(message.index);
    setTotal(message.totalPeriods);
  };

  const handleInput = (input) => {
    port.current.postMessage({ command: input.command });
  };

  const isComplete = period === total - 1 && status === Status.Complete;

  const normal = (
    <>
      <Counter time={time} />
      <Control period={period} status={status} handleInput={handleInput} />
      <Cycles period={period} status={status} total={total} />
    </>
  );

  const complete = (
    <>
      <CompleteMessage>{locale["complete"]}</CompleteMessage>
      <Cycles period={period} status={status} total={total} />
      <NewTimerButton onClick={() => handleInput({ command: Input.ResetAll })}>
        {locale["complete_button"]}
      </NewTimerButton>
    </>
  );

  return <Section width={140}>{isComplete ? complete : normal}</Section>;
};

export default Timer;
