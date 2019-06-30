import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import { Header } from 'components/Header';
import { HeroBanner } from 'components/HeroBanner';
import { ServiceList } from 'components/ServiceList';
import { ManageProfile } from 'components/ManageProfile';
import { useIsLoggedIn } from 'hooks/authHooks';

const useStyles = makeStyles((theme: Theme) => {
  return {
    welcome: {
      paddingTop: 85,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 78,
      },
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

export const Welcome: React.FC = (props) => {
  const classes = useStyles();
  const isUserLoggedIn = useIsLoggedIn();
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
      <ManageProfile />
    </div>
  );
};
