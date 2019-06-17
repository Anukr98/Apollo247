import { setConfig, Config } from 'react-hot-loader';
import { hot } from 'react-hot-loader/root';
import { createMuiTheme, CssBaseline, Theme } from '@material-ui/core';
import { ThemeProvider, makeStyles } from '@material-ui/styles';
import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { Welcome } from 'components/Welcome';

const theme = createMuiTheme({});

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
    </div>
  );
};

const AppContainer: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline>
          <App />
        </CssBaseline>
      </ThemeProvider>
    </BrowserRouter>
  );
};

const rhlConfig = ({ hotHooks: true } as any) as Partial<Config>;
setConfig(rhlConfig);
const HotAppContainer = hot(AppContainer);

export { HotAppContainer as AppContainer };
