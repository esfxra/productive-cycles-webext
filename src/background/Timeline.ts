import Storage from './Storage';
import { Participant } from '../types';

export default class Timeline implements Participant {
  mediator;

  constructor() {
    this.mediator = null;
  }

  public onStart = ({ status }) => {
    Storage.setState({ status });
  };

  public onPause = ({ status }) => {
    Storage.setState({ status });
  };

  public onSkip = ({ status, period }) => {
    Storage.setState({ status, period });
  };

  public onResetCycle = ({ status, period }) => {
    Storage.setState({ status, period });
  };

  public onResetAll = ({ status, period }) => {
    Storage.setState({ status, period });
  };

  public onEnd = ({ status, period }) => {
    Storage.setState({ status, period });
  };
}

// function calculateNewTargets(
//   period: number,
//   remaining: number,
//   totalPeriods: number,
//   cycleMinutes: number,
//   breakMinutes: number
// ): number[] {
//   const targets = [];
//   for (let idx = 0; idx < totalPeriods; idx += 1) {
//     // Set 0 for periods that have already occurred
//     if (idx < period) {
//       targets.push(0);
//       continue;
//     }

//     // Use time left in current period
//     if (idx === period) {
//       targets.push(remaining + Date.now());
//       continue;
//     }

//     // Use previous target value and corresponding type duration
//     const isCycle = idx % 2 === 0;
//     const previous = targets[idx - 1];
//     if (isCycle) {
//       targets.push(previous + cycleMinutes * 60000 + Date.now());
//     } else {
//       targets.push(previous + breakMinutes * 60000 + Date.now());
//     }
//   }

//   return targets;
// }
