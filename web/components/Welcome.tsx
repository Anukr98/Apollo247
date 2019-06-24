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
      paddingTop: '85px',
    },
    booksLink: {
      color: theme.palette.primary.main,
      textDecoration: 'underline',
    },
    headerSticky: {
      position: 'fixed',
      width: '100%',
      zIndex: 99,
      top: 0,
    },
    container: {
      maxWidth: '1064px',
      margin: 'auto',
    },
  };
});

export interface WelcomeProps { }

export const Welcome: React.FC<WelcomeProps> = (props) => {
  const classes = useStyles();
  const [showSignUp, handleSignUpCard] = React.useState<boolean>(false);
  return (
    <div className={classes.welcome}>
      <div className={classes.headerSticky}>
        <div className={classes.container}>
          <Route exact component={Header} />
        </div>
      </div>
      <div className={classes.container}>
        <Route exact component={HeroBanner} />
        <Route exact component={ServiceList} />
      </div>
      {showSignUp ? <Route exact component={SignUp} /> : null}
    </div>
  );
};
