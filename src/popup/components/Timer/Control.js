'use strict';

import React from 'react';
import './Control.css';

const Start = ({ onClick }) => (
  <div id="start" className="control-button" onClick={onClick}>
    <img
      alt="start button"
      title="start"
      src="../assets/icons/control-start.svg"
    />
  </div>
);

const Pause = ({ onClick }) => (
  <div id="pause" className="control-button" onClick={onClick}>
    <img
      alt="pause button"
      title="pause"
      src="../assets/icons/control-pause.svg"
    />
  </div>
);

const Reset = ({ onClick }) => (
  <div id="reset-cycle" className="control-button" onClick={onClick}>
    <img
      alt="reset cycle button"
      title="reset cycle"
      src="../assets/icons/control-reset-cycle.svg"
    />
  </div>
);

const ResetAll = ({ onClick }) => (
  <div id="reset-all" className="control-button" onClick={onClick}>
    <img
      alt="reset all button"
      title="reset all"
      src="../assets/icons/control-reset-all.svg"
    />
  </div>
);

const Skip = ({ onClick }) => (
  <div id="skip" onClick={onClick}>
    skip break
  </div>
);

const Control = ({ period, status, start, pause, reset, resetAll, skip }) => {
  const isCycle = period % 2 === 0;

  return (
    <div className="control">
      {isCycle && (status === 'initial' || status === 'paused') && (
        <Start onClick={start} />
      )}
      {isCycle && status === 'running' && <Pause onClick={pause} />}
      {isCycle && <Reset onClick={reset} />}
      {isCycle && <ResetAll onClick={resetAll} />}
      {!isCycle && status === 'running' && <Skip onClick={skip} />}
    </div>
  );
};

export default Control;
