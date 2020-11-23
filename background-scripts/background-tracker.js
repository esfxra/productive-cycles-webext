function initTrackerStorage() {
  chrome.storage.local.get(['stats'], (storage) => {
    if (storage.stats === undefined) {
      const stats = {
        cycleCount: 0,
        breakCount: 0,
        timerCount: 0,
        timeTotal: 0,
      };

      chrome.storage.local.set({ stats });
    }
  });
}

function countCompletedCycle(cycleTime) {
  chrome.storage.local.get(['stats'], (storage) => {
    const cycleCount = storage.stats.cycleCount + 1;
    const timeTotal = storage.stats.timeTotal + cycleTime;

    const stats = {
      cycleCount: cycleCount,
      breakCount: storage.stats.breakCount,
      timerCount: storage.stats.timerCount,
      timeTotal: timeTotal,
    };

    chrome.storage.local.set({ stats });
  });
}

function countCompletedBreak(breakTime) {
  chrome.storage.local.get(['stats'], (storage) => {
    const breakCount = storage.stats.breakCount + 1;
    const timeTotal = storage.stats.timeTotal + breakTime;

    const stats = {
      cycleCount: storage.stats.cycleCount,
      breakCount: breakCount,
      timerCount: storage.stats.timerCount,
      timeTotal: timeTotal,
    };

    chrome.storage.local.set({ stats });
  });
}

function countCompletedTimer(cycleTime) {
  chrome.storage.local.get(['stats'], (storage) => {
    const cycleCount = storage.stats.cycleCount + 1;
    const timerCount = storage.stats.timerCount + 1;
    const timeTotal = storage.stats.timeTotal + cycleTime;

    const stats = {
      cycleCount: cycleCount,
      breakCount: storage.stats.breakCount,
      timerCount: timerCount,
      timeTotal: timeTotal,
    };

    chrome.storage.local.set({ stats });
  });
}
