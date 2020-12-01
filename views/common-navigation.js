import { hideElement, showElement } from './common-utils.js';

/*
|--------------------------------------------------------------------------
| Navigation-related Functions
|--------------------------------------------------------------------------
|
| Module that enables navigation within the extension's views
|
*/
let currentView = '';
let communicationsPort;
let open = false;

const views = ['timer', 'settings'];

const registerNavigation = (current, port) => {
  currentView = current;
  communicationsPort = port;

  // Build and append navigation
  buildMenuList(views);

  // Register menu icon listener
  const menu = document.querySelector('#menu-icon');
  menu.addEventListener('click', () => {
    if (open) {
      closeMenu();
    } else {
      openMenu();
    }
  });
};

const buildMenuList = (views) => {
  // Append navigation list
  const navMenuList = document.createElement('ul');
  navMenuList.id = 'navigation-ul';

  views.forEach((view) => {
    let node = document.createElement('li');
    node.id = `nav-${view}`;
    node.textContent = view;
    navMenuList.appendChild(node);
  });

  const nav = document.querySelector('#navigation');
  nav.appendChild(navMenuList);
};

const navigate = (e) => {
  // Close menu and make necessary listener removals
  closeMenu();

  // Load new view resource
  switch (e.target.id) {
    case 'nav-timer':
      if (currentView !== 'timer') {
        window.location.href = '../timer/timer.html';
      }
      break;
    case 'nav-settings':
      if (currentView === 'timer' && communicationsPort) {
        communicationsPort.disconnect();
      }

      if (currentView !== 'settings') {
        window.location.href = '../settings/settings.html';
      }
      break;
    case 'nav-stats':
      if (currentView === 'timer' && communicationsPort) {
        communicationsPort.disconnect();
      }

      if (currentView !== 'stats') {
        window.location.href = '../stats/stats.html';
      }
      break;
  }
};

const handleOutsideClick = (e) => {
  if (e.target.closest('#menu')) {
    return;
  } else {
    closeMenu();
  }
};

const openMenu = () => {
  open = true;
  registerMenuListeners();
  showElement('#navigation');
};

const closeMenu = () => {
  open = false;
  removeMenuListeners();
  hideElement('#navigation');
};

const registerMenuListeners = () => {
  // Add listener for clicks outside the menu container
  document.addEventListener('click', handleOutsideClick);

  // Add necessary listeners to navigation items
  const navigation = document.querySelector('#navigation-ul');
  navigation.childNodes.forEach((node) => {
    node.addEventListener('click', navigate);
  });
};

const removeMenuListeners = () => {
  // Remove listener for clicks outside the menu container
  document.removeEventListener('click', handleOutsideClick);

  // Remove existing listeners
  const navigation = document.querySelector('#navigation-ul');
  navigation.childNodes.forEach((node) => {
    node.removeEventListener('click', navigate);
  });
};

export { registerNavigation };
