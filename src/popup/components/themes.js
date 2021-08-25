'use strict';

const light = {
  name: 'light',
  foreground: '#747980',
  background: '#eeeeee',
  elevation: '#ffffff',
  accent: '#3c50fa',
  menu: {
    main: '#BEC1C5',
    alt: '#747980',
  },
  button: {
    main: '#747980',
    alt: '#BEC1C5',
  },
  cycles: {
    pending: '#BEC1C5',
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
  background: '#202124',
  elevation: '#28282B',
  accent: '#3c50fa',
  menu: {
    main: '#434552',
    alt: '#3c50fa',
  },
  button: {
    main: '#3c50fa',
    alt: '#454851',
  },
  cycles: {
    pending: '#454851',
    complete: '#f5f5f5',
  },
  settings: {
    number: '#454851',
    checkbox: '#454851',
    checkmark: '#f5f5f5',
  },
};

const themes = {
  light: light,
  dark: dark,
};

export { themes };
