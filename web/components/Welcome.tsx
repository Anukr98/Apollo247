import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import { Header } from 'components/Header';
import { HeroBanner } from 'components/HeroBanner';
import { ServiceList } from 'components/ServiceList';
import { ExistingProfile } from 'components/existingProfile';

const useStyles = makeStyles((theme: Theme) => {
  return {
    welcome: {
      paddingTop: 85,
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
      maxWidth: 1064,
      margin: 'auto',
    },
  };
});

export interface WelcomeProps { }

export const Welcome: React.FC<WelcomeProps> = (props) => {
  const classes = useStyles();
  return (
    <div className={classes.welcome}>
      <div className={classes.headerSticky}>
        <div className={classes.container}>
          <Header />
        </div>
      </div>
      <div className={classes.container}>
        <HeroBanner />
        <ServiceList />
      </div>
      <ExistingProfile />
    </div>
  );
};
