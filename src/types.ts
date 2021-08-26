export type Status = 'initial' | 'running' | 'paused' | 'complete';

export type CycleInputs = 'start' | 'pause' | 'reset-cycle' | 'reset-all';

export type BreakInputs = 'skip';

export type Inputs = CycleInputs | BreakInputs;

export type Views = 'timer' | 'settings' | 'updates';
