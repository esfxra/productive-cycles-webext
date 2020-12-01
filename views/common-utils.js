/*
|--------------------------------------------------------------------------
| Hide and Show Elements
|--------------------------------------------------------------------------
*/
const hideElement = (element) => {
  const elt = document.querySelector(element);
  if (!elt.classList.contains('hidden')) {
    elt.classList.add('hidden');
  }
};

const showElement = (element) => {
  const elt = document.querySelector(element);
  if (elt.classList.contains('hidden')) {
    elt.classList.remove('hidden');
  }
};

/*
|--------------------------------------------------------------------------
| Theme Operations
|--------------------------------------------------------------------------
*/
const loadTheme = () => {
  let stylesheet = document.querySelector('#theme');

  chrome.storage.local.get(['theme'], (storage) => {
    if (storage.theme === 'light') {
      if (!stylesheet.href.includes('light')) {
        stylesheet.href = 'light.css';
      }
    } else {
      if (!stylesheet.href.includes('dark')) {
        stylesheet.href = 'dark.css';
      }
    }
  });
};

export { hideElement, showElement, loadTheme };
