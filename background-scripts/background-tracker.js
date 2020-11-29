function initTrackerStorage() {
  chrome.storage.local.get(['statsMap', 'statsSummary'], (storage) => {
    if (storage.statsMap === undefined) {
      let statsMap = [];

      const today = formatDate(new Date());

      statsMap.push({
        date: today,
        cycles: 0,
        time: 0,
      });

      chrome.storage.local.set({ statsMap });
    }

    if (storage.statsSummary === undefined) {
      const statsSummary = {
        cycleCount: 0,
        timerCount: 0,
        timeTotal: 0,
      };

      chrome.storage.local.set({ statsSummary });
    }
  });
}

function countCompletedCycle(cycleTime, complete) {
  chrome.storage.local.get(['statsMap', 'statsSummary'], (storage) => {
    // Stats map
    let statsMap = [...storage.statsMap];

    // Retrieve last item
    const last_idx = statsMap.length - 1;
    console.log(`Last index: ${last_idx}`);
    const latest = statsMap[last_idx];
    console.log(`Latest date: ${latest.date}`);
    const today = formatDate(new Date());

    // Compare dates
    if (sameDay(today, latest.date)) {
      statsMap[last_idx] = {
        date: latest.date,
        cycles: latest.cycles + 1,
        time: latest.time + cycleTime,
      };
    } else {
      statsMap.push({
        date: today,
        cycles: 1,
        time: cycleTime,
      });
    }

    // Stats Summary
    const cycleCount = storage.statsSummary.cycleCount + 1;
    const timeTotal = storage.statsSummary.timeTotal + cycleTime;

    let timerCount = storage.statsSummary.timerCount;
    if (complete) {
      timerCount += 1;
    }

    const statsSummary = {
      cycleCount: cycleCount,
      timerCount: timerCount,
      timeTotal: timeTotal,
    };

    chrome.storage.local.set({ statsMap, statsSummary });
  });
}

// Utility Functions
function formatDate(date) {
  return `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`;
}

function sameDay(date1, date2) {
  console.log(`same day: ${date1 === date2}`);
  return date1 === date2;
}

function parseTotalTime(totalTime) {
  // Find days
  // Find hours
  // Find minutes
  // Find seconds
}

function extractDays(milliseconds) {
  let days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));

  console.log(`extractDays - days: ${days}`);

  return days;
}

function extractHours(milliseconds) {
  let hours = Math.floor(
    (milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );

  console.log(`extractHours - hours: ${hours}`);

  return hours;
}

function extractMinutes(milliseconds) {
  let min = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));

  console.log(`extractMinutes - min: ${min}`);

  if (min < 1) {
    min = 0;
  }

  // Format processed time; add missing 0s
  if (Math.floor(Math.log10(min)) < 1) {
    minStr = '0' + min;
  } else {
    minStr = min;
  }

  return minStr;
}

function extractSeconds(milliseconds) {
  let sec = Math.floor((milliseconds % (1000 * 60)) / 1000);

  console.log(`extractSeconds - sec: ${sec}`);

  if (sec < 1) {
    sec = 0;
  }

  if (Math.floor(Math.log10(sec)) < 1) {
    secStr = '0' + sec;
  } else {
    secStr = sec;
  }

  return secStr;
}
