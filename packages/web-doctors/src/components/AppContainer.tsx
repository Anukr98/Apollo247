import { setConfig, Config } from 'react-hot-loader';
import { hot } from 'react-hot-loader/root';
import { createMuiTheme, CssBaseline, Theme } from '@material-ui/core';
import {
  ThemeProvider,
  makeStyles,
  StylesProvider,
  createGenerateClassName,
} from '@material-ui/styles';
import React, { useEffect } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { Welcome } from 'components/Welcome';
import { PatientsList } from 'components/PatientsList';
import { DoctorsProfile } from 'components/DoctorsProfile';
import { AuthProvider } from 'components/AuthProvider';
import { useAuth } from 'hooks/authHooks';

const muiTheme = createMuiTheme({
  spacing: 10,
  palette: {
    primary: {
      main: '#fcb716',
      light: '#fed984',
      dark: '#ff748e',
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
      primary: '#f7f8f5',
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
      fontSize: 16,
      fontWeight: 600,
      color: '#02475b',
    },
    h4: {
      fontSize: 20,
      fontWeight: 600,
      color: '#02475b',
    },
    h5: {
      fontSize: 14,
      fontWeight: 'normal',
      color: '#02475b',
    },
    h6: {
      fontSize: 13,
      fontWeight: 600,
      color: '#02475b',
    },
    button: {
      fontSize: 13,
      fontWeight: 'bold',
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
});

const useStyles = makeStyles((theme: Theme) => {
  return {
    app: {
      minHeight: '100vh',
      backgroundImage: 'linear-gradient(to bottom, #f0f1ec, #dcdfce)',
      paddingBottom: 70,
      [theme.breakpoints.down('xs')]: {
        paddingBottom: 90,
      },
    },
  };
});

const App: React.FC = () => {
  const classes = useStyles();
  const { signInError } = useAuth();
  useEffect(() => {
    if (signInError) window.alert('Error signing in :(');
  }, [signInError]);
  return (
    <div className={classes.app}>
      <Route exact path={clientRoutes.welcome()} component={Welcome} />
      <Route exact path={clientRoutes.patients()} component={PatientsList} />
      <Route exact path={clientRoutes.DoctorsProfile()} component={DoctorsProfile} />
    </div>
  );
};

const generator = createGenerateClassName({
  seed: `${Math.floor(Math.random() * 1000)}`,
});

const AppContainer: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StylesProvider generateClassName={generator}>
          <ThemeProvider theme={muiTheme}>
            <CssBaseline>
              <App />
            </CssBaseline>
          </ThemeProvider>
        </StylesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

const rhlConfig = ({ hotHooks: true } as any) as Partial<Config>;
setConfig(rhlConfig);
const HotAppContainer = hot(AppContainer);

export { HotAppContainer as AppContainer };
