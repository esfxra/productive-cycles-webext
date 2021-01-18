'use strict';

import React from 'react';
import './Cycles.css';

const Cycle = ({ status }) => {
  console.log(`Status is ${status}`);
  let cycle;
  switch (status) {
    case 'running':
    case 'pause':
      cycle = <div className="cycle-dot running"></div>;
      break;
    case 'initial':
      cycle = <div className="cycle-dot pending"></div>;
      break;
    case 'complete':
      cycle = <div className="cycle-dot complete"></div>;
      break;
  }

  return cycle;
};

const Cycles = ({ period, status, totalPeriods }) => {
  const totalCycles = Math.ceil(totalPeriods / 2);
  let cycles = [];
  let i = 0;
  console.log(totalPeriods);
  while (cycles.length < totalCycles) {
    if (i % 2 === 0) {
      if (i === period) {
        cycles.push(<Cycle key={i / 2} status={status} />);
      } else if (i < period) {
        cycles.push(<Cycle key={i / 2} status={'complete'} />);
      } else if (i > period) {
        cycles.push(<Cycle key={i / 2} status={'initial'} />);
      }
    }

    i += 1; // Will skip odd indexes (aka breaks)
  }

  return <div className="cycles">{cycles}</div>;
};

export default Cycles;
