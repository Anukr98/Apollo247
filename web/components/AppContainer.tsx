import { setConfig, Config } from 'react-hot-loader';
import { hot } from 'react-hot-loader/root';
import { createMuiTheme, CssBaseline, Theme } from '@material-ui/core';
import { ThemeProvider, makeStyles } from '@material-ui/styles';
import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { apiRoutes } from 'helpers/apiRoutes';
import { ApolloProvider } from 'react-apollo';
import { ApolloProvider as ApolloHooksProvider } from 'react-apollo-hooks';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { createHttpLink } from 'apollo-link-http';
import ApolloClient from 'apollo-client';
import { Welcome } from 'components/Welcome';
import { DoctorsList } from './DoctorsList';

const apolloClient = new ApolloClient({
  link: createHttpLink({
    uri: apiRoutes.graphql(),
  }),
  cache: new InMemoryCache(),
});

const muiTheme = createMuiTheme({
  palette: {
    primary: {
      main: '#fcb716',
    },
  },
  typography: {
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
    },
    h2: {
      fontFamily: ['IBM Plex Sans', 'sans-serif'].join(','),
      fontSize: '36px',
      fontWeight: 600,
      color: '#02475b',
    },
    h5: {
      fontFamily: ['IBM Plex Sans', 'sans-serif'].join(','),
      fontSize: '14px',
      fontWeight: 600,
      color: '#02475b',
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
    },
    container: {
      maxWidth: '1064px',
      margin: 'auto',
    },
  };
});

const App: React.FC = () => {
  const classes = useStyles();
  return (
    <div className={classes.app}>
      <div className={classes.container}>
        <Route exact path={clientRoutes.welcome()} component={Welcome} />
        <Route exact path={clientRoutes.doctors()} component={DoctorsList} />
      </div>
    </div>
  );
};

const AppContainer: React.FC = () => {
  return (
    <BrowserRouter>
      <ApolloProvider client={apolloClient}>
        <ApolloHooksProvider client={apolloClient}>
          <ThemeProvider theme={muiTheme}>
            <CssBaseline>
              <App />
            </CssBaseline>
          </ThemeProvider>
        </ApolloHooksProvider>
      </ApolloProvider>
    </BrowserRouter>
  );
};

const rhlConfig = ({ hotHooks: true } as any) as Partial<Config>;
setConfig(rhlConfig);
const HotAppContainer = hot(AppContainer);

export { HotAppContainer as AppContainer };
