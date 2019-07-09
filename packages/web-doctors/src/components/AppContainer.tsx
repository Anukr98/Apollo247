import { setConfig, Config } from 'react-hot-loader';
import { hot } from 'react-hot-loader/root';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';

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
  return <div className={classes.app}>Welcome to web-doctors</div>;
};

const AppContainer: React.FC = () => {
  return <App />;
};

const rhlConfig = ({ hotHooks: true } as any) as Partial<Config>;
setConfig(rhlConfig);
const HotAppContainer = hot(AppContainer);

export { HotAppContainer as AppContainer };
