import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    name: string;
    foreground: string;
    background: string;
    elevation: string;
    accent: string;
    menu: {
      main: string;
      alt: string;
    };
    button: {
      main: string;
      alt: string;
    };
    cycles: {
      pending: string;
      complete: string;
    };
    settings: {
      number: string;
      checkbox: string;
      checkmark: string;
    };
  }
}
