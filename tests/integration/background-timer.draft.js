// import { Timer } from '../src/background/background-timer.js';
// const defaultValues = {
//   cycleMinutes: 25,
//   breakMinutes: 5,
//   totalCycles: 4,
//   autoStart: true,
// };

// describe('Timer state machine', () => {
//   let timer;
//   let buildTimeline;
//   let setState;
//   let runSubtractor;
//   beforeAll(() => {
//     timer = new Timer(defaultValues);
//     timer.state.time = timer.settings.cycleTime;
//     // Spies
//     buildTimeline = jest.spyOn(timer, 'buildTimeline');
//     setState = jest.spyOn(timer, 'setState');
//     runSubtractor = jest.spyOn(timer, 'runSubtractor');
//   });
//   beforeEach(() => {
//     // Reset calls and instances of methods with spies
//     // buildTimeline.mockClear();
//     // setState.mockClear();
//     // runSubtractor.mockClear();
//   });

//   test('Starts and completes first cycle', () => {
//     jest.useFakeTimers();
//     timer.startCycle();

//     expect(timer.state.status).toBe('running');

//     // Advance the timer
//     let i = 1;
//     while (i < timer.settings.cycleTime / 1000) {
//       jest.advanceTimersByTime(1000);
//       i += 1;
//     }

//     expect(timer.state.time).toBe(0);

//     // Force next period (first break)
//     jest.advanceTimersByTime(1000);
//   });

//   test('Starts and completes first break', () => {
//     jest.useFakeTimers();

//     expect(timer.state.status).toBe('break');

//     // Advance the timer
//     let i = 1;
//     while (i < timer.settings.breakTime / 1000) {
//       jest.advanceTimersByTime(1000);
//       i += 1;
//     }

//     expect(timer.state.time).toBe(0);

//     // Force next period (second cycle)
//     jest.advanceTimersByTime(1000);
//   });
// });

// import { Timer } from '../src/background/background-timer.js';
// const defaultValues = {
//   cycleMinutes: 25,
//   breakMinutes: 5,
//   totalCycles: 4,
//   autoStart: true,
// };

// describe('Cycle start', () => {
//   let timer;
//   let buildTimeline;
//   let setState;
//   let runSubtractor;
//   beforeAll(() => {
//     timer = new Timer(defaultValues);
//     // Spies
//     buildTimeline = jest.spyOn(timer, 'buildTimeline');
//     setState = jest.spyOn(timer, 'setState');
//     runSubtractor = jest
//       .spyOn(timer, 'runSubtractor')
//       .mockImplementation(() => {});
//   });
//   beforeEach(() => {
//     timer.resetAll();

//     // Reset calls and instances of methods with spies
//     buildTimeline.mockClear();
//     setState.mockClear();
//     runSubtractor.mockClear();
//   });

//   test('Correctly handles initial state', () => {
//     // Start the timer
//     timer.startCycle();

//     // Check number of calls
//     expect(buildTimeline).toHaveBeenCalledTimes(1);
//     expect(setState).toHaveBeenCalledTimes(1);
//     expect(runSubtractor).toHaveBeenCalledTimes(1);

//     // Check updated values
//     expect(timer.state.status).toBe('running');
//   });

//   test('Correctly handles paused state', () => {
//     // Setup
//     timer.state.status = 'paused';

//     // Start the timer
//     timer.startCycle();

//     // Check number of calls
//     expect(buildTimeline).toHaveBeenCalledTimes(1);
//     expect(setState).toHaveBeenCalledTimes(1);
//     expect(timer.runSubtractor).toHaveBeenCalledTimes(1);

//     // Check updated values
//     expect(timer.state.status).toBe('running');
//   });

//   test('Correctly handles autoStart after break', () => {
//     // Setup
//     timer.state.status = 'break';
//     timer.settings.autoStart = true;

//     // Start the timer
//     timer.startCycle();

//     // Check number of calls
//     expect(buildTimeline).toHaveBeenCalledTimes(0);
//     expect(setState).toHaveBeenCalledTimes(1);
//     expect(timer.runSubtractor).toHaveBeenCalledTimes(1);

//     // Check updated values
//     expect(timer.state.status).toBe('running');
//   });
// });

// describe('Cycle pause', () => {
//   let timer;
//   beforeAll(() => (timer = new Timer(defaultValues)));
//   beforeEach(() => timer.resetAll());

//   test('Correctly pauses the timer', () => {
//     // Spies
//     const setState = jest.spyOn(timer, 'setState');
//     const stopSubtractor = jest.spyOn(timer, 'stopSubtractor');

//     // Start the timer
//     timer.pauseCycle();

//     // Tests
//     expect(setState).toHaveBeenCalledTimes(1);
//     expect(stopSubtractor).toHaveBeenCalledTimes(1);
//     expect(timer.state.status).toBe('paused');
//   });
// });

// describe('Cycle end', () => {
//   let timer;
//   beforeAll(() => (timer = new Timer(defaultValues)));
//   beforeEach(() => timer.resetAll());

