'use strict';

const light = {
  name: 'light',
  foreground: '#747980',
  background: '#eeeeee',
  elevation: '#ffffff',
  accent: '#3c50fa',
  menu: {
    main: '#C2C5CB',
    alt: '#747980',
  },
  button: {
    main: '#747980',
    alt: '#C2C5CB',
  },
  cycles: {
    pending: '#C2C5CB',
    complete: '#747980',
  },
  settings: {
    number: '#e7e8ea',
    checkbox: '#e7e8ea',
    checkmark: '#747980',
  },
};

const dark = {
  name: 'dark',
  foreground: '#f5f5f5',
  background: '#1e1f23',
  elevation: '#27282D',
  accent: '#3c50fa',
  menu: {
    main: '#434552',
    alt: '#3c50fa',
  },
  button: {
    main: '#3c50fa',
    alt: '#484B56',
  },
  cycles: {
    pending: '#484B56',
    complete: '#f5f5f5',
  },
  settings: {
    number: '#787d8a',
    checkbox: '#787d8a',
    checkmark: '#f5f5f5',
  },
};

const themes = {
  light: light,
  dark: dark,
};

export { themes };
