'use strict';

class Period {
  constructor(id, duration) {
    this.id = id;
    this.duration = duration;

    this.remaining = duration;
    this.target = 0;

    this.status = 'initial';
    this.enabled = false;
  }

  get isCycle() {
    return this.id % 2 === 0;
  }

  get actual() {
    return this.target - Date.now();
  }

  get adjust() {
    const actual = this.actual;
    const surplus = actual - Math.floor(actual / 1000) * 1000;
    this.remaining = actual - surplus;

    return surplus;
  }

  start() {
    this.status = 'running';
  }

  end() {
    this.status = 'complete';
  }

  reset() {
    this.status = 'initial';
    this.remaining = this.duration;
  }
}

class Cycle extends Period {
  constructor(id, remaining, target) {
    super(id, remaining, target);
  }

  pause() {
    this.status = 'paused';
  }

  autoStart(autoStart) {
    this.enabled = autoStart.cycles;
  }
}

class Break extends Period {
  constructor(id, remaining, target) {
    super(id, remaining, target);
  }

  skip() {
    this.end();
  }

  autoStart(autoStart) {
    this.enabled = autoStart.breaks;
  }
}

export { Cycle, Break };
