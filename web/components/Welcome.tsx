import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import { Header } from 'components/Header';
import { HeroBanner } from 'components/HeroBanner';
import { ServiceList } from 'components/ServiceList';
import { Route } from 'react-router-dom';
import { SignUp } from 'components/SignUp';

const useStyles = makeStyles((theme: Theme) => {
  return {
    welcome: {
      color: 'blue',
    },
    booksLink: {
      color: theme.palette.primary.main,
      textDecoration: 'underline',
    },
  };
});

export interface WelcomeProps {}

export const Welcome: React.FC<WelcomeProps> = (props) => {
  const classes = useStyles();
  return (
    <div className={classes.welcome}>
      <Route exact component={Header} />
      <Route exact component={HeroBanner} />
      <Route exact component={ServiceList} />
      <Route exact component={SignUp} />
    </div>
  );
};
