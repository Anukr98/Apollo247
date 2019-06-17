import { setConfig, Config } from 'react-hot-loader';
import { hot } from 'react-hot-loader/root';
import { createMuiTheme, CssBaseline, Theme } from '@material-ui/core';
import { ThemeProvider, makeStyles } from '@material-ui/styles';
import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { Welcome } from 'components/Welcome';
import { apiRoutes } from 'helpers/apiRoutes';
import { ApolloProvider } from 'react-apollo';
import { ApolloProvider as ApolloHooksProvider } from 'react-apollo-hooks';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { createHttpLink } from 'apollo-link-http';
import ApolloClient from 'apollo-client';
import { BooksList } from 'components/BooksList';
import { red } from '@material-ui/core/colors';

const apolloClient = new ApolloClient({
  link: createHttpLink({
    uri: apiRoutes.graphql(),
  }),
  cache: new InMemoryCache(),
});

const muiTheme = createMuiTheme({
  palette: {
    primary: {
      main: red.A100,
    },
  },
});

const useStyles = makeStyles((theme: Theme) => {
  return {
    app: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
    },
  };
});

const App: React.FC = () => {
  const classes = useStyles();
  return (
    <div className={classes.app}>
      <Route exact path={clientRoutes.welcome()} component={Welcome} />
      <Route exact path={clientRoutes.books()} component={BooksList} />
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