//   test('Correctly ends the current cycle', () => {
//     // Spies
//     const notify = jest.spyOn(timer.notifications, 'notify');
//     const startBreak = jest
//       .spyOn(timer, 'startBreak')
//       .mockImplementation(() => {});

//     // Setup
//     const prevPeriod = timer.state.period;

//     // End the cycle
//     timer.endCycle();

//     // Tests
//     expect(notify).toHaveBeenCalledTimes(1);
//     expect(startBreak).toHaveBeenCalledTimes(1);
//     expect(timer.state.period).toBe(prevPeriod + 1);
//     expect(timer.state.time).toBe(timer.settings.breakTime);
//   });
// });

// describe('Break start', () => {
//   let timer;
//   beforeAll(() => (timer = new Timer(defaultValues)));
//   beforeEach(() => timer.resetAll());

//   test('Correctly starts the break', () => {
//     // Spies
//     const setState = jest.spyOn(timer, 'setState');
//     const runSubtractor = jest
//       .spyOn(timer, 'runSubtractor')
//       .mockImplementation(() => {});

//     // Start the break
//     timer.startBreak();

//     // Tests
//     expect(setState).toHaveBeenCalledTimes(1);
//     expect(runSubtractor).toHaveBeenCalledTimes(1);
//     expect(timer.state.status).toBe('break');
//   });
// });

// describe('Break end', () => {
//   let timer;
//   let notify;
//   let setState;
//   beforeAll(() => {
//     timer = new Timer(defaultValues);
//     // Spy on these functions
//     notify = jest.spyOn(timer.notifications, 'notify');
//     setState = jest.spyOn(timer, 'setState');
//   });
//   beforeEach(() => {
//     timer.resetAll();
//     notify.mockClear();
//     setState.mockClear();
//   });

//   test('Correctly ends the break without autoStart', () => {
//     // Spies
//     const postState = jest
//       .spyOn(timer, 'postState')
//       .mockImplementation(() => {});

//     // Setup
//     timer.settings.autoStart = false;
//     const prevPeriod = timer.state.period;

//     // End the break
//     timer.endBreak();

//     // Tests
//     expect(notify).toHaveBeenCalledTimes(1);
//     expect(setState).toHaveBeenCalledTimes(2);
//     expect(postState).toHaveBeenCalledTimes(1);
//     expect(timer.state.period).toBe(prevPeriod + 1);
//     expect(timer.state.time).toBe(timer.settings.cycleTime);
//     expect(timer.state.status).toBe('initial');
//   });

//   test('Correctly ends the break with autoStart', () => {
//     // Spies
//     const startCycle = jest
//       .spyOn(timer, 'startCycle')
//       .mockImplementation(() => {});

//     // Setup
//     timer.settings.autoStart = true;
//     timer.state.status = 'break';
//     const prevPeriod = timer.state.period;

//     // End the break
//     timer.endBreak();

//     // Tests
//     expect(notify).toHaveBeenCalledTimes(1);
//     expect(setState).toHaveBeenCalledTimes(1);
//     expect(startCycle).toHaveBeenCalledTimes(1);
//     expect(timer.state.period).toBe(prevPeriod + 1);
//     expect(timer.state.time).toBe(timer.settings.cycleTime);
//     expect(timer.state.status).toBe('break');
//   });
// });

// describe('Break skip', () => {
//   let timer;
//   let notify;
//   let setState;
//   beforeAll(() => {
//     timer = new Timer(defaultValues);
//     // Spy on these functions
//     setState = jest.spyOn(timer, 'setState');
//   });
//   beforeEach(() => {
//     timer.resetAll();
//     setState.mockClear();
//   });

//   test('Correctly skips the break without autoStart', () => {
//     // Spies
//     const postState = jest
//       .spyOn(timer, 'postState')
//       .mockImplementation(() => {});

//     // Setup
//     timer.settings.autoStart = false;
//     const prevPeriod = timer.state.period;

//     // End the break
//     timer.skipBreak();

//     // Tests
//     expect(setState).toHaveBeenCalledTimes(2);
//     expect(postState).toHaveBeenCalledTimes(1);
//     expect(timer.state.period).toBe(prevPeriod + 1);
//     expect(timer.state.time).toBe(timer.settings.cycleTime);
//     expect(timer.state.status).toBe('initial');
//   });

//   test('Correctly skips the break with autoStart', () => {
//     // Spies
//     const buildTimeline = jest.spyOn(timer, 'buildTimeline');
//     const startCycle = jest
//       .spyOn(timer, 'startCycle')
//       .mockImplementation(() => {});

//     // Setup
//     timer.settings.autoStart = true;
//     timer.state.status = 'break';
//     const prevPeriod = timer.state.period;

//     // End the break
//     timer.skipBreak();

//     // Tests
//     expect(setState).toHaveBeenCalledTimes(1);
//     expect(buildTimeline).toHaveBeenCalledTimes(1);
//     expect(startCycle).toHaveBeenCalledTimes(1);
//     expect(timer.state.period).toBe(prevPeriod + 1);
//     expect(timer.state.time).toBe(timer.settings.cycleTime);
//     expect(timer.state.status).toBe('break');
//   });
// });
