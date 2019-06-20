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
    container: {
      maxWidth: '1064px',
      margin: 'auto',
    },
  };
});

export interface WelcomeProps {}

export const Welcome: React.FC<WelcomeProps> = (props) => {
  const classes = useStyles();
  const [showSignUp, handleSignUpCard] = React.useState<boolean>(false);
  return (
    <div className={classes.welcome}>
<<<<<<< HEAD
      <Route exact component={Header} />
      <Route exact component={HeroBanner} />
      <Route exact component={ServiceList} />
      {showSignUp ? <Route exact component={SignUp} /> : null}
=======
      <div className={classes.container}>
        <Route exact component={Header} />
        <Route exact component={HeroBanner} />
        <Route exact component={ServiceList} />
      </div>
      <Route exact component={SignUp} />
>>>>>>> origin/development
    </div>
  );
};
