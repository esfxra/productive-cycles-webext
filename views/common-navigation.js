let nav = false;
let current;

// const views = ['.timer-view', '.settings-view', '.stats-view'];
const views = ['.timer-view', '.settings-view'];

current = determineView(views);
console.log(current);

function hideElement(element) {
  const elt = document.querySelector(element);
  if (!elt.classList.contains('hidden')) {
    elt.classList.add('hidden');
  }
}

function showElement(element) {
  const elt = document.querySelector(element);
  if (elt.classList.contains('hidden')) {
    elt.classList.remove('hidden');
  }
}

function determineView(views) {
  let result = views.filter((view) => document.querySelector(view))[0];
  if (result) {
    result = result.replace('.', '');
    result = result.replace('-view', '');
  }
  return result;
}

function navigate(e) {
  const destination = e.target.id;

  // Remove existing listeners
  const timer = document.querySelector('#nav-timer');
  timer.removeEventListener('click', navigate);

  const options = document.querySelector('#nav-settings');
  options.removeEventListener('click', navigate);

  // const stats = document.querySelector('#nav-stats');
  // stats.removeEventListener('click', navigate);

  document.removeEventListener('click', handleOutsideClickWhileOpen);

  // Hide the menu
  nav = false;
  hideElement('#navigation');

  // Change view based on user input
  switch (destination) {
    case 'nav-timer':
      if (current !== 'timer') {
        window.location.href = '../timer/timer.html';
      }
      break;
    case 'nav-settings':
      if (current === 'timer' && port) port.disconnect();

      if (current !== 'settings') {
        window.location.href = '../settings/settings.html';
      }
      break;
    case 'nav-stats':
      if (current === 'timer' && port) port.disconnect();

      if (current !== 'stats') {
        window.location.href = '../stats/stats.html';
      }
      break;
  }
}

function handleOutsideClickWhileOpen(e) {
  if (e.target.closest('#menu')) {
    return;
  } else {
    document.removeEventListener('click', handleOutsideClickWhileOpen);

    nav = false;
    hideElement('#navigation');
  }
}

function registerMenu() {
  // Register listeners for 'menu' button
  const menu = document.querySelector('#menu-icon');
  menu.addEventListener('click', () => {
    if (nav) {
      document.removeEventListener('click', handleOutsideClickWhileOpen);

      nav = false;
      hideElement('#navigation');
    } else {
      nav = true;
      showElement('#navigation');

      // Register listeners for menu
      const timer = document.querySelector('#nav-timer');
      const settings = document.querySelector('#nav-settings');
      // const stats = document.querySelector('#nav-stats');

      timer.addEventListener('click', navigate);
      settings.addEventListener('click', navigate);
      // stats.addEventListener('click', navigate);

      // Register listener for clicks outside the menu box
      document.addEventListener('click', handleOutsideClickWhileOpen);
    }
  });
}
