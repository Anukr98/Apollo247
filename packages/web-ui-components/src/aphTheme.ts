import { ThemeOptions } from '@material-ui/core/styles/createMuiTheme';

const aphTheme: ThemeOptions = {
  spacing: 10,
  palette: {
    primary: {
      main: '#fcb716',
      light: '#fed984',
      contrastText: '#fff',
    },
    secondary: {
      main: '#0087ba',
      light: '#01475b',
      dark: '#02475b',
      contrastText: '#fff',
    },
    error: {
      main: '#890000',
      dark: '#e50000',
      light: '#e50000',
      contrastText: '#fff',
    },
    text: {
      primary: '#02475b',
    },
    background: {
      default: '#dcdfce',
    },
    action: {
      active: '#fff',
      hover: '#fff',
      hoverOpacity: 0.08,
      selected: '#fc9916',
      disabled: '#fff',
      disabledBackground: '#fed984',
    },
  },
  typography: {
    htmlFontSize: 16,
    fontFamily: ['IBM Plex Sans', 'sans-serif'].join(','),
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: {
      fontSize: 56,
      fontWeight: 600,
      color: '#02475b',
    },
    h2: {
      fontSize: 36,
      fontWeight: 600,
      color: '#02475b',
    },
    h3: {
      fontSize: 26,
      fontWeight: 600,
      color: '#02475b',
    },
    h4: {
      fontSize: 18,
      fontWeight: 600,
      color: '#02475b',
    },
    h5: {
      fontSize: 14,
      fontWeight: 500,
      color: '#02475b',
    },
    button: {
      fontSize: 13,
      // fontWeight: 'bold',
    },
  },
  shape: {
    borderRadius: 10,
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 768,
      md: 900,
      lg: 1024,
      xl: 1200,
    },
  },
};

export default aphTheme;
