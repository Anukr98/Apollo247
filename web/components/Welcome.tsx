import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => {
  return {
    welcome: {
      color: 'blue',
    },
  };
});

export interface WelcomeProps {}

export const Welcome: React.FC<WelcomeProps> = (props) => {
  const classes = useStyles();
  return (
    <div className={classes.welcome}>
      Welcome <img src={require('images/apollo.jpg')} />
    </div>
  );
};
