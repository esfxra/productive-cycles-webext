'use strict';

class Period {
  constructor(id, remaining, target) {
    this.id = id;
    this.remaining = remaining;
    this.target = target;

    this.status = 'initial';
    this.enabled = false;

    this.duration = remaining;
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

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }
}

class Cycle extends Period {
  constructor(id, remaining, target) {
    super(id, remaining, target);
  }

  pause() {
    this.status = 'paused';
  }
}

class Break extends Period {
  constructor(id, remaining, target) {
    super(id, remaining, target);
  }

  skip() {
    this.end();
  }
}

export { Cycle, Break };
