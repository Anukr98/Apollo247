import { setConfig, Config } from 'react-hot-loader';
import { hot } from 'react-hot-loader/root';
import { createMuiTheme, CssBaseline, Theme } from '@material-ui/core';
import {
  ThemeProvider,
  makeStyles,
  StylesProvider,
  createGenerateClassName,
} from '@material-ui/styles';
import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { Welcome } from 'components/Welcome';
import { DoctorsList } from 'components/DoctorsList';
import { AuthProvider } from 'components/AuthProvider';

const muiTheme = createMuiTheme({
  spacing: 10,
  palette: {
    primary: {
      main: '#fcb716',
    },
  },
  typography: {
    body1: {
      fontFamily: ['IBM Plex Sans', 'sans-serif'].join(','),
    },
    body2: {
      fontFamily: ['IBM Plex Sans', 'sans-serif'].join(','),
      fontSize: '12px',
      lineHeight: '18px',
      fontWeight: 400,
      letterSpacing: 'normal',
      backgroundImage: 'linear-gradient(to bottom, #f0f1ec, #dcdfce)',
    },
    h1: {
      fontFamily: ['IBM Plex Sans', 'sans-serif'].join(','),
      fontSize: '56px',
      fontWeight: 600,
      color: '#02475b',
      letterSpacing: 'normal',
    },
    h2: {
      fontFamily: ['IBM Plex Sans', 'sans-serif'].join(','),
      fontSize: '36px',
      fontWeight: 600,
      color: '#02475b',
      lineHeight: 1.22,
    },
    h5: {
      fontFamily: ['IBM Plex Sans', 'sans-serif'].join(','),
      fontSize: '14px',
      fontWeight: 500,
      color: '#02475b',
      lineHeight: 1.45,
    },
    button: {
      fontSize: '13px',
      fontWeight: 'bold',
      fontStyle: 'normal',
      lineHeight: '1.85',
      letterSpacing: 'normal',
      color: '#ffffff',
    },
  },
});

const useStyles = makeStyles((theme: Theme) => {
  return {
    app: {
      minHeight: '100vh',
      '& label.Mui-focused': {
        color: '#02475b',
      },
      '& .MuiInputBase-root': {
        fontFamily: ['IBM Plex Sans', 'sans-serif'].join(','),
      },
      '& .MuiInputBase-root:before': {
        borderBottomColor: '#00b38e',
        borderWidth: '2px',
      },
      '& .MuiInput-underline:after': {
        borderBottomColor: '#00b38e',
      },
    },
  };
});

const App: React.FC = () => {
  const classes = useStyles();
  return (
    <div className={classes.app}>
      <Route exact path={clientRoutes.welcome()} component={Welcome} />
      <Route exact path={clientRoutes.doctors()} component={DoctorsList} />
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
